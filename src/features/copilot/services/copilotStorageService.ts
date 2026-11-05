import { supabase } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import type { CareerConversation, CareerMessage } from '../types/copilot.types';

const STORAGE_PREFIX = 'resumax_copilot_conversations_';

function getLocalConversations(userId: string): CareerConversation[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('[CopilotStorageService] Failed to read from localStorage:', err);
    return [];
  }
}

function saveLocalConversations(userId: string, convs: CareerConversation[]): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(convs));
  } catch (err) {
    console.warn('[CopilotStorageService] Failed to write to localStorage:', err);
  }
}

export class CopilotStorageService {
  /**
   * List all conversations for the user
   */
  static async listConversations(userId: string): Promise<CareerConversation[]> {
    const { isConfigured } = getSupabaseEnv();

    if (isConfigured) {
      try {
        const { data, error } = await supabase
          .from('career_conversations')
          .select(`
            id,
            user_id,
            resume_id,
            title,
            created_at,
            updated_at,
            career_messages (
              id,
              conversation_id,
              user_id,
              role,
              content,
              metadata,
              created_at
            )
          `)
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (!error && data) {
          const mapped: CareerConversation[] = data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            resumeId: d.resume_id,
            title: d.title,
            messages: (d.career_messages || []).map((m: any) => ({
              id: m.id,
              conversationId: m.conversation_id,
              userId: m.user_id,
              role: m.role,
              content: m.content,
              metadata: m.metadata,
              createdAt: m.created_at,
            })),
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));

          saveLocalConversations(userId, mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('[CopilotStorageService] Supabase error, falling back to local storage:', err);
      }
    }

    return getLocalConversations(userId);
  }

  /**
   * Create a new conversation
   */
  static async createConversation(
    title: string,
    userId: string,
    resumeId?: string | null,
    resumeTitle?: string | null
  ): Promise<CareerConversation> {
    const { isConfigured } = getSupabaseEnv();
    const newId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newConv: CareerConversation = {
      id: newId,
      userId,
      resumeId: resumeId || null,
      resumeTitle: resumeTitle || null,
      title: title.trim(),
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    if (isConfigured) {
      try {
        await supabase.from('career_conversations').insert({
          id: newConv.id,
          user_id: newConv.userId,
          resume_id: newConv.resumeId,
          title: newConv.title,
          created_at: newConv.createdAt,
          updated_at: newConv.updatedAt,
        });
      } catch (err) {
        console.warn('[CopilotStorageService] Supabase insert error:', err);
      }
    }

    const current = getLocalConversations(userId);
    saveLocalConversations(userId, [newConv, ...current]);
    return newConv;
  }

  /**
   * Add a message to a conversation
   */
  static async addMessage(
    conversationId: string,
    msgData: Omit<CareerMessage, 'id' | 'conversationId' | 'userId' | 'createdAt'>,
    userId: string
  ): Promise<CareerMessage> {
    const { isConfigured } = getSupabaseEnv();
    const msgId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newMsg: CareerMessage = {
      id: msgId,
      conversationId,
      userId,
      role: msgData.role,
      content: msgData.content,
      metadata: msgData.metadata,
      createdAt: now,
    };

    if (isConfigured) {
      try {
        await supabase.from('career_messages').insert({
          id: newMsg.id,
          conversation_id: newMsg.conversationId,
          user_id: newMsg.userId,
          role: newMsg.role,
          content: newMsg.content,
          metadata: newMsg.metadata || {},
          created_at: newMsg.createdAt,
        });

        await supabase
          .from('career_conversations')
          .update({ updated_at: now })
          .eq('id', conversationId);
      } catch (err) {
        console.warn('[CopilotStorageService] Supabase addMessage error:', err);
      }
    }

    const current = getLocalConversations(userId);
    const convIndex = current.findIndex((c) => c.id === conversationId);
    if (convIndex !== -1) {
      current[convIndex].messages.push(newMsg);
      current[convIndex].updatedAt = now;
      saveLocalConversations(userId, current);
    }

    return newMsg;
  }

  /**
   * Rename a conversation
   */
  static async renameConversation(
    conversationId: string,
    newTitle: string,
    userId: string
  ): Promise<boolean> {
    const { isConfigured } = getSupabaseEnv();
    const now = new Date().toISOString();

    if (isConfigured) {
      try {
        await supabase
          .from('career_conversations')
          .update({ title: newTitle.trim(), updated_at: now })
          .eq('id', conversationId)
          .eq('user_id', userId);
      } catch (err) {
        console.warn('[CopilotStorageService] Supabase rename error:', err);
      }
    }

    const current = getLocalConversations(userId);
    const conv = current.find((c) => c.id === conversationId);
    if (conv) {
      conv.title = newTitle.trim();
      conv.updatedAt = now;
      saveLocalConversations(userId, current);
      return true;
    }
    return false;
  }

  /**
   * Delete a conversation
   */
  static async deleteConversation(conversationId: string, userId: string): Promise<boolean> {
    const { isConfigured } = getSupabaseEnv();

    if (isConfigured) {
      try {
        await supabase
          .from('career_conversations')
          .delete()
          .eq('id', conversationId)
          .eq('user_id', userId);
      } catch (err) {
        console.warn('[CopilotStorageService] Supabase delete error:', err);
      }
    }

    const current = getLocalConversations(userId);
    const filtered = current.filter((c) => c.id !== conversationId);
    saveLocalConversations(userId, filtered);
    return true;
  }
}

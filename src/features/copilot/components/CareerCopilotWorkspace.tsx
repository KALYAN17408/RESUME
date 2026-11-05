import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { ResumeService } from '@/features/resumes/services/resumeService';
import type { ResumeData } from '@/features/resumes/types/resume.types';
import type { CareerConversation } from '../types/copilot.types';
import { CopilotStorageService } from '../services/copilotStorageService';
import { CareerCopilotService } from '../services/careerCopilotService';
import { ConversationList } from '../components/ConversationList';
import { ChatMessageBubble } from '../components/ChatMessageBubble';
import { QuickPromptChips } from '../components/QuickPromptChips';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  Bot,
  Send,
  FileText,
  X,
  Menu,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export const CareerCopilotPage: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const userId = user?.id || 'demo_user';

  // Resumes state
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  // Conversations state
  const [conversations, setConversations] = useState<CareerConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [, setIsLoadingConvs] = useState(true);

  // Chat message & generation state
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [deletingConv, setDeletingConv] = useState<CareerConversation | null>(null);
  const [isMobileListOpen, setIsMobileListOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Active conversation object
  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const activeResume = resumes.find((r) => r.id === selectedResumeId) || null;

  // Auto scroll to bottom
  const scrollToBottom = () => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, isGenerating]);

  // Load user resumes
  useEffect(() => {
    let isMounted = true;
    async function fetchResumes() {
      try {
        const items = await ResumeService.listResumes(userId);
        const fullList: ResumeData[] = [];
        for (const it of items) {
          const r = await ResumeService.getResume(it.id, userId);
          if (r) fullList.push(r);
        }
        if (isMounted) {
          setResumes(fullList);
          if (fullList.length > 0 && !selectedResumeId) {
            setSelectedResumeId(fullList[0].id);
          }
        }
      } catch (err) {
        console.warn('Failed to load resumes:', err);
      }
    }

    fetchResumes();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    setIsLoadingConvs(true);
    try {
      const list = await CopilotStorageService.listConversations(userId);
      setConversations(list);
      if (list.length > 0 && !activeConversationId) {
        setActiveConversationId(list[0].id);
      } else if (list.length === 0) {
        // Create initial conversation automatically
        const initial = await CopilotStorageService.createConversation('Career Strategy Chat', userId);
        setConversations([initial]);
        setActiveConversationId(initial.id);
      }
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    } finally {
      setIsLoadingConvs(false);
    }
  }, [userId, activeConversationId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // New Conversation Handler
  const handleNewConversation = async () => {
    try {
      const count = conversations.length + 1;
      const newConv = await CopilotStorageService.createConversation(
        `Career Discussion ${count}`,
        userId,
        selectedResumeId,
        activeResume?.title || activeResume?.personalInfo.fullName
      );
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setIsMobileListOpen(false);
      addToast({
        type: 'info',
        title: 'New Conversation',
        message: 'Started a fresh career strategy session.',
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Rename Conversation Handler
  const handleRenameConversation = async (id: string, newTitle: string) => {
    await CopilotStorageService.renameConversation(id, newTitle, userId);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  };

  // Delete Conversation Handler
  const handleConfirmDelete = async () => {
    if (!deletingConv) return;
    await CopilotStorageService.deleteConversation(deletingConv.id, userId);
    const updated = conversations.filter((c) => c.id !== deletingConv.id);
    setConversations(updated);
    if (activeConversationId === deletingConv.id) {
      setActiveConversationId(updated[0]?.id || null);
    }
    setDeletingConv(null);
    addToast({
      type: 'info',
      title: 'Conversation Deleted',
      message: 'Removed conversation from history.',
    });
  };

  // Send Message Handler
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim() || isGenerating) return;

    let targetConvId = activeConversationId;
    if (!targetConvId) {
      const created = await CopilotStorageService.createConversation(
        textToSend.slice(0, 30) + '...',
        userId,
        selectedResumeId,
        activeResume?.title
      );
      setConversations([created]);
      targetConvId = created.id;
      setActiveConversationId(created.id);
    }

    setInputPrompt('');
    setGenerationError(null);
    setIsGenerating(true);

    try {
      // 1. Add User Message
      const userMsg = await CopilotStorageService.addMessage(
        targetConvId,
        {
          role: 'user',
          content: textToSend.trim(),
        },
        userId
      );

      // Update state immediately with user message
      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConvId
            ? { ...c, messages: [...c.messages, userMsg], updatedAt: new Date().toISOString() }
            : c
        )
      );

      // 2. Generate Assistant Response
      const currentMessages = activeConversation ? activeConversation.messages : [];
      const result = await CareerCopilotService.generateAdvice({
        prompt: textToSend.trim(),
        conversationHistory: [...currentMessages, userMsg],
        resumeData: activeResume,
      });

      // 3. Add Assistant Message
      const assistantMsg = await CopilotStorageService.addMessage(
        targetConvId,
        {
          role: 'assistant',
          content: result.content,
          metadata: result.metadata,
        },
        userId
      );

      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConvId
            ? { ...c, messages: [...c.messages, assistantMsg], updatedAt: new Date().toISOString() }
            : c
        )
      );
    } catch (err: any) {
      console.error('Error generating career advice:', err);
      setGenerationError(err?.message || 'Failed to generate response. Please try again.');
    } finally {
      setIsGenerating(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] text-left rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200/80 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileListOpen(!isMobileListOpen)}
            className="sm:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Toggle conversation history"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-white shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">AI Career Copilot</h1>
              <p className="text-[11px] text-slate-500">
                Strategic career guidance, skill roadmaps & interview coaching
              </p>
            </div>
          </div>
        </div>

        {/* Resume Context Selector */}
        <div className="flex items-center gap-2">
          {activeResume ? (
            <div className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50/70 px-3 py-1 text-xs text-violet-900">
              <FileText className="w-3.5 h-3.5 text-violet-600 shrink-0" />
              <span className="font-semibold truncate max-w-[150px]">
                {activeResume.title || activeResume.personalInfo.fullName}
              </span>
              <button
                onClick={() => setSelectedResumeId(null)}
                className="text-violet-400 hover:text-violet-700 p-0.5 rounded-md"
                title="Remove resume context"
                aria-label="Remove resume context"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium hidden md:inline">Grounding:</span>
              <select
                value={selectedResumeId || ''}
                onChange={(e) => setSelectedResumeId(e.target.value || null)}
                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs focus:border-violet-500 focus:outline-hidden"
              >
                <option value="">No Resume Context</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    Use: {r.title || r.personalInfo.fullName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Workspace (Sidebar + Message Area) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar / Mobile Drawer */}
        <div
          className={cn(
            'absolute inset-y-0 left-0 z-20 sm:static sm:flex transition-transform duration-200 ease-in-out',
            isMobileListOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
          )}
        >
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={(id) => {
              setActiveConversationId(id);
              setIsMobileListOpen(false);
            }}
            onNewConversation={handleNewConversation}
            onRenameConversation={handleRenameConversation}
            onDeleteConversation={(c) => setDeletingConv(c)}
          />
        </div>

        {/* Message Area */}
        <div className="flex flex-1 flex-col h-full bg-slate-50/30 overflow-hidden">
          {/* Scrollable messages container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeConversation && activeConversation.messages.length > 0 ? (
              activeConversation.messages.map((msg) => (
                <ChatMessageBubble
                  key={msg.id}
                  message={msg}
                  onSuggestionClick={(sugg) => handleSendMessage(sugg)}
                />
              ))
            ) : (
              <QuickPromptChips
                onSelectPrompt={(p) => handleSendMessage(p)}
                candidateRole={activeResume?.personalInfo.professionalTitle}
              />
            )}

            {/* Typing / Generating Indicator */}
            {isGenerating && (
              <div className="flex items-center gap-3 py-2 px-2 text-xs text-violet-700">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-white shadow-xs">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-white border border-violet-100 px-4 py-2.5 shadow-xs">
                  <Spinner size="sm" />
                  <span className="font-semibold text-violet-850">Career Copilot is evaluating your request...</span>
                </div>
              </div>
            )}

            {/* Error Banner with Retry */}
            {generationError && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{generationError}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleSendMessage()}>
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Retry
                </Button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-3.5 border-t border-slate-200/80 bg-white">
            <div className="relative flex items-end gap-2 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xs focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500">
              <textarea
                ref={textareaRef}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask about resume refinement, interview answers, skill roadmaps, or career pivots..."
                disabled={isGenerating}
                className="w-full resize-none border-none bg-transparent px-2 py-1 text-xs text-slate-850 placeholder-slate-400 focus:outline-hidden max-h-32 font-sans"
              />

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSendMessage()}
                disabled={!inputPrompt.trim() || isGenerating}
                className="shrink-0 bg-violet-600 hover:bg-violet-700 px-3 py-1.5 h-8 rounded-xl"
              >
                {isGenerating ? <Spinner size="sm" /> : <Send className="w-3.5 h-3.5" />}
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-1.5">
              Press Enter to send, Shift+Enter for new line. AI advice is grounded in your selected resume data.
            </p>
          </div>
        </div>
      </div>

      {/* Delete Conversation Dialog */}
      <ConfirmationDialog
        isOpen={!!deletingConv}
        onClose={() => setDeletingConv(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Conversation"
        description={`Are you sure you want to delete "${deletingConv?.title}"? All chat history in this conversation will be permanently removed.`}
        confirmLabel="Delete Chat"
        variant="danger"
      />
    </div>
  );
};

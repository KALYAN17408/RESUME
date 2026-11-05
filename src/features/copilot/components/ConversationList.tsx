import React, { useState } from 'react';
import type { CareerConversation } from '../types/copilot.types';
import { Button } from '@/components/ui/Button';
import { Plus, MessageSquare, Trash2, Edit2, Check, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ConversationListProps {
  conversations: CareerConversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onRenameConversation: (id: string, newTitle: string) => Promise<void>;
  onDeleteConversation: (conv: CareerConversation) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onDeleteConversation,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startRename = (conv: CareerConversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveRename = async (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      await onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/60 border-r border-slate-200/80 w-full sm:w-64 md:w-72 shrink-0">
      {/* Top action: New Chat */}
      <div className="p-3 border-b border-slate-200/80">
        <Button
          variant="primary"
          size="sm"
          onClick={onNewConversation}
          className="w-full justify-center bg-violet-600 hover:bg-violet-700 shadow-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Conversation
        </Button>
      </div>

      {/* Conversations scroll area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length > 0 ? (
          conversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const isEditing = editingId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => !isEditing && onSelectConversation(conv.id)}
                className={cn(
                  'group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium cursor-pointer transition-all',
                  isActive
                    ? 'bg-white text-violet-900 border border-violet-200 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                )}
              >
                {isEditing ? (
                  <form
                    onSubmit={(e) => saveRename(conv.id, e)}
                    className="flex items-center gap-1 w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      autoFocus
                      className="w-full rounded-md border border-violet-400 bg-white px-2 py-0.5 text-xs text-slate-800 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={(e) => saveRename(conv.id, e)}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md"
                      title="Save"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelRename}
                      className="p-1 text-slate-400 hover:bg-slate-100 rounded-md"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <MessageSquare
                        className={cn(
                          'w-4 h-4 shrink-0',
                          isActive ? 'text-violet-600' : 'text-slate-400'
                        )}
                      />
                      <span className="truncate text-left">{conv.title}</span>
                    </div>

                    <div className="hidden group-hover:flex items-center gap-1 shrink-0 ml-1">
                      <button
                        onClick={(e) => startRename(conv, e)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Rename"
                        aria-label="Rename conversation"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conv);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete"
                        aria-label="Delete conversation"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs">
            No previous conversations. Start a new chat!
          </div>
        )}
      </div>
    </div>
  );
};

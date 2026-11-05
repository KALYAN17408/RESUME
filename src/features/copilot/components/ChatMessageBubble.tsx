import React, { useState } from 'react';
import type { CareerMessage } from '../types/copilot.types';
import { Bot, User as UserIcon, Copy, Check, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ChatMessageBubbleProps {
  message: CareerMessage;
  onSuggestionClick?: (suggestion: string) => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  onSuggestionClick,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy message:', err);
    }
  };

  return (
    <div
      className={cn(
        'flex w-full gap-3 py-3 px-2',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-xs">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div
        className={cn(
          'relative max-w-2xl rounded-2xl p-4 text-xs leading-relaxed text-left',
          isUser
            ? 'bg-blue-600 text-white shadow-xs rounded-br-xs'
            : 'border border-slate-200/90 bg-white text-slate-850 shadow-xs rounded-bl-xs'
        )}
      >
        {/* Copy button for assistant responses */}
        {!isUser && (
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Copy response to clipboard"
            aria-label="Copy response"
          >
            {copied ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <Check className="w-3.5 h-3.5" /> Copied
              </span>
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* Message Content */}
        <div className={cn('space-y-2 whitespace-pre-wrap', isUser ? 'text-white' : 'text-slate-800')}>
          {message.content}
        </div>

        {/* Actionable suggestions chips */}
        {!isUser && message.metadata?.actionableSuggestions && message.metadata.actionableSuggestions.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5">
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-violet-700">
              <Sparkles className="w-3 h-3 text-violet-600" />
              Suggested Follow-ups
            </span>
            <div className="flex flex-wrap gap-1.5">
              {message.metadata.actionableSuggestions.map((sugg, i) => (
                <button
                  key={i}
                  onClick={() => onSuggestionClick && onSuggestionClick(sugg)}
                  className="rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200/80 px-2.5 py-1 text-[11px] font-medium transition-colors text-left"
                >
                  {sugg}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-1.5 flex justify-end">
          <span className={cn('text-[9px]', isUser ? 'text-blue-200' : 'text-slate-400')}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-600 shadow-xs">
          <UserIcon className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

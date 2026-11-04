import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  FileText,
  Trash2,
  ExternalLink,
  Search,
  Building,
  Briefcase,
  Calendar,
} from 'lucide-react';
import type { CoverLetterDraft } from '../types/coverLetter.types';

interface CoverLetterDraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: CoverLetterDraft[];
  activeDraftId: string | null;
  onLoadDraft: (draftId: string) => void;
  onDeleteDraft: (draftId: string) => void;
  onNewDraft: () => void;
}

export const CoverLetterDraftsModal: React.FC<CoverLetterDraftsModalProps> = ({
  isOpen,
  onClose,
  drafts,
  activeDraftId,
  onLoadDraft,
  onDeleteDraft,
  onNewDraft,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDrafts = drafts.filter((d) => {
    const q = searchTerm.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.companyName.toLowerCase().includes(q) ||
      d.jobTitle.toLowerCase().includes(q) ||
      d.content.toLowerCase().includes(q)
    );
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Saved Cover Letter Drafts">
      <div className="space-y-4">
        {/* Search Bar & New Button */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search drafts by company, role, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onNewDraft();
              onClose();
            }}
            className="text-xs shrink-0"
          >
            Start New
          </Button>
        </div>

        {/* Drafts List */}
        {drafts.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-200 space-y-2">
            <FileText className="w-8 h-8 text-zinc-300 mx-auto" />
            <p className="text-xs font-semibold text-zinc-700">No saved drafts yet</p>
            <p className="text-[11px] text-zinc-400">
              When you generate or write a cover letter, click "Save Draft" to keep it here.
            </p>
          </div>
        ) : filteredDrafts.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-500">
            No drafts match "{searchTerm}".
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-2.5 pr-1">
            {filteredDrafts.map((draft) => {
              const isActive = draft.id === activeDraftId;
              const formattedDate = new Date(draft.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={draft.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isActive
                      ? 'border-black bg-zinc-50 shadow-xs'
                      : 'border-zinc-200 hover:border-zinc-300 bg-white'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-900 truncate">
                        {draft.title}
                      </span>
                      {isActive && (
                        <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-mono">
                          Current
                        </span>
                      )}
                      <Badge variant="outline" size="sm" className="capitalize text-[10px]">
                        {draft.tone}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-zinc-400" />
                        {draft.companyName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-zinc-400" />
                        {draft.jobTitle}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[10px]">
                        <Calendar className="w-3 h-3 text-zinc-400" />
                        {formattedDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Button
                      variant={isActive ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => onLoadDraft(draft.id)}
                      className="gap-1 text-xs py-1 px-3"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{isActive ? 'Active' : 'Open'}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteDraft(draft.id)}
                      className="text-zinc-400 hover:text-rose-600 p-1.5"
                      title="Delete draft"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};


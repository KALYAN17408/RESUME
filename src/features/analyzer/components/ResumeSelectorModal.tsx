import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ResumeService } from '@/features/resumes/services/resumeService';
import type { ResumeListItem } from '@/features/resumes/types/resume.types';
import { FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatDate } from '@/features/resumes/utils/formatDate';
import { cn } from '@/utils/cn';

interface ResumeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  selectedResumeId?: string;
  onSelectResume: (resume: ResumeListItem) => void;
}

export const ResumeSelectorModal: React.FC<ResumeSelectorModalProps> = ({
  isOpen,
  onClose,
  userId,
  selectedResumeId,
  onSelectResume,
}) => {
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      setIsLoading(true);
      ResumeService.listResumes(userId)
        .then((items) => {
          setResumes(items);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, userId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select a Saved Resume for Analysis">
      <div className="space-y-4">
        <p className="text-xs text-zinc-500">
          Choose one of your saved ResuMax resumes. Structured sections and bullet points will be evaluated directly against your target job description.
        </p>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <Spinner size="md" />
            <p className="text-xs text-zinc-400">Loading your resumes...</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className="py-10 text-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6">
            <FileText className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-zinc-900">No Resumes Found</h4>
            <p className="text-xs text-zinc-500 mt-1">
              You haven't created any resumes yet. You can upload a PDF directly or create a resume in the builder.
            </p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {resumes.map((resume) => {
              const isSelected = resume.id === selectedResumeId;

              return (
                <div
                  key={resume.id}
                  onClick={() => {
                    onSelectResume(resume);
                    onClose();
                  }}
                  className={cn(
                    'p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3',
                    isSelected
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                      : 'bg-white border-zinc-200 hover:border-zinc-400 text-zinc-900 hover:bg-zinc-50'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                        isSelected ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-700'
                      )}
                    >
                      <FileText className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{resume.title}</p>
                      <p
                        className={cn(
                          'text-[10px] truncate',
                          isSelected ? 'text-zinc-300' : 'text-zinc-500'
                        )}
                      >
                        {resume.targetRole || 'General Template'} • Updated{' '}
                        {formatDate(resume.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

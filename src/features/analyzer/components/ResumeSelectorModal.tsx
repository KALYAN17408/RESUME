import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ResumeService } from '@/features/resumes/services/resumeService';
import { ResumeImportModal } from '@/features/resumes/components/ResumeImportModal/ResumeImportModal';
import type { ResumeListItem, ResumeData } from '@/features/resumes/types/resume.types';
import { FileText, CheckCircle2, ArrowRight, UploadCloud } from 'lucide-react';
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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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

  const handleImportSuccess = (newResume: ResumeData) => {
    const listItem: ResumeListItem = {
      id: newResume.id,
      userId: newResume.userId,
      title: newResume.title,
      targetRole: newResume.targetRole,
      templateId: newResume.templateId,
      updatedAt: newResume.updatedAt,
      createdAt: newResume.createdAt,
      atsScore: newResume.atsScore || 0,
    };
    onSelectResume(listItem);
    setIsImportModalOpen(false);
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Select a Saved Resume for Analysis">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              Choose one of your saved resumes, or import a resume directly from your device.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportModalOpen(true)}
              className="text-xs shrink-0 gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5 text-zinc-700" />
              <span>Import from Device</span>
            </Button>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Spinner size="md" />
              <p className="text-xs text-zinc-400">Loading your resumes...</p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="py-10 text-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 space-y-3">
              <FileText className="w-8 h-8 text-zinc-400 mx-auto" />
              <div>
                <h4 className="text-xs font-bold text-zinc-900">No Resumes Found</h4>
                <p className="text-xs text-zinc-500 mt-1">
                  You haven't created any resumes yet. Import a PDF or JSON resume directly from your device.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsImportModalOpen(true)}
                className="gap-1.5 text-xs mx-auto"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Import Resume from Device</span>
              </Button>
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

      {/* Embedded Resume Import Modal */}
      <ResumeImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        userId={userId}
        onImportSuccess={handleImportSuccess}
      />
    </>
  );
};

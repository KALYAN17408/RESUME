import React, { useState, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useUIStore } from '@/stores/uiStore';
import { parseResumeFromFile } from '../../services/resumeParser';
import { ResumeService } from '../../services/resumeService';
import type { ResumeData, TemplateId } from '../../types/resume.types';
import {
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ResumeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onImportSuccess: (newResume: ResumeData) => void;
}

const TEMPLATES: Array<{ id: TemplateId; name: string }> = [
  { id: 'jakes-technical', name: "Jake's Technical" },
  { id: 'harvard-classic', name: 'Harvard Classic' },
  { id: 'stanford-editorial', name: 'Stanford Editorial' },
  { id: 'modern-tech-clean', name: 'Modern Tech Clean' },
];

export const ResumeImportModal: React.FC<ResumeImportModalProps> = ({
  isOpen,
  onClose,
  userId,
  onImportSuccess,
}) => {
  const { addToast } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('jakes-technical');
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatusStep, setImportStatusStep] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetState = () => {
    setSelectedFile(null);
    setCustomTitle('');
    setSelectedTemplate('jakes-technical');
    setIsDragging(false);
    setIsImporting(false);
    setImportStatusStep('');
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (isImporting) return;
    resetState();
    onClose();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setErrorMessage(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    const validExtensions = ['.pdf', '.json', '.txt', '.md'];
    const isAllowed = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!isAllowed) {
      setErrorMessage('Please upload a PDF (.pdf), JSON (.json), or text (.txt) resume file.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 15MB limit.');
      return;
    }

    setSelectedFile(file);
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    setCustomTitle(`Imported - ${nameWithoutExt}`);
    setErrorMessage(null);
  };

  const handleExecuteImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setErrorMessage(null);
    setImportStatusStep('Reading file from device...');

    try {
      setImportStatusStep('Extracting text and structure...');
      const parsedResume = await parseResumeFromFile(
        selectedFile,
        userId || 'demo_user',
        selectedTemplate,
        customTitle
      );

      setImportStatusStep('Saving resume to workspace...');
      const saveResult = await ResumeService.saveResume(parsedResume);

      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save imported resume.');
      }

      addToast({
        message: `Successfully imported "${parsedResume.title}"!`,
        type: 'success',
      });

      onImportSuccess(parsedResume);
      handleClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to import resume.';
      setErrorMessage(msg);
      setIsImporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Resume from Device">
      <div className="space-y-5">
        <p className="text-xs text-zinc-500">
          Upload an existing resume from your computer. RESUME AI automatically parses your contact details, work experience, education, and technical skills into an editable ATS-ready format.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf,.json,application/json,.txt,text/plain,.md,text/markdown"
          className="hidden"
          onChange={handleFileInputChange}
        />

        {/* File Dropzone */}
        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all',
              isDragging
                ? 'border-black bg-zinc-100 scale-[0.99]'
                : 'border-zinc-200 hover:border-zinc-400 bg-zinc-50/50 hover:bg-zinc-50'
            )}
          >
            <div className="w-12 h-12 rounded-2xl bg-zinc-200/80 flex items-center justify-center mx-auto text-zinc-900 mb-3 shadow-xs">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-zinc-900">
              Click to browse or drag & drop resume file
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Supports PDF documents, JSON resumes, and plain text files up to 15MB
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-900 truncate">{selectedFile.name}</p>
                  <p className="text-[10px] text-zinc-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready to Import
                  </p>
                </div>
              </div>

              {!isImporting && (
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-200 transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Resume Title Input */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                Resume Title in Workspace
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                disabled={isImporting}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-black"
                placeholder="e.g. Senior Software Engineer - Master"
              />
            </div>

            {/* Target Template Selection */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                Target ATS Template
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tpl.id)}
                    disabled={isImporting}
                    className={cn(
                      'p-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between',
                      selectedTemplate === tpl.id
                        ? 'border-black bg-white shadow-xs text-black font-bold'
                        : 'border-zinc-200 hover:border-zinc-300 bg-zinc-100 text-zinc-600'
                    )}
                  >
                    <span>{tpl.name}</span>
                    {selectedTemplate === tpl.id && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Processing State */}
        {isImporting && (
          <div className="p-4 rounded-2xl bg-zinc-900 text-white flex items-center gap-3 animate-fade-in">
            <Spinner size="sm" className="text-white shrink-0" />
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-white">Importing Resume from Device</p>
              <p className="text-[11px] text-zinc-300">{importStatusStep}</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isImporting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExecuteImport}
            disabled={!selectedFile || isImporting}
            className="gap-1.5"
          >
            {isImporting ? (
              <>
                <Spinner size="sm" />
                <span>Importing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Import to Workspace</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

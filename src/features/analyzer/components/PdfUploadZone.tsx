import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react';
import { validatePdfFile } from '../services/textExtractor';
import { cn } from '@/utils/cn';

interface PdfUploadZoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  error?: string | null;
}

export const PdfUploadZone: React.FC<PdfUploadZoneProps> = ({
  selectedFile,
  onFileSelect,
  error,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    setLocalError(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(null);
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const validation = validatePdfFile(file);
    if (!validation.valid) {
      setLocalError(validation.error || 'Invalid PDF file.');
      onFileSelect(null);
      return;
    }
    setLocalError(null);
    onFileSelect(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    setLocalError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const displayError = error || localError;

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleFileInput}
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all',
            isDragging
              ? 'border-black bg-zinc-100 scale-[0.99]'
              : 'border-zinc-200 hover:border-zinc-400 bg-zinc-50/50 hover:bg-zinc-50'
          )}
        >
          <div className="w-10 h-10 rounded-2xl bg-zinc-200/80 flex items-center justify-center mx-auto text-zinc-900 mb-3">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-zinc-900">
            Click to upload or drag & drop resume PDF
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">
            Standard PDF format up to 10MB (Vector text streams recommended)
          </p>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-white border border-zinc-200 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 truncate">{selectedFile.name}</p>
              <p className="text-[10px] text-zinc-500">
                {(selectedFile.size / 1024).toFixed(1)} KB • PDF Document
              </p>
            </div>
          </div>

          <button
            onClick={handleRemove}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors"
            aria-label="Remove uploaded file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {displayError && (
        <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
};

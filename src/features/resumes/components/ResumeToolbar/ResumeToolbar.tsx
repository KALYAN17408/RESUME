import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Tooltip } from '@/components/ui/Tooltip';
import type { ResumeData, SaveStatus, TemplateId, ResumeCustomization } from '../../types/resume.types';
import { TEMPLATE_REGISTRY } from '../../templates/templateRegistry';
import { TemplateSelectorModal } from './TemplateSelectorModal';
import { CustomizationModal } from './CustomizationModal';
import { ResumeImportModal } from '../ResumeImportModal/ResumeImportModal';
import { downloadResumePdf } from '../../pdf/generateResumePdf';
import {
  ArrowLeft,
  Download,
  LayoutTemplate,
  Palette,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  Cloud,
  AlertCircle,
  UploadCloud,
} from 'lucide-react';

interface ResumeToolbarProps {
  data: ResumeData;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  errorMessage: string | null;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onTitleChange: (title: string) => void;
  onTemplateChange: (id: TemplateId) => void;
  onCustomizationChange: (customization: Partial<ResumeCustomization>) => void;
  activeTab: 'editor' | 'preview';
  onTabChange: (tab: 'editor' | 'preview') => void;
}

export const ResumeToolbar: React.FC<ResumeToolbarProps> = ({
  data,
  saveStatus,
  lastSavedAt,
  errorMessage,
  zoom,
  onZoomChange,
  onTitleChange,
  onTemplateChange,
  onCustomizationChange,
  activeTab,
  onTabChange,
}) => {
  const navigate = useNavigate();
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(data.title);

  const activeTemplate = TEMPLATE_REGISTRY[data.templateId] || TEMPLATE_REGISTRY['jakes-technical'];

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      onTitleChange(titleInput.trim());
    } else {
      setTitleInput(data.title);
    }
  };

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      await downloadResumePdf(data);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left section: Navigation & Title & Save Status */}
          <div className="flex items-center gap-3 min-w-0">
            <Tooltip content="Back to My Resumes">
              <Link
                to="/dashboard/resumes"
                className="p-1.5 rounded-radius-sm hover:bg-blue-50 text-slate-500 hover:text-blue-700 transition-colors focus-ring"
                aria-label="Back to Resumes"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Tooltip>

            {/* Editable Title */}
            <div className="flex items-center gap-2 min-w-0">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSubmit();
                    if (e.key === 'Escape') {
                      setIsEditingTitle(false);
                      setTitleInput(data.title);
                    }
                  }}
                  autoFocus
                  className="text-sm sm:text-base font-bold text-slate-900 border-b-2 border-blue-600 px-1 py-0.5 outline-none bg-blue-50/50 rounded-radius-xs"
                />
              ) : (
                <h1
                  onClick={() => {
                    setTitleInput(data.title);
                    setIsEditingTitle(true);
                  }}
                  className="text-sm sm:text-base font-bold text-slate-900 cursor-pointer hover:bg-slate-100 px-2 py-0.5 rounded-radius-xs transition-colors flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-[320px]"
                  title="Click to rename"
                >
                  <span className="truncate">{data.title}</span>
                  <span className="text-[10px] text-slate-400 font-normal hidden sm:inline shrink-0">(rename)</span>
                </h1>
              )}
            </div>

            {/* Save Status Indicator */}
            <div className="flex items-center text-xs shrink-0">
              {saveStatus === 'saving' && (
                <span className="inline-flex items-center gap-1.5 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Spinner size="sm" className="text-amber-600" />
                  <span className="hidden sm:inline">Saving...</span>
                </span>
              )}
              {saveStatus === 'saved' && (
                <span
                  className="inline-flex items-center gap-1 text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"
                  title={lastSavedAt ? `Saved at ${lastSavedAt.toLocaleTimeString()}` : 'Cloud Synced'}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Saved</span>
                </span>
              )}
              {saveStatus === 'offline' && (
                <span
                  className="inline-flex items-center gap-1 text-slate-800 font-medium bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200"
                  title="Saved to local browser storage"
                >
                  <Cloud className="w-3.5 h-3.5 text-slate-900" />
                  <span className="hidden sm:inline">Saved locally</span>
                </span>
              )}
              {saveStatus === 'error' && (
                <span
                  className="inline-flex items-center gap-1 text-rose-800 font-medium bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200"
                  title={errorMessage || 'Save failed'}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden sm:inline">Save Failed</span>
                </span>
              )}
            </div>
          </div>

          {/* Mobile Tab Switcher (Editor vs Preview) */}
          <div className="flex lg:hidden items-center justify-center p-1 bg-slate-100 rounded-radius-sm">
            <button
              type="button"
              onClick={() => onTabChange('editor')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-radius-xs transition-all ${
                activeTab === 'editor' ? 'bg-blue-600 shadow-xs text-white' : 'text-slate-600'
              }`}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => onTabChange('preview')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-radius-xs transition-all ${
                activeTab === 'preview' ? 'bg-blue-600 shadow-xs text-white' : 'text-slate-600'
              }`}
            >
              Preview
            </button>
          </div>

          {/* Right section: Import, Template, Appearance, Zoom & Export */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Direct Resume Import Action */}
            <Tooltip content="Import resume from PDF, JSON, or TXT">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImportModalOpen(true)}
                leftIcon={<UploadCloud className="w-3.5 h-3.5 text-slate-700" />}
                className="text-xs"
              >
                Import
              </Button>
            </Tooltip>

            {/* Template Selector Button */}
            <Tooltip content="Choose ATS-friendly resume template">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTemplateModalOpen(true)}
                leftIcon={<LayoutTemplate className="w-3.5 h-3.5 text-slate-600" />}
                className="text-xs"
              >
                <span>{activeTemplate.name}</span>
              </Button>
            </Tooltip>

            {/* Customization Button */}
            <Tooltip content="Customize fonts, colors, and margins">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCustomModalOpen(true)}
                leftIcon={<Palette className="w-3.5 h-3.5 text-slate-600" />}
                className="text-xs"
              >
                Style
              </Button>
            </Tooltip>

            {/* Zoom Controls (Hidden on small screens) */}
            <div className="hidden xl:flex items-center border border-slate-200 rounded-radius-sm p-0.5 bg-slate-50">
              <Tooltip content="Zoom Out">
                <button
                  type="button"
                  onClick={() => onZoomChange(Math.max(50, zoom - 10))}
                  className="p-1 hover:bg-white rounded-radius-xs text-slate-600 hover:text-slate-900 transition-colors focus-ring"
                  aria-label="Zoom Out"
                  disabled={zoom <= 50}
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
              <Tooltip content="Reset Zoom to 100%">
                <button
                  type="button"
                  onClick={() => onZoomChange(100)}
                  className="px-2 text-[11px] font-mono font-medium text-slate-700 hover:bg-white rounded-radius-xs focus-ring"
                  aria-label="Reset Zoom to 100%"
                >
                  {zoom}%
                </button>
              </Tooltip>
              <Tooltip content="Zoom In">
                <button
                  type="button"
                  onClick={() => onZoomChange(Math.min(150, zoom + 10))}
                  className="p-1 hover:bg-white rounded-radius-xs text-slate-600 hover:text-slate-900 transition-colors focus-ring"
                  aria-label="Zoom In"
                  disabled={zoom >= 150}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </div>

            {/* Export PDF */}
            <Tooltip content="Export PDF">
              <Button
                variant="primary"
                size="sm"
                onClick={handleExportPdf}
                isLoading={isExporting}
                leftIcon={<Download className="w-4 h-4" />}
                className="text-xs font-bold shadow-xs"
              >
                {isExporting ? 'Generating PDF...' : 'Download PDF'}
              </Button>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* Modals */}
      <TemplateSelectorModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        activeTemplateId={data.templateId}
        onSelectTemplate={onTemplateChange}
      />

      <CustomizationModal
        isOpen={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        customization={data.customization}
        onUpdate={onCustomizationChange}
      />

      <ResumeImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        userId={data.userId}
        onImportSuccess={(newResume) => {
          navigate(`/dashboard/resumes/${newResume.id}/edit`);
        }}
      />
    </>
  );
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { ResumeData, SaveStatus, TemplateId, ResumeCustomization } from '../../types/resume.types';
import { TEMPLATE_REGISTRY } from '../../templates/templateRegistry';
import { TemplateSelectorModal } from './TemplateSelectorModal';
import { CustomizationModal } from './CustomizationModal';
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
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);
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
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left section: Navigation & Title & Save Status */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/resumes"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              title="Back to Resumes"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            {/* Editable Title */}
            <div className="flex items-center gap-2">
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
                  className="text-base font-bold text-slate-900 border-b-2 border-brand-600 px-1 py-0.5 outline-none bg-brand-50/40 rounded"
                />
              ) : (
                <h1
                  onClick={() => {
                    setTitleInput(data.title);
                    setIsEditingTitle(true);
                  }}
                  className="text-base font-bold text-slate-900 cursor-pointer hover:bg-slate-100 px-2 py-0.5 rounded transition-colors flex items-center gap-1.5"
                  title="Click to rename"
                >
                  <span>{data.title}</span>
                  <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">(click to rename)</span>
                </h1>
              )}
            </div>

            {/* Save Status Indicator */}
            <div className="flex items-center text-xs">
              {saveStatus === 'saving' && (
                <span className="inline-flex items-center gap-1.5 text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                  <Spinner size="sm" className="text-amber-600" />
                  <span className="hidden sm:inline">Saving...</span>
                </span>
              )}
              {saveStatus === 'saved' && (
                <span
                  className="inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60"
                  title={lastSavedAt ? `Saved at ${lastSavedAt.toLocaleTimeString()}` : 'Saved to Supabase'}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Saved</span>
                </span>
              )}
              {saveStatus === 'offline' && (
                <span
                  className="inline-flex items-center gap-1 text-indigo-700 font-medium bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60"
                  title="Saved to local browser storage"
                >
                  <Cloud className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Cached Locally</span>
                </span>
              )}
              {saveStatus === 'error' && (
                <span
                  className="inline-flex items-center gap-1 text-rose-700 font-medium bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60"
                  title={errorMessage || 'Save failed'}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden sm:inline">Save Failed</span>
                </span>
              )}
            </div>
          </div>

          {/* Mobile Tab Switcher (Editor vs Preview) */}
          <div className="flex lg:hidden items-center justify-center p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => onTabChange('editor')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'editor' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
              }`}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => onTabChange('preview')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'preview' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
              }`}
            >
              Preview
            </button>
          </div>

          {/* Right section: Template, Appearance, Zoom & Export */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Template Selector Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTemplateModalOpen(true)}
              leftIcon={<LayoutTemplate className="w-3.5 h-3.5 text-slate-600" />}
              className="text-xs"
            >
              <span>{activeTemplate.name}</span>
            </Button>

            {/* Customization Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCustomModalOpen(true)}
              leftIcon={<Palette className="w-3.5 h-3.5 text-slate-600" />}
              className="text-xs"
            >
              Style
            </Button>

            {/* Zoom Controls (Hidden on small screens) */}
            <div className="hidden xl:flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => onZoomChange(Math.max(50, zoom - 10))}
                className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
                title="Zoom Out"
                disabled={zoom <= 50}
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onZoomChange(100)}
                className="px-2 text-[11px] font-mono font-medium text-slate-700 hover:bg-white rounded"
                title="Reset Zoom"
              >
                {zoom}%
              </button>
              <button
                type="button"
                onClick={() => onZoomChange(Math.min(150, zoom + 10))}
                className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
                title="Zoom In"
                disabled={zoom >= 150}
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Export Vector PDF */}
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
    </>
  );
};

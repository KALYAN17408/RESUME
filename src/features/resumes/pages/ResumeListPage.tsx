import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { ResumeService } from '../services/resumeService';
import type { ResumeListItem } from '../types/resume.types';
import { ResumeCard } from '../components/ResumeList/ResumeCard';
import { DeleteResumeModal } from '../components/ResumeList/DeleteResumeModal';
import { RenameResumeModal } from '../components/ResumeList/RenameResumeModal';
import {
  Plus,
  FileText,
  Sparkles,
  ShieldCheck,
  Search,
} from 'lucide-react';

export const ResumeListPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [renameTarget, setRenameTarget] = useState<{ id: string; title: string } | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const effectiveUserId = user?.id || 'demo_user';

  const loadResumes = async () => {
    setLoading(true);
    try {
      const list = await ResumeService.listResumes(effectiveUserId);
      setResumes(list);
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, [effectiveUserId]);

  const handleCreateNew = async () => {
    setIsCreating(true);
    try {
      const newResume = await ResumeService.createResume(
        effectiveUserId,
        'Untitled Resume',
        'jakes-technical',
        false
      );
      navigate(`/dashboard/resumes/${newResume.id}/edit`);
    } catch (err) {
      console.error('Failed to create resume:', err);
      setIsCreating(false);
    }
  };

  const handleCreateSample = async () => {
    setIsCreating(true);
    try {
      const sampleResume = await ResumeService.createResume(
        effectiveUserId,
        'Senior Software Engineer (Sample)',
        'jakes-technical',
        true
      );
      navigate(`/dashboard/resumes/${sampleResume.id}/edit`);
    } catch (err) {
      console.error('Failed to create sample resume:', err);
      setIsCreating(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await ResumeService.duplicateResume(id, effectiveUserId);
      if (duplicated) {
        await loadResumes();
      }
    } catch (err) {
      console.error('Failed to duplicate resume:', err);
    }
  };

  const handleRenameConfirm = async (newTitle: string) => {
    if (!renameTarget) return;
    try {
      await ResumeService.renameResume(renameTarget.id, effectiveUserId, newTitle);
      await loadResumes();
    } catch (err) {
      console.error('Failed to rename resume:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await ResumeService.deleteResume(deleteTarget.id, effectiveUserId);
      await loadResumes();
    } catch (err) {
      console.error('Failed to delete resume:', err);
    }
  };

  const filteredResumes = resumes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.targetRole && r.targetRole.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>My Resumes</span>
            <Badge variant="brand" size="sm">
              Module A
            </Badge>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build, edit, and export ATS-friendly single-column resumes with real-time vector text.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateSample}
            isLoading={isCreating}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-brand-600" />}
          >
            Load Sample
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreateNew}
            isLoading={isCreating}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Resume
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      {resumes.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search resumes by title or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Spinner size="lg" className="mx-auto text-brand-600" />
          <p className="text-xs text-slate-500 font-medium">Loading your resumes...</p>
        </div>
      ) : resumes.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-10 sm:p-16 text-center max-w-2xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200/60 text-brand-600 flex items-center justify-center mx-auto shadow-xs">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No resumes created yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Create your first ATS-safe resume using battle-tested formats like Jake&apos;s Tech or Harvard Classic, or start from our engineering sample.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              onClick={handleCreateNew}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create New Resume
            </Button>
            <Button
              variant="outline"
              onClick={handleCreateSample}
              leftIcon={<Sparkles className="w-4 h-4 text-brand-600" />}
            >
              Start with Sample Data
            </Button>
          </div>

          <div className="pt-6 border-t border-slate-200/80 flex items-center justify-center gap-6 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Vector Stream PDF
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-600" /> Auto-saved in Real Time
            </span>
          </div>
        </div>
      ) : filteredResumes.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700">No resumes match &quot;{searchQuery}&quot;</p>
          <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
            Clear Search
          </Button>
        </div>
      ) : (
        /* Resume Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onDuplicate={handleDuplicate}
              onRename={(id, title) => setRenameTarget({ id, title })}
              onDelete={(id, title) => setDeleteTarget({ id, title })}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {deleteTarget && (
        <DeleteResumeModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          resumeTitle={deleteTarget.title}
        />
      )}

      {renameTarget && (
        <RenameResumeModal
          isOpen={!!renameTarget}
          onClose={() => setRenameTarget(null)}
          onConfirm={handleRenameConfirm}
          currentTitle={renameTarget.title}
        />
      )}
    </div>
  );
};

import React, { useEffect, useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { OptimizationSessionService } from '../services/optimizationSessionService';
import type {
  OptimizationSession,
  OptimizationSessionListItem,
  OptimizationSessionStatus,
} from '../types/optimizer.types';
import {
  History,
  Search,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  FileText,
  Briefcase,
  Building,
  Calendar,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export interface OptimizationSessionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentSessionId?: string | null;
  onSelectSession: (session: OptimizationSession) => void;
  onNewSession?: () => void;
}

function formatSessionDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

const STATUS_LABELS: Record<OptimizationSessionStatus, { label: string; variant: 'outline' | 'default' | 'secondary' }> = {
  draft: { label: 'Draft', variant: 'outline' },
  in_progress: { label: 'In Progress', variant: 'secondary' },
  partially_applied: { label: 'Partially Applied', variant: 'outline' },
  completed: { label: 'Completed', variant: 'default' },
  archived: { label: 'Archived', variant: 'outline' },
};

export const OptimizationSessionHistory: React.FC<OptimizationSessionHistoryProps> = ({
  isOpen,
  onClose,
  userId,
  currentSessionId,
  onSelectSession,
  onNewSession,
}) => {
  const [sessions, setSessions] = useState<OptimizationSessionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Inline rename state
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  // Deleting state
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Loading full session indicator
  const [openingSessionId, setOpeningSessionId] = useState<string | null>(null);

  const fetchSessions = async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const items = await OptimizationSessionService.listSessions(userId);
      setSessions(items);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to load sessions: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
      setSearchQuery('');
      setStatusFilter('all');
      setEditingSessionId(null);
      setDeletingSessionId(null);
    }
  }, [isOpen, userId]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.sessionName.toLowerCase().includes(q);
        const matchesJob = s.jobTitle?.toLowerCase().includes(q) || false;
        const matchesCompany = s.companyName?.toLowerCase().includes(q) || false;
        const matchesResume = s.resumeTitle?.toLowerCase().includes(q) || false;
        return matchesName || matchesJob || matchesCompany || matchesResume;
      }
      return true;
    });
  }, [sessions, searchQuery, statusFilter]);

  const handleOpenSession = async (sessionId: string) => {
    setOpeningSessionId(sessionId);
    try {
      const fullSession = await OptimizationSessionService.getSessionById(sessionId, userId);
      if (fullSession) {
        onSelectSession(fullSession);
        onClose();
      } else {
        setError('Could not retrieve full session data.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to open session: ${msg}`);
    } finally {
      setOpeningSessionId(null);
    }
  };

  const handleStartRename = (sessionId: string, currentName: string) => {
    setEditingSessionId(sessionId);
    setEditingName(currentName);
  };

  const handleSaveRename = async (sessionId: string) => {
    if (!editingName.trim()) return;
    setIsRenaming(true);
    try {
      const ok = await OptimizationSessionService.renameSession(sessionId, editingName.trim(), userId);
      if (ok) {
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, sessionName: editingName.trim() } : s))
        );
        setEditingSessionId(null);
      } else {
        setError('Failed to rename session');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to rename: ${msg}`);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    setIsDeleting(true);
    try {
      const ok = await OptimizationSessionService.deleteSession(sessionId, userId);
      if (ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        setDeletingSessionId(null);
      } else {
        setError('Failed to delete session');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to delete: ${msg}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Optimization Sessions History"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-zinc-500">
            Revisit, manage, and continue previous AI optimization sessions with all staged changes intact.
          </p>
          {onNewSession && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onNewSession();
                onClose();
              }}
              className="gap-1.5 text-xs shrink-0 bg-black text-white hover:bg-zinc-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Session</span>
            </Button>
          )}
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search sessions by name, job, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white text-zinc-700"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="in_progress">In Progress</option>
            <option value="partially_applied">Partially Applied</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-500 hover:text-rose-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Session List Body */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <Spinner size="md" />
            <p className="text-xs text-zinc-400">Loading optimization history...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 space-y-2">
            <History className="w-8 h-8 text-zinc-300 mx-auto" />
            <h4 className="text-xs font-bold text-zinc-900">
              {sessions.length === 0 ? 'No Optimization Sessions Yet' : 'No Matching Sessions'}
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {sessions.length === 0
                ? 'Your AI optimization sessions will automatically be preserved here so you can pick up where you left off.'
                : 'Try adjusting your search criteria or status filter to find the session.'}
            </p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-2.5 pr-1">
            {filteredSessions.map((session) => {
              const isCurrent = session.id === currentSessionId;
              const isEditing = editingSessionId === session.id;
              const isDeletingThis = deletingSessionId === session.id;
              const isOpeningThis = openingSessionId === session.id;

              return (
                <div
                  key={session.id}
                  className={cn(
                    'p-4 rounded-2xl border transition-all space-y-2.5',
                    isCurrent
                      ? 'bg-zinc-50/80 border-black shadow-xs'
                      : 'bg-white border-zinc-200 hover:border-zinc-300'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Session Title & Metadata */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(session.id);
                              if (e.key === 'Escape') setEditingSessionId(null);
                            }}
                            autoFocus
                            className="text-xs font-bold px-2 py-1 rounded-lg border border-black focus:outline-none w-full max-w-xs"
                          />
                          <button
                            onClick={() => handleSaveRename(session.id)}
                            disabled={isRenaming}
                            className="p-1 rounded-lg bg-black text-white hover:bg-zinc-800 disabled:opacity-50"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingSessionId(null)}
                            disabled={isRenaming}
                            className="p-1 rounded-lg bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-zinc-900 truncate">
                            {session.sessionName}
                          </h4>
                          {isCurrent && (
                            <Badge variant="outline" size="sm" className="font-mono text-[9px] bg-black text-white border-black">
                              Active
                            </Badge>
                          )}
                          <button
                            onClick={() => handleStartRename(session.id, session.sessionName)}
                            className="text-zinc-400 hover:text-black transition-colors"
                            title="Rename session"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500 mt-1">
                        {session.jobTitle && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-zinc-400" />
                            <span>{session.jobTitle}</span>
                          </span>
                        )}
                        {session.companyName && (
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-zinc-400" />
                            <span>{session.companyName}</span>
                          </span>
                        )}
                        {session.resumeTitle && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3 text-zinc-400" />
                            <span>{session.resumeTitle}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          <span>{formatSessionDate(session.updatedAt)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Status & Staged Count Badges */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-zinc-200 text-zinc-600 bg-zinc-50">
                        {STATUS_LABELS[session.status]?.label || session.status}
                      </span>
                      {session.stagedCount > 0 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-white flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{session.stagedCount} staged</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-400 px-1.5">
                          0 staged
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
                    <div>
                      {isDeletingThis ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-rose-600 font-semibold">
                            Delete this session?
                          </span>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteSession(session.id)}
                            disabled={isDeleting}
                            className="h-7 px-2 text-[11px]"
                          >
                            {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingSessionId(null)}
                            disabled={isDeleting}
                            className="h-7 px-2 text-[11px]"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingSessionId(session.id)}
                          className="text-zinc-400 hover:text-rose-600 transition-colors p-1"
                          title="Delete session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <Button
                      variant={isCurrent ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleOpenSession(session.id)}
                      disabled={isOpeningThis}
                      className="gap-1.5 text-xs h-7 px-3"
                    >
                      {isOpeningThis ? (
                        <>
                          <Spinner size="sm" />
                          <span>Opening...</span>
                        </>
                      ) : (
                        <>
                          <span>{isCurrent ? 'Current Session' : 'Open Session'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
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

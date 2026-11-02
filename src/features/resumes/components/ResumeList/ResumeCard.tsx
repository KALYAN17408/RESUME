import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { ResumeListItem } from '../../types/resume.types';
import { TEMPLATE_REGISTRY } from '../../templates/templateRegistry';
import {
  FileText,
  Clock,
  Edit,
  Copy,
  Trash2,
  Edit3,
} from 'lucide-react';

interface ResumeCardProps {
  resume: ResumeListItem;
  onDuplicate: (id: string) => void;
  onRename: (id: string, currentTitle: string) => void;
  onDelete: (id: string, title: string) => void;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({
  resume,
  onDuplicate,
  onRename,
  onDelete,
}) => {
  const template = TEMPLATE_REGISTRY[resume.templateId] || TEMPLATE_REGISTRY['jakes-technical'];
  const formattedDate = new Date(resume.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card className="p-5 flex flex-col justify-between hover:shadow-elevated transition-all border-slate-200 group">
      <div className="space-y-3">
        {/* Header: Title and Template Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-200/60 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">
                {resume.title}
              </h3>
              {resume.targetRole && (
                <p className="text-[11px] text-slate-500 line-clamp-1">{resume.targetRole}</p>
              )}
            </div>
          </div>
          <Badge variant="default" size="sm" className="shrink-0 text-[10px]">
            {template.name}
          </Badge>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Updated {formattedDate}
          </span>
          {resume.atsScore && resume.atsScore > 0 ? (
            <span className="text-emerald-600 font-semibold">
              Score: {resume.atsScore}/100
            </span>
          ) : null}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link to={`/dashboard/resumes/${resume.id}/edit`} className="flex-1">
          <Button variant="primary" size="sm" className="w-full text-xs font-bold" leftIcon={<Edit className="w-3.5 h-3.5" />}>
            Edit Resume
          </Button>
        </Link>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDuplicate(resume.id)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Duplicate Resume"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onRename(resume.id, resume.title)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Rename Resume"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(resume.id, resume.title)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Resume"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
};

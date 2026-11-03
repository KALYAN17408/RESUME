import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  FileText,
  Briefcase,
  Building,
  RotateCcw,
  Edit3,
  ScanSearch,
  CheckCircle2,
} from 'lucide-react';

interface OptimizerHeaderProps {
  resumeTitle: string;
  resumeId?: string;
  targetJobTitle?: string;
  companyName?: string;
  totalStagedCount: number;
  onChangeResume: () => void;
  onReset: () => void;
}

export const OptimizerHeader: React.FC<OptimizerHeaderProps> = ({
  resumeTitle,
  resumeId,
  targetJobTitle,
  companyName,
  totalStagedCount,
  onChangeResume,
  onReset,
}) => {
  const navigate = useNavigate();

  return (
    <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Info */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-zinc-900 tracking-wider uppercase">
              Module C • AI Resume Optimizer
            </span>
            <Badge variant="outline" size="sm" className="font-mono text-[10px]">
              Grounded Heuristics
            </Badge>
            {totalStagedCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black text-white flex items-center gap-1 shadow-xs">
                <CheckCircle2 className="w-3 h-3" />
                <span>{totalStagedCount} change{totalStagedCount > 1 ? 's' : ''} staged</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-100 text-zinc-900 text-xs font-bold">
              <FileText className="w-3.5 h-3.5 text-zinc-700" />
              <span>{resumeTitle}</span>
            </div>

            {targetJobTitle && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs">
                <Briefcase className="w-3 h-3 text-zinc-400" />
                <span>{targetJobTitle}</span>
              </div>
            )}

            {companyName && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs">
                <Building className="w-3 h-3 text-zinc-400" />
                <span>{companyName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Navigation Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {resumeId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/dashboard/resumes/${resumeId}/edit`)}
              className="gap-1.5 text-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Resume Builder</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/analyzer')}
            className="gap-1.5 text-xs"
          >
            <ScanSearch className="w-3.5 h-3.5" />
            <span>ATS Analyzer</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onChangeResume}
            className="gap-1.5 text-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Change Resume</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="gap-1.5 text-xs text-zinc-500 hover:text-black"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

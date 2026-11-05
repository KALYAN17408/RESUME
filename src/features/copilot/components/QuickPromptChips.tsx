import React from 'react';
import { Sparkles, FileText, Target, MessageSquare, Compass, ArrowRight } from 'lucide-react';

interface QuickPromptChipsProps {
  onSelectPrompt: (prompt: string) => void;
  candidateRole?: string;
}

export const QuickPromptChips: React.FC<QuickPromptChipsProps> = ({
  onSelectPrompt,
  candidateRole = 'Software Professional',
}) => {
  const prompts = [
    {
      icon: FileText,
      label: 'Resume Assessment',
      prompt: `Review my current resume highlights for ${candidateRole} roles and identify where to quantify impact.`,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      icon: Target,
      label: 'Skill Gap Evaluation',
      prompt: 'Analyze my current skills and suggest the top 3 high-demand technologies I should learn next.',
      color: 'text-violet-600 bg-violet-50 border-violet-200',
    },
    {
      icon: MessageSquare,
      label: 'Behavioral Interview Prep',
      prompt: 'Help me structure a STAR behavioral answer about solving a high-stakes technical disagreement.',
      color: 'text-teal-600 bg-teal-50 border-teal-200',
    },
    {
      icon: Compass,
      label: 'Career Trajectory Roadmap',
      prompt: 'Create a 6-month actionable roadmap to transition from Mid-level to Senior Software Engineer.',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
  ];

  return (
    <div className="space-y-4 py-8 px-4 text-center max-w-2xl mx-auto">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 shadow-xs">
        <Sparkles className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-900">Welcome to AI Career Copilot</h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
          Your personal career strategist. Ask for resume bullet reviews, interview frameworks, skill gap roadmaps, and offer navigation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
        {prompts.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-violet-300 hover:shadow-xs transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg border text-xs ${item.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-violet-600 transition-colors" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-violet-700 transition-colors">
                  {item.label}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {item.prompt}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

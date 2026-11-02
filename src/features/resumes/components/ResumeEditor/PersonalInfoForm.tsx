import React from 'react';
import { Input } from '@/components/ui/Input';
import type { PersonalInfo } from '../../types/resume.types';

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (partial: Partial<PersonalInfo>) => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Personal & Contact Details</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Recruiters and ATS parsers extract contact details strictly from the header.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label="Full Name"
          placeholder="e.g. Alex Johnson"
          value={data.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
        />

        <Input
          label="Professional Title"
          placeholder="e.g. Senior Software Engineer"
          value={data.professionalTitle}
          onChange={(e) => onChange({ professionalTitle: e.target.value })}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="alex@example.com"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
        />

        <Input
          label="Phone Number"
          placeholder="+1 (555) 019-2834"
          value={data.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
        />

        <Input
          label="Location"
          placeholder="e.g. San Francisco, CA"
          value={data.location}
          onChange={(e) => onChange({ location: e.target.value })}
        />

        <Input
          label="LinkedIn URL"
          placeholder="https://linkedin.com/in/alex"
          value={data.linkedinUrl}
          onChange={(e) => onChange({ linkedinUrl: e.target.value })}
        />

        <Input
          label="GitHub Profile URL"
          placeholder="https://github.com/alex"
          value={data.githubUrl}
          onChange={(e) => onChange({ githubUrl: e.target.value })}
        />

        <Input
          label="Portfolio / Website URL"
          placeholder="https://alexjohnson.dev"
          value={data.portfolioUrl}
          onChange={(e) => onChange({ portfolioUrl: e.target.value })}
        />
      </div>

      <div className="space-y-1.5 pt-2">
        <label className="text-xs font-semibold text-slate-700 block">
          Professional Summary
        </label>
        <textarea
          rows={4}
          value={data.summary}
          onChange={(e) => onChange({ summary: e.target.value })}
          placeholder="High-impact summary highlighting years of experience, core domains, and major quantified achievements..."
          className="w-full text-xs rounded-xl border border-slate-300 p-3 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all leading-relaxed"
        />
        <p className="text-[11px] text-slate-500">
          Tip: Keep summary under 3-4 sentences focusing on quantified impact.
        </p>
      </div>
    </div>
  );
};

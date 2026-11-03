import React from 'react';
import type { ResumeData } from '../types/resume.types';
import { formatResumeDateRange, formatResumeDate } from '../utils/formatDate';
import { sanitizeUrl, cleanDisplayUrl } from '../utils/sanitizeUrl';

interface TemplateProps {
  data: ResumeData;
}

export const HarvardClassicTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo } = data;
  const fontStyle = { fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' };

  // Contact items array
  const contactItems: { label: string; url?: string }[] = [];
  if (personalInfo.location) contactItems.push({ label: personalInfo.location });
  if (personalInfo.phone) contactItems.push({ label: personalInfo.phone, url: sanitizeUrl(personalInfo.phone) });
  if (personalInfo.email) contactItems.push({ label: personalInfo.email, url: sanitizeUrl(personalInfo.email) });
  if (personalInfo.linkedinUrl) contactItems.push({ label: cleanDisplayUrl(personalInfo.linkedinUrl), url: sanitizeUrl(personalInfo.linkedinUrl) });
  if (personalInfo.githubUrl) contactItems.push({ label: cleanDisplayUrl(personalInfo.githubUrl), url: sanitizeUrl(personalInfo.githubUrl) });
  if (personalInfo.portfolioUrl) contactItems.push({ label: cleanDisplayUrl(personalInfo.portfolioUrl), url: sanitizeUrl(personalInfo.portfolioUrl) });

  const renderSection = (type: string) => {
    if (!data.enabledSections[type as keyof typeof data.enabledSections]) return null;

    switch (type) {
      case 'summary':
        if (!personalInfo.summary) return null;
        return (
          <div key="summary" className="mb-4">
            <h2 className="text-[12px] font-bold uppercase tracking-wider text-center border-b border-slate-400 pb-0.5 mb-1.5 text-slate-900">
              Professional Summary
            </h2>
            <p className="text-[10.5px] leading-relaxed text-slate-800 text-justify">
              {personalInfo.summary}
            </p>
          </div>
        );

      case 'education':
        if (!data.educations.length) return null;
        return (
          <div key="education" className="mb-4">
            <h2 className="text-[12px] font-bold uppercase tracking-wider text-center border-b border-slate-400 pb-0.5 mb-2 text-slate-900">
              Education
            </h2>
            <div className="space-y-2.5">
              {data.educations.map((edu) => (
                <div key={edu.id} className="text-[10.5px]">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{edu.institution}</span>
                    <span className="font-normal text-[10px] text-slate-700">
                      {edu.location}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-slate-800 italic">
                    <span>{edu.degree}{edu.gpa ? ` — GPA: ${edu.gpa}` : ''}</span>
                    <span className="text-[10px] not-italic text-slate-700">
                      {formatResumeDateRange(edu.startDate, edu.endDate, edu.current)}
                    </span>
                  </div>
                  {edu.honors && (
                    <p className="text-[10px] text-slate-700 mt-0.5">{edu.honors}</p>
                  )}
                  {edu.description && (
                    <p className="text-[10px] text-slate-700 mt-0.5">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'experience':
        if (!data.experiences.length) return null;
        return (
          <div key="experience" className="mb-4">
            <h2 className="text-[12px] font-bold uppercase tracking-wider text-center border-b border-slate-400 pb-0.5 mb-2 text-slate-900">
              Experience
            </h2>
            <div className="space-y-3">
              {data.experiences.map((exp) => (
                <div key={exp.id} className="text-[10.5px]">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{exp.company}</span>
                    <span className="font-normal text-[10px] text-slate-700">
                      {exp.location}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-slate-800 italic mb-1">
                    <span>{exp.jobTitle}</span>
                    <span className="text-[10px] not-italic text-slate-700">
                      {formatResumeDateRange(exp.startDate, exp.endDate, exp.current)}
                    </span>
                  </div>
                  {exp.highlights.length > 0 && (
                    <ul className="list-disc list-outside pl-4 space-y-1 text-[10px] text-slate-800 leading-relaxed">
                      {exp.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'projects':
        if (!data.projects.length) return null;
        return (
          <div key="projects" className="mb-4">
            <h2 className="text-[12px] font-bold uppercase tracking-wider text-center border-b border-slate-400 pb-0.5 mb-2 text-slate-900">
              Selected Projects
            </h2>
            <div className="space-y-2.5">
              {data.projects.map((proj) => (
                <div key={proj.id} className="text-[10.5px]">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">
                      {proj.name}
                      {proj.technologies.length > 0 && (
                        <span className="font-normal italic text-[10px] text-slate-700 ml-1.5">
                          — {proj.technologies.join(', ')}
                        </span>
                      )}
                    </span>
                    {(proj.startDate || proj.endDate) && (
                      <span className="text-[10px] text-slate-700">
                        {formatResumeDateRange(proj.startDate, proj.endDate)}
                      </span>
                    )}
                  </div>
                  {proj.url && (
                    <a
                      href={sanitizeUrl(proj.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[9.5px] text-slate-800 underline block"
                    >
                      {cleanDisplayUrl(proj.url)}
                    </a>
                  )}
                  {proj.description && (
                    <div className="text-[10px] mt-0.5 text-slate-800 leading-relaxed">
                      {proj.description.split('\n').map((line, lIdx) => (
                        <p key={lIdx}>
                          {line.startsWith('•') || line.startsWith('-') ? line : `• ${line}`}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'skills':
        if (!data.skillCategories.length) return null;
        return (
          <div key="skills" className="mb-4">
            <h2 className="text-[12px] font-bold uppercase tracking-wider text-center border-b border-slate-400 pb-0.5 mb-2 text-slate-900">
              Skills & Competencies
            </h2>
            <div className="text-[10.5px] space-y-1">
              {data.skillCategories.map((cat) => (
                <div key={cat.id} className="flex">
                  <span className="font-bold text-slate-900 min-w-[140px] shrink-0">
                    {cat.name}:
                  </span>
                  <span className="text-slate-800">{cat.skills.join(', ')}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        if (!data.certifications.length) return null;
        return (
          <div key="certifications" className="mb-4">
            <h2 className="text-[12px] font-bold uppercase tracking-wider text-center border-b border-slate-400 pb-0.5 mb-2 text-slate-900">
              Certifications & Credentials
            </h2>
            <div className="space-y-1 text-[10.5px]">
              {data.certifications.map((cert) => (
                <div key={cert.id} className="flex justify-between items-baseline">
                  <span className="text-slate-800">
                    <span className="font-bold text-slate-900">{cert.name}</span>, {cert.issuer}
                  </span>
                  <span className="text-[10px] text-slate-700">
                    {formatResumeDate(cert.issueDate)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'achievements':
        if (!data.achievements.length) return null;
        return (
          <div key="achievements" className="mb-4">
            <h2 className="text-[12px] font-bold uppercase tracking-wider text-center border-b border-slate-400 pb-0.5 mb-2 text-slate-900">
              Honors & Awards
            </h2>
            <div className="space-y-1 text-[10.5px]">
              {data.achievements.map((ach) => (
                <div key={ach.id} className="flex justify-between items-baseline">
                  <span className="text-slate-800">
                    <span className="font-bold text-slate-900">{ach.title}</span>
                    {ach.issuer ? ` (${ach.issuer})` : ''}
                    {ach.description ? `: ${ach.description}` : ''}
                  </span>
                  {ach.date && (
                    <span className="text-[10px] text-slate-700">{formatResumeDate(ach.date)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'languages':
        if (!data.languages.length) return null;
        return (
          <div key="languages" className="mb-4">
            <h2 className="text-[12px] font-bold uppercase tracking-wider text-center border-b border-slate-400 pb-0.5 mb-2 text-slate-900">
              Languages
            </h2>
            <p className="text-[10.5px] text-slate-800 text-center">
              {data.languages.map((l) => `${l.language} (${l.proficiency})`).join(' • ')}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={fontStyle}
      className="bg-white text-slate-900 p-8 sm:p-12 w-full min-h-[1050px] shadow-sm select-text"
    >
      {/* Formal Harvard Header: Prestigious Centered Title with Italic Subheading */}
      <header className="text-center mb-4 pb-2 border-b border-slate-900">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-normal uppercase text-slate-900">
          {personalInfo.fullName || 'YOUR NAME'}
        </h1>
        {personalInfo.professionalTitle && (
          <p className="text-[11px] italic text-slate-700 mt-1">
            {personalInfo.professionalTitle}
          </p>
        )}
        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-0.5 text-[10px] text-slate-700 mt-1.5">
          {contactItems.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-400">•</span>}
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline text-slate-800"
                >
                  {item.label}
                </a>
              ) : (
                <span>{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </header>

      {/* Render sections according to user order */}
      {data.sectionsOrder.map((sectionType) => renderSection(sectionType))}
    </div>
  );
};

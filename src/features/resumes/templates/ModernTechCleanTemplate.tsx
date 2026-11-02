import React from 'react';
import type { ResumeData } from '../types/resume.types';
import { formatResumeDateRange, formatResumeDate } from '../utils/formatDate';
import { sanitizeUrl, cleanDisplayUrl } from '../utils/sanitizeUrl';

interface TemplateProps {
  data: ResumeData;
}

export const ModernTechCleanTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, customization } = data;
  const accentColor = customization.accentColor || '#000000';
  const fontStyle = { fontFamily: customization.fontFamily || 'Inter, sans-serif' };

  // Contact items array
  const contactItems: { label: string; url?: string }[] = [];
  if (personalInfo.email) contactItems.push({ label: personalInfo.email, url: sanitizeUrl(personalInfo.email) });
  if (personalInfo.phone) contactItems.push({ label: personalInfo.phone, url: sanitizeUrl(personalInfo.phone) });
  if (personalInfo.location) contactItems.push({ label: personalInfo.location });
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
            <h2
              style={{ color: accentColor }}
              className="text-[12px] font-extrabold tracking-wide uppercase flex items-center gap-2 mb-1.5"
            >
              <span style={{ backgroundColor: accentColor }} className="w-1.5 h-3.5 rounded-sm inline-block" />
              About Me
            </h2>
            <p className="text-[10px] leading-relaxed text-slate-700 pl-3.5 text-justify">
              {personalInfo.summary}
            </p>
          </div>
        );

      case 'skills':
        if (!data.skillCategories.length) return null;
        return (
          <div key="skills" className="mb-4">
            <h2
              style={{ color: accentColor }}
              className="text-[12px] font-extrabold tracking-wide uppercase flex items-center gap-2 mb-2"
            >
              <span style={{ backgroundColor: accentColor }} className="w-1.5 h-3.5 rounded-sm inline-block" />
              Technical Competencies
            </h2>
            <div className="pl-3.5 space-y-1.5 text-[10px]">
              {data.skillCategories.map((cat) => (
                <div key={cat.id} className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-slate-900 min-w-[130px] shrink-0">
                    {cat.name}:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {cat.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[9px] font-medium border border-slate-200/60"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'experience':
        if (!data.experiences.length) return null;
        return (
          <div key="experience" className="mb-4">
            <h2
              style={{ color: accentColor }}
              className="text-[12px] font-extrabold tracking-wide uppercase flex items-center gap-2 mb-2"
            >
              <span style={{ backgroundColor: accentColor }} className="w-1.5 h-3.5 rounded-sm inline-block" />
              Work Experience
            </h2>
            <div className="pl-3.5 space-y-3">
              {data.experiences.map((exp) => (
                <div key={exp.id} className="text-[10px]">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span className="text-[11px] text-slate-900">{exp.jobTitle}</span>
                    <span className="font-medium text-[9.5px] text-slate-500">
                      {formatResumeDateRange(exp.startDate, exp.endDate, exp.current)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-slate-700 font-semibold mb-1">
                    <span style={{ color: accentColor }}>{exp.company}</span>
                    {exp.location && <span className="text-[9.5px] text-slate-500 font-normal">{exp.location}</span>}
                  </div>
                  {exp.highlights.length > 0 && (
                    <ul className="list-disc list-outside pl-4 space-y-0.5 text-[9.5px] text-slate-700 leading-relaxed">
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
            <h2
              style={{ color: accentColor }}
              className="text-[12px] font-extrabold tracking-wide uppercase flex items-center gap-2 mb-2"
            >
              <span style={{ backgroundColor: accentColor }} className="w-1.5 h-3.5 rounded-sm inline-block" />
              Key Projects
            </h2>
            <div className="pl-3.5 space-y-2">
              {data.projects.map((proj) => (
                <div key={proj.id} className="text-[10px]">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">
                      {proj.name}
                      {proj.technologies.length > 0 && (
                        <span className="font-normal text-[9px] text-slate-500 ml-1.5">
                          — {proj.technologies.join(', ')}
                        </span>
                      )}
                    </span>
                    {(proj.startDate || proj.endDate) && (
                      <span className="text-[9.5px] text-slate-500">
                        {formatResumeDateRange(proj.startDate, proj.endDate)}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 my-0.5">
                    {proj.url && (
                      <a
                        href={sanitizeUrl(proj.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[9px] font-medium hover:underline text-black"
                      >
                        Live: {cleanDisplayUrl(proj.url)}
                      </a>
                    )}
                    {proj.githubUrl && (
                      <a
                        href={sanitizeUrl(proj.githubUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[9px] font-medium hover:underline text-slate-600"
                      >
                        GitHub: {cleanDisplayUrl(proj.githubUrl)}
                      </a>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-[9.5px] text-slate-700 leading-relaxed">
                      • {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        if (!data.educations.length) return null;
        return (
          <div key="education" className="mb-4">
            <h2
              style={{ color: accentColor }}
              className="text-[12px] font-extrabold tracking-wide uppercase flex items-center gap-2 mb-2"
            >
              <span style={{ backgroundColor: accentColor }} className="w-1.5 h-3.5 rounded-sm inline-block" />
              Education
            </h2>
            <div className="pl-3.5 space-y-2">
              {data.educations.map((edu) => (
                <div key={edu.id} className="text-[10px]">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span className="text-[10.5px]">{edu.institution}</span>
                    <span className="font-medium text-[9.5px] text-slate-500">
                      {formatResumeDateRange(edu.startDate, edu.endDate, edu.current)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-slate-700">
                    <span>{edu.degree}{edu.gpa ? ` (GPA: ${edu.gpa})` : ''}</span>
                    {edu.location && <span className="text-[9px] text-slate-500">{edu.location}</span>}
                  </div>
                  {edu.honors && (
                    <p className="text-[9px] text-slate-600 mt-0.5">{edu.honors}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        if (!data.certifications.length) return null;
        return (
          <div key="certifications" className="mb-4">
            <h2
              style={{ color: accentColor }}
              className="text-[12px] font-extrabold tracking-wide uppercase flex items-center gap-2 mb-2"
            >
              <span style={{ backgroundColor: accentColor }} className="w-1.5 h-3.5 rounded-sm inline-block" />
              Certifications
            </h2>
            <div className="pl-3.5 space-y-1 text-[10px]">
              {data.certifications.map((cert) => (
                <div key={cert.id} className="flex justify-between items-baseline">
                  <span className="text-slate-800">
                    <span className="font-bold text-slate-900">{cert.name}</span> — {cert.issuer}
                  </span>
                  <span className="text-[9.5px] text-slate-500">
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
            <h2
              style={{ color: accentColor }}
              className="text-[12px] font-extrabold tracking-wide uppercase flex items-center gap-2 mb-2"
            >
              <span style={{ backgroundColor: accentColor }} className="w-1.5 h-3.5 rounded-sm inline-block" />
              Achievements
            </h2>
            <div className="pl-3.5 space-y-1 text-[10px]">
              {data.achievements.map((ach) => (
                <div key={ach.id} className="flex justify-between items-baseline">
                  <span className="text-slate-800">
                    <span className="font-bold text-slate-900">{ach.title}</span>
                    {ach.issuer ? ` (${ach.issuer})` : ''}
                    {ach.description ? `: ${ach.description}` : ''}
                  </span>
                  {ach.date && (
                    <span className="text-[9.5px] text-slate-500">{formatResumeDate(ach.date)}</span>
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
            <h2
              style={{ color: accentColor }}
              className="text-[12px] font-extrabold tracking-wide uppercase flex items-center gap-2 mb-2"
            >
              <span style={{ backgroundColor: accentColor }} className="w-1.5 h-3.5 rounded-sm inline-block" />
              Languages
            </h2>
            <p className="pl-3.5 text-[10px] text-slate-800">
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
      className="bg-white text-slate-900 p-8 sm:p-11 w-full min-h-[1050px] shadow-sm select-text"
    >
      {/* Modern Tech Header with subtle colored background badge */}
      <header className="mb-5 pb-3 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {personalInfo.fullName || 'YOUR NAME'}
            </h1>
            {personalInfo.professionalTitle && (
              <p
                style={{ color: accentColor }}
                className="text-[11.5px] font-bold tracking-wide mt-0.5"
              >
                {personalInfo.professionalTitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9.5px] text-slate-600 mt-2.5 pt-2 border-t border-slate-100">
          {contactItems.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-300">•</span>}
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline text-slate-700"
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

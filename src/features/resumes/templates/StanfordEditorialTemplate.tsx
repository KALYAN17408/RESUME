import React from 'react';
import type { ResumeData } from '../types/resume.types';
import { formatResumeDateRange, formatResumeDate } from '../utils/formatDate';
import { sanitizeUrl, cleanDisplayUrl } from '../utils/sanitizeUrl';

interface TemplateProps {
  data: ResumeData;
}

export const StanfordEditorialTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, customization } = data;
  const accentColor = customization.accentColor || '#4338ca';
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
              style={{ color: accentColor, borderColor: accentColor }}
              className="text-[11.5px] font-bold tracking-widest uppercase border-b pb-0.5 mb-1.5"
            >
              Overview
            </h2>
            <p className="text-[10px] leading-relaxed text-slate-700 text-justify">
              {personalInfo.summary}
            </p>
          </div>
        );

      case 'experience':
        if (!data.experiences.length) return null;
        return (
          <div key="experience" className="mb-4">
            <h2
              style={{ color: accentColor, borderColor: accentColor }}
              className="text-[11.5px] font-bold tracking-widest uppercase border-b pb-0.5 mb-2"
            >
              Professional Experience
            </h2>
            <div className="space-y-3">
              {data.experiences.map((exp) => (
                <div key={exp.id} className="text-[10px]">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span className="text-[11px]">{exp.jobTitle}</span>
                    <span className="font-medium text-[9.5px] text-slate-600">
                      {formatResumeDateRange(exp.startDate, exp.endDate, exp.current)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-slate-700 font-medium mb-1">
                    <span>{exp.company}{exp.location ? `, ${exp.location}` : ''}</span>
                    {exp.employmentType && (
                      <span className="text-[9px] text-slate-500">{exp.employmentType}</span>
                    )}
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

      case 'education':
        if (!data.educations.length) return null;
        return (
          <div key="education" className="mb-4">
            <h2
              style={{ color: accentColor, borderColor: accentColor }}
              className="text-[11.5px] font-bold tracking-widest uppercase border-b pb-0.5 mb-2"
            >
              Education
            </h2>
            <div className="space-y-2">
              {data.educations.map((edu) => (
                <div key={edu.id} className="text-[10px]">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span className="text-[10.5px]">{edu.institution}</span>
                    <span className="font-medium text-[9.5px] text-slate-600">
                      {formatResumeDateRange(edu.startDate, edu.endDate, edu.current)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-slate-700">
                    <span>{edu.degree}{edu.gpa ? ` (GPA: ${edu.gpa})` : ''}</span>
                    {edu.location && <span className="text-[9px] text-slate-500">{edu.location}</span>}
                  </div>
                  {edu.honors && (
                    <p className="text-[9.5px] text-slate-600 mt-0.5 italic">{edu.honors}</p>
                  )}
                  {edu.description && (
                    <p className="text-[9.5px] text-slate-600 mt-0.5">{edu.description}</p>
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
            <h2
              style={{ color: accentColor, borderColor: accentColor }}
              className="text-[11.5px] font-bold tracking-widest uppercase border-b pb-0.5 mb-2"
            >
              Core Expertise
            </h2>
            <div className="text-[10px] space-y-1">
              {data.skillCategories.map((cat) => (
                <div key={cat.id} className="flex">
                  <span className="font-bold text-slate-900 min-w-[130px] shrink-0">
                    {cat.name}:
                  </span>
                  <span className="text-slate-700">{cat.skills.join(', ')}</span>
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
              style={{ color: accentColor, borderColor: accentColor }}
              className="text-[11.5px] font-bold tracking-widest uppercase border-b pb-0.5 mb-2"
            >
              Notable Projects
            </h2>
            <div className="space-y-2">
              {data.projects.map((proj) => (
                <div key={proj.id} className="text-[10px]">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">
                      {proj.name}
                      {proj.technologies.length > 0 && (
                        <span className="font-normal text-[9px] text-slate-500 ml-1.5">
                          [{proj.technologies.join(', ')}]
                        </span>
                      )}
                    </span>
                    {(proj.startDate || proj.endDate) && (
                      <span className="text-[9.5px] text-slate-600">
                        {formatResumeDateRange(proj.startDate, proj.endDate)}
                      </span>
                    )}
                  </div>
                  {proj.url && (
                    <a
                      href={sanitizeUrl(proj.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[9px] text-indigo-700 underline block"
                    >
                      {cleanDisplayUrl(proj.url)}
                    </a>
                  )}
                  {proj.description && (
                    <p className="text-[9.5px] mt-0.5 text-slate-700 leading-relaxed">
                      • {proj.description}
                    </p>
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
              style={{ color: accentColor, borderColor: accentColor }}
              className="text-[11.5px] font-bold tracking-widest uppercase border-b pb-0.5 mb-2"
            >
              Certifications
            </h2>
            <div className="space-y-1 text-[10px]">
              {data.certifications.map((cert) => (
                <div key={cert.id} className="flex justify-between items-baseline">
                  <span className="text-slate-800">
                    <span className="font-bold text-slate-900">{cert.name}</span> — {cert.issuer}
                  </span>
                  <span className="text-[9.5px] text-slate-600">
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
              style={{ color: accentColor, borderColor: accentColor }}
              className="text-[11.5px] font-bold tracking-widest uppercase border-b pb-0.5 mb-2"
            >
              Achievements
            </h2>
            <div className="space-y-1 text-[10px]">
              {data.achievements.map((ach) => (
                <div key={ach.id} className="flex justify-between items-baseline">
                  <span className="text-slate-800">
                    <span className="font-bold text-slate-900">{ach.title}</span>
                    {ach.issuer ? ` (${ach.issuer})` : ''}
                    {ach.description ? `: ${ach.description}` : ''}
                  </span>
                  {ach.date && (
                    <span className="text-[9.5px] text-slate-600">{formatResumeDate(ach.date)}</span>
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
              style={{ color: accentColor, borderColor: accentColor }}
              className="text-[11.5px] font-bold tracking-widest uppercase border-b pb-0.5 mb-2"
            >
              Languages
            </h2>
            <p className="text-[10px] text-slate-800">
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
      {/* Editorial Left-Aligned Header */}
      <header className="mb-4 pb-3 border-b-2 border-slate-900">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
              {personalInfo.fullName || 'YOUR NAME'}
            </h1>
            {personalInfo.professionalTitle && (
              <p
                style={{ color: accentColor }}
                className="text-[11.5px] font-semibold tracking-wide uppercase mt-0.5"
              >
                {personalInfo.professionalTitle}
              </p>
            )}
          </div>
          <div className="flex flex-wrap sm:flex-col items-start sm:items-end text-[9.5px] text-slate-600 gap-x-2 gap-y-0.5">
            {contactItems.map((item, idx) => (
              <React.Fragment key={idx}>
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
        </div>
      </header>

      {/* Render sections according to user order */}
      {data.sectionsOrder.map((sectionType) => renderSection(sectionType))}
    </div>
  );
};

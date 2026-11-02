import React from 'react';
import type { ResumeData } from '../types/resume.types';
import { formatResumeDateRange, formatResumeDate } from '../utils/formatDate';
import { sanitizeUrl, cleanDisplayUrl } from '../utils/sanitizeUrl';

interface TemplateProps {
  data: ResumeData;
}

export const JakesTechnicalTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, customization } = data;
  const fontStyle = { fontFamily: customization.fontFamily || 'Inter, sans-serif' };

  // Contact items array
  const contactItems: { label: string; url?: string }[] = [];
  if (personalInfo.phone) contactItems.push({ label: personalInfo.phone, url: sanitizeUrl(personalInfo.phone) });
  if (personalInfo.email) contactItems.push({ label: personalInfo.email, url: sanitizeUrl(personalInfo.email) });
  if (personalInfo.linkedinUrl) contactItems.push({ label: cleanDisplayUrl(personalInfo.linkedinUrl), url: sanitizeUrl(personalInfo.linkedinUrl) });
  if (personalInfo.githubUrl) contactItems.push({ label: cleanDisplayUrl(personalInfo.githubUrl), url: sanitizeUrl(personalInfo.githubUrl) });
  if (personalInfo.portfolioUrl) contactItems.push({ label: cleanDisplayUrl(personalInfo.portfolioUrl), url: sanitizeUrl(personalInfo.portfolioUrl) });
  if (personalInfo.location) contactItems.push({ label: personalInfo.location });

  const renderSection = (type: string) => {
    if (!data.enabledSections[type as keyof typeof data.enabledSections]) return null;

    switch (type) {
      case 'summary':
        if (!personalInfo.summary) return null;
        return (
          <div key="summary" className="mb-3">
            <h2 className="text-[12px] font-bold tracking-wider uppercase border-b border-black pb-0.5 mb-1.5 text-black">
              Summary
            </h2>
            <p className="text-[10.5px] leading-relaxed text-black text-justify">
              {personalInfo.summary}
            </p>
          </div>
        );

      case 'education':
        if (!data.educations.length) return null;
        return (
          <div key="education" className="mb-3">
            <h2 className="text-[12px] font-bold tracking-wider uppercase border-b border-black pb-0.5 mb-1.5 text-black">
              Education
            </h2>
            <div className="space-y-2">
              {data.educations.map((edu) => (
                <div key={edu.id} className="text-[10.5px]">
                  <div className="flex justify-between items-baseline font-bold text-black">
                    <span>{edu.institution}{edu.location ? `, ${edu.location}` : ''}</span>
                    <span className="font-medium text-[10px]">
                      {formatResumeDateRange(edu.startDate, edu.endDate, edu.current)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline italic text-black">
                    <span>{edu.degree}{edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</span>
                    {edu.honors && <span className="text-[9.5px] not-italic">{edu.honors}</span>}
                  </div>
                  {edu.description && (
                    <p className="text-[10px] mt-0.5 text-black">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'experience':
        if (!data.experiences.length) return null;
        return (
          <div key="experience" className="mb-3">
            <h2 className="text-[12px] font-bold tracking-wider uppercase border-b border-black pb-0.5 mb-1.5 text-black">
              Experience
            </h2>
            <div className="space-y-2.5">
              {data.experiences.map((exp) => (
                <div key={exp.id} className="text-[10.5px]">
                  <div className="flex justify-between items-baseline font-bold text-black">
                    <span>{exp.jobTitle}</span>
                    <span className="font-medium text-[10px]">
                      {formatResumeDateRange(exp.startDate, exp.endDate, exp.current)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline italic text-black mb-1">
                    <span>{exp.company}{exp.location ? ` — ${exp.location}` : ''}</span>
                    {exp.employmentType && (
                      <span className="text-[9.5px] not-italic">{exp.employmentType}</span>
                    )}
                  </div>
                  {exp.highlights.length > 0 && (
                    <ul className="list-disc list-outside pl-4 space-y-0.5 text-[10px] text-black leading-relaxed">
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
          <div key="projects" className="mb-3">
            <h2 className="text-[12px] font-bold tracking-wider uppercase border-b border-black pb-0.5 mb-1.5 text-black">
              Projects
            </h2>
            <div className="space-y-2">
              {data.projects.map((proj) => (
                <div key={proj.id} className="text-[10.5px]">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-black">
                      {proj.name}
                      {proj.technologies.length > 0 && (
                        <span className="font-normal italic text-[10px] ml-1.5">
                          | {proj.technologies.join(', ')}
                        </span>
                      )}
                    </span>
                    {(proj.startDate || proj.endDate) && (
                      <span className="text-[10px] font-medium text-black">
                        {formatResumeDateRange(proj.startDate, proj.endDate)}
                      </span>
                    )}
                  </div>
                  {proj.url && (
                    <a
                      href={sanitizeUrl(proj.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[9.5px] text-black underline block"
                    >
                      {cleanDisplayUrl(proj.url)}
                    </a>
                  )}
                  {proj.description && (
                    <p className="text-[10px] mt-0.5 text-black leading-relaxed">
                      • {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'skills':
        if (!data.skillCategories.length) return null;
        return (
          <div key="skills" className="mb-3">
            <h2 className="text-[12px] font-bold tracking-wider uppercase border-b border-black pb-0.5 mb-1.5 text-black">
              Technical Skills
            </h2>
            <div className="text-[10.5px] space-y-1">
              {data.skillCategories.map((cat) => (
                <div key={cat.id} className="flex">
                  <span className="font-bold text-black min-w-[130px] shrink-0">
                    {cat.name}:
                  </span>
                  <span className="text-black">{cat.skills.join(', ')}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        if (!data.certifications.length) return null;
        return (
          <div key="certifications" className="mb-3">
            <h2 className="text-[12px] font-bold tracking-wider uppercase border-b border-black pb-0.5 mb-1.5 text-black">
              Certifications
            </h2>
            <div className="space-y-1 text-[10.5px]">
              {data.certifications.map((cert) => (
                <div key={cert.id} className="flex justify-between items-baseline">
                  <span className="text-black">
                    <span className="font-bold">{cert.name}</span> — {cert.issuer}
                  </span>
                  <span className="text-[10px] font-medium text-black">
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
          <div key="achievements" className="mb-3">
            <h2 className="text-[12px] font-bold tracking-wider uppercase border-b border-black pb-0.5 mb-1.5 text-black">
              Achievements
            </h2>
            <div className="space-y-1 text-[10.5px]">
              {data.achievements.map((ach) => (
                <div key={ach.id} className="flex justify-between items-baseline">
                  <span className="text-black">
                    <span className="font-bold">{ach.title}</span>
                    {ach.issuer ? ` (${ach.issuer})` : ''}
                    {ach.description ? `: ${ach.description}` : ''}
                  </span>
                  {ach.date && (
                    <span className="text-[10px] font-medium text-black">{formatResumeDate(ach.date)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'languages':
        if (!data.languages.length) return null;
        return (
          <div key="languages" className="mb-3">
            <h2 className="text-[12px] font-bold tracking-wider uppercase border-b border-black pb-0.5 mb-1.5 text-black">
              Languages
            </h2>
            <p className="text-[10.5px] text-black">
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
      className="bg-white text-black p-8 sm:p-10 w-full min-h-[1050px] shadow-sm select-text"
    >
      {/* Jake's Header: Bold Centered Name with Single-Line Separated Contact Bar */}
      <header className="text-center mb-3 pb-2 border-b-2 border-black">
        <h1 className="text-2xl font-black uppercase tracking-tight text-black">
          {personalInfo.fullName || 'YOUR NAME'}
        </h1>
        {personalInfo.professionalTitle && (
          <p className="text-[11px] font-semibold text-black tracking-wide uppercase mt-0.5">
            {personalInfo.professionalTitle}
          </p>
        )}
        <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-0.5 text-[9.5px] text-black mt-1">
          {contactItems.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-black">•</span>}
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline text-black"
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

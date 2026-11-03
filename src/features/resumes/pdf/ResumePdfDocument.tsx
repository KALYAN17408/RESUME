import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
} from '@react-pdf/renderer';
import type { ResumeData } from '../types/resume.types';
import { formatResumeDateRange, formatResumeDate } from '../utils/formatDate';
import { sanitizeUrl, cleanDisplayUrl } from '../utils/sanitizeUrl';

// Define base styles for PDF generation
const baseStyles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontSize: 9.5,
    lineHeight: 1.35,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  // Jake's Technical Styles
  jakesHeader: {
    textAlign: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
  },
  jakesName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    color: '#000000',
    marginBottom: 2,
  },
  jakesTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    color: '#000000',
    marginBottom: 4,
  },
  jakesContactBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    fontSize: 8.5,
    color: '#000000',
  },
  jakesSectionHeader: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    borderBottomWidth: 0.8,
    borderBottomColor: '#000000',
    paddingBottom: 2,
    marginTop: 8,
    marginBottom: 5,
    color: '#000000',
  },
  // Harvard Classic Styles
  harvardHeader: {
    textAlign: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  harvardName: {
    fontSize: 19,
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase',
    color: '#0f172a',
    marginBottom: 2,
  },
  harvardTitle: {
    fontSize: 9.5,
    fontFamily: 'Times-Italic',
    color: '#334155',
    marginBottom: 4,
  },
  harvardSectionHeader: {
    fontSize: 10.5,
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
    borderBottomWidth: 0.8,
    borderBottomColor: '#64748b',
    paddingBottom: 2,
    marginTop: 8,
    marginBottom: 6,
    color: '#0f172a',
  },
  // Stanford Editorial Styles
  stanfordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: '#0f172a',
  },
  stanfordName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    color: '#0f172a',
  },
  stanfordTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  stanfordSectionHeader: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    borderBottomWidth: 0.8,
    paddingBottom: 2,
    marginTop: 8,
    marginBottom: 5,
  },
  // Modern Tech Clean Styles
  modernHeader: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modernName: {
    fontSize: 19,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  modernTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    marginTop: 2,
  },
  modernSectionHeader: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 5,
  },
  // Shared item styles
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 1,
  },
  boldText: {
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
  },
  italicText: {
    fontFamily: 'Helvetica-Oblique',
    color: '#1e293b',
  },
  regularText: {
    fontFamily: 'Helvetica',
    color: '#000000',
  },
  timesBold: {
    fontFamily: 'Times-Bold',
    color: '#0f172a',
  },
  timesItalic: {
    fontFamily: 'Times-Italic',
    color: '#334155',
  },
  timesRegular: {
    fontFamily: 'Times-Roman',
    color: '#0f172a',
  },
  bulletList: {
    paddingLeft: 12,
    marginTop: 2,
    marginBottom: 3,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 1.5,
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: 8,
    fontSize: 8.5,
  },
  bulletText: {
    flex: 1,
    fontSize: 8.8,
    lineHeight: 1.3,
  },
  linkText: {
    color: '#000000',
    textDecoration: 'underline',
  },
  skillRow: {
    flexDirection: 'row',
    marginBottom: 2.5,
  },
  skillCategoryLabel: {
    width: 130,
    fontSize: 9,
  },
  skillList: {
    flex: 1,
    fontSize: 9,
  },
});

interface ResumePdfDocumentProps {
  data: ResumeData;
}

export const ResumePdfDocument: React.FC<ResumePdfDocumentProps> = ({ data }) => {
  const { personalInfo, customization, templateId } = data;
  const isHarvard = templateId === 'harvard-classic';
  const isStanford = templateId === 'stanford-editorial';
  const isModern = templateId === 'modern-tech-clean';
  const isJakes = !isHarvard && !isStanford && !isModern;

  const accentColor = customization.accentColor || '#000000';
  const baseFont = isHarvard ? 'Times-Roman' : 'Helvetica';
  const boldFont = isHarvard ? 'Times-Bold' : 'Helvetica-Bold';
  const italicFont = isHarvard ? 'Times-Italic' : 'Helvetica-Oblique';

  // Contact items array
  const contactItems: { label: string; url?: string }[] = [];
  if (personalInfo.phone) contactItems.push({ label: personalInfo.phone, url: sanitizeUrl(personalInfo.phone) });
  if (personalInfo.email) contactItems.push({ label: personalInfo.email, url: sanitizeUrl(personalInfo.email) });
  if (personalInfo.location) contactItems.push({ label: personalInfo.location });
  if (personalInfo.linkedinUrl) contactItems.push({ label: cleanDisplayUrl(personalInfo.linkedinUrl), url: sanitizeUrl(personalInfo.linkedinUrl) });
  if (personalInfo.githubUrl) contactItems.push({ label: cleanDisplayUrl(personalInfo.githubUrl), url: sanitizeUrl(personalInfo.githubUrl) });
  if (personalInfo.portfolioUrl) contactItems.push({ label: cleanDisplayUrl(personalInfo.portfolioUrl), url: sanitizeUrl(personalInfo.portfolioUrl) });

  const renderSectionHeader = (title: string) => {
    if (isJakes) {
      return <Text style={baseStyles.jakesSectionHeader}>{title}</Text>;
    }
    if (isHarvard) {
      return <Text style={baseStyles.harvardSectionHeader}>{title}</Text>;
    }
    if (isStanford) {
      return (
        <Text style={[baseStyles.stanfordSectionHeader, { color: accentColor, borderBottomColor: accentColor }]}>
          {title}
        </Text>
      );
    }
    // Modern Tech Clean
    return (
      <View style={baseStyles.modernSectionHeader}>
        <View style={{ width: 4, height: 10, backgroundColor: accentColor, marginRight: 5, borderRadius: 1 }} />
        <Text style={{ color: accentColor }}>{title}</Text>
      </View>
    );
  };

  const renderSection = (type: string) => {
    if (!data.enabledSections[type as keyof typeof data.enabledSections]) return null;

    switch (type) {
      case 'summary':
        if (!personalInfo.summary) return null;
        return (
          <View key="summary" wrap={false} style={{ marginBottom: 6 }}>
            {renderSectionHeader('Summary')}
            <Text style={{ fontFamily: baseFont, fontSize: 8.8, lineHeight: 1.35, color: '#1e293b' }}>
              {personalInfo.summary}
            </Text>
          </View>
        );

      case 'education':
        if (!data.educations.length) return null;
        return (
          <View key="education" style={{ marginBottom: 6 }}>
            {renderSectionHeader('Education')}
            {data.educations.map((edu) => (
              <View key={edu.id} wrap={false} style={{ marginBottom: 4 }}>
                <View style={baseStyles.itemRow}>
                  <Text style={{ fontFamily: boldFont, fontSize: 9.5, color: '#000000' }}>
                    {edu.institution}{edu.location ? `, ${edu.location}` : ''}
                  </Text>
                  <Text style={{ fontFamily: baseFont, fontSize: 8.5, color: '#334155' }}>
                    {formatResumeDateRange(edu.startDate, edu.endDate, edu.current)}
                  </Text>
                </View>
                <View style={baseStyles.itemRow}>
                  <Text style={{ fontFamily: italicFont, fontSize: 9, color: '#1e293b' }}>
                    {edu.degree}{edu.gpa ? ` • GPA: ${edu.gpa}` : ''}
                  </Text>
                  {edu.honors && (
                    <Text style={{ fontFamily: baseFont, fontSize: 8, color: '#475569' }}>
                      {edu.honors}
                    </Text>
                  )}
                </View>
                {edu.description && (
                  <Text style={{ fontFamily: baseFont, fontSize: 8.5, color: '#334155', marginTop: 1 }}>
                    {edu.description}
                  </Text>
                )}
              </View>
            ))}
          </View>
        );

      case 'experience':
        if (!data.experiences.length) return null;
        return (
          <View key="experience" style={{ marginBottom: 6 }}>
            {renderSectionHeader('Experience')}
            {data.experiences.map((exp) => (
              <View key={exp.id} wrap={false} style={{ marginBottom: 6 }}>
                <View style={baseStyles.itemRow}>
                  <Text style={{ fontFamily: boldFont, fontSize: 9.5, color: '#000000' }}>
                    {exp.jobTitle || (exp as any).position}
                  </Text>
                  <Text style={{ fontFamily: baseFont, fontSize: 8.5, color: '#334155' }}>
                    {formatResumeDateRange(exp.startDate, exp.endDate, exp.current)}
                  </Text>
                </View>
                <View style={baseStyles.itemRow}>
                  <Text style={{ fontFamily: italicFont, fontSize: 9, color: isModern ? accentColor : '#1e293b' }}>
                    {exp.company}{exp.location ? ` — ${exp.location}` : ''}
                  </Text>
                  {exp.employmentType && (
                    <Text style={{ fontFamily: baseFont, fontSize: 8, color: '#64748b' }}>
                      {exp.employmentType}
                    </Text>
                  )}
                </View>
                {exp.highlights.length > 0 && (
                  <View style={baseStyles.bulletList}>
                    {exp.highlights.map((h, i) => (
                      <View key={i} style={baseStyles.bulletItem}>
                        <Text style={[baseStyles.bulletDot, { fontFamily: baseFont }]}>•</Text>
                        <Text style={[baseStyles.bulletText, { fontFamily: baseFont }]}>{h}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        );

      case 'projects':
        if (!data.projects.length) return null;
        return (
          <View key="projects" style={{ marginBottom: 6 }}>
            {renderSectionHeader('Projects')}
            {data.projects.map((proj) => (
              <View key={proj.id} wrap={false} style={{ marginBottom: 4 }}>
                <View style={baseStyles.itemRow}>
                  <Text style={{ fontFamily: boldFont, fontSize: 9.2, color: '#000000' }}>
                    {proj.name}
                    {proj.technologies.length > 0 && (
                      <Text style={{ fontFamily: italicFont, fontSize: 8.5, color: '#475569' }}>
                        {' '}| {proj.technologies.join(', ')}
                      </Text>
                    )}
                  </Text>
                  {(proj.startDate || proj.endDate) && (
                    <Text style={{ fontFamily: baseFont, fontSize: 8.5, color: '#334155' }}>
                      {formatResumeDateRange(proj.startDate, proj.endDate)}
                    </Text>
                  )}
                </View>
                {proj.url && (
                  <Link src={sanitizeUrl(proj.url)} style={[baseStyles.linkText, { fontSize: 8, marginBottom: 1 }]}>
                    {cleanDisplayUrl(proj.url)}
                  </Link>
                )}
                {proj.description && (
                  <View style={{ marginTop: 1 }}>
                    {proj.description.split('\n').map((line, lIdx) => (
                      <Text key={lIdx} style={{ fontFamily: baseFont, fontSize: 8.8, color: '#1e293b', marginTop: 1 }}>
                        {line.startsWith('•') || line.startsWith('-') ? line : `• ${line}`}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        );

      case 'skills':
        if (!data.skillCategories.length) return null;
        return (
          <View key="skills" wrap={false} style={{ marginBottom: 6 }}>
            {renderSectionHeader('Technical Skills')}
            {data.skillCategories.map((cat) => (
              <View key={cat.id} style={baseStyles.skillRow}>
                <Text style={[baseStyles.skillCategoryLabel, { fontFamily: boldFont, color: '#000000' }]}>
                  {cat.name}:
                </Text>
                <Text style={[baseStyles.skillList, { fontFamily: baseFont, color: '#1e293b' }]}>
                  {cat.skills.join(', ')}
                </Text>
              </View>
            ))}
          </View>
        );

      case 'certifications':
        if (!data.certifications.length) return null;
        return (
          <View key="certifications" wrap={false} style={{ marginBottom: 6 }}>
            {renderSectionHeader('Certifications')}
            {data.certifications.map((cert) => (
              <View key={cert.id} style={baseStyles.itemRow}>
                <Text style={{ fontFamily: baseFont, fontSize: 8.8, color: '#1e293b' }}>
                  <Text style={{ fontFamily: boldFont, color: '#000000' }}>{cert.name}</Text> — {cert.issuer}
                </Text>
                <Text style={{ fontFamily: baseFont, fontSize: 8.5, color: '#334155' }}>
                  {formatResumeDate(cert.issueDate)}
                </Text>
              </View>
            ))}
          </View>
        );

      case 'achievements':
        if (!data.achievements.length) return null;
        return (
          <View key="achievements" wrap={false} style={{ marginBottom: 6 }}>
            {renderSectionHeader('Achievements')}
            {data.achievements.map((ach) => (
              <View key={ach.id} style={baseStyles.itemRow}>
                <Text style={{ fontFamily: baseFont, fontSize: 8.8, color: '#1e293b' }}>
                  <Text style={{ fontFamily: boldFont, color: '#000000' }}>{ach.title}</Text>
                  {ach.issuer ? ` (${ach.issuer})` : ''}
                  {ach.description ? `: ${ach.description}` : ''}
                </Text>
                {ach.date && (
                  <Text style={{ fontFamily: baseFont, fontSize: 8.5, color: '#334155' }}>
                    {formatResumeDate(ach.date)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        );

      case 'languages':
        if (!data.languages.length) return null;
        return (
          <View key="languages" wrap={false} style={{ marginBottom: 6 }}>
            {renderSectionHeader('Languages')}
            <Text style={{ fontFamily: baseFont, fontSize: 8.8, color: '#1e293b' }}>
              {data.languages.map((l) => `${l.language} (${l.proficiency})`).join(' • ')}
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Document
      title={data.title || 'Resume'}
      author={personalInfo.fullName || 'Candidate'}
      subject="Professional Resume created with ResuMax AI"
      creator="ResuMax AI — ATS Resume Intelligence"
    >
      <Page size="A4" style={[baseStyles.page, { fontFamily: baseFont }]}>
        {/* Header Rendering based on active template */}
        {isJakes && (
          <View style={baseStyles.jakesHeader}>
            <Text style={baseStyles.jakesName}>
              {personalInfo.fullName || 'YOUR NAME'}
            </Text>
            {personalInfo.professionalTitle && (
              <Text style={baseStyles.jakesTitle}>
                {personalInfo.professionalTitle}
              </Text>
            )}
            <View style={baseStyles.jakesContactBar}>
              {contactItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <Text>•</Text>}
                  {item.url ? (
                    <Link src={item.url} style={baseStyles.linkText}>
                      {item.label}
                    </Link>
                  ) : (
                    <Text>{item.label}</Text>
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {isHarvard && (
          <View style={baseStyles.harvardHeader}>
            <Text style={baseStyles.harvardName}>
              {personalInfo.fullName || 'YOUR NAME'}
            </Text>
            {personalInfo.professionalTitle && (
              <Text style={baseStyles.harvardTitle}>
                {personalInfo.professionalTitle}
              </Text>
            )}
            <View style={[baseStyles.jakesContactBar, { fontFamily: 'Times-Roman' }]}>
              {contactItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <Text>•</Text>}
                  {item.url ? (
                    <Link src={item.url} style={baseStyles.linkText}>
                      {item.label}
                    </Link>
                  ) : (
                    <Text>{item.label}</Text>
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {isStanford && (
          <View style={baseStyles.stanfordHeader}>
            <View>
              <Text style={baseStyles.stanfordName}>
                {personalInfo.fullName || 'YOUR NAME'}
              </Text>
              {personalInfo.professionalTitle && (
                <Text style={[baseStyles.stanfordTitle, { color: accentColor }]}>
                  {personalInfo.professionalTitle}
                </Text>
              )}
            </View>
            <View style={{ alignItems: 'flex-end', fontSize: 8.5 }}>
              {contactItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  {item.url ? (
                    <Link src={item.url} style={baseStyles.linkText}>
                      {item.label}
                    </Link>
                  ) : (
                    <Text style={{ color: '#475569' }}>{item.label}</Text>
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {isModern && (
          <View style={baseStyles.modernHeader}>
            <Text style={baseStyles.modernName}>
              {personalInfo.fullName || 'YOUR NAME'}
            </Text>
            {personalInfo.professionalTitle && (
              <Text style={[baseStyles.modernTitle, { color: accentColor }]}>
                {personalInfo.professionalTitle}
              </Text>
            )}
            <View style={[baseStyles.jakesContactBar, { justifyContent: 'flex-start', marginTop: 4 }]}>
              {contactItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <Text>•</Text>}
                  {item.url ? (
                    <Link src={item.url} style={baseStyles.linkText}>
                      {item.label}
                    </Link>
                  ) : (
                    <Text>{item.label}</Text>
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* Section List according to user ordering */}
        {data.sectionsOrder.map((sectionType) => renderSection(sectionType))}
      </Page>
    </Document>
  );
};

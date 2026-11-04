import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
} from '@react-pdf/renderer';
import type { ResumeData } from '@/features/resumes/types/resume.types';

const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingBottom: 42,
    paddingHorizontal: 48,
    fontSize: 10,
    lineHeight: 1.45,
    fontFamily: 'Helvetica',
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 12,
  },
  candidateName: {
    fontSize: 17,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#0f172a',
    marginBottom: 3,
  },
  candidateTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    color: '#475569',
    marginBottom: 6,
  },
  contactBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    fontSize: 8.5,
    color: '#475569',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
  },
  dateBlock: {
    marginTop: 10,
    marginBottom: 12,
    fontSize: 9.5,
    color: '#334155',
  },
  recipientBlock: {
    marginBottom: 14,
    fontSize: 9.5,
    lineHeight: 1.35,
    color: '#334155',
  },
  recipientName: {
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  subjectLine: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 14,
  },
  bodyParagraph: {
    marginBottom: 10,
    textAlign: 'justify',
    lineHeight: 1.5,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 48,
    right: 48,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
  },
});

export interface CoverLetterPdfProps {
  content: string; // The current edited content
  subjectLine?: string;
  candidateName?: string;
  candidateTitle?: string;
  recipientName?: string;
  companyName?: string;
  resumeData?: ResumeData | null;
  dateStr?: string;
}

export const CoverLetterPdfDocument: React.FC<CoverLetterPdfProps> = ({
  content,
  subjectLine,
  candidateName,
  candidateTitle,
  recipientName,
  companyName,
  resumeData,
  dateStr,
}) => {
  const info = resumeData?.personalInfo;
  const name = (candidateName || info?.fullName || '').trim();
  const title = (candidateTitle || info?.professionalTitle || '').trim();
  const phone = info?.phone?.trim() || '';
  const email = info?.email?.trim() || '';
  const location = info?.location?.trim() || '';
  const linkedin = info?.linkedinUrl?.trim() || '';
  const github = info?.githubUrl?.trim() || '';
  const portfolio = info?.portfolioUrl?.trim() || '';

  const date =
    dateStr ||
    new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());

  // Split content into paragraphs preserving blank lines
  const rawParagraphs = content.split(/\n+/).map((p) => p.trim()).filter(Boolean);

  // Determine if content starts with "Dear ..."
  const hasSalutation = rawParagraphs[0]?.toLowerCase().startsWith('dear ');
  const salutation = hasSalutation ? rawParagraphs[0] : null;

  // Filter out salutation and trailing sign-off if handled separately
  const bodyParagraphs = hasSalutation ? rawParagraphs.slice(1) : rawParagraphs;

  const contactTokens: { label: string; href?: string }[] = [];
  if (phone) contactTokens.push({ label: phone });
  if (email) contactTokens.push({ label: email, href: `mailto:${email}` });
  if (location) contactTokens.push({ label: location });
  if (linkedin) {
    const clean = linkedin.replace(/^https?:\/\/(?:www\.)?linkedin\.com\/in\//i, 'linkedin/');
    contactTokens.push({ label: clean, href: linkedin });
  }
  if (github) {
    const clean = github.replace(/^https?:\/\/(?:www\.)?github\.com\//i, 'github/');
    contactTokens.push({ label: clean, href: github });
  }
  if (portfolio) {
    const clean = portfolio.replace(/^https?:\/\/(?:www\.)?/i, '');
    contactTokens.push({ label: clean, href: portfolio.startsWith('http') ? portfolio : `https://${portfolio}` });
  }

  return (
    <Document title={subjectLine || 'Cover Letter'} author={name || 'ResuMax AI'}>
      <Page size="A4" style={styles.page} wrap>
        {/* Header with Candidate Contact Info */}
        {(name || contactTokens.length > 0) && (
          <View style={styles.header}>
            {name ? <Text style={styles.candidateName}>{name}</Text> : null}
            {title ? <Text style={styles.candidateTitle}>{title}</Text> : null}
            {contactTokens.length > 0 && (
              <View style={styles.contactBar}>
                {contactTokens.map((item, idx) => (
                  <View key={idx} style={styles.contactItem}>
                    {idx > 0 && <Text style={{ marginRight: 6, color: '#94a3b8' }}>•</Text>}
                    {item.href ? (
                      <Link src={item.href} style={styles.link}>
                        {item.label}
                      </Link>
                    ) : (
                      <Text>{item.label}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Date */}
        <Text style={styles.dateBlock}>{date}</Text>

        {/* Recipient Block */}
        {(recipientName || companyName) && (
          <View style={styles.recipientBlock}>
            {recipientName && recipientName !== 'Hiring Team' && (
              <Text style={styles.recipientName}>{recipientName}</Text>
            )}
            {companyName && <Text>{companyName}</Text>}
          </View>
        )}

        {/* Subject Line */}
        {subjectLine && <Text style={styles.subjectLine}>Re: {subjectLine}</Text>}

        {/* Salutation if extracted */}
        {salutation && <Text style={styles.bodyParagraph}>{salutation}</Text>}

        {/* Main Body Paragraphs */}
        {bodyParagraphs.map((paragraph, index) => (
          <Text key={index} style={styles.bodyParagraph} wrap>
            {paragraph}
          </Text>
        ))}

        {/* Multi-page footer page numbering */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            totalPages > 1 ? `Page ${pageNumber} of ${totalPages}` : ''
          }
          fixed
        />
      </Page>
    </Document>
  );
};

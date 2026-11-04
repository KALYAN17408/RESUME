import React from 'react';
import { pdf } from '@react-pdf/renderer';
import {
  CoverLetterPdfDocument,
  type CoverLetterPdfProps,
} from '../components/CoverLetterPdfDocument';

/**
 * Generates an in-memory Blob representing a 100% vector text stream PDF for a cover letter
 */
export async function generateCoverLetterPdfBlob(
  props: CoverLetterPdfProps
): Promise<Blob> {
  if (!props.content || !props.content.trim()) {
    throw new Error('Cannot export empty cover letter content to PDF.');
  }

  const docElement = React.createElement(CoverLetterPdfDocument, props);
  const instance = pdf(docElement as any);
  const blob = await instance.toBlob();
  return blob;
}

/**
 * Triggers a browser download of the exported vector cover letter PDF
 */
export async function downloadCoverLetterPdf(
  props: CoverLetterPdfProps,
  customFilename?: string
): Promise<string> {
  const blob = await generateCoverLetterPdfBlob(props);

  let filename = customFilename;
  if (!filename) {
    const company = (props.companyName || 'Company')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_');
    const role = (props.candidateTitle || 'Role')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_');
    filename = `Cover_Letter_${company}_${role}.pdf`;
  }

  if (!filename.toLowerCase().endsWith('.pdf')) {
    filename += '.pdf';
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return filename;
}

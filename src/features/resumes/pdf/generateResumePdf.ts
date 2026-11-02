import { pdf } from '@react-pdf/renderer';
import React from 'react';
import type { ResumeData } from '../types/resume.types';
import { ResumePdfDocument } from './ResumePdfDocument';

/**
 * Generates an in-memory Blob representing a 100% vector text stream PDF
 */
export async function generateResumePdfBlob(data: ResumeData): Promise<Blob> {
  const docElement = React.createElement(ResumePdfDocument, { data });
  // @react-pdf/renderer pdf() returns an instance with .toBlob() and .toBuffer()
  const instance = pdf(docElement as any);
  const blob = await instance.toBlob();
  return blob;
}

/**
 * Generates a Node.js Buffer representing the PDF (useful in test environments)
 */
export async function generateResumePdfBuffer(data: ResumeData): Promise<Buffer> {
  const docElement = React.createElement(ResumePdfDocument, { data });
  const instance = pdf(docElement as any);
  const blob = await instance.toBlob();

  if (typeof blob.arrayBuffer === 'function') {
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  // Fallback using FileReader
  return new Promise<Buffer>((resolve, reject) => {
    if (typeof FileReader !== 'undefined') {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(Buffer.from(reader.result as ArrayBuffer));
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    } else {
      reject(new Error('Unable to convert blob to buffer: arrayBuffer not supported.'));
    }
  });
}

/**
 * Triggers a browser download of the exported vector PDF
 */
export async function downloadResumePdf(data: ResumeData, filename?: string): Promise<void> {
  const blob = await generateResumePdfBlob(data);
  const safeName = (filename || `${data.personalInfo.fullName || 'Resume'}_${data.templateId}`)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toLowerCase();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeName}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

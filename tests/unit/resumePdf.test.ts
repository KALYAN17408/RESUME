// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { generateResumePdfBuffer } from '@/features/resumes/pdf/generateResumePdf';
import { createSampleResume } from '@/features/resumes/utils/resumeDefaults';
import type { TemplateId } from '@/features/resumes/types/resume.types';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

function extractTextWithPdftotext(buffer: Buffer): string {
  const tmpFile = path.join(os.tmpdir(), `test_resume_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`);
  try {
    fs.writeFileSync(tmpFile, buffer);
    const output = execSync(`pdftotext "${tmpFile}" -`, { encoding: 'utf-8' });
    return output;
  } finally {
    if (fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile);
    }
  }
}

describe('Vector PDF Engine (@react-pdf/renderer)', () => {
  const templates: TemplateId[] = [
    'jakes-technical',
    'harvard-classic',
    'stanford-editorial',
    'modern-tech-clean',
  ];

  it.each(templates)(
    'generates a valid, selectable vector PDF with pdftotext for template: %s',
    async (templateId) => {
      const sampleData = createSampleResume('test_user_pdf', templateId);
      const buffer = await generateResumePdfBuffer(sampleData);

      // 1. Verify buffer is non-empty and starts with standard PDF header '%PDF-'
      expect(buffer).toBeDefined();
      expect(buffer.length).toBeGreaterThan(1000);
      const header = buffer.subarray(0, 5).toString('utf-8');
      expect(header).toBe('%PDF-');

      // 2. Extract text using native pdftotext to verify 100% selectable vector text
      const text = extractTextWithPdftotext(buffer);
      expect(text.length).toBeGreaterThan(200);

      // 3. Verify key text strings are present in the selectable text stream
      expect(text).toMatch(/Alex\s+Johnson/i);
      expect(text).toContain('CloudPlatform Inc.');
      expect(text).toContain('University of California, Berkeley');
      expect(text).toContain('PulseQueue');
      expect(text).toContain('TypeScript');
      expect(text).toContain('alex.johnson@example.com');
    },
    25000
  );

  it('preserves user links and URI annotations in PDF stream', async () => {
    const sampleData = createSampleResume('test_user_pdf', 'jakes-technical');
    const buffer = await generateResumePdfBuffer(sampleData);
    const pdfString = buffer.toString('latin1');

    // Vector PDFs generated with Link contain URI annotations
    expect(pdfString).toContain('/URI');
    expect(pdfString).toContain('mailto:alex.johnson@example.com');
  });
});

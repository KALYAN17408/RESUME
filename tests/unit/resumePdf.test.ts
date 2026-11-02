// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { generateResumePdfBuffer } from '@/features/resumes/pdf/generateResumePdf';
import { createSampleResume } from '@/features/resumes/utils/resumeDefaults';
import type { ResumeData, TemplateId } from '@/features/resumes/types/resume.types';
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

function inspectWithPdfInfo(buffer: Buffer): { pages: number } {
  const tmpFile = path.join(os.tmpdir(), `test_info_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`);
  try {
    fs.writeFileSync(tmpFile, buffer);
    const output = execSync(`pdfinfo "${tmpFile}"`, { encoding: 'utf-8' });
    const match = output.match(/Pages:\s+(\d+)/);
    return { pages: match ? parseInt(match[1], 10) : 1 };
  } finally {
    if (fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile);
    }
  }
}

function countRasterImagesWithPdfImages(buffer: Buffer): number {
  const tmpFile = path.join(os.tmpdir(), `test_img_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`);
  try {
    fs.writeFileSync(tmpFile, buffer);
    const output = execSync(`pdfimages -list "${tmpFile}"`, { encoding: 'utf-8' });
    const lines = output.trim().split('\n').filter((l) => l.trim().length > 0);
    // Standard pdfimages header has 2 lines. If lines <= 2, exactly 0 raster images are in the document.
    return lines.length <= 2 ? 0 : lines.length - 2;
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

      // 4. Inspect PDF objects using pdfimages to guarantee ZERO full-page raster images
      const rasterCount = countRasterImagesWithPdfImages(buffer);
      expect(rasterCount).toBe(0);
    },
    25000
  );

  it.each(templates)(
    'renders multi-page resumes across page boundaries without clipping for template: %s',
    async (templateId) => {
      const multiResume: ResumeData = createSampleResume('test_user_multipage', templateId);
      
      // Expand with multiple additional detailed positions and projects to force clean multi-page pagination
      for (let i = 1; i <= 6; i++) {
        multiResume.experiences.push({
          id: `exp_overflow_${i}`,
          company: `Scalable Systems Corp ${i}`,
          jobTitle: `Principal Systems Engineer ${i}`,
          location: 'San Francisco, CA',
          startDate: '2016-01',
          endDate: '2018-05',
          current: false,
          highlights: [
            `Engineered distributed data pipeline processing ${i * 50} TB daily with zero data loss.`,
            `Spearheaded multi-region disaster recovery protocol cutting failover latency by 85%.`,
            `Mentored ${i * 4} software engineers across three cross-functional organizations.`,
          ],
        });
      }

      for (let i = 1; i <= 4; i++) {
        multiResume.projects.push({
          id: `proj_overflow_${i}`,
          name: `Distributed Telemetry Ingestor v${i}`,
          description: `High throughput stream processing engine for observability processing up to 2 million events per second with sub-5ms p99 latency.`,
          technologies: ['Rust', 'Apache Kafka', 'ClickHouse', 'Docker'],
          url: `https://github.com/example/telemetry-v${i}`,
          startDate: '2019-01',
          endDate: '2019-12',
        });
      }

      const buffer = await generateResumePdfBuffer(multiResume);
      expect(buffer.length).toBeGreaterThan(5000);

      // Verify page count via pdfinfo
      const info = inspectWithPdfInfo(buffer);
      expect(info.pages).toBeGreaterThanOrEqual(2);

      // Verify text from later pages is fully extracted without truncation or clipping
      const text = extractTextWithPdftotext(buffer);
      expect(text).toContain('Scalable Systems Corp 6');
      expect(text).toContain('Distributed Telemetry Ingestor v4');
      expect(text).toContain('Principal Systems Engineer 6');

      // Guarantee ZERO raster image elements across multi-page document
      const rasterCount = countRasterImagesWithPdfImages(buffer);
      expect(rasterCount).toBe(0);
    },
    30000
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

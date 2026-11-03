import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BulletRewriterCard } from '@/features/optimizer/components/BulletRewriterCard';
import { createSampleResume } from '@/features/resumes/utils/resumeDefaults';
import type { RewriteBulletResult } from '@/features/optimizer/types/optimizer.types';

describe('BulletRewriterCard Component', () => {
  const sampleResume = createSampleResume('user_1', 'jakes-technical');
  const expId = sampleResume.experiences[0].id;

  const mockRewriteResult: RewriteBulletResult = {
    originalBullet: 'Worked on database queries and caching to improve speed.',
    alternatives: [
      {
        id: 'alt-b1',
        text: 'Engineered and delivered database query optimizations, resulting in [add measurable result if available, e.g. % increase or hours saved].',
        formula: 'XYZ',
        actionVerb: 'Engineered',
        metricsOrPlaceholders: ['[add measurable result if available, e.g. % increase or hours saved]'],
        improvements: ['Applied Google XYZ formula', 'Replaced passive verb with Engineered'],
        requiresConfirmation: true,
        unsupportedClaims: [],
      },
      {
        id: 'alt-b2',
        text: 'Streamlined database query optimization across production environments, driving 35% latency reduction.',
        formula: 'Action-Result',
        actionVerb: 'Streamlined',
        metricsOrPlaceholders: ['35%'],
        improvements: ['Structured around direct business action'],
        requiresConfirmation: false,
        unsupportedClaims: [],
      },
    ],
    provider: 'deterministic',
    isDeterministic: true,
    processingTimeMs: 12,
  };

  it('renders experience items and bullet points', () => {
    const handleRewrite = vi.fn();
    render(
      <BulletRewriterCard
        resume={sampleResume}
        bulletResults={{}}
        activeBulletKey={null}
        isLoading={false}
        error={null}
        stagedBullets={[]}
        onRewrite={handleRewrite}
        onStageBullet={vi.fn()}
        onUnstageBullet={vi.fn()}
      />
    );

    expect(screen.getByText('Experience & Project Bullet Rewriter')).toBeInTheDocument();
    expect(screen.getByText('Google XYZ Formula')).toBeInTheDocument();
    expect(screen.getByText(/Work Experience/i)).toBeInTheDocument();
    expect(screen.getByText('Select Bullet Point to Optimize')).toBeInTheDocument();

    const rewriteBtn = screen.getByRole('button', { name: /rewrite selected bullet/i });
    fireEvent.click(rewriteBtn);
    expect(handleRewrite).toHaveBeenCalled();
  });

  it('displays rewritten alternatives with formula badges and staging action', () => {
    const handleStage = vi.fn();
    const bulletKey = `experience_${expId}_0`;

    render(
      <BulletRewriterCard
        resume={sampleResume}
        bulletResults={{ [bulletKey]: mockRewriteResult }}
        activeBulletKey={null}
        isLoading={false}
        error={null}
        stagedBullets={[]}
        onRewrite={vi.fn()}
        onStageBullet={handleStage}
        onUnstageBullet={vi.fn()}
      />
    );

    expect(screen.getByText('XYZ Formula')).toBeInTheDocument();
    expect(screen.getByText('Verb: Engineered')).toBeInTheDocument();
    expect(screen.getByText(/Placeholder Metric Required/i)).toBeInTheDocument();

    const stageBtns = screen.getAllByRole('button', { name: /apply to staged changes/i });
    fireEvent.click(stageBtns[0]);
    expect(handleStage).toHaveBeenCalledWith(
      expect.objectContaining({
        formula: 'XYZ',
        rewritten: expect.stringContaining('Engineered and delivered'),
      })
    );
  });

  it('allows inline editing to replace placeholder brackets and stages customized bullet text', () => {
    const handleStage = vi.fn();
    const bulletKey = `experience_${expId}_0`;

    render(
      <BulletRewriterCard
        resume={sampleResume}
        bulletResults={{ [bulletKey]: mockRewriteResult }}
        activeBulletKey={null}
        isLoading={false}
        error={null}
        stagedBullets={[]}
        onRewrite={vi.fn()}
        onStageBullet={handleStage}
        onUnstageBullet={vi.fn()}
      />
    );

    // Click "Edit & Fill Metric" on the first alternative
    const editBtns = screen.getAllByRole('button', { name: /edit & fill metric/i });
    fireEvent.click(editBtns[0]);

    // Textarea is shown
    const textarea = screen.getByPlaceholderText(/edit bullet point and replace bracketed placeholders/i);
    expect(textarea).toBeInTheDocument();

    // Fill in actual metric
    fireEvent.change(textarea, {
      target: {
        value: 'Engineered and delivered database query optimizations, resulting in 42% latency reduction and $12k server savings.',
      },
    });

    // Click "Done"
    const doneBtn = screen.getByRole('button', { name: /done editing/i });
    fireEvent.click(doneBtn);

    // Click stage button
    const stageBtns = screen.getAllByRole('button', { name: /apply to staged changes/i });
    fireEvent.click(stageBtns[0]);

    expect(handleStage).toHaveBeenCalledWith(
      expect.objectContaining({
        formula: 'XYZ',
        rewritten: 'Engineered and delivered database query optimizations, resulting in 42% latency reduction and $12k server savings.',
      })
    );
  });

  it('allows dismissing a bullet alternative', () => {
    const bulletKey = `experience_${expId}_0`;

    render(
      <BulletRewriterCard
        resume={sampleResume}
        bulletResults={{ [bulletKey]: mockRewriteResult }}
        activeBulletKey={null}
        isLoading={false}
        error={null}
        stagedBullets={[]}
        onRewrite={vi.fn()}
        onStageBullet={vi.fn()}
        onUnstageBullet={vi.fn()}
      />
    );

    const dismissBtns = screen.getAllByTitle('Dismiss this alternative');
    fireEvent.click(dismissBtns[0]);

    expect(screen.queryByText(mockRewriteResult.alternatives[0].text)).not.toBeInTheDocument();
  });
});

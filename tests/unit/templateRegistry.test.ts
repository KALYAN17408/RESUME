import { describe, it, expect } from 'vitest';
import { TEMPLATE_REGISTRY, TEMPLATE_LIST } from '@/features/resumes/templates/templateRegistry';

describe('templateRegistry', () => {
  it('registers all four required ATS templates', () => {
    expect(TEMPLATE_REGISTRY['jakes-technical']).toBeDefined();
    expect(TEMPLATE_REGISTRY['harvard-classic']).toBeDefined();
    expect(TEMPLATE_REGISTRY['stanford-editorial']).toBeDefined();
    expect(TEMPLATE_REGISTRY['modern-tech-clean']).toBeDefined();
  });

  it('contains exactly four templates in the catalog list', () => {
    expect(TEMPLATE_LIST).toHaveLength(4);
  });

  it('provides complete metadata for every template', () => {
    for (const t of TEMPLATE_LIST) {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(t.badge).toBeTruthy();
      expect(t.recommendedRole).toBeTruthy();
      expect(t.defaultFont).toBeTruthy();
      expect(t.defaultAccent).toBeTruthy();
    }
  });

  it('Jake Technical uses clean black-and-white default accent', () => {
    expect(TEMPLATE_REGISTRY['jakes-technical'].defaultAccent).toBe('#0f172a');
  });

  it('Harvard Classic uses serif default font', () => {
    expect(TEMPLATE_REGISTRY['harvard-classic'].defaultFont).toBe('Merriweather');
  });
});

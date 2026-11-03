import type { ResumeData } from '@/features/resumes/types/resume.types';

export interface ApprovedSummaryChange {
  original: string;
  selected: string;
  tone: string;
}

export interface ApprovedBulletChange {
  key: string;
  sourceType: 'experience' | 'project';
  sourceId: string;
  sourceTitle: string;
  bulletIndex: number;
  original: string;
  rewritten: string;
  formula?: string;
}

export interface ApprovedSkillChange {
  skill: string;
  category: string;
  suggestedSection?: 'skills' | 'experience' | 'summary' | 'projects';
}

export interface ApprovedChangesPayload {
  summary?: ApprovedSummaryChange | null;
  bullets?: ApprovedBulletChange[];
  skills?: ApprovedSkillChange[];
}

export interface MergeResult {
  updatedResume: ResumeData;
  appliedCount: number;
  appliedDetails: {
    summaryApplied: boolean;
    bulletsAppliedCount: number;
    skillsAppliedCount: number;
  };
  warnings: string[];
}

export class ResumeMergeService {
  /**
   * Validate that the target resume and changes payload are valid for merging
   */
  static validateMergeInputs(
    resume: ResumeData,
    changes: ApprovedChangesPayload
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!resume || typeof resume !== 'object') {
      errors.push('Target resume object is invalid or undefined.');
      return { isValid: false, errors };
    }

    if (!resume.id || !resume.userId) {
      errors.push('Resume is missing mandatory identity fields (id or userId).');
    }

    if (!resume.personalInfo) {
      errors.push('Resume is missing personalInfo structure.');
    }

    // Check bullets reference validity
    if (changes.bullets && changes.bullets.length > 0) {
      const expIds = new Set((resume.experiences || []).map((e) => e.id));
      const projIds = new Set((resume.projects || []).map((p) => p.id));

      for (const b of changes.bullets) {
        if (b.sourceType === 'experience' && !expIds.has(b.sourceId)) {
          errors.push(`Staged bullet references non-existent experience ID: ${b.sourceId}`);
        } else if (b.sourceType === 'project' && !projIds.has(b.sourceId)) {
          errors.push(`Staged bullet references non-existent project ID: ${b.sourceId}`);
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Apply approved changes immutably to a target resume
   */
  static mergeApprovedChanges(
    originalResume: ResumeData,
    approvedChanges: ApprovedChangesPayload
  ): MergeResult {
    // 1. Validate inputs
    const validation = this.validateMergeInputs(originalResume, approvedChanges);
    if (!validation.isValid) {
      throw new Error(`Resume merge validation failed: ${validation.errors.join('; ')}`);
    }

    // 2. Deep clone original resume to ensure absolute immutability
    const updated: ResumeData = JSON.parse(JSON.stringify(originalResume));
    const warnings: string[] = [];
    let bulletsAppliedCount = 0;
    let skillsAppliedCount = 0;
    let summaryApplied = false;

    // 3. Apply Professional Summary (if approved)
    if (approvedChanges.summary && approvedChanges.summary.selected) {
      updated.personalInfo.summary = approvedChanges.summary.selected.trim();
      summaryApplied = true;
    }

    // 4. Apply Approved Bullets
    if (approvedChanges.bullets && approvedChanges.bullets.length > 0) {
      for (const bullet of approvedChanges.bullets) {
        if (!bullet.rewritten) continue;

        if (bullet.sourceType === 'experience') {
          const exp = (updated.experiences || []).find((e) => e.id === bullet.sourceId);
          if (!exp) {
            warnings.push(`Experience with ID "${bullet.sourceId}" was not found; bullet skipped.`);
            continue;
          }

          if (!Array.isArray(exp.highlights)) {
            exp.highlights = [];
          }

          if (bullet.bulletIndex >= 0 && bullet.bulletIndex < exp.highlights.length) {
            exp.highlights[bullet.bulletIndex] = bullet.rewritten.trim();
            bulletsAppliedCount++;
          } else {
            // Append if out of bounds index
            exp.highlights.push(bullet.rewritten.trim());
            bulletsAppliedCount++;
          }
        } else if (bullet.sourceType === 'project') {
          const proj = (updated.projects || []).find((p) => p.id === bullet.sourceId);
          if (!proj) {
            warnings.push(`Project with ID "${bullet.sourceId}" was not found; bullet skipped.`);
            continue;
          }

          proj.description = bullet.rewritten.trim();
          bulletsAppliedCount++;
        }
      }
    }

    // 5. Apply Approved Confirmed Skills
    if (approvedChanges.skills && approvedChanges.skills.length > 0) {
      if (!Array.isArray(updated.skillCategories)) {
        updated.skillCategories = [];
      }

      // Collect all existing normalized skills across all categories
      const existingSkillSet = new Set<string>();
      for (const cat of updated.skillCategories) {
        if (Array.isArray(cat.skills)) {
          for (const s of cat.skills) {
            existingSkillSet.add(s.trim().toLowerCase());
          }
        }
      }

      for (const skillItem of approvedChanges.skills) {
        const trimmedSkill = skillItem.skill.trim();
        const normalized = trimmedSkill.toLowerCase();

        if (existingSkillSet.has(normalized)) {
          warnings.push(`Skill "${trimmedSkill}" already exists in resume; skipped duplicate.`);
          continue;
        }

        const targetCatName = skillItem.category.trim() || 'Technical Skills';
        let targetCategory = updated.skillCategories.find(
          (c) => c.name.toLowerCase() === targetCatName.toLowerCase()
        );

        if (!targetCategory) {
          targetCategory = {
            id: crypto.randomUUID(),
            name: targetCatName,
            skills: [],
          };
          updated.skillCategories.push(targetCategory);
        }

        targetCategory.skills.push(trimmedSkill);
        existingSkillSet.add(normalized);
        skillsAppliedCount++;
      }
    }

    // 6. Update timestamp
    updated.updatedAt = new Date().toISOString();

    const appliedCount =
      (summaryApplied ? 1 : 0) + bulletsAppliedCount + skillsAppliedCount;

    return {
      updatedResume: updated,
      appliedCount,
      appliedDetails: {
        summaryApplied,
        bulletsAppliedCount,
        skillsAppliedCount,
      },
      warnings,
    };
  }
}

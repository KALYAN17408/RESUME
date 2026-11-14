/**
 * RESUME AI - Global Site & Contact Configuration
 *
 * Centralizes public brand metadata, support contact identifiers, and legal disclosures.
 * Ensures personal contact info is never accidentally exposed in client bundles.
 */

export const SITE_CONFIG = {
  name: 'RESUME AI',
  brandName: 'RESUME AI',
  domain: 'theresume-ai.netlify.app',
  url: 'https://theresume-ai.netlify.app',
  githubUrl: 'https://github.com/KALYAN17408/RESUME',
  
  // Preferred placeholder when a production support inbox has not been configured in env
  supportEmailPlaceholder: '[RESUME_AI_SUPPORT_EMAIL]',
  
  // Resolved support email from environment, falling back to placeholder
  get supportEmail(): string {
    const envEmail = import.meta.env.VITE_SUPPORT_EMAIL?.trim();
    if (envEmail && !envEmail.includes('[') && envEmail.includes('@')) {
      return envEmail;
    }
    return this.supportEmailPlaceholder;
  },

  get isSupportEmailConfigured(): boolean {
    const envEmail = import.meta.env.VITE_SUPPORT_EMAIL?.trim();
    return Boolean(envEmail && !envEmail.includes('[') && envEmail.includes('@'));
  },

  // Google Search Console Verification Meta Tag Token
  get googleSiteVerification(): string {
    return import.meta.env.VITE_GOOGLE_SITE_VERIFICATION?.trim() || '';
  },
};

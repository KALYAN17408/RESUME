import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { SITE_CONFIG } from '@/config/site';
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  Mail,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('intro');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    { id: 'intro', title: '1. Introduction & Scope' },
    { id: 'collected-info', title: '2. Information We Collect' },
    { id: 'google-oauth', title: '3. Google OAuth & Account Data' },
    { id: 'github-oauth', title: '4. GitHub OAuth Authentication' },
    { id: 'email-profile', title: '5. Email & Profile Information' },
    { id: 'resume-data', title: '6. Resume & Uploaded Documents' },
    { id: 'processing-ai', title: '7. Resume Builder, ATS & Cover Letter Processing' },
    { id: 'supabase-db', title: '8. Supabase Auth & Database Storage' },
    { id: 'storage-files', title: '9. Supabase Storage & File Handling' },
    { id: 'cookies-tokens', title: '10. Cookies, Sessions & Auth Tokens' },
    { id: 'third-parties', title: '11. Third-Party Service Providers' },
    { id: 'data-sharing', title: '12. Data Sharing & Disclosure' },
    { id: 'retention-deletion', title: '13. Data Retention & Deletion' },
    { id: 'user-rights', title: '14. User Rights & Account Deletion' },
    { id: 'security', title: '15. Security Practices & Limitations' },
    { id: 'children', title: '16. Children’s Privacy' },
    { id: 'international', title: '17. International Data Processing' },
    { id: 'changes', title: '18. Changes to this Policy' },
    { id: 'contact', title: '19. Contact Information' },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-black selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1 py-10 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Top Breadcrumb & Status Pill */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-200/60"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <Badge variant="outline" size="sm" className="bg-white text-slate-700 border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                Official Privacy Policy
              </Badge>
              <Badge variant="success" size="sm" className="text-[10px] font-bold">
                Live & Compliant
              </Badge>
            </div>
          </div>

          {/* Hero Header Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-card space-y-4 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 -z-0 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-md shadow-black/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Effective Date: November 1, 2026 • Last Reviewed & Updated: November 12, 2026
              </p>
            </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl pt-2">
              This Privacy Policy explains how <strong>{SITE_CONFIG.name}</strong> (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), hosted at{' '}
              <a href={SITE_CONFIG.url} className="text-blue-600 underline font-semibold">
                {SITE_CONFIG.url}
              </a>
              , collects, processes, stores, and protects personal data and user documents. We are committed to complete transparency, zero data selling, and robust security across all resume and career tools.
            </p>
          </div>

          {/* Two-Column Layout: Sidebar TOC + Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sticky Table of Contents (Desktop) */}
            <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-left">
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                  Table of Contents
                </h2>
                <nav className="space-y-1 max-h-[calc(100vh-180px)] overflow-y-auto pr-1 text-xs">
                  {sections.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                        activeSection === sec.id
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span className="truncate">{sec.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-50" />
                    </button>
                  ))}
                </nav>
              </div>

              {/* Quick Trust Highlights Card */}
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-black text-white p-5 shadow-xs text-left space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <Lock className="w-4 h-4" />
                  <span>Privacy Guarantees</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>No selling or renting of personal or resume data.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>No targeted advertising or data broker integrations.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Full compliance with Google API Limited Use policy.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>PostgreSQL Row Level Security ensures document isolation.</span>
                  </li>
                </ul>
              </div>
            </aside>

            {/* Document Content */}
            <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-card text-left space-y-12 text-sm text-slate-700 leading-relaxed">
              {/* Section 1 */}
              <section id="intro" className="space-y-3 scroll-mt-24">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-black inline-flex items-center justify-center">1</span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Introduction and Scope</h2>
                </div>
                <p>
                  <strong>{SITE_CONFIG.name}</strong> operates the web application located at <a href={SITE_CONFIG.url} className="text-blue-600 underline font-medium">{SITE_CONFIG.url}</a>. This platform provides single-column ATS-compliant resume building, resume compatibility analysis, and tailored cover letter generation. All primary tools are offered completely free of charge.
                </p>
                <p>
                  This Privacy Policy applies to all registered and unregistered visitors, users who authenticate via email, Google OAuth, or GitHub OAuth, and any candidate data processed through our browser tools or backend infrastructure.
                </p>
              </section>

              {/* Section 2 */}
              <section id="collected-info" className="space-y-3 scroll-mt-24 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-black inline-flex items-center justify-center">2</span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Information We Collect</h2>
                </div>
                <p>
                  We collect only the minimum personal data strictly necessary to deliver, authenticate, and improve our services:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 pl-2">
                  <li><strong>Account Credentials:</strong> Email address, full name, and encrypted authentication tokens.</li>
                  <li><strong>Candidate Resume Details:</strong> Contact information, employment history, education, skills, projects, and target job descriptions.</li>
                  <li><strong>Uploaded Files:</strong> PDF resume documents uploaded specifically for ATS compatibility scanning.</li>
                  <li><strong>Technical & Session Data:</strong> Browser user-agent, operating system, IP address, and timestamp logs captured automatically for session security and anti-abuse rate limiting.</li>
                </ul>
              </section>

              {/* Section 3 - Google OAuth */}
              <section id="google-oauth" className="space-y-4 scroll-mt-24 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-black inline-flex items-center justify-center">3</span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Google OAuth Authentication and Account Information</h2>
                </div>
                <p>
                  When you sign in using <strong>Continue with Google</strong>, Google prompts you to grant access to basic profile scopes (<code>email</code>, <code>profile</code>, <code>openid</code>). We receive and store:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 pl-2">
                  <li><strong>Primary Google Email Address:</strong> Used as your unique account identifier, for authentication sessions, and to send password recovery or service notices.</li>
                  <li><strong>Full Name:</strong> Used to personalize your workspace header and pre-fill the candidate name on your resumes.</li>
                  <li><strong>Google Profile Picture URL:</strong> Used optionally to display your avatar in the dashboard sidebar.</li>
                  <li><strong>Google Subject ID:</strong> A cryptographic identifier provided by Google to verify token authenticity.</li>
                </ul>

                {/* Google API Limited Use Callout Box */}
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <span>Google API Services User Data Policy — Limited Use Disclosure</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {SITE_CONFIG.name}&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{' '}
                    <a
                      href="https://developers.google.com/terms/api-services-user-data-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Google API Services User Data Policy
                    </a>
                    , including the Limited Use requirements:
                  </p>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-2">
                    <li>We do <strong>not</strong> use Google user data to serve advertisements or personalized advertising.</li>
                    <li>We do <strong>not</strong> sell Google user data to third parties, data brokers, or marketing networks.</li>
                    <li>We do <strong>not</strong> use Google user data to train, fine-tune, or develop generalized artificial intelligence or machine learning models.</li>
                    <li>We do <strong>not</strong> allow humans to read user data unless you provide explicit consent for technical troubleshooting, it is strictly necessary for security audits, or to comply with applicable laws.</li>
                  </ul>
                </div>
              </section>

              {/* Section 4 - GitHub OAuth */}
              <section id="github-oauth" className="space-y-3 scroll-mt-24 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-black inline-flex items-center justify-center">4</span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">GitHub OAuth Authentication and Account Information</h2>
                </div>
                <p>
                  When you sign in using <strong>Continue with GitHub</strong>, we request basic read-only access to your public profile and verified email address (<code>read:user</code>, <code>user:email</code>). We store your verified GitHub email address, display name, and avatar URL solely to create your account and maintain your authenticated session.
                </p>
              </section>

              {/* Section 5 */}
              <section id="email-profile" className="space-y-3 scroll-mt-24 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-black inline-flex items-center justify-center">5</span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Email and Account Profile Information</h2>
                </div>
                <p>
                  If you register directly with an email address and password, your password is never stored in plaintext. Passwords are securely hashed by Supabase Auth using industry-standard cryptographic algorithms before being committed to the database. We store your account profile in the <code>public.profiles</code> table (fields: <code>id</code>, <code>full_name</code>, <code>email</code>, <code>avatar_url</code>, and timestamps).
                </p>
              </section>

              {/* Section 6 */}
              <section id="resume-data" className="space-y-3 scroll-mt-24 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-black inline-flex items-center justify-center">6</span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Resume Content and Uploaded Documents</h2>
                </div>
                <p>
                  <strong>You retain 100% intellectual property ownership</strong> of all resume text, employment history, educational credentials, and portfolio links you provide.
                </p>
                <p>
                  When you upload a PDF resume for ATS analysis, the file is parsed in your browser session using our text-extraction engine to compute keyword density, formatting compliance, and metric quantification. We do not sell your resumes to recruiters, headhunters, or advertising agencies.
                </p>
              </section>

              {/* Section 7 */}
              <section id="processing-ai" className="space-y-3 scroll-mt-24 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-black inline-flex items-center justify-center">7</span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Resume Creation, Editing, ATS Analysis & Cover Letter Processing
                  </h2>
                </div>
                <p>
                  Our application architecture combines browser-native execution with secure cloud storage:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 pl-2">
                  <li><strong>Resume Builder:</strong> Operates directly in your browser. Document changes are automatically debounced and saved to your account. PDF generation runs locally using <code>@react-pdf/renderer</code>, producing selectable vector text streams without routing documents through third-party rendering APIs.</li>
                  <li><strong>ATS Resume Analyzer:</strong> Evaluates your resume against target job descriptions using heuristic parsing algorithms (Google XYZ formula quantification, verb impact analysis, and section layout validation).</li>
                  <li><strong>Cover Letter Generator:</strong> Synthesizes role-tailored letters matching your verified experience across 4 customizable tones. If remote edge functions are unreachable, the application automatically uses a deterministic, rule-based client-side synthesis fallback.</li>
                </ul>
              </section>

              {/* Section 8 */}
              <section id="supabase-db" className="space-y-3 scroll-mt-24 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-black inline-flex items-center justify-center">8</span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Supabase Authentication and Database Storage</h2>
                </div>
                <p>
                  Our primary backend infrastructure is powered by <strong>Supabase</strong> (hosted on enterprise cloud infrastructure in the Asia-Pacific region, project reference: <code>mnjekjorvdsvnshumhbr</code>).
                </p>
                <p>
                  All database tables (including <code>resumes</code>, <code>profiles</code>, and session logs) are strictly protected by <strong>PostgreSQL Row Level Security (RLS)</strong>. RLS ensures that each user&apos;s data is mathematically isolated and queryable only when authenticated with that user&apos;s cryptographic JWT token (<code>auth.uid() = user_id</code>). No user can view, edit, or delete another user&apos;s documents.
                </p>
              </section>

              {/* Section 9 */}
              <section id="storage-files" className="space-y-3 scroll-mt-24 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-black inline-flex items-center justify-center">9</span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Supabase Storage and Uploaded Files</h2>
                </div>
                <p>
                  Uploaded assets are stored in private Supabase Storage buckets governed by authenticated access policies. In the event of transient network offline conditions, our storage adapter maintains encrypted local cache copies on your device until cloud synchronization can be completed.
                </p>
              </section>

              {/* Section 10 */}
              <section id="cookies-tokens" className="space-y-3 scroll-mt-24 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-black inline-flex items-center justify-center">10</span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Cookies, Sessions and Authentication Tokens</h2>
                </div>
                <p>
                  We utilize a triple-layer client storage adapter designed for single-page applications:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 pl-2">
                  <li><strong>Local Storage (<code>window.localStorage</code>):</strong> Caches non-sensitive UI preferences and active JWT session tokens.</li>
                  <li><strong>Encrypted Cookies (<code>document.cookie</code>):</strong> Stores temporary session identifiers with <code>SameSite=Lax</code> and <code>Secure</code> flags to preserve authentication across cross-origin OAuth redirects and Safari Intelligent Tracking Prevention (ITP).</li>
                  <li><strong>Session Storage (<code>window.sessionStorage</code>):</strong> Acts as a local fallback for private or incognito browsing sessions.</li>
                </ul>
                <p className="text-xs text-slate-500 pt-1">
                  We do <strong>not</strong> deploy advertising cookies, tracking pixels, or cross-site tracking scripts.
                </p>
              </section>

              {/* Section 11 */}
              <section id="third-parties" className="space-y-3 scroll-mt-24 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-black inline-flex items-center justify-center">11</span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Third-Party Service Providers</h2>
                </div>
                <p>
                  We partner only with verified infrastructure providers who maintain rigorous security certifications:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <p className="font-bold text-slate-900">Supabase Inc.</p>
                    <p className="text-slate-600">PostgreSQL database, user authentication, and encrypted object storage. SOC 2 Type II certified.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <p className="font-bold text-slate-900">Netlify Inc.</p>
                    <p className="text-slate-600">Static application delivery, global edge CDN, and TLS 1.3 certificate termination.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <p className="font-bold text-slate-900">Google LLC (Google Identity)</p>
                    <p className="text-slate-600">OAuth 2.0 authentication verification and token validation.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <p className="font-bold text-slate-900">GitHub Inc. (Microsoft)</p>
                    <p className="text-slate-600">OAuth 2.0 developer identity authentication.</p>
                  </div>
                </div>
              </section>

              {/* Section 12 */}
              <section id="data-sharing" className="space-y-3 scroll-mt-24 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-black inline-flex items-center justify-center">12</span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Data Sharing and Disclosure</h2>
                </div>
                <p>
                  We do not sell, rent, lease, or monetize your personal information or resume materials under any circumstances. We disclose data solely:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pl-2">
                  <li>To the trusted infrastructure processors listed in Section 11 to operate the platform.</li>
                  <li>When required to comply with a valid legal process, judicial subpoena, or applicable statutory law.</li>
                  <li>To investigate, prevent, or address security threats, fraud, or technical vulnerabilities.</li>
                </ul>
              </section>

              {/* Section 13 */}
              <section id="retention-deletion" className="space-y-3 scroll-mt-24 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-black inline-flex items-center justify-center">13</span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Data Retention and Deletion</h2>
                </div>
                <p>
                  We retain your resumes and account information for as long as your account remains active. You may delete individual resumes at any time from your dashboard. When a resume or account is deleted, foreign-key cascades ensure that associated records in PostgreSQL are permanently purged.
                </p>
              </section>

              {/* Section 14 */}
              <section id="user-rights" className="space-y-3 scroll-mt-24 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-black inline-flex items-center justify-center">14</span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">User Rights and Account Deletion Requests</h2>
                </div>
                <p>
                  Regardless of your geographical location, we extend full data privacy rights:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 pl-2">
                  <li><strong>Right to Access & Portability:</strong> Download all resumes in industry-standard vector PDF format at any time.</li>
                  <li><strong>Right to Rectification:</strong> Edit any part of your profile or resume documents directly through the editor.</li>
                  <li><strong>Right to Erasure:</strong> Delete any document or delete your entire account through Account Settings or by emailing support.</li>
                  <li>
                    <strong>Revoking Google Access:</strong> You can revoke {SITE_CONFIG.name}&apos;s access to your Google Account at any time via{' '}
                    <a
                      href="https://myaccount.google.com/permissions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline font-medium"
                    >
                      Google Security Settings
                    </a>
                    .
                  </li>
                </ul>
              </section>

              {/* Section 15 */}
              <section id="security" className="space-y-3 scroll-mt-24 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-black inline-flex items-center justify-center">15</span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Security Practices and Limitations</h2>
                </div>
                <p>
                  We protect your documents using defense-in-depth security practices:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pl-2">
                  <li><strong>Encryption in Transit:</strong> All HTTP traffic is enforced over TLS 1.3 with HSTS headers.</li>
                  <li><strong>Encryption at Rest:</strong> Database tables and file storage buckets are encrypted at rest using AES-256.</li>
                  <li><strong>Database Row Level Security:</strong> RLS policies enforced at the PostgreSQL kernel level.</li>
                  <li><strong>PKCE OAuth Security:</strong> RFC 7636 Proof Key for Code Exchange prevents code interception attacks.</li>
                </ul>
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <p>
                    <strong>Technical Limitation:</strong> While we employ industry-standard encryption and security measures, no method of transmission over the Internet or electronic storage is completely impenetrable. We encourage users to maintain secure, unique passwords.
                  </p>
                </div>
              </section>

              {/* Section 16 */}
              <section id="children" className="space-y-3 scroll-mt-24 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-black inline-flex items-center justify-center">16</span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Children&apos;s Privacy</h2>
                </div>
                <p>
                  {SITE_CONFIG.name} is intended for job seekers and career professionals. We do not knowingly collect or solicit personal information from individuals under the age of 16 (or under 13 in the United States pursuant to COPPA). If we learn that we have inadvertently collected personal data from a minor, we will promptly delete that information.
                </p>
              </section>

              {/* Section 17 */}
              <section id="international" className="space-y-3 scroll-mt-24 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-black inline-flex items-center justify-center">17</span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">International Data Processing</h2>
                </div>
                <p>
                  Our static application is hosted via Netlify&apos;s global CDN, and database servers are located in secure AWS/Cloudflare facilities. By accessing the site from outside these regions, you acknowledge that your information will be transferred and processed in accordance with this Privacy Policy.
                </p>
              </section>

              {/* Section 18 */}
              <section id="changes" className="space-y-3 scroll-mt-24 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-black inline-flex items-center justify-center">18</span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Changes to this Privacy Policy</h2>
                </div>
                <p>
                  We may update this policy periodically to reflect operational changes, product updates, or legal compliance mandates. When changes occur, the &ldquo;Last Updated&rdquo; date at the top of this document will be updated. Continued use of {SITE_CONFIG.name} constitutes your acceptance of the revised policy.
                </p>
              </section>

              {/* Section 19 */}
              <section id="contact" className="space-y-4 scroll-mt-24 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-black inline-flex items-center justify-center">19</span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Contact Information</h2>
                </div>
                <p>
                  If you have questions, data deletion requests, or privacy concerns regarding this Privacy Policy, please contact our support desk:
                </p>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Privacy & Support Inquiries</span>
                    <Badge variant="outline" size="sm" className="text-[10px]">
                      {SITE_CONFIG.isSupportEmailConfigured ? 'Operational' : 'Support Desk'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-slate-700">
                    <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Email:{' '}</span>
                    {SITE_CONFIG.isSupportEmailConfigured ? (
                      <a href={`mailto:${SITE_CONFIG.supportEmail}`} className="text-blue-600 underline font-semibold">
                        {SITE_CONFIG.supportEmail}
                      </a>
                    ) : (
                      <span className="font-mono bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                        {SITE_CONFIG.supportEmailPlaceholder}
                      </span>
                    )}
                  </div>
                  {!SITE_CONFIG.isSupportEmailConfigured && (
                    <p className="text-[11px] text-slate-500 pt-1">
                      Note: Set <code>VITE_SUPPORT_EMAIL</code> in deployment environment settings to publish a live support address.
                    </p>
                  )}
                  <p className="text-slate-500 text-[11px] pt-1">
                    Application Domain: <a href={SITE_CONFIG.url} className="text-blue-600 underline">{SITE_CONFIG.domain}</a>
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Official Repository: <a href={SITE_CONFIG.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{SITE_CONFIG.githubUrl}</a>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

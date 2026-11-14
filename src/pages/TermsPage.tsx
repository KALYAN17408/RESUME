import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { FileText, ArrowLeft, Mail } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site';

export const TermsPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-black selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Breadcrumb / Back link */}
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <Badge variant="outline" size="sm" className="bg-white text-slate-700 border-slate-200 text-[10px] font-bold uppercase tracking-wider">
              Terms & Conditions
            </Badge>
          </div>

          {/* Header */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-card space-y-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-md shadow-black/20">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Effective Date: November 1, 2026 • Last Updated: November 12, 2026
            </p>
            <p className="text-sm text-slate-600 leading-relaxed pt-2">
              These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of <strong>RESUME AI</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;), accessible at{' '}
              <a href="https://theresume-ai.netlify.app" className="text-blue-600 underline font-medium">
                https://theresume-ai.netlify.app
              </a>
              . By creating an account, signing in with Google or GitHub, or using our services, you agree to be bound by these Terms.
            </p>
          </div>

          {/* Terms Content */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-card space-y-8 text-left text-sm text-slate-700 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">1. Use of Services & Free Access</h2>
              <p>
                RESUME AI provides software tools to build, format, scan, and download resume documents and cover letters. All core services are provided completely free of charge with no hidden fees, paywalls, or mandatory subscriptions.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">2. User Accounts & Security</h2>
              <p>
                You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. When creating an account or authenticating through third-party OAuth providers (Google, GitHub), you agree to provide accurate, current, and complete information.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">3. User Content & Intellectual Property Ownership</h2>
              <p>
                <strong>You retain 100% ownership</strong> of all resumes, career history, documents, and text you input or export using RESUME AI. We do not claim any ownership rights over your resume content. We do not sell your resume data, and we do not use your private documents to train public machine learning models.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">4. Prohibited Conduct</h2>
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pl-2">
                <li>Use the platform for any unlawful purpose or to distribute fraudulent employment credentials.</li>
                <li>Attempt to bypass, disable, or tamper with security features, access controls, or rate limits.</li>
                <li>Reverse-engineer or disrupt the infrastructure of the application.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">5. Disclaimer of Warranties</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                RESUME AI is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. While our templates and analysis algorithms are engineered around industry ATS standards, we do not guarantee specific interview offers, employment outcomes, or hiring decisions.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">6. Limitation of Liability</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                To the maximum extent permitted by applicable law, RESUME AI and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the platform.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-100 pt-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">7. Contact Information</h2>
              <p className="text-xs text-slate-600">
                For questions regarding these Terms of Service, please contact:
              </p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5 text-xs">
                <p className="font-semibold text-slate-900">RESUME AI Support</p>
                <p className="flex items-center gap-1.5 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Email:{' '}</span>
                  {SITE_CONFIG.isSupportEmailConfigured ? (
                    <a href={`mailto:${SITE_CONFIG.supportEmail}`} className="text-blue-600 underline font-medium">
                      {SITE_CONFIG.supportEmail}
                    </a>
                  ) : (
                    <span className="font-mono text-slate-700 bg-slate-200/70 px-1.5 py-0.5 rounded text-[11px]">
                      {SITE_CONFIG.supportEmailPlaceholder}
                    </span>
                  )}
                </p>
                {!SITE_CONFIG.isSupportEmailConfigured && (
                  <p className="text-[11px] text-slate-500 pt-1">
                    Note: To configure an operational support address, set <code>VITE_SUPPORT_EMAIL</code> in your deployment environment settings.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

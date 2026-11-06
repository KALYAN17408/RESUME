# RESUME AI — Google & GitHub OAuth Integration & Configuration Guide

**Project:** RESUME AI (`D:\RESUMAX_AI`)  
**Supabase Reference:** `mnjekjorvdsvnshumhbr`  
**Supabase URL:** `https://mnjekjorvdsvnshumhbr.supabase.co`  
**Frontend Deployment:** Netlify (SPA)  
**Security Standard:** PKCE Authorization Flow, Row Level Security (RLS) Enforced

---

## 1. Overview & Architecture

RESUME AI supports both standard email/password authentication and single-click OAuth authentication via **Google** and **GitHub**.

### Authentication Flow (PKCE)
```
1. User clicks "Continue with Google" or "Continue with GitHub" on /login or /signup.
2. App invokes Supabase Auth: supabase.auth.signInWithOAuth({ provider, options: { redirectTo } }).
3. User is directed to Google or GitHub consent screen.
4. Provider validates credentials and redirects to the Supabase Auth Callback URL:
   https://mnjekjorvdsvnshumhbr.supabase.co/auth/v1/callback
5. Supabase exchanges the authorization code for an authenticated session and issues JWT tokens.
6. Supabase redirects the browser back to the application callback URL (/auth/callback).
7. AuthCallbackPage finalizes session state, provisions/syncs the public profile, and routes to /dashboard.
```

---

## 2. Supabase Project Configuration

In the Supabase Dashboard (`https://supabase.com/dashboard/project/mnjekjorvdsvnshumhbr`):

### A. URL Configuration (`Authentication -> URL Configuration`)
1. **Site URL:**
   - Local Development: `http://localhost:5173`
   - Production: `https://<your-netlify-site>.netlify.app` (set to your active production domain)
2. **Redirect URLs (Allow List):**
   Add all of the following exact URIs to **Redirect URLs**:
   ```
   http://localhost:5173/auth/callback
   http://localhost:5173/dashboard
   http://localhost:5173/**
   https://<your-netlify-site>.netlify.app/auth/callback
   https://<your-netlify-site>.netlify.app/dashboard
   https://<your-netlify-site>.netlify.app/**
   ```

### B. OAuth Callback URL (Required for Google & GitHub)
The unique callback URL provided by your Supabase project for all OAuth providers is:
```
https://mnjekjorvdsvnshumhbr.supabase.co/auth/v1/callback
```
> [!IMPORTANT]
> Both Google Cloud Console and GitHub Developer Settings require **this exact Supabase URL** as their Authorized Redirect URI / Authorization Callback URL. Do not enter `localhost` or your Netlify domain directly into Google or GitHub's redirect URI field—they must redirect to Supabase, which then redirects to your app.

---

## 3. Google OAuth Application Setup Guide

Follow these steps to create your Google OAuth 2.0 Client credentials:

### Step 1: Open Google Cloud Console
1. Navigate to [Google Cloud Console](https://console.cloud.google.com/).
2. Sign in with your Google account.
3. Select an existing project or click **New Project** (e.g., `resume-ai-production`).

### Step 2: Configure OAuth Consent Screen
1. In the left navigation, go to **APIs & Services** → **OAuth consent screen**.
2. Select **External** user type and click **Create**.
3. **App Information**:
   - **App name**: `RESUME AI`
   - **User support email**: Select your verified email address.
   - **App logo**: (Optional) Upload RESUME AI icon.
4. **App Domain**:
   - **Application home page**: `https://<your-netlify-site>.netlify.app` (or `http://localhost:5173`)
   - **Application privacy policy**: `https://<your-netlify-site>.netlify.app/privacy`
   - **Application terms of service**: `https://<your-netlify-site>.netlify.app/terms`
5. **Developer Contact Information**: Enter your contact email.
6. Click **Save and Continue**.
7. **Scopes**: Click **Add or Remove Scopes** and select:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
8. Click **Save and Continue**.
9. **Test Users** (when Publishing Status is "Testing"):
   - Add your Google account email and any test user emails who should have access during development.
10. Click **Save and Continue** to finish.

### Step 3: Create OAuth Client Credentials
1. In the left navigation, go to **APIs & Services** → **Credentials**.
2. Click **+ Create Credentials** → **OAuth client ID**.
3. **Application type**: Select **Web application**.
4. **Name**: `RESUME AI Web Client`.
5. **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `https://<your-netlify-site>.netlify.app`
6. **Authorized redirect URIs**:
   - `https://mnjekjorvdsvnshumhbr.supabase.co/auth/v1/callback`
7. Click **Create**.
8. A modal appears displaying your **Client ID** and **Client Secret**. Copy both values securely.

### Step 4: Configure Google Provider in Supabase
1. In the Supabase Dashboard, navigate to **Authentication** → **Providers** → **Google**.
2. Toggle **Enable Google provider** to ON.
3. Paste the **Client ID** from Google Cloud Console.
4. Paste the **Client Secret** from Google Cloud Console.
5. Click **Save**.

> [!NOTE]
> While the Google consent screen is in **Testing** mode, only users added under **Test Users** can sign in. When ready for public access, click **Publish App** on the OAuth consent screen tab.

---

## 4. GitHub OAuth Application Setup Guide

Follow these steps to configure GitHub OAuth:

### Step 1: Open GitHub Developer Settings
1. Log in to [GitHub](https://github.com/).
2. Click your profile picture (top right) → **Settings**.
3. In the left sidebar, scroll down and click **Developer settings** (or visit `https://github.com/settings/developers`).
4. Click **OAuth Apps** → **New OAuth App** (or **Register a new application**).

### Step 2: Register the Application
1. **Application name**: `RESUME AI`
2. **Homepage URL**:
   - Production: `https://<your-netlify-site>.netlify.app`
   - Local: `http://localhost:5173`
3. **Application description**: `AI-powered resume optimization and career copilot platform.`
4. **Authorization callback URL**:
   - `https://mnjekjorvdsvnshumhbr.supabase.co/auth/v1/callback`
5. Click **Register application**.

### Step 3: Generate Client Secret
1. On the application details page, copy the **Client ID**.
2. Click **Generate a new client secret**.
3. Copy the generated **Client Secret** immediately (it will only be displayed once).

### Step 4: Configure GitHub Provider in Supabase
1. In the Supabase Dashboard, navigate to **Authentication** → **Providers** → **GitHub**.
2. Toggle **Enable GitHub provider** to ON.
3. Paste the **Client ID** from GitHub.
4. Paste the **Client Secret** from GitHub.
5. Click **Save**.

---

## 5. Security & Privacy Safeguards

1. **Zero Secret Leakage:**
   - Neither the Google Client Secret nor the GitHub Client Secret are ever included in frontend code, Git commits, or client-side bundles.
   - All OAuth secrets reside exclusively in the Supabase managed vault.
2. **Frontend Scope Limitation:**
   - The Vite frontend environment contains only public keys:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_SITE_URL`
   - No `service_role` or admin credentials exist in frontend code.
3. **Row Level Security (RLS) Preservation:**
   - Database tables (`resumes`, `profiles`, `ats_reports`, etc.) enforce strict RLS policies bound to `auth.uid() = user_id`.
   - When a user signs in via Google or GitHub, Supabase assigns them a unique `auth.users.id`.
   - The Postgres trigger `public.handle_new_user()` provisions a row in `public.profiles` using the user's OAuth metadata (`name`, `avatar_url`, `email`).
   - OAuth users can only view and mutate their own resumes and analysis reports.

---

## 6. Environment Configuration

### Local Environment (`.env` or `.env.local`)
```env
VITE_SUPABASE_URL=https://mnjekjorvdsvnshumhbr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uamVram9ydmRzdm5zaHVtaGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2Mjc1MTYsImV4cCI6MjEwOTIwMzUxNn0.qG5NKzEC5PdXL1QvHbM4SLTeZpivkKDCVS24dGHBDhc
VITE_SITE_URL=http://localhost:5173
```

### Production Environment (Netlify Environment Variables)
Configure the following in **Netlify Site Settings → Environment variables**:
```env
VITE_SUPABASE_URL=https://mnjekjorvdsvnshumhbr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uamVram9ydmRzdm5zaHVtaGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2Mjc1MTYsImV4cCI6MjEwOTIwMzUxNn0.qG5NKzEC5PdXL1QvHbM4SLTeZpivkKDCVS24dGHBDhc
VITE_SITE_URL=https://<your-netlify-site>.netlify.app
```

---

## 7. Pre-Deployment Manual Verification Checklist

Once Client IDs and Secrets have been entered into Supabase Dashboard, perform the following end-to-end verifications:

- [ ] **1. Register via Email/Password:** Create account `test@example.com` → Verify signup & profile creation.
- [ ] **2. Sign In via Email/Password:** Sign out and log back in with password credentials → Access `/dashboard`.
- [ ] **3. Register New Account via Google:** Click "Continue with Google" on `/signup` → Approve consent screen → Verify redirect to `/dashboard` and profile row in `public.profiles`.
- [ ] **4. Existing User Login via Google:** Sign out → Click "Continue with Google" on `/login` → Verify direct access to existing dashboard.
- [ ] **5. Register New Account via GitHub:** Click "Continue with GitHub" on `/signup` → Authorize application → Verify redirect to `/dashboard`.
- [ ] **6. Existing User Login via GitHub:** Sign out → Click "Continue with GitHub" on `/login` → Verify direct access.
- [ ] **7. Sign Out:** Click "Sign Out" in Settings (`/dashboard/settings`) → Verify session cleared and redirected to `/login`.
- [ ] **8. Session Persistence:** While authenticated, refresh the browser window (`F5`) → Verify user remains logged in without flickering to login.
- [ ] **9. Protected Route Guard:** Open an incognito window and visit `http://localhost:5173/dashboard` → Verify immediate redirection to `/login`.
- [ ] **10. Successful Redirection:** Verify that `/auth/callback` displays the branded loader and smoothly lands on `/dashboard`.
- [ ] **11. Cancellation Handling:** Click "Continue with Google", then click "Cancel" on the Google consent page → Verify that `/login` displays a friendly error alert banner rather than crashing.
- [ ] **12. Data Isolation & RLS:** Create a resume under an OAuth account → Verify that another user cannot view or edit that resume.

---

## 8. Common OAuth Errors & Troubleshooting

| Error | Root Cause | Solution |
| :--- | :--- | :--- |
| `redirect_uri_mismatch` | Google or GitHub callback URL does not match Supabase's callback URL. | In Google Cloud / GitHub settings, ensure the Authorized Redirect URI is exactly `https://mnjekjorvdsvnshumhbr.supabase.co/auth/v1/callback`. |
| `Unsupported provider: provider is not enabled` | Google or GitHub provider toggle is disabled in Supabase. | Open Supabase Dashboard → **Authentication** → **Providers** → Enable the provider and save credentials. |
| `User cancelled or denied sign-in` (`access_denied`) | The user aborted the authorization dialog. | Expected behavior; the app catches this and displays a polite banner on the login/signup screen. |
| `Email already registered with different provider` | Supabase default security prevents automatic account linking across distinct providers with the same email. | In Supabase Dashboard → **Authentication** → **General**, toggle **"Allow unconfirmed email linking"** if cross-provider linking with same email is desired. |
| Redirect lands on 404 on Netlify | SPA client-side routing missing catch-all redirect. | Verify `netlify.toml` contains `[[redirects]] from = "/*" to = "/index.html" status = 200` (already configured). |

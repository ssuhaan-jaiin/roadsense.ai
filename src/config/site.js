function env(key, fallback = '') {
  return typeof import.meta !== 'undefined' && import.meta.env?.[key] != null && String(import.meta.env[key]).trim() !== ''
    ? String(import.meta.env[key]).trim()
    : fallback
}

/** Public repo URL for hero / about — override with `VITE_GITHUB_REPO_URL` in `.env.local` */
export const GITHUB_REPO_URL =
  env('VITE_GITHUB_REPO_URL') || 'https://github.com/YOURUSERNAME/roadsense-ai'

/** Footer & contact — replace with `VITE_*` in `.env.local` */

/** Personal or portfolio website */
export const CONTACT_WEBSITE_URL = env('VITE_CONTACT_WEBSITE_URL') || 'https://YOURDOMAIN.example'

/** LinkedIn profile */
export const LINKEDIN_URL = env('VITE_LINKEDIN_URL') || 'https://www.linkedin.com/in/YOURPROFILE'

/** GitHub profile or organisation (shown in footer; repo uses `GITHUB_REPO_URL`) */
export const GITHUB_CONTACT_URL = env('VITE_GITHUB_CONTACT_URL') || 'https://github.com/YOURUSERNAME'

// src/lib/siteUrl.ts
// Resolves the site's canonical base URL in the right priority order:
//
//   1. VITE_SITE_URL env var  — set this when you eventually get a custom domain
//   2. window.location.origin — works perfectly on Vercel preview deployments
//                               (https://wing-and-weft.vercel.app) and any future domain
//                               automatically, with zero config
//
// You do NOT need a .env file right now. When you buy a domain and point it
// to Vercel, add VITE_SITE_URL=https://www.yourdomain.com in Vercel's dashboard
// under Project → Settings → Environment Variables, and this will pick it up.
//
// Usage:  import { SITE_URL } from '../lib/siteUrl';
//         canonical={`${SITE_URL}/categories`}

const envUrl: string | undefined =
  typeof import.meta !== 'undefined'
    ? (import.meta as any).env?.VITE_SITE_URL
    : undefined;

// During SSR or test environments window may not exist — fall back to the
// Vercel deployment URL in that case.
const originUrl: string =
  typeof window !== 'undefined'
    ? window.location.origin
    : 'https://wing-and-weft.vercel.app';

export const SITE_URL: string = envUrl || originUrl;
# Wing & Weft — Complete Setup & Documentation Guide

*Last updated: May 2026*

---

## 📋 Table of Contents

**For Developers**
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Quick Start (Local)](#3-quick-start-local)
4. [Environment Variables](#4-environment-variables)
5. [Deploy to Vercel](#5-deploy-to-vercel)
6. [File Structure](#6-file-structure)
7. [Architecture Notes](#7-architecture-notes)
8. [Customization Reference](#8-customization-reference)
9. [Image & Logo Specifications](#9-image--logo-specifications)
10. [Analytics & Monitoring](#10-analytics--monitoring)
11. [PWA Configuration](#11-pwa-configuration)
12. [SEO Checklist](#12-seo-checklist)
13. [Security Features](#13-security-features)
14. [Known Issues & Fixes Applied](#14-known-issues--fixes-applied)
15. [Future Improvements](#15-future-improvements)

**For the Client**
16. [How to Use the Admin Dashboard](#16-how-to-use-the-admin-dashboard)

---

---

# FOR DEVELOPERS

---

## 1. Project Overview

**Wing & Weft** is a full-stack e-commerce storefront for an Indian saree brand. It is built on React + TypeScript with a Supabase backend and deployed on Vercel. The client manages all content — products, banners, stock, and settings — through a password-protected admin dashboard with no coding required.

### What's live

- Animated loading screen with brand logo
- Responsive navbar with debounced search, category dropdown, dark/light theme toggle
- Full-screen banner carousel with Ken Burns effect and scrollable ribbon
- Auto-scrolling category cards
- Tabbed collections (New Arrivals / Best Sellers / Featured)
- Product listing pages with filters, sort, and search
- Product detail pages with image gallery, lightbox zoom, accordion specs, and WhatsApp inquiry
- FAQ page with accordion and category filters
- Our Story page and Contact page (WhatsApp-routed)
- Policy modals (6 policies)
- Footer with newsletter, quick links, and policy links
- Floating WhatsApp button and scroll-to-top button
- 404 fallback page
- Full dark/light mode across the entire site
- Admin dashboard at `/admin` (login-gated, Supabase Auth)
- Open Graph and WhatsApp link preview support
- Schema.org structured data markup
- GA4 analytics, Vercel Analytics, and Vercel Speed Insights
- PWA-ready (installable, with `site.webmanifest`)
- In-browser WebP conversion on image upload

---

## 2. Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI library |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Framer Motion | Page and component animations |
| React Router v6 | Client-side routing |
| Supabase | Database, Auth, and Storage |
| Lucide React | Icons |
| Google Fonts | DM Sans, Cormorant Garamond, Playfair Display |
| Vercel | Deployment, Analytics, Speed Insights |
| GA4 | Traffic analytics |

---

## 3. Quick Start (Local)

### Prerequisites

- Node.js v18+ — https://nodejs.org
- npm or yarn
- A Supabase project (see `.env` setup below)

### Steps

```bash
# 1. Navigate to project folder
cd wing-and-weft

# 2. Install dependencies
npm install

# 3. Add environment variables (see Section 4)
cp .env.example .env
# → Fill in your Supabase keys

# 4. Start development server
npm run dev

# 5. Open in browser
# → http://localhost:5173
```

### Build for production

```bash
npm run build
# Output is in /dist — ready to deploy
```

---

## 4. Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get these values from: **Supabase → Project Settings → API**.

> ⚠️ Never commit `.env` to GitHub. It is already listed in `.gitignore`.

These same variables must also be added to Vercel under **Settings → Environment Variables** for the deployed site to work.

---

## 5. Deploy to Vercel

### Recommended: GitHub integration

1. Push the project to a GitHub repository
2. Go to https://vercel.com → **Import Project** → select your repo
3. Settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add the two environment variables from Section 4
5. Click **Deploy**

### Custom domain (GoDaddy)

The domain `wingandweft.com` is connected via GoDaddy DNS. To replicate or update:

1. In Vercel → Project Settings → Domains → add your domain
2. In GoDaddy DNS settings:
   - Add a `CNAME` record: `www` → `cname.vercel-dns.com`
   - Add an `A` record: `@` → `76.76.21.21`
   - Remove any conflicting `A` or `CNAME` records on the same names
3. DNS propagation takes up to 48 hours

> ℹ️ GoDaddy sometimes pre-populates conflicting DNS entries. Delete any existing `A` records for `@` before adding Vercel's.

---

## 6. File Structure

```
wing-and-weft/
├── public/
│   ├── index.html            ← SEO meta, OG tags, schema markup, GA4 script
│   ├── site.webmanifest      ← PWA manifest (display: browser — prevents install prompt)
│   ├── favicon.ico
│   └── og-image.jpg          ← OG/WhatsApp link preview image (1200×630)
│
├── src/
│   ├── components/
│   │   ├── Navbar/           ← Navigation, search, dropdown, theme toggle
│   │   ├── Banner/           ← Hero carousel + scrolling ribbon
│   │   ├── Category/         ← Auto-scroll category cards
│   │   ├── Collections/      ← Tabbed product collections
│   │   ├── Instagram/        ← Instagram feed section (toggleable)
│   │   ├── WatchShop/        ← Video reel section (toggleable)
│   │   ├── WhatsApp/         ← CTA section + floating buttons
│   │   ├── Footer/           ← Full footer
│   │   ├── Products/         ← ProductCard (shared), MultiImageUploader
│   │   ├── Policy/           ← Policy modal + data
│   │   └── UI/               ← LoadingScreen, skeletons, CategorySection
│   │
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── CategoryPage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   ├── FAQPage.tsx
│   │   ├── OurStoryPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   └── admin/
│   │       ├── AdminLoginPage.tsx
│   │       ├── AdminDashboard.tsx
│   │       ├── ProductsAdmin.tsx
│   │       ├── BannersAdmin.tsx
│   │       ├── InquiriesAdmin.tsx
│   │       └── SettingsAdmin.tsx
│   │
│   ├── context/
│   │   ├── ThemeContext.tsx   ← Dark/light mode
│   │   └── SettingsContext.tsx ← Dynamic site settings from Supabase
│   │
│   ├── hooks/
│   │   ├── index.ts           ← useDebounce, useScrollToTop, useInView
│   │   ├── useProduct.ts      ← Single product fetch by ID
│   │   └── useImageConverter.ts ← In-browser WebP conversion on upload
│   │
│   ├── lib/
│   │   └── supabase.ts        ← Supabase client initialisation
│   │
│   ├── types/
│   │   └── index.ts           ← TypeScript interfaces (Product, Banner, Inquiry, Settings)
│   │
│   ├── App.tsx                ← Root, routing, loading screen, analytics init
│   └── index.css              ← Global styles, animations, skeleton keyframes
│
├── tailwind.config.js         ← Brand colours, fonts, custom animations
├── vercel.json                ← Security headers, SPA routing fallback
├── vite.config.ts
├── package.json
└── tsconfig.json
```

---

## 7. Architecture Notes

### Supabase tables

| Table | Purpose |
|---|---|
| `products` | All product data including specs, tags, stock, visibility |
| `banners` | Hero carousel slides (image, headline, subtitle, CTA, visibility) |
| `inquiries` | Customer WhatsApp/contact form submissions |
| `settings` | Dynamic site-wide config (WhatsApp number, Instagram URL, ribbon text, etc.) |

Row Level Security (RLS) is enabled on all tables. Public `SELECT` is allowed on `products` and `banners`. All write operations require an authenticated admin session.

### Storage buckets

| Bucket | Contents |
|---|---|
| `product-images` | Product photos (public) |
| `banner-images` | Hero banner images (public) |

### SettingsContext

`SettingsContext` fetches the `settings` table on app load and exposes values site-wide via `useSettings()`. This means WhatsApp number, Instagram URL, ribbon text, and social links are all editable by the client from the admin dashboard — no code changes or redeployments needed.

### Image conversion

`useImageConverter.ts` converts any uploaded image to WebP in the browser before it is sent to Supabase Storage. This runs automatically inside `MultiImageUploader` and keeps storage usage low without requiring any server-side processing.

`MultiImageUploader` also enforces a **3:4 aspect ratio** on all uploaded product images and rejects non-conforming files with a clear error message.

---

## 8. Customization Reference

### Brand colours

File: `tailwind.config.js`

```javascript
brand: {
  cream: '#e9e3cb',
  red: '#bc3d3e',
  orange: '#e69358',
  gold: '#b6893c',
  saffron: '#f59e0b',  // hover accent on CategorySection
}
```

### Toggling optional sections

File: `src/pages/HomePage.tsx`

```typescript
const SHOW_INSTAGRAM = false;   // Set true when Instagram content is ready
const SHOW_WATCH_SHOP = false;  // Set true when reels are ready
```

### WhatsApp number (fallback / hardcoded)

The WhatsApp number is managed dynamically via `SettingsContext` and editable from the admin dashboard. A hardcoded fallback exists in `src/lib/constants.ts` in case the settings fetch fails:

```typescript
export const FALLBACK_WHATSAPP = '919XXXXXXXXXX';
```

### Adding a new product category

1. Add the category to the `categories` array in `src/data/categories.ts`
2. Add a corresponding cover image to Supabase Storage or `/public/images/`
3. The admin dashboard will pick up the new category automatically in the product form dropdown

---

## 9. Image & Logo Specifications

> Share this section with the client or photographer before any shoot.

### Hero / Banner images

| Property | Value |
|---|---|
| Dimensions | 1440 × 700 px |
| Aspect ratio | ~16:5 |
| Format | WebP preferred, JPG accepted |
| Max file size | 300 KB |
| Count | 3 slides recommended |
| Notes | Keep subject slightly left-centre; right side can fade to allow text overlay |

### Category cover images

| Property | Value |
|---|---|
| Dimensions | 400 × 600 px |
| Aspect ratio | 2:3 (portrait) |
| Format | WebP or JPG |
| Max file size | 150 KB |
| Count | 1 per category |

### Product images

| Property | Value |
|---|---|
| Dimensions | 600 × 800 px |
| Aspect ratio | 3:4 (portrait) — enforced at upload |
| Format | Any (converted to WebP automatically on upload) |
| Max file size | 200 KB after conversion |
| Count | 4 per product (required) |
| Notes | Consistent white or off-white background recommended |

### OG / Link preview image

| Property | Value |
|---|---|
| Dimensions | 1200 × 630 px |
| Format | JPG |
| File | `public/og-image.jpg` |
| Notes | Used when the site link is shared on WhatsApp, Instagram, and social media |

### Navbar logo

| Property | Value |
|---|---|
| Recommended dimensions | 400 × 400 px (displayed at 48×48 px) |
| Format | SVG (ideal) or PNG with transparent background |
| Shape | Square — displayed as circle in navbar |
| File name | `public/logo.png` or `public/logo.svg` |

---

## 10. Analytics & Monitoring

### GA4

GA4 is configured with measurement ID `G-PLLM2PLZQD`. The tracking script is embedded directly in `public/index.html`. No npm package is used.

To verify it's firing: open the site → open browser DevTools → Network tab → filter for `collect` → you should see requests to `google-analytics.com`.

### Vercel Analytics

Enabled via the `@vercel/analytics` package, initialised in `App.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react';
// Rendered inside <App> return
<Analytics />
```

### Vercel Speed Insights

Enabled via `@vercel/speed-insights`, also in `App.tsx`:

```typescript
import { SpeedInsights } from '@vercel/speed-insights/react';
<SpeedInsights />
```

Both are visible in the Vercel dashboard under the **Analytics** and **Speed** tabs for the project.

---

## 11. PWA Configuration

The site includes a `public/site.webmanifest` file for PWA metadata (name, icons, theme colour). The `display` field is intentionally set to `"browser"` rather than `"standalone"`:

```json
{
  "display": "browser"
}
```

> ⚠️ Do not change `display` to `"standalone"`. This triggers the browser's PWA install prompt, which interrupts the shopping experience and was reverted after testing.

---

## 12. SEO Checklist

### Implemented

- Meta title, description, and keywords in `public/index.html`
- Open Graph tags for WhatsApp and social link previews
- `og-image.jpg` (1200×630) for rich link previews
- Schema.org JSON-LD structured data for the brand/organisation
- Semantic HTML throughout (`nav`, `main`, `section`, `article`, `footer`)
- ARIA labels on all interactive elements
- Alt text on all images
- Lazy loading on images below the fold
- Mobile-responsive design
- `robots.txt` allowing all crawlers and pointing to sitemap

### To complete before next relaunch

- Submit sitemap to Google Search Console
- Add product-level JSON-LD (`@type: Product`) on `ProductDetailPage`
- Register in Google Search Console and verify domain ownership

---

## 13. Security Features

- Security headers in `vercel.json` (XSS protection, X-Frame-Options, CSP, HSTS)
- `rel="noopener noreferrer"` on all external links
- Supabase RLS policies — public users can only read; writes require authenticated session
- No sensitive data exposed in frontend bundles
- `.env` excluded from version control via `.gitignore`
- Admin route protected by Supabase Auth — unauthenticated users are redirected to `/admin/login`

---

## 14. Known Issues & Fixes Applied

| Issue | Root Cause | Fix Applied |
|---|---|---|
| Infinite loading skeleton on ProductDetailPage | `useProduct` hook received an empty `id` string on first render | Added guard: only fetch when `id` is truthy |
| Image lightbox not working on product detail | React remounting + CSS animation conflict reset zoom state | Moved zoom logic outside animation scope; fixed z-index layering |
| Mobile navbar category accordion broken | Desktop and mobile category open states shared the same variable | Split into separate `desktopOpen` and `mobileOpen` state |
| PWA install prompt appearing unexpectedly | `site.webmanifest` had `"display": "standalone"` | Changed to `"display": "browser"` |
| Star ratings not showing in admin dashboard | `review_count > 0` render guard blocked display; normalizer defaulted ratings to `true` via `?? true` | Fixed normalizer default; removed `review_count` guard on admin star display |
| Admin product form fabric field locked to dropdown | Fabric field was a fixed select | Replaced with free-text input to support custom fabric descriptions |

---

## 15. Future Improvements

### Phase 2 features

- Wishlist — save favourites via Supabase (replaces localStorage approach)
- Recently Viewed — last 4 products, stored in sessionStorage
- Related Products — same-category products at the bottom of detail page
- WhatsApp Catalog API integration for a richer shopping experience
- Customer testimonials section (static until review system is built)
- Google Maps embed on Contact page if a physical store opens

### Mobile enhancements

- Touch swipe support for the banner carousel (`react-swipeable`)
- Bottom navigation bar on mobile for faster tab switching

### Performance

- Implement `React.lazy` + `Suspense` on all page-level routes if bundle size grows
- Consider moving product images to a CDN if Supabase Storage free tier limits are approached

---

---

# FOR THE CLIENT

---

## 16. How to Use the Admin Dashboard

### Accessing the dashboard

Open your browser and go to:

```
https://wingandweft.com/admin
```

Sign in with the email and password that were set up for you. Bookmark this page on your phone for quick access. The dashboard works fully on mobile — useful for updating stock after exhibitions or pop-up events.

---

### Adding a New Product

1. Click **Products** in the left sidebar
2. Click **Add Product** (top right)
3. Fill in the product details:
   - **Name** — the full product name as it should appear on the website
   - **Category** — select from the dropdown (e.g. Silk Sarees, Cotton Sarees)
   - **Fabric** — type the fabric description freely (e.g. "Pure Mulberry Silk with Zari Border")
   - **Price** — original price in ₹
   - **Discount Price** — leave blank if there is no discount
   - **Stock** — number of pieces available
   - **Description** — full product description shown on the product page
   - **Specifications** — saree length, blouse length, blouse fabric, care instructions
   - **Washing Instructions** — displayed separately on the product page
   - **Tags** — tick New Arrival, Best Seller, and/or Featured as appropriate
   - **Visibility** — toggle off to hide a product from the website without deleting it
4. Upload 4 product photos using the image uploader (drag and drop, or click to browse). Photos must be portrait orientation (taller than they are wide). They are converted to the best format automatically.
5. Click **Add Product**. The product appears on the website immediately.

---

### Updating Stock

**Quick method (recommended for day-to-day use):**
1. Go to **Products**
2. Find the product
3. Click directly on the stock badge (e.g. "10 in stock")
4. Type the new number and press Enter
5. Done — shows "Out of Stock" automatically when the count reaches 0

**Full edit method:**
1. Click the pencil (edit) icon on the product row
2. Change the Stock field
3. Click **Save**

---

### Hiding or Showing a Product

Every product has a **visibility toggle** (eye icon) in the product list. Toggling it off hides the product from customers without deleting it. Toggle it back on to make it visible again. This is useful for products that are temporarily unavailable or being prepared.

---

### Managing Banners (Hero Slideshow)

1. Click **Banners** in the sidebar
2. Each slide (Slide 1, 2, 3) can be edited independently:
   - Drag a new image into the image area to replace it
   - Update the headline, subtitle, and button text
   - Change where the button links to (e.g. `/category/silk-sarees`)
3. Click **Save** on each slide after editing
4. Use the eye icon to show or hide individual slides — useful for seasonal promotions

---

### Reading Customer Inquiries

1. Click **Inquiries** in the sidebar
2. New messages appear with a red indicator
3. Click **Reply on WhatsApp** — this opens WhatsApp with the customer's number already filled in
4. Mark messages as **Seen** or **Replied** to track follow-ups

---

### Updating Site Settings

1. Click **Settings** in the sidebar
2. You can update:
   - **WhatsApp number** — the number customers reach when they click any WhatsApp button
   - **Instagram URL** — your Instagram profile link
   - **Ribbon text** — the scrolling text across the top of the homepage
   - Other social and contact links
3. Click **Save changes** — updates go live on the website immediately, no refresh needed

---

### Dashboard at a Glance

| Section | What you can do |
|---|---|
| **Products** | Add, edit, delete, hide/show products. Update stock with one click. |
| **Stock alerts** | The dashboard highlights products with 3 or fewer pieces remaining |
| **Banners** | Replace images, edit headlines and button text, show/hide slides |
| **Inquiries** | Read customer messages, reply via WhatsApp, track status |
| **Settings** | Update WhatsApp number, Instagram link, ribbon text, and other site-wide details |

---

*Wing & Weft — Documentation v2.0 — May 2026*
*For technical support, contact the developer.*
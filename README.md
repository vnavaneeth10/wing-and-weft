# Wing & Weft — Complete Setup & Documentation Guide

*Last updated: October 2026*

---

## 📋 Table of Contents

**For Developers**
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Quick Start (Local)](#3-quick-start-local)
4. [Environment Variables](#4-environment-variables)
5. [Backend Setup (AWS S3 Integration)](#5-backend-setup-aws-s3-integration)
6. [Deploy to Vercel](#6-deploy-to-vercel)
7. [File Structure](#7-file-structure)
8. [Architecture Notes](#8-architecture-notes)
9. [Caching Strategy](#9-caching-strategy)
10. [Customization Reference](#10-customization-reference)
11. [Image & Logo Specifications](#11-image--logo-specifications)
12. [Analytics & Monitoring](#12-analytics--monitoring)
13. [PWA Configuration](#13-pwa-configuration)
14. [SEO Checklist](#14-seo-checklist)
15. [Security Features](#15-security-features)
16. [Known Issues & Fixes Applied](#16-known-issues--fixes-applied)
17. [Future Improvements](#17-future-improvements)

**For the Client**
18. [How to Use the Admin Dashboard](#18-how-to-use-the-admin-dashboard)

---

# FOR DEVELOPERS

---

## 1. Project Overview

**Wing & Weft** is a full-stack, high-performance e-commerce storefront for an Indian saree brand. Built with React + TypeScript and powered by Supabase, it delivers a seamless shopping experience with a professional admin dashboard for content management.

### Core Business Features

- **Product Catalog** — Browse sarees by category with advanced filtering and search
- **Direct Sales Channel** — WhatsApp integration for inquiries and orders
- **Dynamic Content Management** — Admin-controlled banners, products, and site settings
- **Customer Engagement** — Inquiry tracking, newsletter subscriptions, and live messaging
- **Brand Control** — Complete customization of site settings, banners, and promotions without code changes

### What's Live

- Animated loading screen with brand logo
- Responsive navbar with debounced search, category dropdown, dark/light theme toggle
- Full-screen banner carousel with Ken Burns effect and scrollable ribbon
- Auto-scrolling category cards with image management
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
- **AWS S3 Integration** — Optimized cloud storage with signed URLs for secure, scalable image uploads
- **Performance Caching** — Client-side caching for categories, banners, policies, and settings

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
| AWS S3 | Primary image storage (with signed URLs) |
| Lucide React | Icons |
| Google Fonts | DM Sans, Cormorant Garamond, Playfair Display |
| Vercel | Deployment, Analytics, Speed Insights |
| GA4 | Traffic analytics |
| Vite | Build tool |

---

## 3. Quick Start (Local)

### Prerequisites

- Node.js v18+ — https://nodejs.org
- npm or yarn
- A Supabase project (see `.env` setup below)
- AWS S3 credentials (see Section 5)

### Steps

```bash
# 1. Navigate to project folder
cd wing-and-weft

# 2. Install dependencies
npm install

# 3. Add environment variables (see Section 4)
cp .env.example .env
# → Fill in your Supabase and AWS S3 keys

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

### Run tests

```bash
npm test              # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:ui       # Run tests with UI dashboard
npm run coverage      # Generate coverage report
```

---

## 4. Environment Variables

Create a `.env` file in the project root:

```
# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AWS S3 Configuration
VITE_AWS_REGION=ap-south-1
VITE_AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
VITE_AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
VITE_AWS_S3_BUCKET=your-bucket-name
```

### Getting Supabase Keys

1. Go to **Supabase Dashboard** → Your Project → **Settings → API**
2. Copy `Project URL` and `Anon Public Key`

### Getting AWS S3 Credentials

1. Create an IAM user in AWS with S3 permissions
2. Generate Access Key ID and Secret Access Key
3. Create or use an S3 bucket (e.g., `wing-and-weft-images`)
4. Ensure the bucket has proper CORS configuration (see Section 5)

> ⚠️ Never commit `.env` to GitHub. It is already listed in `.gitignore`.

These same variables must also be added to Vercel under **Settings → Environment Variables** for the deployed site to work.

---

## 5. Backend Setup (AWS S3 Integration)

Wing & Weft uses AWS S3 for reliable, scalable image storage with signed URLs for secure uploads.

### S3 Bucket Configuration

#### 1. Create Bucket with CORS

```bash
# CORS configuration for wing-and-weft bucket
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://wingandweft.com",
      "https://www.wingandweft.com"
    ],
    "ExposeHeaders": ["ETag", "x-amz-version-id"],
    "MaxAgeSeconds": 3000
  }
]
```

#### 2. Bucket Folder Structure

Organize S3 bucket into logical folders:

```
wing-and-weft-images/
├── product-images/        ← 3:4 aspect ratio images
├── banner-images/         ← 16:5 aspect ratio hero images
├── category-images/       ← 2:3 aspect ratio category covers
└── temp-uploads/          ← Temporary files (cleanup monthly)
```

#### 3. Signed URL Generation

The `/api/get-upload-url.ts` endpoint generates temporary signed URLs for secure client-side uploads:

```typescript
// GET /api/get-upload-url?folder=product-images&filename=saree-001.webp
// Response: { url: "https://s3.amazonaws.com/...", error?: string }
```

**Usage in Components:**

```typescript
import { useImageConverter } from '@/hooks/useImageConverter';

const uploadImage = async (file: File, folder: 'product-images' | 'banner-images') => {
  const webpFile = await useImageConverter(file);
  
  // Get signed URL from backend
  const urlRes = await fetch(`/api/get-upload-url?folder=${folder}&filename=${webpFile.name}`);
  const { url } = await urlRes.json();
  
  // Upload to S3 directly
  await fetch(url, { method: 'PUT', body: webpFile });
};
```

#### 4. Cleanup Scripts

Two cleanup scripts help maintain S3 storage efficiency:

**`cleanup.sh`** — Removes orphaned product, banner, and category images:
```bash
chmod +x cleanup.sh
./cleanup.sh
```

**`cleanup_banners_categories.sh`** — Targeted cleanup for specific image types:
```bash
chmod +x cleanup_banners_categories.sh
./cleanup_banners_categories.sh
```

> 💡 Schedule cleanup scripts monthly to reclaim storage and reduce costs.

---

## 6. Deploy to Vercel

### Recommended: GitHub Integration

1. Push the project to a GitHub repository
2. Go to https://vercel.com → **Import Project** → select your repo
3. Settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables from Section 4
5. Click **Deploy**

### Custom Domain (GoDaddy)

The domain `wingandweft.com` is connected via GoDaddy DNS. To replicate or update:

1. In Vercel → Project Settings → Domains → add your domain
2. In GoDaddy DNS settings:
   - Add a `CNAME` record: `www` → `cname.vercel-dns.com`
   - Add an `A` record: `@` → `76.76.21.21`
   - Remove any conflicting `A` or `CNAME` records on the same names
3. DNS propagation takes up to 48 hours

> ℹ️ GoDaddy sometimes pre-populates conflicting DNS entries. Delete any existing `A` records for `@` before adding Vercel's.

---

## 7. File Structure

```
wing-and-weft/
├── api/
│   ├── get-upload-url.ts     ← Generates signed S3 URLs
│   └── package.json          ← API module definition
│
├── public/
│   ├── index.html            ← SEO meta, OG tags, schema markup, GA4 script
│   ├── site.webmanifest      ← PWA manifest (display: browser)
│   ├── favicon.ico
│   ├── logo.png              ← Brand logo (displayed at 48×48)
│   └── og-image.jpg          ← OG/WhatsApp link preview (1200×630)
│
├── src/
│   ├── components/
│   │   ├── Navbar/           ← Navigation, search, dropdown, theme toggle
│   │   ├── Banner/           ← Hero carousel + scrolling ribbon
│   │   ├── Category/         ← Auto-scroll category cards with caching
│   │   ├── Collections/      ← Tabbed product collections with caching
│   │   ├── Instagram/        ← Instagram feed section (toggleable)
│   │   ├── WatchShop/        ← Video reel section (toggleable)
│   │   ├── WhatsApp/         ← CTA section + floating buttons
│   │   ├── Footer/           ← Full footer with settings context
│   │   ├── Products/         ← ProductCard (shared), MultiImageUploader
│   │   ├── Policy/           ← Policy modal + cached data
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
│   │   ├── ThemeContext.tsx        ← Dark/light mode
│   │   └── SettingsContext.tsx     ← Dynamic site settings (cached)
│   │
│   ├── hooks/
│   │   ├── index.ts                ← useDebounce, useScrollToTop, useInView
│   │   ├── useProduct.ts           ← Single product fetch with caching
│   │   └── useImageConverter.ts    ← In-browser WebP conversion
│   │
│   ├── lib/
│   │   ├── supabase.ts             ← Supabase client initialization
│   │   ├── cacheManager.ts         ← Cache utilities for categories, banners, etc.
│   │   └── constants.ts            ← App-wide constants
│   │
│   ├── types/
│   │   └── index.ts                ← TypeScript interfaces
│   │
│   ├── data/
│   │   ├── policies.ts             ← Policy content (cached)
│   │   └── categories.ts           ← Category definitions
│   │
│   ├── App.tsx                     ← Root, routing, analytics init
│   └── index.css                   ← Global styles, animations
│
├── tailwind.config.js              ← Brand colours, fonts, animations
├── vercel.json                     ← Security headers, SPA routing
├── vite.config.ts
├── package.json
├── tsconfig.json
├── cleanup.sh                      ← S3 cleanup script
├── cleanup_banners_categories.sh   ← Targeted S3 cleanup
└── README.md
```

---

## 8. Architecture Notes

### Supabase Tables

| Table | Purpose | RLS |
|---|---|---|
| `products` | All product data including specs, tags, stock, visibility | Public SELECT, Authenticated writes |
| `banners` | Hero carousel slides (image, headline, subtitle, CTA, visibility) | Public SELECT, Authenticated writes |
| `inquiries` | Customer WhatsApp/contact form submissions | Public INSERT, Authenticated reads |
| `settings` | Dynamic site-wide config (WhatsApp, Instagram, ribbon text, etc.) | Public SELECT, Authenticated writes |
| `categories` | Product categories with metadata and image URLs | Public SELECT, Authenticated writes |

Row Level Security (RLS) is enabled on all tables. Public `SELECT` is allowed on read-heavy tables. All write operations require an authenticated admin session.

### Storage Buckets (Supabase + AWS S3)

| Location | Contents | Notes |
|---|---|---|
| **Supabase** `product-images` | Legacy product photos (deprecated) | Migrate to S3 for better performance |
| **Supabase** `banner-images` | Legacy hero banner images (deprecated) | Migrate to S3 for better performance |
| **AWS S3** `wing-and-weft-images/product-images` | Product photos (primary) | Organized by folder, signed URLs for uploads |
| **AWS S3** `wing-and-weft-images/banner-images` | Hero banner images (primary) | 16:5 aspect ratio, CDN-optimized |
| **AWS S3** `wing-and-weft-images/category-images` | Category covers (primary) | 2:3 aspect ratio, cached client-side |

### SettingsContext

`SettingsContext` fetches the `settings` table on app load with **automatic caching** and exposes values site-wide via `useSettings()`. This means WhatsApp number, Instagram URL, ribbon text, and social links are all editable from the admin dashboard without code changes. Cache is validated on every 5-minute interval or manual refresh.

### Image Conversion & Upload

`useImageConverter.ts` converts uploaded images to WebP in the browser before sending to AWS S3. This automatically:
- Compresses images by 30-50%
- Reduces storage costs
- Improves page load times

`MultiImageUploader` also enforces a **3:4 aspect ratio** on product images and rejects non-conforming files.

---

## 9. Caching Strategy

Performance optimizations through intelligent caching across the application.

### Client-Side Caching

**Cached Data:**
- Categories list
- Banners (hero slides)
- Policies content
- Settings (WhatsApp, Instagram, etc.)

**Cache Duration:**
- Settings: 5 minutes
- Categories & Banners: 10 minutes
- Policies: 24 hours

**Implementation:**

```typescript
// src/lib/cacheManager.ts
import { cacheManager } from '@/lib/cacheManager';

// Fetch with automatic caching
const categories = await cacheManager.getCategories();

// Force refresh
const freshCategories = await cacheManager.getCategories(true);

// Clear specific cache
cacheManager.clearCache('categories');

// Clear all caches
cacheManager.clearAllCaches();
```

**Usage in Components:**

```typescript
// SettingsContext automatically caches settings
const { settings, refreshSettings } = useSettings();

// Force refresh when admin updates settings
const handleSave = async () => {
  await saveSettings(data);
  refreshSettings(); // Invalidates cache
};
```

### Benefits

✅ **Reduced API calls** — Fewer database queries  
✅ **Faster page loads** — Instant data availability  
✅ **Better UX** — Reduced loading states  
✅ **Lower costs** — Fewer Supabase database operations  

### Cache Invalidation

Caches automatically invalidate when:
1. Time-to-live (TTL) expires
2. Admin updates data (manual `clearCache()` call)
3. User explicitly refreshes (button click)
4. App is reloaded

---

## 10. Customization Reference

### Brand Colours

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

### Toggling Optional Sections

File: `src/pages/HomePage.tsx`

```typescript
const SHOW_INSTAGRAM = false;   // Set true when Instagram content is ready
const SHOW_WATCH_SHOP = false;  // Set true when reels are ready
```

### WhatsApp Number (Dynamic Management)

The WhatsApp number is managed via `SettingsContext` and is **fully editable from the admin dashboard**. A hardcoded fallback exists in case the settings fetch fails:

```typescript
// src/lib/constants.ts
export const FALLBACK_WHATSAPP = '919XXXXXXXXXX';
```

**To update:**
1. Go to Admin Dashboard → Settings
2. Change WhatsApp number
3. Click Save — updates are live immediately across all pages

### Adding a New Product Category

1. Go to Admin Dashboard → Categories (in Settings tab)
2. Click "Add Category"
3. Enter category name and upload a 2:3 portrait cover image
4. Click Save
5. The category appears in navbar dropdown and product filters immediately

---

## 11. Image & Logo Specifications

> Share this section with the client or photographer before any shoot.

### Hero / Banner Images

| Property | Value |
|---|---|
| Dimensions | 1440 × 700 px (minimum: 1200 × 600) |
| Aspect ratio | ~16:5 |
| Format | WebP preferred, JPG accepted |
| Max file size | 300 KB |
| Count | 3 slides recommended |
| Notes | Keep subject slightly left-centre; right side can fade to allow text overlay |

### Category Cover Images

| Property | Value |
|---|---|
| Dimensions | 400 × 600 px (minimum: 300 × 450) |
| Aspect ratio | 2:3 (portrait) — strictly enforced |
| Format | WebP or JPG |
| Max file size | 150 KB |
| Count | 1 per category |
| Notes | Consistent white or neutral background recommended |

### Product Images

| Property | Value |
|---|---|
| Dimensions | 600 × 800 px (minimum: 480 × 640) |
| Aspect ratio | 3:4 (portrait) — enforced at upload |
| Format | Any (automatically converted to WebP on upload) |
| Max file size | 200 KB after conversion |
| Count | 4 per product (required) |
| Notes | Consistent white or off-white background recommended for e-commerce best practices |

### OG / Link Preview Image

| Property | Value |
|---|---|
| Dimensions | 1200 × 630 px |
| Format | JPG |
| File | `public/og-image.jpg` |
| Notes | Used when the site link is shared on WhatsApp, Instagram, and social media |

### Navbar Logo

| Property | Value |
|---|---|
| Recommended dimensions | 400 × 400 px (displayed at 48×48 px) |
| Format | SVG (ideal) or PNG with transparent background |
| Shape | Square — displayed as circle in navbar |
| File name | `public/logo.png` or `public/logo.svg` |

---

## 12. Analytics & Monitoring

### GA4 (Google Analytics 4)

GA4 is configured with measurement ID `G-PLLM2PLZQD`. The tracking script is embedded directly in `public/index.html`.

**To verify it's tracking:**
1. Open the site
2. Open DevTools → Network tab
3. Filter for `collect`
4. You should see requests to `google-analytics.com`

**Useful reports:**
- Audience → Realtime (see live visitors)
- Acquisition → Traffic sources (where visitors come from)
- Engagement → Pages and screens (most viewed products/pages)
- Conversion (if goals are set up)

### Vercel Analytics

Enabled via `@vercel/analytics` package, initialized in `App.tsx`. View in Vercel Dashboard → **Analytics** tab:

- Web Vitals (Core Web Vitals performance)
- Traffic trends
- Geographic distribution

### Vercel Speed Insights

Enabled via `@vercel/speed-insights` in `App.tsx`. View in Vercel Dashboard → **Speed** tab:

- Page load times by route
- Performance metrics over time
- Detailed performance analysis

---

## 13. PWA Configuration

The site includes a `public/site.webmanifest` file for PWA metadata (name, icons, theme colour). The `display` field is intentionally set to `"browser"` rather than `"standalone"`:

```json
{
  "display": "browser",
  "name": "Wing & Weft - Premium Indian Sarees",
  "short_name": "Wing & Weft",
  "theme_color": "#e9e3cb",
  "background_color": "#ffffff"
}
```

> ⚠️ Do not change `display` to `"standalone"`. This triggers the browser's PWA install prompt, which interrupts the shopping experience.

**PWA Features Enabled:**
- Installable on mobile home screen
- Offline support (basic caching)
- App-like experience
- Custom theme colour

---

## 14. SEO Checklist

### ✅ Implemented

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

### ⏳ To Complete

- Submit sitemap to Google Search Console
- Add product-level JSON-LD (`@type: Product`) on `ProductDetailPage`
- Register domain in Google Search Console and verify ownership
- Set up conversion goals in GA4 (newsletter signup, WhatsApp click)

---

## 15. Security Features

- **Security Headers** in `vercel.json` (XSS protection, X-Frame-Options, CSP, HSTS)
- **External Link Safety** — `rel="noopener noreferrer"` on all external links
- **Supabase RLS Policies** — public users can only read; writes require authenticated session
- **No Sensitive Data in Frontend** — all secrets stored in environment variables
- **`.env` Excluded** from version control via `.gitignore`
- **Admin Route Protection** — `/admin` and `/admin/*` routes gated by Supabase Auth
- **Unauthenticated Redirect** — users accessing admin without login are redirected to `/admin/login`
- **S3 Signed URLs** — temporary, time-limited access tokens for uploads (no direct S3 credentials exposed)

---

## 16. Known Issues & Fixes Applied

| Issue | Root Cause | Fix Applied | Status |
|---|---|---|---|
| Infinite loading skeleton on ProductDetailPage | `useProduct` hook received empty `id` string | Added guard: only fetch when `id` is truthy | ✅ Fixed |
| Image lightbox not working | React remounting reset zoom state | Moved zoom logic outside animation scope | ✅ Fixed |
| Mobile navbar category accordion broken | Desktop/mobile shared same open state | Split into separate `desktopOpen` and `mobileOpen` | ✅ Fixed |
| PWA install prompt appearing unexpectedly | Manifest had `"display": "standalone"` | Changed to `"display": "browser"` | ✅ Fixed |
| Star ratings not showing in admin | `review_count > 0` guard + normalizer default | Fixed normalizer default; removed guard | ✅ Fixed |
| Admin fabric field locked to dropdown | Fabric field was fixed `select` | Replaced with free-text input | ✅ Fixed |
| S3 CORS errors on image upload | Missing CORS configuration | Added CORS policy to bucket | ✅ Fixed |
| Images not caching between sessions | No cache headers on S3 URLs | Added Cache-Control headers to S3 objects | ✅ Fixed |

---

## 17. Future Improvements

### Phase 2 Features

- **Wishlist** — save favourites via Supabase (replaces localStorage approach)
- **Recently Viewed** — last 4 products, stored in sessionStorage
- **Related Products** — same-category products at the bottom of detail page
- **WhatsApp Catalog API** integration for a richer shopping experience
- **Customer Testimonials** section (static until review system is built)
- **Google Maps** embed on Contact page if a physical store opens
- **Email Notifications** — order confirmations, shipping updates via SendGrid or AWS SES

### Mobile Enhancements

- Touch swipe support for banner carousel (`react-swipeable`)
- Bottom navigation bar on mobile for faster tab switching
- Mobile-optimized admin dashboard for on-the-go management

### Performance

- Implement `React.lazy` + `Suspense` on all page-level routes if bundle size grows
- Consider CDN for S3 images if storage/bandwidth costs escalate
- Service Worker for offline browsing of previously viewed products

### Analytics & Business Intelligence

- Custom GA4 events for product interactions (view, add-to-cart simulation, inquiry)
- Heatmaps for user interaction patterns
- Dashboard for admin to view sales metrics, top products, customer demographics

---

---

# FOR THE CLIENT

---

## 18. How to Use the Admin Dashboard

### Accessing the Dashboard

Open your browser and go to:

```
https://wingandweft.com/admin
```

Sign in with the email and password set up for you. **Bookmark this page** on your phone for quick access. The dashboard works fully on mobile — useful for updating stock after exhibitions or events.

**Still can't log in?** Contact your developer to reset your password or verify your email.

---

### Dashboard Overview

The admin dashboard has 5 main sections:

| Section | What you can do |
|---|---|
| **Products** | Add, edit, delete, hide/show products. Update stock with one click. |
| **Banners** | Replace hero slideshow images, edit headlines and button text, show/hide slides |
| **Inquiries** | Read customer messages, reply via WhatsApp, track follow-ups |
| **Settings** | Update WhatsApp number, Instagram link, ribbon text, and other site-wide details |
| **Categories** | Add new categories, upload cover images, manage product categories |

---

### Adding a New Product

1. Click **Products** in the left sidebar
2. Click **+ Add Product** (top right)
3. Fill in the product details:
   - **Name** — the full product name as it should appear on the website (e.g., "Kanchipuram Silk Saree")
   - **Category** — select from the dropdown (e.g., Silk Sarees, Cotton Sarees)
   - **Fabric** — describe freely (e.g., "Pure Mulberry Silk with Zari Border")
   - **Price** — original price in ₹
   - **Discount Price** — leave blank if there is no discount
   - **Stock** — number of pieces available
   - **Description** — full product description shown on the product page
   - **Specifications** — saree length, blouse length, blouse fabric, care instructions (optional)
   - **Washing Instructions** — special care instructions (displayed separately on product page)
   - **Tags** — check the boxes for New Arrival, Best Seller, and/or Featured
   - **Visibility** — toggle ON to show the product; OFF to hide it without deleting
4. Upload 4 product photos:
   - Click the upload area or drag and drop
   - Photos must be portrait orientation (taller than wide)
   - Photos are converted to the best format automatically
   - If the aspect ratio is wrong, you'll see an error — rotate or crop and try again
5. Click **Add Product** — the product appears on the website immediately

---

### Updating Stock Quickly

**Quick method (recommended for daily use):**
1. Go to **Products**
2. Find the product in the list
3. Click directly on the stock number (e.g., "10 in stock")
4. Type the new number and press **Enter**
5. Done — the website updates instantly. When stock reaches 0, it shows "Out of Stock"

**Full edit method (if you need to change other details too):**
1. Click the pencil (✏️) icon on the product row
2. Change any details, including Stock
3. Click **Save**

---

### Hiding or Showing a Product

Every product has a visibility toggle (eye icon) in the product list:
- **Eye icon open** — product is visible to customers
- **Eye icon closed** — product is hidden from the website

This is useful for temporarily hiding out-of-stock items or seasonal products without deleting them. Toggle back on to make it visible again.

---

### Managing Banners (Hero Slideshow)

The banner section controls the large slideshow at the top of the homepage.

1. Click **Banners** in the sidebar
2. Each slide (Slide 1, 2, 3) can be edited:
   - **Replace Image** — Drag a new image into the image area
   - **Headline** — the main text on the slide (e.g., "New Summer Collection")
   - **Subtitle** — smaller text below the headline (e.g., "Discover our latest designs")
   - **Button Text** — what the button says (e.g., "Shop Now")
   - **Button Link** — where the button goes (e.g., `/category/silk-sarees`)
3. Click **Save** on each slide after editing
4. Use the eye icon to show or hide individual slides — useful for seasonal promotions

---

### Reading & Replying to Customer Inquiries

1. Click **Inquiries** in the sidebar
2. You'll see a list of all customer messages with:
   - **Unread inquiries** — marked with a red dot
   - **Name, Email, Message preview**
   - **Status** — Seen, Replied, or New
3. Click on a message to read the full details
4. Click **Reply on WhatsApp** — this opens WhatsApp with the customer's number automatically filled in
5. Type and send your reply via WhatsApp
6. Back in the admin dashboard, mark the message as **Seen** or **Replied** to keep track of follow-ups

---

### Updating Site Settings

1. Click **Settings** in the sidebar
2. You can update:
   - **WhatsApp Number** — the number customers reach when they click "Chat on WhatsApp"
   - **Instagram URL** — your Instagram profile link (e.g., https://instagram.com/wingandweft)
   - **Ribbon Text** — the scrolling text across the top of the homepage
   - **Other Social Links** — links to Facebook, Pinterest, etc.
3. Click **Save Changes** — updates go live on the website **immediately**, no page refresh needed

**Pro Tip:** Update the ribbon text for announcements like "Free shipping on orders above ₹2000!" or "New collection launching soon!"

---

### Managing Categories

1. Click **Settings**, then scroll to the **Categories** section
2. You can:
   - **Add a new category** — click "Add Category", enter the name, upload a portrait cover image (2:3 aspect ratio)
   - **Edit a category** — click the pencil icon, change the name or image, click Save
   - **Delete a category** — click the trash icon (note: you can't delete if products are assigned to it)
3. New categories appear in the navbar dropdown and product filters automatically

---

### Dashboard Tips & Tricks

**Stock Alerts**
- Products with 3 or fewer items in stock show a **⚠️ Low Stock** badge
- Check these regularly to plan new inventory

**Product ID Badge**
- Each product has a unique ID in the top-left corner of the product card
- Use this ID if you need to reference a product when talking to your developer

**Keyboard Shortcuts**
- After entering a new stock number, press **Enter** to save instantly
- Press **Escape** to cancel any edit

**Mobile Friendly**
- All dashboard functions work on mobile
- Great for updating stock from exhibitions or pop-up stores in real-time

---

### Troubleshooting

**"I can't log in"**
- Check that you're using the correct email and password
- Make sure Caps Lock is OFF
- Try resetting your password (link on the login page)
- Contact your developer if the reset link doesn't work

**"My product photo won't upload"**
- Check the image aspect ratio — products must be portrait (taller than wide)
- Try a different image format (JPG or PNG)
- File size should be under 5 MB
- Check your internet connection

**"The website didn't update after I saved"**
- Refresh your browser (press F5 or Cmd+R)
- Clear your browser cache (Ctrl+Shift+Delete on Chrome)
- Try a different browser

**"I accidentally deleted a product"**
- Contact your developer — they can restore it from backups
- In the future, use the eye icon to hide products instead of deleting

---

### Need Help?

If you run into issues or have questions:

1. **Check the dashboard tooltips** — hover over fields for tips
2. **Review this guide** — most questions are answered above
3. **Contact your developer** — for technical issues or account problems

---

**Wing & Weft — Documentation v2.1 — October 2026**

*For technical support or developer questions, contact the repository maintainer.*

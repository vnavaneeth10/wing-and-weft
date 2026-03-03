# Wing & Weft — Complete Setup & Documentation Guide

---



## 📋 Table of Contents
1. [Project Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Quick Start (Local)](#quick-start)
4. [Deploy to Vercel](#deploy-vercel)
5. [Image Dimension Specifications](#image-dimensions)
6. [Logo Specifications](#logo-specs)
7. [Customization Guide](#customization)
8. [Backend Recommendation](#backend)
9. [Toggling Hidden Sections](#hidden-sections)
10. [SEO Checklist](#seo)
11. [Security Features](#security)
12. [File Structure](#file-structure)
13. [Suggestions & Improvements](#suggestions)

---

## 1. Project Overview <a name="overview"></a>

**Wing & Weft** is a static product display website for an online saree brand. It includes:
- Animated loading screen with brand logo placeholder
- Responsive navbar with search (debounced), categories dropdown, dark/light theme
- Full-screen banner carousel with Ken Burns effect + scrolling ribbon
- Auto-scrolling category cards
- Tabbed collections (New Arrivals / Best Sellers / Featured)
- Instagram section (toggleable)
- Watch & Shop reels section (toggleable)
- WhatsApp CTA section
- Detailed product pages with image gallery, accordion specs, reviews skeleton
- Category pages with filters, sort, search
- Our Story page
- Contact page (sends via WhatsApp)
- Policy modals (6 policies)
- Footer with newsletter, quick links, policy links
- Floating WhatsApp button + scroll-to-top button
- 404 fallback page
- Full dark/light mode across entire site

---

## 2. Tech Stack <a name="tech-stack"></a>

| Technology | Purpose |
|---|---|
| React 18 | UI library |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Framer Motion | Animations (optional, add as needed) |
| React Router v6 | Client-side routing |
| Lucide React | Icons |
| Google Fonts | Cormorant Garamond, Playfair Display, Raleway |
| Vercel | Deployment |

---

## 3. Quick Start (Local) <a name="quick-start"></a>

### Prerequisites
- Node.js v18+ (https://nodejs.org)
- npm or yarn

### Steps

```bash
# 1. Navigate to project folder
cd wing-and-weft

# 2. Install dependencies
npm install

# 3. Start development server
npm start

# 4. Open in browser
# → http://localhost:3000
```

### Build for production
```bash
npm run build
# Output is in /build folder — ready to deploy
```

---

## 4. Deploy to Vercel <a name="deploy-vercel"></a>

### Option A: GitHub (Recommended)
1. Push project to GitHub repository
2. Go to https://vercel.com → Import Project
3. Select your GitHub repo
4. Settings:
   - Framework: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Click Deploy → Done!

### Option B: Vercel CLI
```bash
npm install -g vercel
vercel login
cd wing-and-weft
vercel --prod
```

### Custom Domain
1. In Vercel dashboard → Project Settings → Domains
2. Add your custom domain (e.g., `wingandweft.in`)
3. Update DNS records as shown by Vercel

---

## 5. Image Dimension Specifications <a name="image-dimensions"></a>

> **Share these with your client for all image submissions.**

### 🖼️ Banner / Hero Images
| Property | Value |
|---|---|
| **Dimensions** | **1440 × 700 px** |
| Aspect Ratio | 16:5 (wide cinematic) |
| Format | JPG or WebP |
| Max File Size | 300 KB each |
| Count | 3 images recommended |
| Subject | Full saree draped model, lifestyle shots |
| Notes | Keep subject slightly left-center; right side can fade to allow text overlay |

### 📂 Category Cover Images
| Property | Value |
|---|---|
| **Dimensions** | **400 × 600 px** |
| Aspect Ratio | 2:3 (portrait) |
| Format | JPG or WebP |
| Max File Size | 150 KB each |
| Count | 1 per category (5 categories) |
| Subject | Close-up of saree fabric texture or draped look |
| Notes | Will be displayed as vertical card, centered crop |

### 🛍️ Product Images (per product)
| Property | Value |
|---|---|
| **Dimensions** | **600 × 800 px** |
| Aspect Ratio | 3:4 (portrait) |
| Format | JPG or WebP |
| Max File Size | 200 KB each |
| Count | 4 images per product (required) |
| Subject | Draped model / flat lay / fabric detail / border close-up |
| Notes | Consistent background recommended (white or off-white) |

### 📸 Instagram Feed Images
| Property | Value |
|---|---|
| **Dimensions** | **400 × 500 px** |
| Aspect Ratio | 4:5 |
| Format | JPG |
| Max File Size | 150 KB each |
| Subject | Model shots, product shots from Instagram |

### 🎬 Watch & Shop Reel Thumbnails
| Property | Value |
|---|---|
| **Dimensions** | **400 × 600 px** |
| Aspect Ratio | 2:3 (portrait, like phone reel) |
| Format | JPG or MP4 (for videos) |
| Max File Size | 2 MB (video), 150 KB (thumbnail) |

---

## 6. Logo Specifications <a name="logo-specs"></a>

> **Share these with your designer/client for logo creation.**

### Navbar Logo
| Property | Value |
|---|---|
| **Recommended dimensions** | **400 × 400 px** (used at 48×48px in navbar) |
| Format | SVG (ideal) or PNG with transparent background |
| Shape | Square with rounded corners (displayed as circle in navbar) |
| Color version needed | Full color version on transparent background |
| File name | `logo.png` or `logo.svg` |

### How to add logo once ready:
1. Place `logo.png` in `/public/` folder
2. In `Navbar.tsx` — find the commented `<img>` tag and uncomment it:
   ```jsx
   <img src="/logo.png" alt="Wing & Weft Logo" className="w-full h-full object-contain rounded-full" />
   ```
3. In `LoadingScreen.tsx` — replace the `<span>W&W</span>` with:
   ```jsx
   <img src="/logo.png" alt="Wing & Weft" className="w-16 h-16 object-contain" />
   ```
4. In `OurStoryPage.tsx` — replace logo placeholder div with:
   ```jsx
   <img src="/logo.png" alt="Wing & Weft Logo" className="w-full h-full object-contain p-8" />
   ```

### Footer Logo
| Property | Value |
|---|---|
| **Recommended dimensions** | **200 × 200 px** (displayed at 40×40px) |
| Same as navbar logo (reuse the same file) |

---

## 7. Customization Guide <a name="customization"></a>

### 🔢 Update WhatsApp Business Number
File: `src/data/products.ts`
```typescript
export const WHATSAPP_NUMBER = '919999999999'; // Format: country code + number (no + or spaces)
// Example for India: '919876543210' for +91 98765 43210
```

### 📸 Add Real Product Images
File: `src/data/products.ts` — update the `IMG` object:
```typescript
const IMG = {
  p1: '/images/product-1-main.jpg',
  p2: '/images/product-2-main.jpg',
  // ...etc
};
```
Place images in `/public/images/` folder.

### ➕ Add New Products
File: `src/data/products.ts` — add to `PRODUCTS` array:
```typescript
{
  id: 'WW-026', // Always unique
  name: 'Your Saree Name',
  category: 'silk-sarees', // must match category id
  fabric: 'Pure Silk',
  price: 5000,
  discountPrice: 4200, // optional, remove if no discount
  rating: 4.5,
  reviewCount: 0,
  stock: 10, // Set to 0 for out of stock
  colors: ['#BC3D3E', '#1A3A5C'],
  images: ['/images/ww026-1.jpg', '/images/ww026-2.jpg', '/images/ww026-3.jpg', '/images/ww026-4.jpg'],
  description: 'Full description here...',
  specifications: {
    sareeFabric: 'Pure Mulberry Silk',
    sareeLength: '6.3 meters',
    blouseLength: '0.8 meters',
    blouseFabric: 'Pure Silk',
  },
  tags: ['New Arrivals'],
  isNewArrival: true,
  isBestSeller: false,
  isFeatured: false,
}
```

### 🔄 Update Stock Availability
In `src/data/products.ts`, find the product by ID and change:
```typescript
stock: 0,  // Out of stock
stock: 3,  // Low stock warning shows
stock: 10, // Normal in stock
```

### 📝 Update Banner Slides
File: `src/data/products.ts` — update `BANNER_SLIDES`:
```typescript
export const BANNER_SLIDES = [
  {
    id: '1',
    image: '/images/banner-1.jpg',
    title: 'Your Slide Title',
    subtitle: 'Your subtitle text',
    cta: 'Button Text',
    link: '/category/silk-sarees',
  },
  // ...
];
```

### 🎨 Change Brand Colors
File: `tailwind.config.js`:
```javascript
brand: {
  cream: '#e9e3cb',  // Light background
  red: '#bc3d3e',    // Primary accent
  orange: '#e69358', // Secondary accent
  gold: '#b6893c',   // Gold details
}
```

---

## 8. Backend Recommendation <a name="backend"></a>

### ✅ Recommended Solution: Airtable + This Static Site

Given your requirements (client has zero coding knowledge, needs to update products independently), here's the best approach:

**Option A: Airtable (Best for your needs)**
- Cost: Free for basic use (up to 1000 records)
- Client can add/edit products in a spreadsheet-like interface
- You build a small API integration in the app

Setup:
1. Create Airtable account at https://airtable.com
2. Create a "Products" base with all fields (name, price, stock, images, etc.)
3. Get API key from Airtable
4. Replace the static `PRODUCTS` array with an Airtable fetch call

```typescript
// In src/data/products.ts, replace static PRODUCTS with:
export const fetchProducts = async () => {
  const response = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/Products`,
    { headers: { Authorization: `Bearer ${API_KEY}` } }
  );
  const data = await response.json();
  return data.records.map(record => record.fields);
};
```

**Option B: Google Sheets + Google Apps Script**
- Cost: Free
- Client familiar with Google Sheets
- More setup but zero ongoing cost

**Option C: Headless CMS (Contentful / Sanity)**
- Cost: Free tier available
- Most powerful content management
- Visual editor for client
- Recommended if you plan to scale

**Option D: Simple Admin Dashboard (Future)**
- Build a password-protected `/admin` page later
- Use localStorage or Airtable API to manage products
- Custom solution, one-time cost for development

### ✅ For Stock Management (Immediate Solution)
Since the client needs to independently update stock:
1. Use Airtable as described above
2. Client logs into Airtable, finds the product, changes `stock` to 0
3. App auto-fetches latest data and shows "Out of Stock"

---

## 9. Toggling Hidden Sections <a name="hidden-sections"></a>

File: `src/pages/HomePage.tsx`

```typescript
// Set these to true/false based on threshold:
const SHOW_INSTAGRAM = false;  // Hide Instagram section
const SHOW_WATCH_SHOP = false; // Hide Watch & Shop section
```

Change to `true` when you want them visible.

---

## 10. SEO Checklist <a name="seo"></a>

The following are implemented:
- ✅ Meta title, description, keywords in `public/index.html`
- ✅ Open Graph tags for social sharing
- ✅ Semantic HTML (nav, main, section, article, footer)
- ✅ ARIA labels on all interactive elements
- ✅ Alt text on all images
- ✅ Lazy loading on images
- ✅ Mobile-responsive design
- ✅ Fast loading via code splitting and lazy pages

**To add (recommended before launch):**
1. Create `public/robots.txt`:
   ```
   User-agent: *
   Allow: /
   Sitemap: https://www.wingandweft.in/sitemap.xml
   ```
2. Add Google Analytics script to `public/index.html`
3. Register on Google Search Console
4. Add structured data (JSON-LD) for products

---

## 11. Security Features <a name="security"></a>

Implemented:
- ✅ Security headers in `vercel.json` (XSS, X-Frame-Options, CSP, etc.)
- ✅ `rel="noopener noreferrer"` on all external links
- ✅ No sensitive data exposed in frontend
- ✅ Input sanitization (forms use controlled components)
- ✅ No localStorage used for sensitive data

---

## 12. File Structure <a name="file-structure"></a>

```
wing-and-weft/
├── public/
│   ├── index.html          ← SEO meta, Google Fonts
│   ├── favicon.ico         ← Add your favicon
│   └── images/             ← Add product/banner images here
│
├── src/
│   ├── components/
│   │   ├── Navbar/         ← Navigation with search, dropdown, theme
│   │   ├── Banner/         ← Hero carousel + ribbon
│   │   ├── Category/       ← Auto-scroll category cards
│   │   ├── Collections/    ← Tabbed product collections
│   │   ├── Instagram/      ← Instagram feed section
│   │   ├── WatchShop/      ← Video reel section
│   │   ├── WhatsApp/       ← CTA section + floating buttons
│   │   ├── Footer/         ← Full footer
│   │   ├── Products/       ← ProductCard component (shared)
│   │   ├── Policy/         ← Policy modal + data
│   │   └── UI/             ← LoadingScreen, skeletons
│   │
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── CategoryPage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   ├── OurStoryPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── SearchPage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── data/
│   │   └── products.ts     ← ALL product data, categories, WhatsApp config
│   │
│   ├── context/
│   │   └── ThemeContext.tsx ← Dark/light theme state
│   │
│   ├── hooks/
│   │   └── index.ts        ← useDebounce, useSearchSuggestions, useScrollToTop, useInView
│   │
│   ├── types/
│   │   └── index.ts        ← TypeScript interfaces
│   │
│   ├── App.tsx             ← Root app, routing, loading screen
│   └── index.css           ← Global styles, animations
│
├── tailwind.config.js      ← Brand colors, fonts, animations
├── vercel.json             ← Security headers, routing
├── package.json
└── tsconfig.json
```

---

## 13. Suggestions & Improvements <a name="suggestions"></a>

### 🚀 Priority Improvements Before Launch
1. **Add a favicon** — Create a simple `favicon.ico` from your logo and add to `/public/`
2. **Replace placeholder images** — Upload real saree photos to `/public/images/`
3. **Update WhatsApp number** — Critical before launch
4. **Add Google Analytics** — Track visitors from day one
5. **Performance** — Use WebP format for all images (50% smaller than JPG)

### 💡 Feature Suggestions for Phase 2
1. **Wishlist** — Let customers save favorites (localStorage)
2. **Image zoom** — Hover/click to zoom on product detail page
3. **Recently Viewed** — Show last 4 viewed products
4. **Related Products** — Show similar category products at bottom of detail page
5. **WhatsApp catalog** — Instead of just chat, use WhatsApp Catalog API
6. **Google Maps embed** — If you have a store, show it on Contact page
7. **Customer testimonials** — Static testimonials until review system is built

### 📱 Mobile-Specific Suggestions
1. Add touch swipe support to the banner (can use `react-swipeable`)
2. Consider adding a bottom navigation bar on mobile

### 🔐 Admin Panel Recommendation
Build a simple `/admin` route (password protected) with:
- Product list with inline stock editing
- Toggle product visibility
- Export to WhatsApp catalog format

Cost to build: 2–3 days of development work.

---

## 📞 Support

For technical support or modifications, the codebase is fully commented and modular. Each component is self-contained.

Contact: support@wingandweft.com

---

*Documentation last updated: March 2026*
*Crafted with ❤️ for Wing & Weft*

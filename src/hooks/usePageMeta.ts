// src/hooks/usePageMeta.ts
// Sets <title> and <meta name="description"> for every page.
// Call once at the top of each page component.
// Lighthouse requires a unique, descriptive title on every page.

import { useEffect } from 'react';

const SITE_NAME = 'Wing & Weft';

interface PageMeta {
  title:        string;   // page-specific title (without site name)
  description:  string;   // 120-160 chars — shown in Google results
  ogImage?:     string;   // optional OG image override (full URL)
}

export function usePageMeta({ title, description, ogImage }: PageMeta) {
  useEffect(() => {
    // ── Title ──────────────────────────────────────────────────────────────
    const fullTitle = `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    // ── Meta description ────────────────────────────────────────────────────
    let descEl = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!descEl) {
      descEl = document.createElement('meta');
      descEl.name = 'description';
      document.head.appendChild(descEl);
    }
    descEl.content = description;

    // ── OG title ────────────────────────────────────────────────────────────
    let ogTitleEl = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitleEl) ogTitleEl.content = fullTitle;

    // ── OG description ───────────────────────────────────────────────────────
    let ogDescEl = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (ogDescEl) ogDescEl.content = description;

    // ── OG image (optional override) ────────────────────────────────────────
    if (ogImage) {
      let ogImgEl = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
      if (ogImgEl) ogImgEl.content = ogImage;
    }

    // ── Cleanup: restore defaults when component unmounts ───────────────────
    return () => {
      document.title = `${SITE_NAME} — Handwoven Sarees | Silk, Cotton & Heritage Weaves`;
    };
  }, [title, description, ogImage]);
}

// ─── Pre-defined page metas ────────────────────────────────────────────────────
// Import and use these in each page component for consistency.

export const PAGE_METAS = {
  home: {
    title: 'Handwoven Sarees — Silk, Cotton & Heritage Weaves',
    description: 'Discover authentic handwoven sarees from master weavers across India. Pure silk, cotton, Banarasi & more — curated for the modern woman who honours heritage. Free shipping above ₹2000.',
  },
  ourStory: {
    title: 'Our Story',
    description: 'Wing & Weft was born from a love for Indian handloom traditions. Learn about our journey, our values, and the master weavers behind every saree.',
  },
  contact: {
    title: 'Contact Us',
    description: 'Get in touch with Wing & Weft. Reach us via WhatsApp, email, or our contact form. We respond within 24 hours.',
  },
  notFound: {
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist. Browse our handwoven saree collection or return to the homepage.',
  },
  search: {
    title: 'Search Results',
    description: 'Search our collection of authentic handwoven sarees — silk, cotton, Banarasi, georgette and more.',
  },
} as const;
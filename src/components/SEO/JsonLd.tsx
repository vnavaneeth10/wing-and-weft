// src/components/SEO/JsonLd.tsx
// Reusable JSON-LD structured data components.
// Drop these alongside <SEO /> in any page that needs rich results.

import React from 'react';
import { SITE_URL } from '../../lib/siteUrl';

// ─── BreadcrumbList ───────────────────────────────────────────────────────────

interface BreadcrumbItem {
  name: string;
  /** Full absolute URL */
  url:  string;
}

export const BreadcrumbJsonLd: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        '@context':        'https://schema.org',
        '@type':           'BreadcrumbList',
        itemListElement:   items.map((item, i) => ({
          '@type':   'ListItem',
          position:  i + 1,
          name:      item.name,
          item:      item.url,
        })),
      }),
    }}
  />
);

// ─── ItemList (for the /categories index page) ────────────────────────────────

interface ListItem {
  name:   string;
  url:    string;
  image?: string;
}

export const ItemListJsonLd: React.FC<{ name: string; items: ListItem[] }> = ({ name, items }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        '@context':      'https://schema.org',
        '@type':         'ItemList',
        name,
        itemListElement: items.map((item, i) => ({
          '@type':   'ListItem',
          position:  i + 1,
          name:      item.name,
          url:       item.url,
          ...(item.image ? { image: item.image } : {}),
        })),
      }),
    }}
  />
);

// ─── WebPage (for individual category pages) ──────────────────────────────────

interface WebPageProps {
  name:        string;
  description: string;
  url:         string;
  image?:      string;
}

export const WebPageJsonLd: React.FC<WebPageProps> = ({ name, description, url, image }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        '@context':   'https://schema.org',
        '@type':      'CollectionPage',
        name,
        description,
        url,
        ...(image ? { image } : {}),
        publisher: {
          '@type': 'Organization',
          name:    'Wing & Weft',
          url:     SITE_URL,
        },
      }),
    }}
  />
);
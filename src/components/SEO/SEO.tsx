// src/components/SEO/SEO.tsx
// Lightweight SEO component — wraps usePageMeta for convenience.
// Your pages import this — it just calls usePageMeta internally.
import { usePageMeta } from '../../hooks/usePageMeta';

interface SEOProps {
  title:        string;
  description:  string;
  ogImage?:     string;
}

const SEO: React.FC<SEOProps> = ({ title, description, ogImage }) => {
  usePageMeta({ title, description, ogImage });
  return null; // renders nothing — just sets document head
};

import React from 'react';
export default SEO;
// src/types/index.ts

// ─── Product ──────────────────────────────────────────────────────────────────
// Matches Supabase DB schema exactly (snake_case)
export interface Product {
  id:             string;
  name:           string;
  category:       string;
  fabric:         string;
  price:          number;
  discount_price: number | null;  // ✅ was: discountPrice
  stock:          number;
  colors:         string[];
  images:         string[];
  description:    string;
  saree_fabric:   string;         // ✅ was: specifications.sareeFabric
  saree_length:   string;         // ✅ was: specifications.sareeLength
  blouse_length:  string;         // ✅ was: specifications.blouseLength
  blouse_fabric:  string;         // ✅ was: specifications.blouseFabric
  is_best_seller: boolean;        // ✅ was: isBestSeller
  is_new_arrival: boolean;        // ✅ was: isNewArrival
  is_featured:    boolean;        // ✅ was: isFeatured
  rating:         number;
  review_count:   number;         // ✅ was: reviewCount
  created_at?:    string;
}

// ─── Category ─────────────────────────────────────────────────────────────────
// ✅ Updated to match Supabase categories table (live from DB now)
export interface Category {
  id:          string;
  name:        string;
  image:       string;
  description: string;
  count:       number;
  sort_order:  number;   // ✅ NEW
  is_active:   boolean;  // ✅ NEW
  created_at?: string;
}

// ─── Banner ───────────────────────────────────────────────────────────────────
export interface Banner {
  id:         string;
  title:      string;
  subtitle:   string;
  cta_text:   string;
  cta_link:   string;
  image_url:  string;
  sort_order: number;
  is_active:  boolean;
}
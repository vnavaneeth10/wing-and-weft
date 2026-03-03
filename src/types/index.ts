// src/types/index.ts

export interface Product {
  id: string;
  name: string;
  category: string;
  fabric: string;
  price: number;
  discountPrice?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  colors: string[];
  images: string[];
  description: string;
  specifications: {
  sareeFabric: string;
  sareeLength: string;
  blouseLength: string;
  blouseFabric: string;
  };
  tags: string[];
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  weight?: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
  count: number;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface FilterState {
  category: string;
  priceRange: [number, number];
  fabric: string[];
  tag: string;
  sortBy: string;
  searchQuery: string;
}

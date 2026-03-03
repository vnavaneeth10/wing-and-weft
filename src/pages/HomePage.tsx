// src/pages/HomePage.tsx
import React from 'react';
import Banner from '../components/Banner/Banner';
import CategorySection from '../components/Category/CategorySection';
import Collections from '../components/Collections/Collections';
import InstagramSection from '../components/Instagram/InstagramSection';
import WatchShop from '../components/WatchShop/WatchShop';
import { WhatsAppSection } from '../components/WhatsApp/WhatsAppSection';

// Feature flags — toggle as needed
const SHOW_INSTAGRAM = true; // set false to hide until threshold
const SHOW_WATCH_SHOP = true; // set false to hide until threshold

const HomePage: React.FC = () => {
  return (
    <main>
      <Banner />
      <CategorySection />
      <Collections />
      {SHOW_INSTAGRAM && <InstagramSection />}
      {SHOW_WATCH_SHOP && <WatchShop />}
      <WhatsAppSection />
    </main>
  );
};

export default HomePage;

// src/pages/HomePage.tsx
import React from 'react';
import Banner from '../components/Banner/Banner';
import CategorySection from '../components/Category/CategorySection';
import Collections from '../components/Collections/Collections';
import InstagramSection from '../components/Instagram/InstagramSection';
import WatchShop from '../components/WatchShop/WatchShop';
import { WhatsAppSection } from '../components/WhatsApp/WhatsAppSection';

// Feature flags — toggle as needed
const SHOW_INSTAGRAM = false; // set false to hide until threshold
const SHOW_WATCH_SHOP = false; // set false to hide until threshold
const COLLECTIONS = false;

const HomePage: React.FC = () => {
  return (
    <main id="main-content">
      <Banner />
      <CategorySection />
      {COLLECTIONS && <Collections />}
      {SHOW_INSTAGRAM && <InstagramSection />}
      {SHOW_WATCH_SHOP && <WatchShop />}
      <WhatsAppSection />
    </main>
  );
};

export default HomePage;

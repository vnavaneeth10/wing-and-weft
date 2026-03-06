// src/components/Instagram/InstagramSection.tsx
import React, { useEffect, useState } from 'react';
import { Instagram } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useInView } from '../../hooks';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../admin/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────
interface InstagramPost {
  id: string;
  image: string;
  link: string;
  caption: string;
}

// ─── Fallback posts (shown while loading or if no DB posts set) ───────────────
const FALLBACK_POSTS: InstagramPost[] = [
  { id: '1', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop', link: 'https://www.instagram.com/wingandweft/', caption: 'Kanchipuram Elegance' },
  { id: '2', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=500&fit=crop', link: 'https://www.instagram.com/wingandweft/', caption: 'Banarasi Dreams' },
  { id: '3', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=500&fit=crop', link: 'https://www.instagram.com/wingandweft/', caption: 'Mysore Magic' },
  { id: '4', image: 'https://images.unsplash.com/photo-1631947430066-48c30d57b943?w=400&h=500&fit=crop', link: 'https://www.instagram.com/wingandweft/', caption: 'Patola Story' },
  { id: '5', image: 'https://images.unsplash.com/photo-1617627143233-a6699d9f3d2a?w=400&h=500&fit=crop', link: 'https://www.instagram.com/wingandweft/', caption: 'Tussar Tales' },
  { id: '6', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop&q=80', link: 'https://www.instagram.com/wingandweft/', caption: 'Handloom Love' },
];

// ─── Fetch instagram_url and instagram_posts from Supabase settings ───────────
const fetchInstagramData = async (): Promise<{ posts: InstagramPost[]; url: string }> => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/settings?key=in.(instagram_url,instagram_posts)`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );
  if (!res.ok) throw new Error('Failed to fetch');
  const rows: { key: string; value: string }[] = await res.json();
  const map: Record<string, string> = {};
  rows.forEach((r) => { map[r.key] = r.value; });

  let posts = FALLBACK_POSTS;
  if (map['instagram_posts']) {
    try {
      const parsed = JSON.parse(map['instagram_posts']);
      if (Array.isArray(parsed) && parsed.length > 0) posts = parsed;
    } catch {
      // keep fallback
    }
  }

  return {
    posts,
    url: map['instagram_url'] || 'https://www.instagram.com/wingandweft/',
  };
};

// ─── Component ────────────────────────────────────────────────────────────────
const InstagramSection: React.FC = () => {
  const { isDark } = useTheme();
  const { ref, inView } = useInView();
  const [posts, setPosts] = useState<InstagramPost[]>(FALLBACK_POSTS);
  const [instagramUrl, setInstagramUrl] = useState('https://www.instagram.com/wingandweft/');

  // ✅ Fetch live from Supabase settings
  useEffect(() => {
    fetchInstagramData()
      .then(({ posts: p, url }) => {
        setPosts(p);
        setInstagramUrl(url);
      })
      .catch(() => {/* keep fallbacks */ });
  }, []);

  return (
    <section
      ref={ref}
      className={`py-16 md:py-24 ${isDark ? 'bg-dark-bg' : 'bg-white'}`}
      aria-label="Follow us on Instagram"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div
          className={`text-center mb-10 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Instagram size={20} className="text-brand-red" />
            <p className="text-brand-gold text-xs uppercase tracking-widest font-body" style={{ letterSpacing: '0.3em' }}>
              Follow Us on Instagram
            </p>
          </div>
          <h2
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600 }}
            className={isDark ? 'text-brand-cream' : 'text-stone-800'}
          >
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-red transition-colors">
              @wingandweft
            </a>
          </h2>
          <div className="saree-divider w-32 mx-auto mt-4" />
        </div>

        {/* Auto-scrolling posts */}
        <div className="relative overflow-hidden mb-10">
          <div
            className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
            style={{ background: isDark ? 'linear-gradient(to right, #1a1410, transparent)' : 'linear-gradient(to right, white, transparent)' }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
            style={{ background: isDark ? 'linear-gradient(to left, #1a1410, transparent)' : 'linear-gradient(to left, white, transparent)' }}
          />
          <div className="auto-scroll-container gap-4 py-2" style={{ animationDuration: '25s' }}>
            {[...posts, ...posts].map((post, i) => (
              <a
                key={`${post.id}-${i}`}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 group relative overflow-hidden rounded-xl cursor-pointer"
                style={{ width: '220px', height: '280px' }}
                aria-label={`View Instagram post: ${post.caption}`}
              >
                <img
                  src={post.image}
                  alt={post.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 text-center">
                    <Instagram size={32} color="white" className="mx-auto mb-2" />
                    <p className="text-white text-xs font-body font-semibold">{post.caption}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Follow button */}
        <div className="text-center">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold font-body text-sm uppercase tracking-widest transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(220,39,67,0.4)',
              letterSpacing: '0.15em',
            }}
          >
            <Instagram size={18} />
            Follow on Instagram
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;
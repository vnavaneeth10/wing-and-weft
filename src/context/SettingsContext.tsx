import React, { createContext, useContext, useEffect, useState } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../admin/lib/supabase';

interface SiteSettings {
  whatsapp_number:  string;
  contact_phone:    string;
  contact_email:    string;
  instagram_url:    string;
  instagram_handle: string;
  facebook_url:     string;
  facebook_name:    string;
  business_hours:   string;
  ribbon_text:      string;
  ribbon_visible:   string;
}

const DEFAULTS: SiteSettings = {
  whatsapp_number:  '919999999999',
  contact_phone:    '+91 99999 99999',
  contact_email:    'support@wingandweft.com',
  instagram_url:    'https://www.instagram.com/wingandweft/',
  instagram_handle: '@wingandweft',
  facebook_url:     '#',
  facebook_name:    'Wing & Weft',
  business_hours:   'Mon–Sat: 10AM – 7PM',
  ribbon_text:      '',
  ribbon_visible:   'true',
};

const SettingsContext = createContext<SiteSettings>(DEFAULTS);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);

  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/settings?select=key,value`, {
      headers: {
        apikey:        SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    })
      .then(r => r.json())
      .then((rows: { key: string; value: string }[]) => {
        const map: Record<string, string> = {};
        rows.forEach(r => { if (r.key) map[r.key] = r.value; });
        setSettings({
          whatsapp_number:  map['whatsapp_number']  || DEFAULTS.whatsapp_number,
          contact_phone:    map['contact_phone']    || DEFAULTS.contact_phone,
          contact_email:    map['contact_email']    || DEFAULTS.contact_email,
          instagram_url:    map['instagram_url']    || DEFAULTS.instagram_url,
          instagram_handle: map['instagram_handle'] || DEFAULTS.instagram_handle,
          facebook_url:     map['facebook_url']     || DEFAULTS.facebook_url,
          facebook_name:    map['facebook_name']    || DEFAULTS.facebook_name,
          business_hours:   map['business_hours']   || DEFAULTS.business_hours,
          ribbon_text:      map['ribbon_text']      || DEFAULTS.ribbon_text,
          ribbon_visible:   map['ribbon_visible']   || DEFAULTS.ribbon_visible,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
};
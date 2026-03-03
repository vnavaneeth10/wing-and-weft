// src/admin/pages/AdminSettings.tsx
import React, { useState, useEffect } from 'react';
//import { Save, Settings, Phone, Instagram, Facebook, MessageCircle, AlignLeft } from 'lucide-react';
import {
  Save,
  Settings,
  Phone,
  Instagram,
  Facebook,
  MessageCircle,
  AlignLeft,
  type LucideIcon,
} from 'lucide-react';
import { AdminBtn, Field, inputCls, inputStyle, Toast, Spinner } from '../components/AdminUI';
import { useSettings } from '../hooks/useAdminData';
//import { LucideIcon } from 'lucide-react';

type ToastState = { msg: string; type: 'success' | 'error' } | null;

interface SettingField {
  key: string;
  label: string;
  placeholder: string;
  icon: LucideIcon;
  hint?: string;
  type?: 'text' | 'tel' | 'url' | 'textarea';
}

const SETTING_FIELDS: SettingField[] = [
  { key: 'whatsapp_number', label: 'WhatsApp Business Number', placeholder: '919999999999', icon: MessageCircle, hint: 'Include country code, no + or spaces. Example: 919876543210 for +91 98765 43210', type: 'tel' },
  { key: 'instagram_url', label: 'Instagram Profile URL', placeholder: 'https://www.instagram.com/wingandweft/', icon: Instagram, type: 'url' },
  { key: 'facebook_url', label: 'Facebook Page URL', placeholder: 'https://www.facebook.com/wingandweft', icon: Facebook, type: 'url' },
  { key: 'contact_phone', label: 'Contact Phone (Display)', placeholder: '+91 99999 99999', icon: Phone },
  { key: 'contact_email', label: 'Support Email', placeholder: 'support@wingandweft.com', icon: MessageCircle },
  { key: 'ribbon_text', label: 'Ribbon Scrolling Text', placeholder: 'Timeless sarees crafted with uncompromising quality...', icon: AlignLeft, hint: 'This text scrolls below the homepage banner', type: 'textarea' },
];

const AdminSettings: React.FC = () => {
  const { settings, loading, saveSetting } = useSettings();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [changed, setChanged] = useState<Set<string>>(new Set());

  useEffect(() => {
    setValues({ ...settings });
  }, [settings]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setChanged((prev) => new Set([...prev, key]));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await Promise.all([...changed].map((key) => saveSetting(key, values[key] || '')));
      setChanged(new Set());
      showToast('Settings saved successfully', 'success');
    } catch {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold" style={{ fontFamily: '"Raleway", sans-serif' }}>
            Settings
          </h1>
          <p className="text-slate-500 text-sm mt-0.5" style={{ fontFamily: '"Raleway", sans-serif' }}>
            Manage brand links, contact info, and display text
          </p>
        </div>
        {changed.size > 0 && (
          <AdminBtn
            icon={<Save size={16} />}
            loading={saving}
            onClick={handleSaveAll}
          >
            Save {changed.size} change{changed.size > 1 ? 's' : ''}
          </AdminBtn>
        )}
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Section: Brand & Social */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
            <Settings size={16} className="text-brand-gold" />
            <h2 className="text-white font-semibold text-sm" style={{ fontFamily: '"Raleway", sans-serif' }}>
              Brand & Social Links
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            {SETTING_FIELDS.map(({ key, label, placeholder, icon: Icon, hint, type = 'text' }) => (
              <div key={key} className={type === 'textarea' ? 'md:col-span-2' : ''}>
                <Field label={label} hint={hint}>
                  <div className="relative">
                    <Icon size={15} className="absolute left-3.5 top-3 text-slate-500" />
                    {type === 'textarea' ? (
                      <textarea
                        rows={3}
                        className={`${inputCls} pl-10`}
                        style={{ ...inputStyle, resize: 'none' }}
                        placeholder={placeholder}
                        value={values[key] || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                    ) : (
                      <input
                        type={type}
                        className={`${inputCls} pl-10`}
                        style={{
                          ...inputStyle,
                          ...(changed.has(key) ? { borderColor: 'rgba(188,61,62,0.4)' } : {}),
                        }}
                        placeholder={placeholder}
                        value={values[key] || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                    )}
                    {changed.has(key) && (
                      <span
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-orange"
                        style={{ fontFamily: '"Raleway", sans-serif' }}
                      >
                        unsaved
                      </span>
                    )}
                  </div>
                </Field>
              </div>
            ))}
          </div>

          {/* Save button at bottom */}
          <div className="px-6 py-4 border-t border-white/10 flex justify-end">
            <AdminBtn
              icon={<Save size={16} />}
              loading={saving}
              onClick={handleSaveAll}
              disabled={changed.size === 0}
              variant={changed.size > 0 ? 'primary' : 'secondary'}
            >
              {changed.size > 0 ? `Save ${changed.size} change${changed.size > 1 ? 's' : ''}` : 'No changes'}
            </AdminBtn>
          </div>
        </div>
      )}

      {/* Admin account info card */}
      <div
        className="rounded-2xl p-5"
        style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <h2 className="text-white font-semibold text-sm mb-3" style={{ fontFamily: '"Raleway", sans-serif' }}>
          Admin Account
        </h2>
        <p className="text-slate-400 text-sm mb-4" style={{ fontFamily: '"Raleway", sans-serif' }}>
          To change your admin email or password, go directly to your Supabase dashboard:
        </p>
        <a
          href="https://app.supabase.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#e0e0e0', fontFamily: '"Raleway", sans-serif' }}
        >
          Open Supabase Dashboard ↗
        </a>
        <p className="text-slate-600 text-xs mt-3" style={{ fontFamily: '"Raleway", sans-serif' }}>
          Authentication → Users → Select your email → Reset password
        </p>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
};

export default AdminSettings;

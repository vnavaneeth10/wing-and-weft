// src/components/Policy/PolicyModal.tsx
import React, { useEffect } from 'react';
import { X, Mail, Phone, Instagram } from 'lucide-react';
import { POLICIES } from './policies';
import { useTheme } from '../../context/ThemeContext';
import { INSTAGRAM_URL } from '../../data/products';

interface Props {
  policyId: string;
  onClose: () => void;
}

const PolicyModal: React.FC<Props> = ({ policyId, onClose }) => {
  const { isDark } = useTheme();
  const policy = POLICIES.find((p) => p.id === policyId);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  if (!policy) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={policy.title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative z-10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col ${
          isDark ? 'bg-dark-card border border-dark-border' : 'bg-white border border-stone-200'
        }`}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{
            background: 'linear-gradient(135deg, #bc3d3e, #b6893c)',
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        >
          <h2
            className="text-brand-cream"
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.5rem', fontWeight: 600 }}
          >
            {policy.title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors text-brand-cream/70 hover:text-brand-cream hover:bg-white/20"
            aria-label="Close policy"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <ul className="space-y-3">
            {policy.content.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5"
                  style={{ background: '#bc3d3e' }}
                />
                <p className={`text-sm font-body leading-relaxed ${isDark ? 'text-dark-text' : 'text-stone-700'}`}>
                  {item}
                </p>
              </li>
            ))}
          </ul>

          {/* Contact at bottom */}
          <div
            className={`mt-8 p-4 rounded-xl ${isDark ? 'bg-dark-bg border border-dark-border' : 'bg-brand-cream/30 border border-brand-cream'}`}
          >
            <p
              className={`text-sm font-semibold mb-3 font-body ${isDark ? 'text-dark-text' : 'text-stone-800'}`}
            >
              For any policy related queries:
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="tel:+919999999999"
                className="flex items-center gap-2 text-sm font-body text-brand-red hover:underline"
              >
                <Phone size={14} /> +91 99999 99999
              </a>
              <a
                href="mailto:support@wingandweft.com"
                className="flex items-center gap-2 text-sm font-body text-brand-red hover:underline"
              >
                <Mail size={14} /> support@wingandweft.com
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-body text-brand-red hover:underline"
              >
                <Instagram size={14} /> @wingandweft
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyModal;

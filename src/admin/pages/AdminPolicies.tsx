// src/admin/pages/AdminPolicies.tsx
import React, { useState } from 'react';
import { Plus, Trash2, Save, ChevronDown, ChevronUp, Eye, EyeOff, GripVertical } from 'lucide-react';
import { AdminBtn, Field, inputCls, useAdminInputStyle, Spinner, Toast, Badge, useAdminTk } from '../components/AdminUI';
import { usePolicies, DBPolicy } from '../hooks/useAdminData';

type ToastState = { msg: string; type: 'success' | 'error' } | null;

const AdminPolicies: React.FC = () => {
  const tk = useAdminTk();
  const is = useAdminInputStyle();
  const { policies, loading, updatePolicy } = usePolicies();

  // Local editing state keyed by policy id
  const [editing, setEditing]   = useState<Record<string, DBPolicy>>({});
  const [saving, setSaving]     = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [toast, setToast]       = useState<ToastState>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  // Get the live editing version or fall back to DB version
  const getPolicy = (id: string): DBPolicy =>
    editing[id] ?? policies.find(p => p.id === id)!;

  const setLocal = (id: string, updates: Partial<DBPolicy>) => {
    const base = getPolicy(id);
    setEditing(prev => ({ ...prev, [id]: { ...base, ...updates } }));
  };

  const hasChanges = (id: string) => !!editing[id];

  // ── Bullet point helpers ───────────────────────────────────────────────────
  const updateBullet = (id: string, idx: number, value: string) => {
    const content = [...getPolicy(id).content];
    content[idx] = value;
    setLocal(id, { content });
  };

  const addBullet = (id: string) => {
    const content = [...getPolicy(id).content, ''];
    setLocal(id, { content });
    // Auto-expand
    setExpanded(prev => ({ ...prev, [id]: true }));
  };

  const removeBullet = (id: string, idx: number) => {
    const content = getPolicy(id).content.filter((_, i) => i !== idx);
    setLocal(id, { content });
  };

  const moveBullet = (id: string, idx: number, dir: 'up' | 'down') => {
    const content = [...getPolicy(id).content];
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= content.length) return;
    [content[idx], content[swap]] = [content[swap], content[idx]];
    setLocal(id, { content });
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async (id: string) => {
    const local = editing[id];
    if (!local) return;
    // Validate — remove empty bullets before saving
    const cleaned = { ...local, content: local.content.filter(b => b.trim()) };
    if (!cleaned.title.trim()) { showToast('Title cannot be empty', 'error'); return; }
    if (cleaned.content.length === 0) { showToast('Policy must have at least one point', 'error'); return; }

    setSaving(id);
    try {
      await updatePolicy(id, cleaned);
      setEditing(prev => { const n = { ...prev }; delete n[id]; return n; });
      showToast('Policy saved successfully', 'success');
    } catch {
      showToast('Failed to save policy', 'error');
    } finally {
      setSaving(null);
    }
  };

  const toggleActive = async (policy: DBPolicy) => {
    try {
      await updatePolicy(policy.id, { is_active: !policy.is_active });
      showToast(`Policy ${policy.is_active ? 'hidden' : 'shown'} on website`, 'success');
    } catch {
      showToast('Failed to update visibility', 'error');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textPrimary }}>
          Policies
        </h1>
        <p className="text-sm mt-0.5" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>
          Edit the policy content shown in the footer modal. Changes go live immediately.
        </p>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 px-5 py-4 rounded-xl"
        style={{ background: 'rgba(182,137,60,0.08)', border: '1px solid rgba(182,137,60,0.2)' }}>
        <p className="text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textSecondary }}>
          <span className="text-brand-gold font-semibold">Tip:</span> The contact details shown at the bottom of each policy modal (phone, email, Instagram) are pulled from <span className="text-brand-orange font-semibold">Admin → Settings</span>. Update them there to reflect across all policies automatically.
        </p>
      </div>

      {/* Policy cards */}
      <div className="space-y-4">
        {policies.map((policy) => {
          const p        = getPolicy(policy.id);
          const isOpen   = expanded[policy.id] ?? true;
          const changed  = hasChanges(policy.id);

          return (
            <div key={policy.id}
              className="rounded-2xl overflow-hidden transition-colors duration-300"
              style={{
                background: tk.cardBg,
                border: `1px solid ${changed ? 'rgba(188,61,62,0.4)' : tk.border}`,
              }}>

              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b"
                style={{ borderColor: tk.border }}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Collapse toggle */}
                  <button
                    onClick={() => setExpanded(prev => ({ ...prev, [policy.id]: !isOpen }))}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                    style={{ background: tk.cardBgHover, color: tk.textMuted }}>
                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {/* Editable title inline */}
                  <input
                    className="flex-1 bg-transparent text-sm font-semibold outline-none min-w-0"
                    style={{ fontFamily: '"Raleway", sans-serif', color: tk.textPrimary }}
                    value={p.title}
                    onChange={e => setLocal(policy.id, { title: e.target.value })}
                    placeholder="Policy title"
                  />

                  {changed && <Badge label="Unsaved" color="orange" />}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  {/* Visibility toggle */}
                  <button
                    onClick={() => toggleActive(policy)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      color: policy.is_active ? '#4ade80' : tk.textMuted,
                      fontFamily: '"Raleway", sans-serif',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = tk.cardBgHover}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
                    {policy.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
                    {policy.is_active ? 'Visible' : 'Hidden'}
                  </button>

                  {/* Save */}
                  <AdminBtn
                    icon={<Save size={13} />}
                    loading={saving === policy.id}
                    onClick={() => handleSave(policy.id)}
                    disabled={!changed}
                    variant={changed ? 'primary' : 'secondary'}
                    className="text-xs py-1.5 px-3"
                  >
                    Save
                  </AdminBtn>
                </div>
              </div>

              {/* Collapsible content */}
              {isOpen && (
                <div className="p-5 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-widest mb-4"
                    style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.15em', color: tk.textMuted }}>
                    Policy Points — {p.content.length} item{p.content.length !== 1 ? 's' : ''}
                  </p>

                  {p.content.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      {/* Up/Down */}
                      <div className="flex flex-col gap-0.5 flex-shrink-0 mt-2">
                        <button onClick={() => moveBullet(policy.id, idx, 'up')}
                          disabled={idx === 0}
                          className="w-5 h-5 rounded flex items-center justify-center transition-colors disabled:opacity-20"
                          style={{ color: tk.textMuted }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = tk.cardBgHover}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
                          <ChevronUp size={11} />
                        </button>
                        <button onClick={() => moveBullet(policy.id, idx, 'down')}
                          disabled={idx === p.content.length - 1}
                          className="w-5 h-5 rounded flex items-center justify-center transition-colors disabled:opacity-20"
                          style={{ color: tk.textMuted }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = tk.cardBgHover}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
                          <ChevronDown size={11} />
                        </button>
                      </div>

                      {/* Bullet number */}
                      <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-2.5"
                        style={{ background: 'rgba(188,61,62,0.12)', color: '#bc3d3e', fontFamily: '"Raleway", sans-serif' }}>
                        {idx + 1}
                      </span>

                      {/* Text input */}
                      <textarea
                        rows={2}
                        className={`${inputCls} flex-1 resize-none text-sm`}
                        style={{ ...is, lineHeight: '1.6' }}
                        value={bullet}
                        onChange={e => updateBullet(policy.id, idx, e.target.value)}
                        placeholder="Enter policy point…"
                      />

                      {/* Delete */}
                      <button
                        onClick={() => removeBullet(policy.id, idx)}
                        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all mt-1"
                        style={{ color: tk.textMuted }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = tk.textMuted; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                        title="Remove point">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                  {/* Add point */}
                  <button
                    onClick={() => addBullet(policy.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all mt-2"
                    style={{
                      border: `1px dashed ${tk.borderMed}`,
                      color: tk.textMuted,
                      fontFamily: '"Raleway", sans-serif',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#bc3d3e'; (e.currentTarget as HTMLButtonElement).style.color = '#bc3d3e'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = tk.borderMed; (e.currentTarget as HTMLButtonElement).style.color = tk.textMuted; }}>
                    <Plus size={14} /> Add Policy Point
                  </button>

                  {/* Save reminder when there are changes */}
                  {changed && (
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl mt-2"
                      style={{ background: 'rgba(188,61,62,0.06)', border: '1px solid rgba(188,61,62,0.2)' }}>
                      <p className="text-xs" style={{ fontFamily: '"Raleway", sans-serif', color: '#fca5a5' }}>
                        You have unsaved changes in this policy
                      </p>
                      <AdminBtn
                        icon={<Save size={13} />}
                        loading={saving === policy.id}
                        onClick={() => handleSave(policy.id)}
                        className="text-xs py-1.5 px-3">
                        Save Now
                      </AdminBtn>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
};

export default AdminPolicies;
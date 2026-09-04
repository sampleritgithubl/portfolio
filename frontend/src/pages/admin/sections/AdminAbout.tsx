import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { FiSave, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { usePortfolio, API_BASE } from '../../../context/PortfolioContext';
import type { PersonalInfo } from '../../../context/PortfolioContext';

export default function AdminAbout() {
  const { data, updateDataLocally, refreshData } = usePortfolio();
  const [form, setForm] = useState<PersonalInfo>({ ...data.personalInfo });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/api/admin/portfolio/personalInfo`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        throw new Error('Failed to update personal info on backend.');
      }

      updateDataLocally({ personalInfo: form });
      showToast('success', 'About & Profile information updated successfully!');
      refreshData();
    } catch (err: any) {
      showToast('error', err.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-panel-card">
      <div className="admin-card-header">
        <div>
          <h3 className="admin-card-heading">Edit Personal & About Info</h3>
          <p className="admin-card-desc">Update your name, bio, job titles, social links, and key showcase stats.</p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={handleSubmit}
          disabled={saving}
        >
          <FiSave size={16} />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === 'success' ? <FiCheck size={18} /> : <FiAlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="admin-form-grid" style={{ marginBottom: '24px' }}>
          <div className="admin-field">
            <label className="admin-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="admin-input"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Hero Title / Role</label>
            <input
              type="text"
              name="title"
              className="admin-input"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Subtitle / University</label>
            <input
              type="text"
              name="subtitle"
              className="admin-input"
              value={form.subtitle}
              onChange={handleChange}
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Availability Status</label>
            <input
              type="text"
              name="status"
              className="admin-input"
              value={form.status}
              onChange={handleChange}
              placeholder="e.g. AVAILABLE FOR HIRE"
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="admin-input"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Phone Number</label>
            <input
              type="text"
              name="phone"
              className="admin-input"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Location</label>
            <input
              type="text"
              name="location"
              className="admin-input"
              value={form.location}
              onChange={handleChange}
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">GitHub URL</label>
            <input
              type="url"
              name="github"
              className="admin-input"
              value={form.github}
              onChange={handleChange}
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">LinkedIn URL</label>
            <input
              type="url"
              name="linkedin"
              className="admin-input"
              value={form.linkedin}
              onChange={handleChange}
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Twitter / X URL</label>
            <input
              type="url"
              name="twitter"
              className="admin-input"
              value={form.twitter}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Stats Badges */}
        <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
          <div style={{ fontWeight: '600', marginBottom: '14px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--admin-cyan)' }}>
            Key Showcase Stats
          </div>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-label">Experience Badge</label>
              <input
                type="text"
                name="experience"
                className="admin-input"
                value={form.experience}
                onChange={handleChange}
                placeholder="e.g. Undergrad"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Projects Count Badge</label>
              <input
                type="text"
                name="projects"
                className="admin-input"
                value={form.projects}
                onChange={handleChange}
                placeholder="e.g. 10+"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Certifications Count Badge</label>
              <input
                type="text"
                name="certifications"
                className="admin-input"
                value={form.certifications}
                onChange={handleChange}
                placeholder="e.g. 6+"
              />
            </div>
          </div>
        </div>

        {/* Bio Textarea */}
        <div className="admin-field" style={{ marginBottom: '24px' }}>
          <label className="admin-label">Full Bio / About Description</label>
          <textarea
            name="bio"
            className="admin-textarea"
            style={{ minHeight: '130px' }}
            value={form.bio}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={saving}
          >
            <FiSave size={16} />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

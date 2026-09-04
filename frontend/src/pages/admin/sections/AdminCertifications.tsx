import { useState } from 'react';
import type { FormEvent } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import { usePortfolio, API_BASE } from '../../../context/PortfolioContext';
import type { Certification } from '../../../context/PortfolioContext';

export default function AdminCertifications() {
  const { data, updateDataLocally, refreshData } = usePortfolio();
  const [certs, setCerts] = useState<Certification[]>(data.certifications || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState<Partial<Certification>>({
    title: '',
    issuer: '',
    date: '2024',
    color: '#00d4ff',
    icon: '📜',
    credentialId: '',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop'
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const openAddModal = () => {
    setEditingCert(null);
    setFormData({
      title: '',
      issuer: '',
      date: new Date().getFullYear().toString(),
      color: '#00d4ff',
      icon: '📜',
      credentialId: '',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cert: Certification) => {
    setEditingCert(cert);
    setFormData({ ...cert });
    setIsModalOpen(true);
  };

  const saveCertsToBackend = async (updatedList: Certification[]) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/api/admin/portfolio/certifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedList)
      });

      if (!res.ok) throw new Error('Failed to update certifications');

      setCerts(updatedList);
      updateDataLocally({ certifications: updatedList });
      showToast('success', 'Certifications updated successfully!');
      refreshData();
    } catch (err: any) {
      showToast('error', err.message || 'Error saving certifications');
    } finally {
      setSaving(false);
    }
  };

  const handleModalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    let updatedList: Certification[];

    if (editingCert) {
      updatedList = certs.map((c) =>
        c.id === editingCert.id ? ({ ...formData, id: editingCert.id } as Certification) : c
      );
    } else {
      const newCert = {
        ...formData,
        id: Date.now()
      } as Certification;
      updatedList = [newCert, ...certs];
    }

    await saveCertsToBackend(updatedList);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this certification?')) return;
    const filtered = certs.filter((c) => c.id !== id);
    await saveCertsToBackend(filtered);
  };

  return (
    <div className="admin-panel-card">
      <div className="admin-card-header">
        <div>
          <h3 className="admin-card-heading">Certifications & Credentials ({certs.length})</h3>
          <p className="admin-card-desc">Showcase verified certificates and professional badges.</p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={openAddModal}>
          <FiPlus size={16} />
          <span>Add Certification</span>
        </button>
      </div>

      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === 'success' ? <FiCheck size={18} /> : <FiAlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Icon</th>
              <th>Title</th>
              <th>Issuer</th>
              <th>Year</th>
              <th>Credential ID</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {certs.map((cert) => (
              <tr key={cert.id}>
                <td style={{ fontSize: '22px' }}>{cert.icon || '📜'}</td>
                <td>
                  <div style={{ fontWeight: '600', color: '#fff' }}>{cert.title}</div>
                </td>
                <td>
                  <span style={{ color: cert.color || 'var(--admin-text-main)', fontWeight: '500' }}>
                    {cert.issuer}
                  </span>
                </td>
                <td>{cert.date}</td>
                <td>
                  <code style={{ fontSize: '11px', color: 'var(--admin-text-muted)', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>
                    {cert.credentialId || 'N/A'}
                  </code>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      className="admin-btn admin-btn-outline"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                      onClick={() => openEditModal(cert)}
                    >
                      <FiEdit2 size={13} />
                    </button>
                    <button
                      className="admin-btn admin-btn-danger"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                      onClick={() => handleDelete(cert.id)}
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="admin-card-header">
              <h3 className="admin-card-heading">
                {editingCert ? 'Edit Certification' : 'Add New Certification'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit}>
              <div className="admin-form-grid" style={{ marginBottom: '18px' }}>
                <div className="admin-field">
                  <label className="admin-label">Certification Title</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label">Issuer Organization</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. AWS, Google Cloud, Meta"
                    value={formData.issuer || ''}
                    onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label">Year / Date</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label">Icon (Emoji or Symbol)</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="☁️, 🔷, 📱, 🧠, 🍃"
                    value={formData.icon || ''}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label">Credential ID</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="AWS-SAA-2024-001"
                    value={formData.credentialId || ''}
                    onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label">Accent Color</label>
                  <input
                    type="color"
                    className="admin-input"
                    style={{ height: '44px', padding: '4px' }}
                    value={formData.color || '#00d4ff'}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-field" style={{ marginBottom: '24px' }}>
                <label className="admin-label">Image or Certificate URL</label>
                <input
                  type="url"
                  className="admin-input"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : (editingCert ? 'Update Certification' : 'Create Certification')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

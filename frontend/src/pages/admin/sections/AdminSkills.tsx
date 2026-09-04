import { useState } from 'react';
import type { FormEvent } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import { usePortfolio, API_BASE } from '../../../context/PortfolioContext';
import type { Skill } from '../../../context/PortfolioContext';

export default function AdminSkills() {
  const { data, updateDataLocally, refreshData } = usePortfolio();
  const [skills, setSkills] = useState<Skill[]>(data.skills || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<{ index: number; skill: Skill } | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState<Skill>({
    name: '',
    level: 85,
    category: 'Frontend',
    color: '#00d4ff'
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const openAddModal = () => {
    setEditingSkill(null);
    setFormData({
      name: '',
      level: 80,
      category: 'Frontend',
      color: '#00d4ff'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (skill: Skill, index: number) => {
    setEditingSkill({ index, skill });
    setFormData({ ...skill });
    setIsModalOpen(true);
  };

  const saveSkillsToBackend = async (updatedList: Skill[]) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/api/admin/portfolio/skills`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedList)
      });

      if (!res.ok) throw new Error('Failed to update skills');

      setSkills(updatedList);
      updateDataLocally({ skills: updatedList });
      showToast('success', 'Skills updated successfully!');
      refreshData();
    } catch (err: any) {
      showToast('error', err.message || 'Error saving skills');
    } finally {
      setSaving(false);
    }
  };

  const handleModalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    let updatedList: Skill[];

    if (editingSkill !== null) {
      updatedList = [...skills];
      updatedList[editingSkill.index] = formData;
    } else {
      updatedList = [formData, ...skills];
    }

    await saveSkillsToBackend(updatedList);
    setIsModalOpen(false);
  };

  const handleDelete = async (index: number) => {
    if (!window.confirm(`Delete skill "${skills[index].name}"?`)) return;
    const filtered = skills.filter((_, i) => i !== index);
    await saveSkillsToBackend(filtered);
  };

  return (
    <div className="admin-panel-card">
      <div className="admin-card-header">
        <div>
          <h3 className="admin-card-heading">Technical Skills ({skills.length})</h3>
          <p className="admin-card-desc">Configure your technical proficiency levels and categories.</p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={openAddModal}>
          <FiPlus size={16} />
          <span>Add Skill</span>
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
              <th>Skill Name</th>
              <th>Category</th>
              <th style={{ width: '220px' }}>Proficiency Level</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((s, idx) => (
              <tr key={idx}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color || '#00d4ff' }} />
                    <span style={{ fontWeight: '600', color: '#fff' }}>{s.name}</span>
                  </div>
                </td>
                <td>
                  <span className="admin-badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--admin-text-main)' }}>
                    {s.category}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${s.level}%`, height: '100%', background: s.color || '#00d4ff', borderRadius: '10px' }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', width: '36px', textAlign: 'right' }}>
                      {s.level}%
                    </span>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      className="admin-btn admin-btn-outline"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                      onClick={() => openEditModal(s, idx)}
                    >
                      <FiEdit2 size={13} />
                    </button>
                    <button
                      className="admin-btn admin-btn-danger"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                      onClick={() => handleDelete(idx)}
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
                {editingSkill ? 'Edit Skill' : 'Add New Skill'}
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
              <div className="admin-form-grid" style={{ marginBottom: '20px' }}>
                <div className="admin-field">
                  <label className="admin-label">Skill Name</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label">Category</label>
                  <select
                    className="admin-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Database">Database</option>
                    <option value="Mobile">Mobile</option>
                    <option value="AI/ML">AI / ML</option>
                    <option value="DevOps">DevOps</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-grid" style={{ marginBottom: '24px' }}>
                <div className="admin-field">
                  <label className="admin-label">Proficiency Level ({formData.level}%)</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                    style={{ width: '100%', marginTop: '10px' }}
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label">Accent Color</label>
                  <input
                    type="color"
                    className="admin-input"
                    style={{ height: '44px', padding: '4px' }}
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
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
                  {saving ? 'Saving...' : (editingSkill ? 'Update Skill' : 'Create Skill')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import type { FormEvent } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import { usePortfolio, API_BASE } from '../../../context/PortfolioContext';
import type { Project } from '../../../context/PortfolioContext';

export default function AdminProjects() {
  const { data, updateDataLocally, refreshData } = usePortfolio();
  const [projects, setProjects] = useState<Project[]>(data.projects || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    description: '',
    image: '',
    tech: [],
    github: '',
    live: '',
    category: 'Full Stack',
    color: '#00d4ff',
    featured: false
  });
  const [techInput, setTechInput] = useState('');

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const openAddModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&h=400&fit=crop',
      tech: ['React', 'Node.js', 'TypeScript'],
      github: 'https://github.com/sampleritgithubl',
      live: '#',
      category: 'Full Stack',
      color: '#00d4ff',
      featured: true
    });
    setTechInput('React, Node.js, TypeScript');
    setIsModalOpen(true);
  };

  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    setFormData({ ...proj });
    setTechInput(proj.tech ? proj.tech.join(', ') : '');
    setIsModalOpen(true);
  };

  const saveProjectsToBackend = async (updatedList: Project[]) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/api/admin/portfolio/projects`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedList)
      });

      if (!res.ok) throw new Error('Failed to update projects on server');

      setProjects(updatedList);
      updateDataLocally({ projects: updatedList });
      showToast('success', 'Projects updated successfully!');
      refreshData();
    } catch (err: any) {
      showToast('error', err.message || 'Error saving projects');
    } finally {
      setSaving(false);
    }
  };

  const handleModalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const techArray = techInput.split(',').map((t) => t.trim()).filter(Boolean);

    let updatedList: Project[];

    if (editingProject) {
      updatedList = projects.map((p) =>
        p.id === editingProject.id
          ? ({ ...formData, id: editingProject.id, tech: techArray } as Project)
          : p
      );
    } else {
      const newId = Date.now();
      const newProj = {
        ...formData,
        id: newId,
        tech: techArray
      } as Project;
      updatedList = [newProj, ...projects];
    }

    await saveProjectsToBackend(updatedList);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    const filtered = projects.filter((p) => p.id !== id);
    await saveProjectsToBackend(filtered);
  };

  return (
    <div className="admin-panel-card">
      <div className="admin-card-header">
        <div>
          <h3 className="admin-card-heading">Manage Projects ({projects.length})</h3>
          <p className="admin-card-desc">Add, edit, or delete showcased portfolio projects.</p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={openAddModal}>
          <FiPlus size={16} />
          <span>Add Project</span>
        </button>
      </div>

      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === 'success' ? <FiCheck size={18} /> : <FiAlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Projects List */}
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Preview</th>
              <th>Title</th>
              <th>Category</th>
              <th>Tech Stack</th>
              <th>Featured</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((proj) => (
              <tr key={proj.id}>
                <td>
                  <img
                    src={proj.image}
                    alt={proj.title}
                    style={{ width: '60px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'; }}
                  />
                </td>
                <td>
                  <div style={{ fontWeight: '600', color: '#fff', fontSize: '14.5px' }}>{proj.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {proj.description}
                  </div>
                </td>
                <td>
                  <span className="admin-badge" style={{ background: 'rgba(0, 212, 255, 0.1)', color: '#00d4ff', border: '1px solid rgba(0, 212, 255, 0.25)' }}>
                    {proj.category}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '240px' }}>
                    {proj.tech?.slice(0, 3).map((t, idx) => (
                      <span key={idx} style={{ fontSize: '11px', background: 'rgba(255,255,255,0.06)', padding: '2px 7px', borderRadius: '4px' }}>
                        {t}
                      </span>
                    ))}
                    {(proj.tech?.length || 0) > 3 && (
                      <span style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>+{proj.tech.length - 3}</span>
                    )}
                  </div>
                </td>
                <td>
                  {proj.featured ? (
                    <span style={{ color: '#22c55e', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiCheck /> Yes
                    </span>
                  ) : (
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '12px' }}>No</span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      className="admin-btn admin-btn-outline"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                      onClick={() => openEditModal(proj)}
                      title="Edit project"
                    >
                      <FiEdit2 size={13} />
                    </button>
                    <button
                      className="admin-btn admin-btn-danger"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                      onClick={() => handleDelete(proj.id)}
                      title="Delete project"
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
                {editingProject ? 'Edit Project' : 'Add New Project'}
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
                  <label className="admin-label">Project Title</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label">Category</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. AI / Full Stack, Mobile"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
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

                <div className="admin-field">
                  <label className="admin-label">Featured Status</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '44px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.featured)}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '13.5px' }}>Feature on homepage priority</span>
                  </label>
                </div>
              </div>

              <div className="admin-field" style={{ marginBottom: '18px' }}>
                <label className="admin-label">Cover Image URL</label>
                <input
                  type="url"
                  className="admin-input"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  required
                />
              </div>

              <div className="admin-field" style={{ marginBottom: '18px' }}>
                <label className="admin-label">Technologies (comma-separated)</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="React, Node.js, MongoDB, TypeScript"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-grid" style={{ marginBottom: '18px' }}>
                <div className="admin-field">
                  <label className="admin-label">GitHub Repository URL</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.github || ''}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label">Live Demo URL</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.live || ''}
                    onChange={(e) => setFormData({ ...formData, live: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-field" style={{ marginBottom: '24px' }}>
                <label className="admin-label">Description</label>
                <textarea
                  className="admin-textarea"
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
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
                  {saving ? 'Saving...' : (editingProject ? 'Update Project' : 'Create Project')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

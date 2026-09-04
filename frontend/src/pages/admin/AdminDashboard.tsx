import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiUser,
  FiFolder,
  FiAward,
  FiCode,
  FiMail,
  FiLogOut,
  FiExternalLink,
  FiMenu,
  FiX
} from 'react-icons/fi';
import AdminOverview from './sections/AdminOverview';
import AdminAbout from './sections/AdminAbout';
import AdminProjects from './sections/AdminProjects';
import AdminCertifications from './sections/AdminCertifications';
import AdminSkills from './sections/AdminSkills';
import AdminMessages from './sections/AdminMessages';
import { API_BASE } from '../../context/PortfolioContext';
import './Admin.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'about' | 'projects' | 'certifications' | 'skills' | 'messages'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Protect route
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }

    // Verify token with backend
    fetch(`${API_BASE}/api/admin/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login', { replace: true });
        }
      })
      .catch(() => {
        // Backend offline or unreachable: keep token in local storage
      });
  }, [navigate]);

  // Fetch unread count for sidebar badge
  useEffect(() => {
    const fetchCount = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/api/admin/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const list = await res.json();
          setUnreadCount(list.filter((m: any) => !m.read).length);
        }
      } catch (e) {}
    };
    fetchCount();
  }, [activeTab]);

  const handleLogout = () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      fetch(`${API_BASE}/api/admin/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    localStorage.removeItem('adminToken');
    navigate('/admin/login', { replace: true });
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: FiGrid },
    { id: 'about', label: 'Profile & About', icon: FiUser },
    { id: 'projects', label: 'Projects', icon: FiFolder },
    { id: 'certifications', label: 'Certifications', icon: FiAward },
    { id: 'skills', label: 'Skills & Tech', icon: FiCode },
    { id: 'messages', label: 'Inquiries / Inbox', icon: FiMail, badge: unreadCount > 0 ? unreadCount : null },
  ];

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-brand">
          <div className="admin-brand-title">
            <span style={{ color: 'var(--admin-cyan)' }}>&lt;</span>
            Kavindu Admin
            <span style={{ color: 'var(--admin-cyan)' }}>/&gt;</span>
          </div>
          <button
            className="admin-mobile-toggle"
            onClick={() => setSidebarOpen(false)}
            style={{ display: sidebarOpen ? 'block' : 'none' }}
          >
            <FiX size={20} />
          </button>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setSidebarOpen(false);
                }}
              >
                <Icon />
                <span>{item.label}</span>
                {item.badge && <span className="admin-nav-badge">{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn-outline"
            style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', fontSize: '13px' }}
          >
            <FiExternalLink size={14} />
            <span>View Live Site</span>
          </a>
          <button className="admin-btn-logout" onClick={handleLogout}>
            <FiLogOut size={14} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              className="admin-mobile-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FiMenu />
            </button>
            <h2 className="admin-topbar-title">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h2>
          </div>

          <div className="admin-topbar-actions">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn admin-btn-outline"
              style={{ fontSize: '12px', padding: '6px 14px', textDecoration: 'none' }}
            >
              <FiExternalLink size={13} />
              <span>Preview Portfolio</span>
            </a>
          </div>
        </header>

        <main className="admin-content-inner">
          {activeTab === 'overview' && <AdminOverview onNavigate={(t) => setActiveTab(t as any)} />}
          {activeTab === 'about' && <AdminAbout />}
          {activeTab === 'projects' && <AdminProjects />}
          {activeTab === 'certifications' && <AdminCertifications />}
          {activeTab === 'skills' && <AdminSkills />}
          {activeTab === 'messages' && <AdminMessages />}
        </main>
      </div>
    </div>
  );
}

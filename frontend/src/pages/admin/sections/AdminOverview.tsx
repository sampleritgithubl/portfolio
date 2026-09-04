import { useState, useEffect } from 'react';
import { FiFolder, FiAward, FiCode, FiMail, FiArrowRight } from 'react-icons/fi';
import { usePortfolio, API_BASE } from '../../../context/PortfolioContext';

interface AdminOverviewProps {
  onNavigate: (tab: string) => void;
}

export default function AdminOverview({ onNavigate }: AdminOverviewProps) {
  const { data } = usePortfolio();
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/api/admin/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const list = await res.json();
          setMessages(list);
          setUnreadCount(list.filter((m: any) => !m.read).length);
        }
      } catch (e) {
        console.error('Failed to load messages for overview', e);
      }
    };
    fetchMessages();
  }, []);

  return (
    <div>
      {/* Quick Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card" onClick={() => onNavigate('projects')} style={{ cursor: 'pointer' }}>
          <div className="admin-stat-icon" style={{ background: 'rgba(0, 212, 255, 0.1)', color: '#00d4ff' }}>
            <FiFolder />
          </div>
          <div>
            <div className="admin-stat-val" style={{ color: '#00d4ff' }}>{data.projects.length}</div>
            <div className="admin-stat-lbl">Active Projects</div>
          </div>
        </div>

        <div className="admin-stat-card" onClick={() => onNavigate('certifications')} style={{ cursor: 'pointer' }}>
          <div className="admin-stat-icon" style={{ background: 'rgba(255, 153, 0, 0.1)', color: '#ff9900' }}>
            <FiAward />
          </div>
          <div>
            <div className="admin-stat-val" style={{ color: '#ff9900' }}>{data.certifications.length}</div>
            <div className="admin-stat-lbl">Certifications</div>
          </div>
        </div>

        <div className="admin-stat-card" onClick={() => onNavigate('skills')} style={{ cursor: 'pointer' }}>
          <div className="admin-stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <FiCode />
          </div>
          <div>
            <div className="admin-stat-val" style={{ color: '#8b5cf6' }}>{data.skills.length}</div>
            <div className="admin-stat-lbl">Skills Listed</div>
          </div>
        </div>

        <div className="admin-stat-card" onClick={() => onNavigate('messages')} style={{ cursor: 'pointer' }}>
          <div className="admin-stat-icon" style={{ background: unreadCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.1)', color: unreadCount > 0 ? '#ef4444' : '#22c55e' }}>
            <FiMail />
          </div>
          <div>
            <div className="admin-stat-val" style={{ color: unreadCount > 0 ? '#ef4444' : '#22c55e' }}>
              {unreadCount} <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--admin-text-muted)' }}>/ {messages.length}</span>
            </div>
            <div className="admin-stat-lbl">Unread Inquiries</div>
          </div>
        </div>
      </div>

      {/* Quick Summary Card */}
      <div className="admin-panel-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-heading">Welcome to your Portfolio CMS</h3>
            <p className="admin-card-desc">Quickly control your public portfolio content, projects, and incoming inquiries.</p>
          </div>
          <button className="admin-btn admin-btn-outline" onClick={() => window.open('/', '_blank')}>
            View Public Site
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
            <div style={{ fontWeight: '600', marginBottom: '8px', color: '#fff' }}>👤 Personal Info</div>
            <p style={{ fontSize: '13px', color: 'var(--admin-text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
              Name: <strong>{data.personalInfo.name}</strong><br />
              Title: {data.personalInfo.title}<br />
              Location: {data.personalInfo.location}
            </p>
            <button className="admin-btn admin-btn-outline" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={() => onNavigate('about')}>
              Edit Profile <FiArrowRight size={14} />
            </button>
          </div>

          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
            <div style={{ fontWeight: '600', marginBottom: '8px', color: '#fff' }}>🚀 Latest Projects</div>
            <p style={{ fontSize: '13px', color: 'var(--admin-text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
              {data.projects.slice(0, 3).map(p => p.title).join(', ')}...
            </p>
            <button className="admin-btn admin-btn-outline" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={() => onNavigate('projects')}>
              Manage Projects <FiArrowRight size={14} />
            </button>
          </div>

          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
            <div style={{ fontWeight: '600', marginBottom: '8px', color: '#fff' }}>📬 Contact Form Messages</div>
            <p style={{ fontSize: '13px', color: 'var(--admin-text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
              {messages.length === 0 ? 'No messages received yet.' : `${messages.length} inquiries received from potential clients.`}
            </p>
            <button className="admin-btn admin-btn-outline" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={() => onNavigate('messages')}>
              Open Inbox <FiArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import {
  FiFolder,
  FiAward,
  FiCode,
  FiMail,
  FiArrowRight,
  FiDownload,
  FiUploadCloud,
  FiRefreshCw,
  FiDatabase,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo
} from 'react-icons/fi';
import { usePortfolio, API_BASE } from '../../../context/PortfolioContext';

interface AdminOverviewProps {
  onNavigate: (tab: string) => void;
}

export default function AdminOverview({ onNavigate }: AdminOverviewProps) {
  const { data, resetToDefaults, importData } = usePortfolio();
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [storageStatus, setStorageStatus] = useState<{
    database?: string;
    databaseConnected?: boolean;
    cloudinaryConfigured?: boolean;
  }>({});
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const fetchStatus = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/api/admin/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setStorageStatus(json);
        }
      } catch (e) {
        console.error('Failed to load storage status', e);
      }
    };

    fetchMessages();
    fetchStatus();
  }, []);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setImporting(true);
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Invalid JSON file');
        }
        await importData(parsed);
        alert('✅ Portfolio backup successfully imported and synced!');
      } catch (err: any) {
        alert(`❌ Import failed: ${err.message}`);
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const isPermanent = storageStatus.databaseConnected === true;

  return (
    <div>
      {/* Permanent Storage Status Banner */}
      <div
        className="admin-panel-card"
        style={{
          marginBottom: '20px',
          background: isPermanent ? 'rgba(34, 197, 94, 0.08)' : 'rgba(234, 179, 8, 0.08)',
          border: `1px solid ${isPermanent ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                background: isPermanent ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                color: isPermanent ? '#22c55e' : '#eab308'
              }}
            >
              <FiDatabase />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isPermanent ? (
                  <>
                    <FiCheckCircle color="#22c55e" /> MongoDB Atlas Cloud: Connected (Permanent 24/7 Storage)
                  </>
                ) : (
                  <>
                    <FiAlertTriangle color="#eab308" /> Cloud Storage Status: Local / Render Ephemeral Mode
                  </>
                )}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--admin-text-muted)', margin: '4px 0 0', lineHeight: 1.5 }}>
                {isPermanent
                  ? 'All changes and uploaded images are permanently stored in MongoDB Atlas and will never be reset when Render restarts.'
                  : 'Render free tier resets local files after 15 min of inactivity. Add MONGODB_URI to Render Environment Variables for permanent 24/7 cloud persistence.'}
              </p>
            </div>
          </div>
          {!isPermanent && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', background: 'rgba(234, 179, 8, 0.15)', color: '#facc15', padding: '6px 12px', borderRadius: '6px' }}>
                💡 Tip: Set MONGODB_URI in Render
              </span>
            </div>
          )}
        </div>
      </div>

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

      {/* Data Security, Export & Import Card */}
      <div className="admin-panel-card" style={{ marginTop: '24px' }}>
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-heading">Data Backup & Instant Restore</h3>
            <p className="admin-card-desc">Download a complete backup of your portfolio data (JSON) or restore anytime with one click.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={() => {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <FiDownload size={14} />
              Export Backup (JSON)
            </button>

            <button
              type="button"
              className="admin-btn admin-btn-outline"
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
            >
              <FiUploadCloud size={14} />
              {importing ? 'Importing...' : 'Import Backup (JSON)'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImportFile}
            />

            <button
              type="button"
              className="admin-btn admin-btn-danger"
              onClick={() => {
                if (window.confirm('Reset all changes and restore original default data?')) {
                  resetToDefaults();
                  alert('Portfolio data reset to defaults.');
                }
              }}
            >
              <FiRefreshCw size={14} />
              Reset to Defaults
            </button>
          </div>
        </div>

        <div style={{ marginTop: '14px', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '13px', color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiInfo size={16} color="#00d4ff" />
          <span>
            <strong>Pro Tip:</strong> After customizing your projects and images, click <strong>"Export Backup (JSON)"</strong> to save a local copy of your portfolio. You can restore it anytime with <strong>"Import Backup"</strong>!
          </span>
        </div>
      </div>
    </div>
  );
}


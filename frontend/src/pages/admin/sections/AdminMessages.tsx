import { useState, useEffect } from 'react';
import { FiMail, FiTrash2, FiCheck, FiSearch, FiX, FiAlertCircle } from 'react-icons/fi';
import { API_BASE } from '../../../context/PortfolioContext';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [search, setSearch] = useState('');
  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchMessages = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err: any) {
      showToast('error', 'Failed to fetch inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const toggleReadStatus = async (id: string, currentRead: boolean) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_BASE}/api/admin/messages/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ read: !currentRead })
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, read: !currentRead } : m))
        );
        if (activeMessage && activeMessage.id === id) {
          setActiveMessage((prev) => (prev ? { ...prev, read: !currentRead } : null));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this message permanently?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_BASE}/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (activeMessage && activeMessage.id === id) {
          setActiveMessage(null);
        }
        showToast('success', 'Message deleted.');
      }
    } catch (e) {
      showToast('error', 'Failed to delete message.');
    }
  };

  const openMessageModal = (msg: ContactMessage) => {
    setActiveMessage(msg);
    if (!msg.read) {
      toggleReadStatus(msg.id, false);
    }
  };

  // Filter & Search Logic
  const filteredMessages = messages.filter((m) => {
    if (filter === 'unread' && m.read) return false;
    if (filter === 'read' && !m.read) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="admin-panel-card">
      <div className="admin-card-header">
        <div>
          <h3 className="admin-card-heading">
            Inbox & Messages ({messages.length})
            {unreadCount > 0 && (
              <span className="admin-nav-badge" style={{ marginLeft: '10px' }}>
                {unreadCount} new
              </span>
            )}
          </h3>
          <p className="admin-card-desc">Messages submitted by visitors and clients through your contact form.</p>
        </div>
        <button className="admin-btn admin-btn-outline" onClick={fetchMessages}>
          Refresh
        </button>
      </div>

      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === 'success' ? <FiCheck size={18} /> : <FiAlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <FiSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
          <input
            type="text"
            className="admin-input"
            style={{ paddingLeft: '40px' }}
            placeholder="Search by sender, email, or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className={`admin-btn ${filter === 'all' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: '12.5px' }}
            onClick={() => setFilter('all')}
          >
            All ({messages.length})
          </button>
          <button
            className={`admin-btn ${filter === 'unread' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: '12.5px' }}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
          <button
            className={`admin-btn ${filter === 'read' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: '12.5px' }}
            onClick={() => setFilter('read')}
          >
            Read ({messages.length - unreadCount})
          </button>
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
          Loading messages...
        </div>
      ) : filteredMessages.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
          <FiMail size={36} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>No messages found in this view.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: msg.read ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 212, 255, 0.05)',
                border: `1px solid ${msg.read ? 'var(--admin-border)' : 'rgba(0, 212, 255, 0.3)'}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                gap: '16px',
                flexWrap: 'wrap'
              }}
              onClick={() => openMessageModal(msg)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '240px' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: msg.read ? 'transparent' : '#ef4444',
                    border: msg.read ? '2px solid rgba(255,255,255,0.2)' : 'none',
                    flexShrink: 0
                  }}
                  title={msg.read ? 'Read' : 'Unread'}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '600', color: '#fff', fontSize: '14.5px' }}>{msg.name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--admin-cyan)' }}>{msg.email}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--admin-text-main)', marginTop: '2px', fontWeight: msg.read ? 'normal' : '600' }}>
                    {msg.subject}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)', marginTop: '2px', maxWidth: '480px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {msg.message}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--admin-text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleReadStatus(msg.id, msg.read);
                  }}
                  title={msg.read ? 'Mark as Unread' : 'Mark as Read'}
                >
                  <FiCheck size={14} color={msg.read ? '#22c55e' : 'inherit'} />
                </button>

                <button
                  type="button"
                  className="admin-btn admin-btn-danger"
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(msg.id);
                  }}
                  title="Delete message"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Modal Detail View */}
      {activeMessage && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-heading">{activeMessage.subject}</h3>
                <div style={{ fontSize: '12.5px', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                  Received on {new Date(activeMessage.createdAt).toLocaleString()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveMessage(null)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <FiX size={20} />
              </button>
            </div>

            <div style={{ padding: '16px 0', borderBottom: '1px solid var(--admin-border)', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '13.5px' }}>
                <div>
                  <span style={{ color: 'var(--admin-text-muted)' }}>From: </span>
                  <strong style={{ color: '#fff' }}>{activeMessage.name}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--admin-text-muted)' }}>Reply-To: </span>
                  <a href={`mailto:${activeMessage.email}`} style={{ color: 'var(--admin-cyan)', textDecoration: 'none' }}>
                    {activeMessage.email}
                  </a>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--admin-text-muted)', letterSpacing: '0.08em', marginBottom: '8px' }}>
                Message Body
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--admin-border)', borderRadius: '10px', padding: '20px', lineHeight: '1.7', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                {activeMessage.message}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={() => handleDelete(activeMessage.id)}
              >
                <FiTrash2 size={14} /> Delete
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href={`mailto:${activeMessage.email}?subject=Re: ${encodeURIComponent(activeMessage.subject)}`}
                  className="admin-btn admin-btn-primary"
                  style={{ textDecoration: 'none' }}
                >
                  <FiMail size={14} /> Reply by Email
                </a>
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={() => setActiveMessage(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

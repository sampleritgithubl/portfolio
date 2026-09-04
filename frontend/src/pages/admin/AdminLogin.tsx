import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiArrowRight, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { API_BASE } from '../../context/PortfolioContext';
import './Admin.css';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // If already logged in, redirect immediately
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid password');
      }

      // Store auth token
      localStorage.setItem('adminToken', data.token);
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-badge">
            <FiLock size={14} />
            <span>PORTFOLIO ADMIN</span>
          </div>
          <h1 className="admin-login-title">Welcome Back</h1>
          <p className="admin-login-subtitle">
            Enter your secret admin key to manage your live portfolio
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#ef4444',
              fontSize: '13.5px',
              marginBottom: '20px'
            }}>
              <FiAlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="admin-field" style={{ marginBottom: '24px' }}>
            <label className="admin-label">Master Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="admin-input"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
                style={{ paddingRight: '46px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--admin-text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
          >
            {loading ? 'Authenticating...' : (
              <>
                <span>Access Dashboard</span>
                <FiArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '28px', textAlign: 'center' }}>
          <a
            href="/"
            style={{
              color: 'var(--admin-text-muted)',
              fontSize: '13px',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--admin-text-muted)')}
          >
            ← Back to Portfolio Site
          </a>
        </div>
      </div>
    </div>
  );
}

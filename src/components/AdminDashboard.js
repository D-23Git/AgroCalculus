import React, { useState, useEffect } from 'react';
import api from '../utils/apiService';

const AdminDashboard = ({ onNavigate, onLogout, profile }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      const token = localStorage.getItem('agro_token');
      const data = await api.getAnalytics(token);
      if (data.error || data.msg) {
        setError(data.msg || data.error);
      } else {
        setStats(data);
      }
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  const timeAgo = (dateStr) => {
    if (!dateStr) return 'N/A';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      fontFamily: "'Inter', sans-serif",
      color: 'white',
      padding: '0'
    }}>
      {/* TOP NAV */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '16px 30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>🛡️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '1px' }}>AgroCalculus</div>
            <div style={{ fontSize: '0.7rem', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '2px' }}>Super Admin Control Panel</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            background: 'rgba(167,139,250,0.2)',
            border: '1px solid rgba(167,139,250,0.4)',
            borderRadius: '20px',
            padding: '6px 14px',
            fontSize: '0.82rem'
          }}>
            👑 {profile?.name || 'Super Admin'}
          </div>
          <button onClick={() => onNavigate('home')} style={{
            background: 'rgba(16,185,129,0.2)',
            border: '1px solid rgba(16,185,129,0.4)',
            color: '#34d399',
            borderRadius: '8px',
            padding: '7px 14px',
            cursor: 'pointer',
            fontSize: '0.82rem'
          }}>🌿 Go to App</button>
          <button onClick={onLogout} style={{
            background: 'rgba(239,68,68,0.2)',
            border: '1px solid rgba(239,68,68,0.4)',
            color: '#f87171',
            borderRadius: '8px',
            padding: '7px 14px',
            cursor: 'pointer',
            fontSize: '0.82rem'
          }}>🚪 Logout</button>
        </div>
      </div>

      <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* WELCOME */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
            Analytics Dashboard 📊
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '6px 0 0', fontSize: '0.9rem' }}>
            Real-time insights into AgroCalculus platform usage. Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⚡</div>
            <div style={{ color: 'rgba(255,255,255,0.6)' }}>Fetching live analytics...</div>
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '12px',
            padding: '20px',
            color: '#f87171',
            textAlign: 'center'
          }}>
            ⚠️ {error}
            <br />
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '8px', display: 'block' }}>
              Make sure the backend is running and you have re-logged in after the latest changes.
            </span>
          </div>
        )}

        {stats && (
          <>
            {/* STAT CARDS */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {[
                { icon: '👥', label: 'Total Users', value: stats.totalUsers, color: '#6366f1', glow: 'rgba(99,102,241,0.3)' },
                { icon: '🕐', label: 'Recent Logins', value: stats.recentLogins?.length || 0, color: '#10b981', glow: 'rgba(16,185,129,0.3)' },
                { icon: '👑', label: 'Super Admins', value: stats.superAdmins || 1, color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
                { icon: '🌱', label: 'Farmers', value: (stats.totalUsers || 0) - (stats.superAdmins || 0), color: '#34d399', glow: 'rgba(52,211,153,0.3)' },
              ].map((card, i) => (
                <div key={i} style={{
                  background: `linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))`,
                  border: `1px solid ${card.color}40`,
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: `0 8px 32px ${card.glow}`,
                  transition: 'transform 0.2s',
                  cursor: 'default'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{card.icon}</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: card.color }}>{card.value}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '4px' }}>{card.label}</div>
                </div>
              ))}
            </div>

            {/* RECENT LOGINS TABLE */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '1.3rem' }}>🕵️</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Recent Activity</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>Last 10 users who logged in</div>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                      {['#', 'Name', 'Email / Mobile', 'Role', 'Last Login'].map(h => (
                        <th key={h} style={{
                          textAlign: 'left',
                          padding: '12px 20px',
                          color: 'rgba(255,255,255,0.4)',
                          fontWeight: 600,
                          fontSize: '0.78rem',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          borderBottom: '1px solid rgba(255,255,255,0.06)'
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentLogins?.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                          No recent logins yet. Be the first! 🌱
                        </td>
                      </tr>
                    )}
                    {stats.recentLogins?.map((u, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>{i + 1}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name || '—'}</div>
                        </td>
                        <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                          {u.email?.includes('fake_e_') ? '—' : (u.email || u.mobile || '—')}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{
                            background: u.role === 'superadmin' ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.2)',
                            color: u.role === 'superadmin' ? '#f59e0b' : '#818cf8',
                            border: `1px solid ${u.role === 'superadmin' ? '#f59e0b50' : '#818cf850'}`,
                            borderRadius: '20px',
                            padding: '3px 10px',
                            fontSize: '0.75rem',
                            textTransform: 'capitalize'
                          }}>
                            {u.role === 'superadmin' ? '👑 ' : '🌿 '}{u.role || 'farmer'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                          {timeAgo(u.lastLogin)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => onNavigate('market')} style={{
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.4)',
                color: '#34d399',
                borderRadius: '10px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}>🏪 Mandi Hub</button>
              <button onClick={() => onNavigate('village')} style={{
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.4)',
                color: '#818cf8',
                borderRadius: '10px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}>🏘️ Village Connect</button>
              <button onClick={() => onNavigate('schemes')} style={{
                background: 'rgba(245,158,11,0.15)',
                border: '1px solid rgba(245,158,11,0.4)',
                color: '#fbbf24',
                borderRadius: '10px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}>📋 Schemes Hub</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

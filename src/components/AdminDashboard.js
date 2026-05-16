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
            background: 'rgba(245,158,11,0.2)',
            border: '1px solid rgba(245,158,11,0.4)',
            color: '#fbbf24',
            borderRadius: '20px',
            padding: '6px 14px',
            fontSize: '0.82rem',
            fontWeight: 600
          }}>
            👑 अॅडमिन: {profile?.name || 'Admin'}
          </div>
          <button onClick={() => onNavigate('home')} style={{
            background: 'rgba(16,185,129,0.2)',
            border: '1px solid rgba(16,185,129,0.4)',
            color: '#34d399',
            borderRadius: '8px',
            padding: '7px 14px',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 600
          }}>🌿 Go to App</button>
          <button onClick={onLogout} style={{
            background: 'rgba(239,68,68,0.2)',
            border: '1px solid rgba(239,68,68,0.4)',
            color: '#f87171',
            borderRadius: '8px',
            padding: '7px 14px',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 600
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
            Real-time insights into AgroCalculus platform usage.
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
          </div>
        )}

        {stats && (
          <>
            {/* STAT CARDS */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {[
                { icon: '🌍', label: 'Total Registrations', value: stats.totalUsers, color: '#6366f1', glow: 'rgba(99,102,241,0.2)' },
                { icon: '🌾', label: 'Registered Farmers', value: stats.farmers || 0, color: '#10b981', glow: 'rgba(16,185,129,0.2)' },
                { icon: '🏪', label: 'Mandi Officers', value: stats.officers || 0, color: '#818cf8', glow: 'rgba(129,140,248,0.2)' },
                { icon: '👑', label: 'Super Admins', value: stats.superAdmins || 0, color: '#f59e0b', glow: 'rgba(245,158,11,0.2)' },
              ].map((card, i) => (
                <div key={i} style={{
                  background: `rgba(255,255,255,0.05)`,
                  border: `1px solid ${card.color}30`,
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: `0 10px 40px ${card.glow}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ fontSize: '2.4rem', fontWeight: 900, color: card.color }}>{card.value}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: 600, marginTop: '2px' }}>{card.label}</div>
                  <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', fontSize: '4rem', opacity: 0.1 }}>{card.icon}</div>
                </div>
              ))}
            </div>

            {/* RECENT LOGINS TABLE */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}>
              <div style={{
                padding: '24px 30px',
                background: 'rgba(255,255,255,0.02)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '1.5rem' }}>🕵️</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Platform Activity Log</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>Live tracking of recent user logins</div>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                      {['#', 'User Identity', 'Contact Info', 'Account Type', 'Activity'].map(h => (
                        <th key={h} style={{
                          textAlign: 'left',
                          padding: '16px 30px',
                          color: 'rgba(255,255,255,0.4)',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '1.5px'
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentLogins?.map((u, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '16px 30px', color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>{i + 1}</td>
                        <td style={{ padding: '16px 30px' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: u.role === 'superadmin' ? '#fbbf24' : 'white' }}>
                            {u.name || 'Anonymous User'}
                          </div>
                        </td>
                        <td style={{ padding: '16px 30px', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                          {u.email?.includes('fake_e_') ? '—' : (u.email || u.mobile || '—')}
                        </td>
                        <td style={{ padding: '16px 30px' }}>
                          <span style={{
                            background: u.role === 'superadmin' ? 'rgba(245,158,11,0.15)' : (u.role === 'officer' ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.15)'),
                            color: u.role === 'superadmin' ? '#f59e0b' : (u.role === 'officer' ? '#818cf8' : '#34d399'),
                            border: `1px solid ${u.role === 'superadmin' ? '#f59e0b40' : (u.role === 'officer' ? '#818cf840' : '#34d39940')}`,
                            borderRadius: '8px',
                            padding: '4px 12px',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            {u.accountType || (u.role === 'superadmin' ? 'अॅडमिन' : 'शेतकरी')}
                          </span>
                        </td>
                        <td style={{ padding: '16px 30px', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                          Logged in {timeAgo(u.lastLogin)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

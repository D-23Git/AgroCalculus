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

  const UserTable = ({ title, users, icon, color }) => (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${color}30`,
      borderRadius: '20px',
      overflow: 'hidden',
      flex: 1,
      minWidth: '350px'
    }}>
      <div style={{ padding: '20px', background: `${color}10`, borderBottom: `1px solid ${color}20`, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
        <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.5px' }}>{title} ({users?.length || 0})</span>
      </div>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {(!users || users.length === 0) ? (
              <tr><td style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>No records found</td></tr>
            ) : (
              users.map((u, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{u.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                      {u.email?.includes('fake_e_') ? 'Mobile User' : (u.email || u.mobile || '—')}
                    </div>
                  </td>
                  <td style={{ padding: '15px 20px', textAlign: 'right', verticalAlign: 'middle' }}>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{timeAgo(u.lastLogin)}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a14',
      fontFamily: "'Inter', sans-serif",
      color: 'white',
      padding: '0'
    }}>
      {/* TOP NAV */}
      <div style={{
        background: 'rgba(15,15,25,0.8)',
        backdropFilter: 'blur(30px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '16px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🛡️</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.5px' }}>AgroCalculus</div>
            <div style={{ fontSize: '0.65rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>Central Intelligence</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ padding: '8px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.85rem', fontWeight: 600 }}>
            👑 {profile?.name || 'Admin'}
          </div>
          <button onClick={() => onNavigate('home')} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>🌿 Go to App</button>
          <button onClick={onLogout} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>Logout</button>
        </div>
      </div>

      <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* STATS */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            {[
              { label: 'Total Registrations', val: stats.totalUsers, color: '#6366f1', icon: '👥' },
              { label: 'Shetkari (Farmers)', val: stats.farmers, color: '#10b981', icon: '🌾' },
              { label: 'Mandai Prashak', val: stats.officers, color: '#8b5cf6', icon: '🏢' },
              { label: 'Super Admins', val: stats.superAdmins, color: '#f59e0b', icon: '👑' }
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}20`, borderRadius: '24px', padding: '30px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginTop: '5px' }}>{s.label}</div>
                <div style={{ position: 'absolute', right: '-15px', bottom: '-15px', fontSize: '5rem', opacity: 0.05 }}>{s.icon}</div>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '20px' }}>⚡</div>
            Initializing Data Streams...
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            <UserTable 
              title="Registered Shetkari" 
              users={stats?.recentLogins?.filter(u => u.role === 'farmer')} 
              icon="🌾" 
              color="#10b981" 
            />
            <UserTable 
              title="Mandai Prashak" 
              users={stats?.recentLogins?.filter(u => u.role === 'officer')} 
              icon="🏢" 
              color="#8b5cf6" 
            />
            <UserTable 
              title="Administrators" 
              users={stats?.recentLogins?.filter(u => u.role === 'superadmin')} 
              icon="👑" 
              color="#f59e0b" 
            />
          </div>
        )}

        {error && (
          <div style={{ marginTop: '30px', padding: '20px', borderRadius: '15px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center' }}>
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

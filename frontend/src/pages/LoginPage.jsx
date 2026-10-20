import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Zap, ShieldCheck } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('admin@robovault.edu');
  const [password, setPassword] = useState('Admin@123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (role) => {
    switch (role) {
      case 'ADMIN':
        setEmail('admin@robovault.edu');
        setPassword('Admin@123456');
        break;
      case 'LAB_ASSISTANT':
        setEmail('assistant@robovault.edu');
        setPassword('Assistant@123456');
        break;
      case 'FACULTY':
        setEmail('faculty@robovault.edu');
        setPassword('Faculty@123456');
        break;
      case 'STUDENT':
        setEmail('student@robovault.edu');
        setPassword('Student@123456');
        break;
      default:
        break;
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '14px', color: '#38bdf8', marginBottom: '12px' }}>
            <Zap size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>RoboVault Platform</h2>
          <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '4px' }}>
            Robotics Lab Asset, Checkout & Maintenance Security
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label>Academic / Institutional Email</label>
            <input
              type="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@robovault.edu"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '8px' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In with JWT'}
          </button>
        </form>

        {/* Demo Persona Quick-Fill */}
        <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '10px' }}>
            <ShieldCheck size={14} color="#38bdf8" />
            <span>Quick-Select Seed Personas:</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 8px' }} onClick={() => setDemoAccount('ADMIN')}>
              👑 Admin (Dr. Chen)
            </button>
            <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 8px' }} onClick={() => setDemoAccount('LAB_ASSISTANT')}>
              🔧 Lab Assistant
            </button>
            <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 8px' }} onClick={() => setDemoAccount('FACULTY')}>
              🎓 Faculty Supervisor
            </button>
            <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 8px' }} onClick={() => setDemoAccount('STUDENT')}>
              🚀 Student Researcher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

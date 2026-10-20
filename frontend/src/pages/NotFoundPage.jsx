import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        background: 'rgba(239, 68, 68, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        border: '1px solid rgba(239, 68, 68, 0.3)'
      }}>
        <Bot size={48} style={{ color: 'var(--danger)' }} />
      </div>

      <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
        404
      </div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 600, margin: '0.75rem 0 0.5rem 0', color: 'var(--text-primary)' }}>
        Hardware Register Not Found
      </h2>
      <p style={{ maxWidth: '420px', color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0 0 1.75rem 0' }}>
        The requested system path does not correspond to any active robotics assets, maintenance records, or platform controllers.
      </p>

      <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <ArrowLeft size={16} />
        <span>Return to Command Center</span>
      </Link>
    </div>
  );
}

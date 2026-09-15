import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { X, Lock, Mail, User, GraduationCap, Building2, Sparkles, AlertCircle } from 'lucide-react';
import '../styles/modal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultRole = 'renter' }) => {
  const { loginWithEmail, signUpWithEmail, loginWithGoogle, loginAsDemo, isSupabaseLive } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const res = await signUpWithEmail(email, name || email.split('@')[0], role, password);
        if (res.error) setError(res.error);
        else onClose();
      } else {
        const res = await loginWithEmail(email, password);
        if (res.error) setError(res.error);
        else onClose();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = (demoRole: 'student' | 'landlord') => {
    loginAsDemo(demoRole);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Header */}
        <div className="wizard-header" style={{ textAlign: 'center', paddingBottom: 16 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span className="badge badge-teal">
              {isSupabaseLive ? 'Supabase Database Connected' : 'Demo Auth Active'}
            </span>
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {isSignUp ? 'Create your HfxRentals Account' : 'Welcome to HfxRentals'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-400)', marginTop: 4 }}>
            {isSignUp
              ? 'Connect with verified Halifax landlords, sublets, and roommates.'
              : 'Sign in to access your saved viewings, favorites, and listings.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)' }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '12px',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: !isSignUp ? 'var(--teal-400)' : 'var(--slate-400)',
              borderBottom: !isSignUp ? '2px solid var(--teal-500)' : 'none',
              background: !isSignUp ? 'rgba(0, 168, 150, 0.08)' : 'transparent'
            }}
            onClick={() => { setIsSignUp(false); setError(null); }}
          >
            Sign In
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '12px',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: isSignUp ? 'var(--teal-400)' : 'var(--slate-400)',
              borderBottom: isSignUp ? '2px solid var(--teal-500)' : 'none',
              background: isSignUp ? 'rgba(0, 168, 150, 0.08)' : 'transparent'
            }}
            onClick={() => { setIsSignUp(true); setError(null); }}
          >
            Create Account
          </button>
        </div>

        <div className="wizard-body">
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Role selector on Signup */}
          {isSignUp && (
            <div>
              <label className="filter-label" style={{ marginBottom: 8, display: 'block' }}>
                I am primarily a:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div
                  className={`category-choice-card ${role === 'renter' || role === 'student' ? 'selected' : ''}`}
                  onClick={() => setRole('renter')}
                  style={{ padding: '12px', textAlign: 'center' }}
                >
                  <GraduationCap size={20} color="var(--teal-400)" style={{ margin: '0 auto 4px auto' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Student / Renter</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>Looking for flats & roommates</div>
                </div>

                <div
                  className={`category-choice-card ${role === 'landlord' ? 'selected' : ''}`}
                  onClick={() => setRole('landlord')}
                  style={{ padding: '12px', textAlign: 'center' }}
                >
                  <Building2 size={20} color="var(--amber-500)" style={{ margin: '0 auto 4px auto' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Landlord / Manager</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>Listing units & viewings</div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isSignUp && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="filter-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--slate-400)' }} />
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ paddingLeft: 38, width: '100%' }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="filter-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--slate-400)' }} />
                <input
                  type="email"
                  required
                  placeholder={isSignUp ? 'you@dal.ca or email' : 'you@example.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: 38, width: '100%' }}
                />
              </div>
              {isSignUp && (
                <span style={{ fontSize: '0.72rem', color: 'var(--teal-400)' }}>
                  Tip: Using @dal.ca or @smu.ca automatically awards a Verified Student badge!
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="filter-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--slate-400)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: 38, width: '100%' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: 6, padding: '12px', fontSize: '0.95rem' }}
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create Free Account' : 'Sign In'}
            </button>
          </form>

          {/* Social / Google Login */}
          <div style={{ textAlign: 'center', margin: '14px 0 6px 0', position: 'relative' }}>
            <span style={{ background: 'var(--navy-850)', padding: '0 10px', fontSize: '0.75rem', color: 'var(--slate-400)', position: 'relative', zIndex: 1 }}>
              or continue with
            </span>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--glass-border)', zIndex: 0 }} />
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => { loginWithGoogle(); onClose(); }}
            style={{ width: '100%', gap: 10 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Sign In with Google
          </button>

          {/* Quick Demo Logins for Testing */}
          <div style={{ background: 'rgba(244, 162, 97, 0.08)', border: '1px solid rgba(244, 162, 97, 0.25)', borderRadius: 'var(--radius-md)', padding: '12px', marginTop: 8 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--amber-500)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Sparkles size={13} />
              <span>Instant 1-Click Demo Profiles:</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px' }}
                onClick={() => handleDemo('student')}
              >
                🎓 Dalhousie Student
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px' }}
                onClick={() => handleDemo('landlord')}
              >
                🏢 South End Landlord
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, CheckCircle2, AlertCircle, Save, ShieldCheck, User } from 'lucide-react';
import '../styles/modal.css';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUsernameUpdated?: (newName: string) => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  onUsernameUpdated
}) => {
  const { user, updateUsername, checkUsernameAvailable } = useAuth();
  const [username, setUsername] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Real-time username availability validation
  const [isCheckingAvail, setIsCheckingAvail] = useState(false);
  const [availStatus, setAvailStatus] = useState<'idle' | 'same' | 'available' | 'taken' | 'invalid'>('same');
  const [availMsg, setAvailMsg] = useState('');

  useEffect(() => {
    if (user?.name) {
      setUsername(user.name);
      setAvailStatus('same');
    }
  }, [user?.name, isOpen]);

  // Debounced availability check
  useEffect(() => {
    const trimmed = username.trim();
    if (!user) return;

    if (!trimmed) {
      setAvailStatus('invalid');
      setAvailMsg('Username cannot be empty.');
      return;
    }

    if (trimmed.length < 3) {
      setAvailStatus('invalid');
      setAvailMsg('Username must be at least 3 characters.');
      return;
    }

    if (trimmed.toLowerCase() === user.name.toLowerCase()) {
      setAvailStatus('same');
      setAvailMsg('');
      setErrorMsg('');
      return;
    }

    setIsCheckingAvail(true);
    const timer = setTimeout(async () => {
      const res = await checkUsernameAvailable(trimmed);
      setIsCheckingAvail(false);
      if (res.available) {
        setAvailStatus('available');
        setAvailMsg(`"${trimmed}" is available!`);
        setErrorMsg('');
      } else {
        setAvailStatus('taken');
        setAvailMsg(res.error || `Username "${trimmed}" is already taken by another user.`);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username, user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmed = username.trim();
    if (!trimmed) {
      setErrorMsg('Username cannot be empty.');
      return;
    }

    if (availStatus === 'taken') {
      setErrorMsg(availMsg || 'This username is already taken. Please pick another one.');
      return;
    }

    setIsSaving(true);
    const res = await updateUsername(trimmed);
    setIsSaving(false);

    if (res.error) {
      setErrorMsg(res.error);
      setAvailStatus('taken');
      setAvailMsg(res.error);
    } else {
      setSuccessMsg(`Username successfully updated to "${trimmed}"!`);
      setAvailStatus('same');
      if (onUsernameUpdated) {
        onUsernameUpdated(trimmed);
      }
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close settings modal">
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ padding: '24px 28px 16px 28px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0, 168, 150, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-400)' }}>
              <User size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Account Profile Settings</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>
                Manage your public landlord or student credentials on HfxRentals.
              </p>
            </div>
          </div>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 28px' }}>
          {/* User Preview Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '12px 16px',
              background: 'var(--navy-800)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--glass-border)',
              marginBottom: 20
            }}
          >
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
              alt={user.name}
              style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--teal-500)' }}
            />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>{user.name}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                <span className="badge badge-teal" style={{ textTransform: 'capitalize', fontSize: '0.72rem' }}>
                  <ShieldCheck size={11} /> {user.role}
                </span>
                {user.universityAffiliation && (
                  <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                    🎓 {user.universityAffiliation}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontSize: '0.82rem', marginBottom: 16 }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ background: 'rgba(0, 168, 150, 0.15)', border: '1px solid rgba(0, 168, 150, 0.4)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--teal-300)', fontSize: '0.82rem', marginBottom: 16 }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Email Address (Permanently Locked / Non-Editable) */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--slate-300)' }}>
                Registered Email Address
              </label>
              <span style={{ fontSize: '0.72rem', color: 'var(--amber-400)', display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(244, 162, 97, 0.12)', padding: '2px 8px', borderRadius: '12px' }}>
                <Lock size={10} /> Locked & Verified
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                disabled
                readOnly
                value={user.email}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  paddingRight: '36px',
                  background: 'rgba(7, 19, 33, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--slate-400)',
                  fontSize: '0.88rem',
                  cursor: 'not-allowed'
                }}
              />
              <Lock
                size={15}
                color="var(--slate-500)"
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--slate-400)', marginTop: 5, lineHeight: 1.4 }}>
              🔒 Email address is permanently tied to your account for identity verification and lease compliance. It cannot be modified.
            </p>
          </div>

          {/* Username / Display Name (Editable) */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--slate-200)' }}>
                Public Display Name / Landlord Name
              </label>
              {isCheckingAvail && (
                <span style={{ fontSize: '0.72rem', color: 'var(--teal-300)' }}>
                  Checking availability...
                </span>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Sarah Jenkins, Robert MacLeod"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  paddingRight: '36px',
                  background: availStatus === 'taken' 
                    ? 'rgba(239, 68, 68, 0.08)' 
                    : availStatus === 'available' 
                    ? 'rgba(0, 168, 150, 0.08)' 
                    : 'var(--navy-900)',
                  border: availStatus === 'taken'
                    ? '1px solid #ef4444'
                    : availStatus === 'available'
                    ? '1px solid var(--teal-500)'
                    : '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color var(--transition-fast), background-color var(--transition-fast)'
                }}
              />
              <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                {availStatus === 'available' && <CheckCircle2 size={16} color="var(--teal-400)" />}
                {availStatus === 'taken' && <AlertCircle size={16} color="#ef4444" />}
              </div>
            </div>

            {/* Live Availability Status Callout */}
            {availStatus === 'taken' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f87171', fontSize: '0.74rem', marginTop: 6, fontWeight: 600 }}>
                <AlertCircle size={13} />
                <span>{availMsg}</span>
              </div>
            )}
            {availStatus === 'available' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--teal-300)', fontSize: '0.74rem', marginTop: 6, fontWeight: 600 }}>
                <CheckCircle2 size={13} />
                <span>{availMsg}</span>
              </div>
            )}

            <p style={{ fontSize: '0.74rem', color: 'var(--slate-400)', marginTop: 6, lineHeight: 1.4 }}>
              ✨ This name is shown as the Landlord / Lister on all your property postings, sublets, and inside private tenant chats. Usernames must be unique across the platform.
            </p>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--glass-border)', paddingTop: 16 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSaving}
              style={{ fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving || !username.trim() || availStatus === 'taken' || isCheckingAvail}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.85rem',
                opacity: (availStatus === 'taken' || isCheckingAvail) ? 0.6 : 1,
                cursor: (availStatus === 'taken' || isCheckingAvail) ? 'not-allowed' : 'pointer'
              }}
            >
              <Save size={15} />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

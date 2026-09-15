import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleResetCache = () => {
    try {
      localStorage.removeItem('hfx_local_rentals');
      localStorage.removeItem('hfx_local_sublets');
      localStorage.removeItem('hfx_user_profile');
    } catch (e) {
      console.warn('Could not clear localStorage:', e);
    }
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'linear-gradient(135deg, #071321 0%, #0d2137 100%)',
          color: '#ffffff',
          fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: 520,
            padding: '36px 28px',
            borderRadius: '16px',
            background: 'rgba(15, 30, 50, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
              margin: '0 auto 20px'
            }}>
              <AlertTriangle size={32} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '10px' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '24px', lineHeight: 1.5 }}>
              A temporary display error occurred while rendering the listing. Don't worry, you can easily reload or reset local data.
            </p>

            {this.state.error && (
              <pre style={{
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                color: '#fca5a5',
                overflowX: 'auto',
                textAlign: 'left',
                marginBottom: '24px',
                maxHeight: '140px'
              }}>
                {this.state.error.message}
              </pre>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  background: '#00a896',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={16} /> Reload Page
              </button>

              <button
                onClick={this.handleResetCache}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={16} /> Reset Local Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

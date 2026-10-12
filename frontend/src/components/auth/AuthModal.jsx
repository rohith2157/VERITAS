import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Building, 
  ShieldCheck, 
  GraduationCap, 
  KeyRound, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authMode, 
    setAuthMode, 
    login, 
    register, 
    quickLogin 
  } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [selectedRole, setSelectedRole] = useState('FACULTY'); // 'FACULTY' | 'STUDENT' | 'AUDITOR'

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useRef(null);
  const emailInputRef = useRef(null);

  useEffect(() => {
    if (authMode) {
      setActiveTab(authMode);
    }
    setErrorMessage('');
  }, [authMode, isAuthModalOpen]);

  useEffect(() => {
    if (isAuthModalOpen) {
      const timer = setTimeout(() => {
        emailInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isAuthModalOpen, activeTab]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (activeTab === 'login') {
        if (!email.trim()) {
          setErrorMessage('Please enter your institutional email address.');
          setIsSubmitting(false);
          return;
        }
        if (!password.trim()) {
          setErrorMessage('Please enter your password.');
          setIsSubmitting(false);
          return;
        }
        const user = login(email, password, selectedRole);
        showToast(`Welcome back, ${user.name}! Authenticated as ${user.roleLabel}.`, 'success');
      } else {
        if (!name.trim()) {
          setErrorMessage('Please enter your full name.');
          setIsSubmitting(false);
          return;
        }
        if (!email.trim() || !email.includes('@')) {
          setErrorMessage('Please enter a valid academic or institutional email.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters long.');
          setIsSubmitting(false);
          return;
        }
        const user = register({
          name: name.trim(),
          email: email.trim(),
          password,
          role: selectedRole,
          institution: institution.trim() || 'Veritas Academic Consortium'
        });
        showToast(`Account created! Welcome to Veritas, ${user.name}.`, 'success');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = (personaKey) => {
    const user = quickLogin(personaKey);
    const label = personaKey === 'faculty' ? 'Faculty Evaluator' : (personaKey === 'student' ? 'Graduate Candidate' : 'Auditor');
    showToast(`Quick Login active: ${user.name} (${label})`, 'info');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Veritas Authentication Portal"
      onClick={closeAuthModal}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100001,
        background: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 180ms cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          maxHeight: '92vh',
          background: 'var(--bg-card, #0c0c10)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 24,
          boxShadow: '0 28px 72px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(110, 231, 183, 0.25)',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Top Header & Close Button */}
        <div
          style={{
            padding: '24px 28px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: 'rgba(110, 231, 183, 0.03)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: 'rgba(110, 231, 183, 0.15)',
                  color: '#0d9488',
                  border: '1px solid rgba(110, 231, 183, 0.35)'
                }}
              >
                Zero-Trust Gateway
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--color-ash-gray)',
                  fontFamily: 'monospace'
                }}
              >
                v3.2 SHA-256
              </span>
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--color-bone-white)',
                fontFamily: "var(--font-ppneuemontreal, sans-serif)"
              }}
            >
              {activeTab === 'login' ? 'Sign In to Veritas Node' : 'Create Academic Account'}
            </h2>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 13,
                color: 'var(--color-ash-gray)',
                lineHeight: 1.4
              }}
            >
              {activeTab === 'login'
                ? 'Access forensic evaluation records and cryptographic ledgers.'
                : 'Join the institutional consortium for verified originality.'}
            </p>
          </div>

          <button
            onClick={closeAuthModal}
            aria-label="Close authentication modal"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-ash-gray)',
              padding: 6,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div style={{ padding: '16px 28px 0' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              padding: 4,
              gap: 4
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setAuthMode('login');
                setErrorMessage('');
              }}
              style={{
                padding: '9px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.18s ease',
                background: activeTab === 'login' ? 'linear-gradient(135deg, #67e8f9 0%, #6ee7b7 50%, #bef264 100%)' : 'transparent',
                color: activeTab === 'login' ? '#041316' : 'var(--color-ash-gray)',
                boxShadow: activeTab === 'login' ? '0 2px 14px rgba(110, 231, 183, 0.45)' : 'none'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setAuthMode('register');
                setErrorMessage('');
              }}
              style={{
                padding: '9px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.18s ease',
                background: activeTab === 'register' ? 'linear-gradient(135deg, #67e8f9 0%, #6ee7b7 50%, #bef264 100%)' : 'transparent',
                color: activeTab === 'register' ? '#041316' : 'var(--color-ash-gray)',
                boxShadow: activeTab === 'register' ? '0 2px 14px rgba(110, 231, 183, 0.45)' : 'none'
              }}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '18px 28px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Error Banner */}
          {errorMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: 12
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Role Selector */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--color-silver-mist)',
                marginBottom: 6
              }}
            >
              Institutional Role
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedRole('FACULTY')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 12px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: selectedRole === 'FACULTY' 
                    ? '1px solid #34d399' 
                    : '1px solid var(--border-subtle)',
                  background: selectedRole === 'FACULTY' 
                    ? 'rgba(52, 211, 153, 0.14)' 
                    : 'var(--bg-main)',
                  color: selectedRole === 'FACULTY' ? 'var(--color-bone-white)' : 'var(--color-ash-gray)',
                  transition: 'all 0.15s ease'
                }}
              >
                <ShieldCheck size={14} color={selectedRole === 'FACULTY' ? '#34d399' : 'var(--color-ash-gray)'} />
                <span>Faculty Evaluator</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('STUDENT')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 12px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: selectedRole === 'STUDENT' 
                    ? '1px solid var(--color-saffron-spark)' 
                    : '1px solid var(--border-subtle)',
                  background: selectedRole === 'STUDENT' 
                    ? 'rgba(255, 184, 41, 0.14)' 
                    : 'var(--bg-main)',
                  color: selectedRole === 'STUDENT' ? 'var(--color-bone-white)' : 'var(--color-ash-gray)',
                  transition: 'all 0.15s ease'
                }}
              >
                <GraduationCap size={14} color={selectedRole === 'STUDENT' ? 'var(--color-saffron-spark)' : 'var(--color-ash-gray)'} />
                <span>Student / Scholar</span>
              </button>
            </div>
          </div>

          {/* Name Field (Register Only) */}
          {activeTab === 'register' && (
            <div>
              <label
                htmlFor="auth-fullname"
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--color-silver-mist)',
                  marginBottom: 6
                }}
              >
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="var(--color-ash-gray)" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  id="auth-fullname"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Prof. David Miller or Ananya Sharma"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: 10,
                    border: '1px solid var(--input-border)',
                    background: 'var(--input-bg)',
                    color: 'var(--color-bone-white)',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label
              htmlFor="auth-email"
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--color-silver-mist)',
                marginBottom: 6
              }}
            >
              Academic Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="var(--color-ash-gray)" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                id="auth-email"
                ref={emailInputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu or faculty@veritas.edu"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: 10,
                  border: '1px solid var(--input-border)',
                  background: 'var(--input-bg)',
                  color: 'var(--color-bone-white)',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="auth-password"
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--color-silver-mist)',
                marginBottom: 6
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="var(--color-ash-gray)" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (any password for demo)"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: 10,
                  border: '1px solid var(--input-border)',
                  background: 'var(--input-bg)',
                  color: 'var(--color-bone-white)',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Institution Field (Register Only) */}
          {activeTab === 'register' && (
            <div>
              <label
                htmlFor="auth-institution"
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--color-silver-mist)',
                  marginBottom: 6
                }}
              >
                Affiliated Institution / Department
              </label>
              <div style={{ position: 'relative' }}>
                <Building size={15} color="var(--color-ash-gray)" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  id="auth-institution"
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. National Institute of Technology or Stanford"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: 10,
                    border: '1px solid var(--input-border)',
                    background: 'var(--input-bg)',
                    color: 'var(--color-bone-white)',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: 6,
              padding: '12px 16px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #67e8f9 0%, #6ee7b7 50%, #bef264 100%)',
              color: '#041316',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 20px rgba(110, 231, 183, 0.45), 0 0 14px rgba(103, 232, 249, 0.35)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <span>{activeTab === 'login' ? 'Sign In to Node' : 'Create & Verify Account'}</span>
            <ArrowRight size={15} color="#041316" />
          </button>
        </form>

        {/* 1-Click Demo Profiles Footer */}
        <div
          style={{
            padding: '16px 28px 22px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 10
            }}
          >
            <Sparkles size={13} color="var(--color-saffron-spark)" />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-silver-mist)'
              }}
            >
              1-Click Demo Profiles
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8
            }}
          >
            {/* Faculty Persona */}
            <button
              type="button"
              onClick={() => handleQuickDemo('faculty')}
              style={{
                padding: '8px 10px',
                borderRadius: 10,
                background: 'rgba(103, 232, 249, 0.08)',
                border: '1px solid rgba(103, 232, 249, 0.28)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-bone-white)' }}>
                Dr. Evelyn
              </span>
              <span style={{ fontSize: 9.5, color: '#0d9488', textTransform: 'uppercase', fontWeight: 600 }}>
                Faculty Evaluator
              </span>
            </button>

            {/* Student Persona */}
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              style={{
                padding: '8px 10px',
                borderRadius: 10,
                background: 'rgba(255, 184, 41, 0.08)',
                border: '1px solid rgba(255, 184, 41, 0.25)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-bone-white)' }}>
                Arjun Patel
              </span>
              <span style={{ fontSize: 9.5, color: 'var(--color-saffron-spark)', textTransform: 'uppercase', fontWeight: 600 }}>
                Candidate
              </span>
            </button>

            {/* Auditor Persona */}
            <button
              type="button"
              onClick={() => handleQuickDemo('auditor')}
              style={{
                padding: '8px 10px',
                borderRadius: 10,
                background: 'rgba(21, 132, 110, 0.08)',
                border: '1px solid rgba(21, 132, 110, 0.25)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-bone-white)' }}>
                Marcus Vance
              </span>
              <span style={{ fontSize: 9.5, color: 'var(--color-deep-verdant)', textTransform: 'uppercase', fontWeight: 600 }}>
                Ledger Auditor
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


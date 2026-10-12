import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const DEMO_USERS = {
  faculty: {
    id: 'usr_fac_01',
    name: 'Dr. Evelyn Chen',
    email: 'evelyn.chen@veritas.edu',
    role: 'FACULTY',
    roleLabel: 'Faculty Evaluator & Ombudsman',
    department: 'Computer Science & AI Forensics',
    institution: 'Veritas Academic Consortium',
    badge: 'UGC DAIP Fellow',
    initials: 'EC'
  },
  student: {
    id: 'usr_stu_01',
    name: 'Arjun Patel',
    email: 'arjun.p@cs.university.edu',
    role: 'STUDENT',
    roleLabel: 'Graduate Candidate',
    department: 'Distributed Systems & Security',
    institution: 'National University',
    badge: 'Verified Submitter',
    initials: 'AP'
  },
  auditor: {
    id: 'usr_aud_01',
    name: 'Marcus Vance',
    email: 'marcus.v@veritas.ledger',
    role: 'AUDITOR',
    roleLabel: 'Ledger Node Principal',
    department: 'Cryptographic Provenance',
    institution: 'National Academic Depository',
    badge: 'Consensus Validator',
    initials: 'MV'
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('veritas_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  useEffect(() => {
    if (user) {
      localStorage.setItem('veritas_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('veritas_auth_user');
    }
  }, [user]);

  const login = (email, password, role = 'FACULTY') => {
    // Check against demo credentials or generate authenticated session
    let matched = Object.values(DEMO_USERS).find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    if (!matched) {
      const name = (email || '').split('@')[0].replace(/[._]/g, ' ') || 'Academic User';
      matched = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: email || 'user@veritas.edu',
        role: role || 'FACULTY',
        roleLabel: role === 'STUDENT' ? 'Student Researcher' : 'Faculty Evaluator',
        department: 'Academic Faculty',
        institution: 'Institutional Node',
        badge: 'Verified Member',
        initials: (name.charAt(0) || 'U').toUpperCase()
      };
    }
    setUser(matched);
    setIsAuthModalOpen(false);
    return matched;
  };

  const register = ({ name, email, password, role = 'STUDENT', institution = 'University' }) => {
    const initials = name
      .split(' ')
      .filter(Boolean)
      .map(p => p[0].toUpperCase())
      .slice(0, 2)
      .join('') || 'U';

    const newUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: name || 'New Scholar',
      email: email || 'scholar@veritas.edu',
      role: role || 'STUDENT',
      roleLabel: role === 'FACULTY' ? 'Faculty Evaluator' : 'Student Researcher',
      department: 'Department of Computing',
      institution: institution || 'Veritas Consortium',
      badge: 'New Account',
      initials: initials
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
    return newUser;
  };

  const quickLogin = (type = 'faculty') => {
    const demo = DEMO_USERS[type] || DEMO_USERS.faculty;
    setUser(demo);
    setIsAuthModalOpen(false);
    return demo;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('veritas_auth_user');
  };

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authMode,
        login,
        register,
        quickLogin,
        logout,
        openAuthModal,
        closeAuthModal,
        setAuthMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

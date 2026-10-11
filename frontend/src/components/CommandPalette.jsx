import React, { useState, useEffect, useRef } from 'react';
import { Search, Compass, Shield, Users, Terminal, BookOpen, Zap, Moon, Sun, X, ChevronRight, Lock } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function CommandPalette({ isOpen, onClose, onNavigate, onToggleTheme, isDark }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const { showToast } = useToast();

  const commands = [
    {
      id: 'nav-dashboard',
      category: 'Navigation',
      title: 'Go to Operations Dashboard',
      subtitle: 'Real-time cohort monitoring and KPI metrics',
      icon: Compass,
      action: () => onNavigate('dashboard')
    },
    {
      id: 'nav-studio',
      category: 'Navigation',
      title: 'Go to Universal Studio',
      subtitle: 'Dual-pane diff, stylometry writeprints, and AST clone inspector',
      icon: Shield,
      action: () => onNavigate('studio')
    },
    {
      id: 'nav-classroom',
      category: 'Navigation',
      title: 'Go to Classroom Portal',
      subtitle: 'Student submissions, UGC 2018 grading, and Merkle seals',
      icon: Users,
      action: () => onNavigate('classroom')
    },
    {
      id: 'nav-demobench',
      category: 'Navigation',
      title: 'Go to Demo Bench',
      subtitle: 'Instant presentation benchmark tests for professors',
      icon: Zap,
      action: () => onNavigate('demobench')
    },
    {
      id: 'nav-dev',
      category: 'Navigation',
      title: 'Go to Developer Workstation',
      subtitle: '7-Agent matrix telemetry and interactive API wire playground',
      icon: Terminal,
      action: () => onNavigate('dev')
    },
    {
      id: 'nav-manifesto',
      category: 'Navigation',
      title: 'Back to Veritas Manifesto',
      subtitle: 'WebGL constellation landing page and academic integrity vision',
      icon: BookOpen,
      action: () => onNavigate('manifesto')
    },
    {
      id: 'act-homoglyph',
      category: 'Forensics',
      title: 'Run Homoglyph Evasion Test',
      subtitle: 'Sanitize Cyrillic homoglyphs and strip zero-width characters',
      icon: Shield,
      action: () => {
        onNavigate('demobench');
        showToast('Navigated to Demo Bench: Running Homoglyph Evasion scenario', 'info');
      }
    },
    {
      id: 'act-collusion',
      category: 'Forensics',
      title: 'Check Peer Collusion Matrix',
      subtitle: 'Detect Patient Zero and trace collusion flow across cohort',
      icon: Users,
      action: () => {
        onNavigate('demobench');
        showToast('Navigated to Demo Bench: Running Peer Collusion matrix', 'info');
      }
    },
    {
      id: 'act-merkle',
      category: 'Cryptographic Ledger',
      title: 'Inspect Cryptographic Merkle Ledger',
      subtitle: 'Verify immutable SHA-256 binary tree audit trail',
      icon: Lock,
      action: () => {
        onNavigate('classroom');
        showToast('Navigated to Classroom Portal: Inspecting Merkle Seals', 'success');
      }
    },
    {
      id: 'act-theme',
      category: 'Preferences',
      title: isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme',
      subtitle: 'Toggle global void canvas color theme',
      icon: isDark ? Sun : Moon,
      action: () => {
        if (onToggleTheme) onToggleTheme();
        showToast(`Theme switched to ${isDark ? 'Light' : 'Dark'} mode`, 'info');
      }
    }
  ];

  const filtered = commands.filter((cmd) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.subtitle.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Global Ctrl+K / Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onNavigate(null, true); // Trigger open
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNavigate]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Universal Command Palette"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        animation: 'fadeIn 180ms ease'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 600,
          background: 'var(--color-void)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 20,
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(128, 82, 255, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            gap: 12
          }}
        >
          <Search size={18} color="var(--color-ash-gray)" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search actions... (Esc to exit)"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--color-bone-white)',
              fontSize: 15,
              fontFamily: 'inherit'
            }}
          />
          <span
            style={{
              fontSize: 11,
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '2px 8px',
              borderRadius: 6,
              color: 'var(--color-ash-gray)',
              fontFamily: 'var(--font-mono)'
            }}
          >
            ESC
          </span>
        </div>

        {/* Action Results List */}
        <div
          ref={listRef}
          style={{
            maxHeight: 380,
            overflowY: 'auto',
            padding: '8px'
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--color-ash-gray)', fontSize: 14 }}>
              No commands found matching "{query}"
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              const IconComp = cmd.icon;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(128, 82, 255, 0.12)' : 'transparent',
                    border: isSelected ? '1px solid rgba(128, 82, 255, 0.35)' : '1px solid transparent',
                    transition: 'all 120ms ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: isSelected ? 'rgba(128, 82, 255, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSelected ? 'var(--color-electric-iris)' : 'var(--color-silver-mist)'
                      }}
                    >
                      <IconComp size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-bone-white)' }}>
                        {cmd.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-ash-gray)', fontWeight: 300 }}>
                        {cmd.subtitle}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontSize: 10,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--color-ash-gray)',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {cmd.category}
                    </span>
                    <ChevronRight size={14} color="var(--color-ash-gray)" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 18px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(255, 255, 255, 0.02)',
            fontSize: 11,
            color: 'var(--color-ash-gray)',
            fontFamily: 'var(--font-mono)'
          }}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <span>Veritas Command Palette</span>
        </div>
      </div>
    </div>
  );
}


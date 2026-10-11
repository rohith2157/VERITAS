import React, { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, serverStatus, theme = 'dark', toggleTheme }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { id: 'manifesto', label: 'MANIFESTO' },
    { id: 'dashboard', label: 'DASHBOARD' },
    { id: 'studio', label: 'STUDIO' },
    { id: 'classroom', label: 'CLASSROOM' },
    { id: 'demobench', label: 'BENCHMARK' },
    { id: 'dev', label: 'DEV' },
  ];

  return (
    <>
      <style>{`
        .veritas-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 16px 40px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          background: rgba(0, 0, 0, 0.75);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .veritas-nav-link {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.35px;
          text-transform: uppercase;
          font-family: var(--font-ppneuemontreal, 'PPNeueMontreal', -apple-system, sans-serif);
          color: var(--color-ash-gray);
          padding: 6px 0;
          position: relative;
          transition: color 0.2s ease, transform 0.2s ease;
          display: inline-flex;
          align-items: center;
          text-decoration: none;
        }
        .veritas-nav-link:hover {
          color: var(--color-bone-white) !important;
          transform: translateY(-1px);
        }
        .veritas-nav-link.is-active {
          color: var(--color-bone-white) !important;
        }
        .veritas-nav-indicator {
          position: absolute;
          bottom: -3px;
          left: 0;
          right: 0;
          height: 1.5px;
          background-color: var(--color-bone-white);
          border-radius: 1px;
        }
        .veritas-theme-toggle {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-ash-gray);
          transition: color 0.2s ease, transform 0.2s ease;
        }
        .veritas-theme-toggle:hover {
          color: var(--color-bone-white);
          transform: scale(1.08);
        }
        @media (max-width: 860px) {
          .veritas-navbar {
            padding: 14px 24px;
          }
          .veritas-nav-links {
            gap: 20px !important;
          }
        }
        @media (max-width: 680px) {
          .veritas-nav-links {
            display: none !important;
          }
          .veritas-mobile-toggle {
            display: flex !important;
          }
        }
        .veritas-mobile-toggle {
          display: none;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: var(--color-bone-white);
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          align-items: center;
          justify-content: center;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .veritas-mobile-toggle:hover {
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.05);
        }
        .veritas-mobile-drawer {
          position: fixed;
          top: 68px;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 24px 32px 32px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 999;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
          animation: veritas-drawer-slide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes veritas-drawer-slide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .veritas-mobile-drawer-link {
          background: none;
          border: none;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: var(--color-ash-gray);
          padding: 12px 0;
          cursor: pointer;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: color 0.2s ease;
        }
        .veritas-mobile-drawer-link:hover,
        .veritas-mobile-drawer-link.is-active {
          color: var(--color-bone-white);
        }
      `}</style>

      <header
        className="veritas-navbar"
        style={{
          backgroundColor: isScrolled
            ? (theme === 'dark' ? 'rgba(10, 11, 16, 0.72)' : 'rgba(255, 255, 255, 0.8)')
            : 'transparent',
          backdropFilter: isScrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(16px)' : 'none',
          borderBottom: isScrolled
            ? (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)')
            : '1px solid transparent',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--page-max-width, 1440px)',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {/* Far Left: Stylized Geometric Mark + Wordmark "Veritas" */}
          <div
            onClick={() => setActiveTab('manifesto')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              userSelect: 'none',
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setActiveTab('manifesto');
            }}
            aria-label="Veritas Home"
          >
            {/* Geometric Faceted Mosaic Mark with Veritas gradient */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <linearGradient id="veritas-nav-grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8052ff" />
                  <stop offset="100%" stopColor="#15846e" />
                </linearGradient>
                <linearGradient id="veritas-nav-grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8052ff" />
                  <stop offset="100%" stopColor="#9e7bff" />
                </linearGradient>
                <linearGradient id="veritas-nav-grad3" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#15846e" />
                  <stop offset="100%" stopColor="#2ecba4" />
                </linearGradient>
              </defs>
              <polygon points="12,2 21.5,7.5 12,13 2.5,7.5" fill="url(#veritas-nav-grad2)" fillOpacity="0.95" />
              <polygon points="12,13 21.5,7.5 21.5,18.5 12,24" fill="url(#veritas-nav-grad1)" />
              <polygon points="2.5,7.5 12,13 12,24 2.5,18.5" fill="url(#veritas-nav-grad3)" fillOpacity="0.9" />
              <line x1="12" y1="2" x2="12" y2="13" stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" />
              <line x1="12" y1="13" x2="21.5" y2="7.5" stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" />
              <line x1="12" y1="13" x2="2.5" y2="7.5" stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" />
              <line x1="12" y1="13" x2="12" y2="24" stroke="rgba(255,255,255,0.25)" strokeWidth="0.75" />
            </svg>

            <span
              style={{
                fontFamily: "var(--font-ppneuemontreal, 'PPNeueMontreal', -apple-system, sans-serif)",
                fontSize: 19,
                fontWeight: 400,
                letterSpacing: '-0.3px',
                color: 'var(--color-bone-white)',
                lineHeight: 1,
              }}
            >
              Veritas
            </span>
          </div>

          {/* Center / Right Section: Navigation Text Links + Minimalist Theme Toggle + Signature Pill Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {/* Clean Right-Aligned Navigation Links */}
            <nav className="veritas-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              {navLinks.map((link) => {
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      if (setActiveTab) setActiveTab(link.id);
                      if (typeof window !== 'undefined') window.location.hash = link.id;
                    }}
                    className={`veritas-nav-link ${isActive ? 'is-active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.label}
                    {isActive && <span className="veritas-nav-indicator" />}
                  </button>
                );
              })}
            </nav>

            {/* Far Right Action Elements */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* Minimalist Dark/Light Mode Switcher */}
              <button
                onClick={toggleTheme}
                className="veritas-theme-toggle"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <Sun size={17} strokeWidth={1.8} />
                ) : (
                  <Moon size={17} strokeWidth={1.8} />
                )}
              </button>

              {/* Single Signature Violet Pill Button */}
              <button
                onClick={() => setActiveTab('studio')}
                className="btn t-16 t-14@xs t-16@sm t-ls-0.025 t-600 t-uppercase"
                style={{
                  padding: '10px 22px',
                  fontSize: 13,
                  borderRadius: 24,
                  border: 'none',
                  cursor: 'pointer',
                }}
                aria-label="Request Access"
              >
                <span className="btn__text">REQUEST ACCESS</span>
                <div className="btn__hover" />
              </button>

              {/* Mobile Drawer Hamburger Button */}
              <button
                className="veritas-mobile-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Accessible Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <nav
          className="veritas-mobile-drawer"
          role="navigation"
          aria-label="Mobile Navigation"
        >
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  if (setActiveTab) setActiveTab(link.id);
                  if (typeof window !== 'undefined') window.location.hash = link.id;
                  setMobileMenuOpen(false);
                }}
                className={`veritas-mobile-drawer-link ${isActive ? 'is-active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-electric-iris)',
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      )}
    </>
  );
}

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, Info, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxWidth: 420,
          pointerEvents: 'none'
        }}
      >
        {toasts.map((toast) => {
          let accentColor = 'var(--color-electric-iris)';
          let IconComponent = CheckCircle;
          if (toast.type === 'success') {
            accentColor = 'var(--color-deep-verdant)';
            IconComponent = CheckCircle;
          } else if (toast.type === 'warning') {
            accentColor = 'var(--color-saffron-spark)';
            IconComponent = AlertTriangle;
          } else if (toast.type === 'error') {
            accentColor = '#ef4444';
            IconComponent = AlertCircle;
          } else {
            accentColor = 'var(--color-electric-iris)';
            IconComponent = Info;
          }

          return (
            <div
              key={toast.id}
              role="status"
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                background: 'rgba(8, 8, 8, 0.94)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${accentColor}66`,
                boxShadow: `0 8px 32px rgba(0, 0, 0, 0.45), 0 0 12px ${accentColor}22`,
                padding: '12px 18px',
                borderRadius: 'var(--radius-pill)',
                color: 'var(--color-bone-white)',
                fontSize: 13,
                animation: 'toastIn 240ms cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <IconComponent size={16} color={accentColor} />
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss toast"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-ash-gray)',
                  cursor: 'pointer',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (msg) => console.log('Toast:', msg),
      removeToast: () => {}
    };
  }
  return context;
}


import React, { useEffect } from 'react';

const Modal = ({
  children,
  isOpen,
  onClose,
  title,
  maxWidth = '500px',
  style = {},
  ...props
}) => {
  // Bind Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      style={{ display: 'flex', transition: 'opacity 0.3s ease' }}
      onClick={onClose}
    >
      <div
        className="modal-card fade-in"
        style={{
          ...style,
          maxWidth: maxWidth,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {(title || onClose) && (
          <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            {title && <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{title}</h3>}
            {onClose && (
              <button
                type="button"
                className="close-x-btn"
                style={{ fontSize: '1.8rem', padding: 0, cursor: 'pointer', background: 'none', border: 'none' }}
                onClick={onClose}
                aria-label="Close modal"
              >
                &times;
              </button>
            )}
          </div>
        )}
        <div style={{ flexGrow: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

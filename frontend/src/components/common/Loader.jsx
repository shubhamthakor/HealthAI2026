import React from 'react';

const Loader = ({
  variant = 'spinner', // 'spinner' | 'skeleton-card' | 'skeleton-list'
  size = 'md',        // 'sm' | 'md' | 'lg'
  label = 'Loading metadata...',
  style = {},
  className = '',
  ...props
}) => {
  const isSpinner = variant === 'spinner';
  const isSkeletonCard = variant === 'skeleton-card';
  const isSkeletonList = variant === 'skeleton-list';

  // Spinner size mapping
  const spinnerSizeStyle = {
    sm: { width: '20px', height: '20px', borderWidth: '2px' },
    md: { width: '40px', height: '40px', borderWidth: '4px' },
    lg: { width: '60px', height: '60px', borderWidth: '6px' }
  }[size] || { width: '40px', height: '40px', borderWidth: '4px' };

  if (isSpinner) {
    return (
      <div
        className={`mini-loader-container ${className}`}
        style={{
          ...style,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}
        {...props}
      >
        <div
          className="mini-spinner"
          style={{
            ...spinnerSizeStyle,
            borderColor: 'var(--border)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'auth-spin 0.8s linear infinite'
          }}
        ></div>
        {label && (
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {label}
          </p>
        )}
      </div>
    );
  }

  if (isSkeletonCard) {
    return (
      <div
        className={`section-card ${className}`}
        style={{
          ...style,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
        {...props}
      >
        <div className="skeleton-line shimmer" style={{ width: '40%', height: '20px', borderRadius: '4px' }}></div>
        <div className="skeleton-line shimmer" style={{ width: '90%', height: '14px', borderRadius: '4px' }}></div>
        <div className="skeleton-line shimmer" style={{ width: '70%', height: '14px', borderRadius: '4px' }}></div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <div className="skeleton-line shimmer" style={{ width: '30%', height: '36px', borderRadius: '6px' }}></div>
          <div className="skeleton-line shimmer" style={{ width: '20%', height: '36px', borderRadius: '6px' }}></div>
        </div>
      </div>
    );
  }

  if (isSkeletonList) {
    return (
      <div
        style={{
          ...style,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%'
        }}
        {...props}
      >
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="history-list-item"
            style={{
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '60%' }}>
              <div className="skeleton-line shimmer" style={{ width: '80%', height: '16px', borderRadius: '4px' }}></div>
              <div className="skeleton-line shimmer" style={{ width: '50%', height: '12px', borderRadius: '4px' }}></div>
            </div>
            <div className="skeleton-line shimmer" style={{ width: '80px', height: '24px', borderRadius: '12px' }}></div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default Loader;

import React from 'react';

const EmptyState = ({
  icon = '🔍',
  title = 'No Records Found',
  message = 'There is currently no data available for this section.',
  actionButton,
  style = {},
  className = '',
  ...props
}) => {
  return (
    <div
      className={`empty-state fade-in ${className}`}
      style={{
        ...style,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center'
      }}
      {...props}
    >
      <span className="empty-icon" style={{ fontSize: '3rem', marginBottom: '16px', display: 'inline-block' }}>
        {icon}
      </span>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
        {title}
      </h3>
      <p style={{ margin: '0 0 24px 0', fontSize: '0.92rem', color: 'var(--text-muted)', maxWidth: '380px', lineHeight: 1.5 }}>
        {message}
      </p>
      {actionButton && <div style={{ display: 'flex', justifyContent: 'center' }}>{actionButton}</div>}
    </div>
  );
};

export default EmptyState;

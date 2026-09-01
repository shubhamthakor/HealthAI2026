import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  headerActions,
  onClick,
  hoverEffect = false,
  style = {},
  className = '',
  ...props
}) => {
  const cardClasses = `section-card ${hoverEffect ? 'stat-card' : ''} ${className}`;

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      style={{
        ...style,
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column'
      }}
      {...props}
    >
      {(title || subtitle || headerActions) && (
        <div className="section-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            {title && <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 700, color: 'var(--text-main)' }}>{title}</h3>}
            {subtitle && <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>{subtitle}</p>}
          </div>
          {headerActions && <div style={{ display: 'flex', gap: '8px' }}>{headerActions}</div>}
        </div>
      )}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
};

export default Card;

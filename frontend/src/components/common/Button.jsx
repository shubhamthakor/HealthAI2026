import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style = {},
  className = '',
  ...props
}) => {
  // Variant styling map
  const variantClass = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    text: 'text-btn',
    danger: 'btn-danger'
  }[variant] || 'btn-primary';

  // Size styling map
  const sizeClass = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
    xs: 'btn-xs'
  }[size] || '';

  const buttonClasses = `btn ${variantClass} ${sizeClass} ${isLoading ? 'btn-loading' : ''} ${className}`;

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || isLoading}
      style={{
        ...style,
        position: 'relative',
        minHeight: size === 'xs' ? '28px' : size === 'sm' ? '36px' : '44px' // Accessible click target guidelines
      }}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="btn-spinner"></span>
          <span style={{ opacity: 0 }}>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;

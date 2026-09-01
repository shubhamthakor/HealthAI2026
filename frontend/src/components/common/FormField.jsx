import React from 'react';

const FormField = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  helpText = '',
  options = [],
  rows = 3,
  className = '',
  required = false,
  ...props
}) => {
  const isSelect = type === 'select';
  const isTextArea = type === 'textarea';

  return (
    <div className={`form-group ${className}`} style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column' }}>
      {label && (
        <label
          htmlFor={id}
          className="form-label"
          style={{
            fontSize: '0.88rem',
            fontWeight: 600,
            color: error ? 'var(--error)' : 'var(--text-muted)',
            marginBottom: '8px',
            textAlign: 'left'
          }}
        >
          {label} {required && <span style={{ color: 'var(--error)' }}>*</span>}
        </label>
      )}
      
      <div style={{ position: 'relative', width: '100%' }}>
        {isSelect ? (
          <select
            id={id}
            className={`form-input ${error ? 'validation-error-border' : ''}`}
            value={value}
            onChange={onChange}
            required={required}
            style={{ appearance: 'none', width: '100%' }}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : isTextArea ? (
          <textarea
            id={id}
            className={`form-input ${error ? 'validation-error-border' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            rows={rows}
            required={required}
            style={{ resize: 'vertical', minHeight: '80px', width: '100%' }}
            {...props}
          />
        ) : (
          <input
            id={id}
            type={type}
            className={`form-input ${error ? 'validation-error-border' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            style={{ width: '100%' }}
            {...props}
          />
        )}
      </div>

      {error && (
        <span
          className="validation-error-msg animate-fade-in"
          style={{ fontSize: '0.8rem', color: 'var(--error)', marginTop: '6px', fontWeight: 500, textAlign: 'left' }}
        >
          ⚠️ {error}
        </span>
      )}

      {helpText && !error && (
        <span
          className="form-input-help"
          style={{ fontSize: '0.78rem', color: 'var(--primary)', marginTop: '4px', fontWeight: 500, textAlign: 'left' }}
        >
          {helpText}
        </span>
      )}
    </div>
  );
};

export default FormField;

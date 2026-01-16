import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  variant = 'primary',
  className = '',
  style = {},
  disabled = false
}) => {
  const baseStyles: React.CSSProperties = {
    padding: '11px 20px',
    fontSize: '14px',
    fontWeight: 700,
    borderRadius: '8px',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.06)',
    border: '1px solid var(--btn-secondary-border)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      color: 'var(--btn-primary-text)',
      backgroundColor: 'var(--btn-primary-bg)',
    },
    secondary: {
      color: 'var(--btn-secondary-text)',
      backgroundColor: 'var(--btn-secondary-bg)',
      border: '1px solid var(--btn-secondary-border)',
    },
  };

  const hoverBg = variant === 'primary' ? 'var(--btn-primary-bg-hover)' : 'var(--btn-secondary-hover)';
  const defaultBg = variant === 'primary' ? 'var(--btn-primary-bg)' : 'var(--btn-secondary-bg)';

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`flex items-center transition-colors duration-150 ${className}`}
      style={{ ...baseStyles, ...variantStyles[variant], ...style }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.backgroundColor = hoverBg)}
      onMouseLeave={(e) => !disabled && (e.currentTarget.style.backgroundColor = defaultBg)}
    >
      {children}
    </button>
  );
};

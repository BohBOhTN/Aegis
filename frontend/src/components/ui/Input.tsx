import React, { forwardRef } from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = true, className = '', ...props }, ref) => {
    return (
      <div className={`aegis-input-wrapper ${fullWidth ? 'full-width' : ''} ${className}`}>
        <label className="aegis-label">{label}</label>
        <input 
          ref={ref} 
          className={`aegis-input ${error ? 'error' : ''}`} 
          {...props} 
        />
        {error && <span className="aegis-error-text">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

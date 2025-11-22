/**
 * Input Component
 * Campo de entrada reutilizable según diseño TailAdmin
 */

import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  hint?: string;
}

const Input = ({
  label,
  error,
  success,
  hint,
  id,
  className,
  disabled,
  ...props
}: InputProps) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  
  const inputClasses = cn(
    'h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring transition-colors',
    'bg-white text-gray-800',
    disabled && 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-60',
    error && !disabled && 'border-red-500 focus:border-red-300 focus:ring-red-500/20',
    success && !disabled && 'border-green-500 focus:border-green-300 focus:ring-green-500/20',
    !error && !success && !disabled && 'border-gray-300 focus:border-[#3f37c9] focus:ring-[#3f37c9]/20',
    className
  );
  
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      
      <input
        id={inputId}
        className={inputClasses}
        disabled={disabled}
        {...props}
      />
      
      {(error || hint) && (
        <p className={cn(
          'mt-1.5 text-xs',
          error ? 'text-red-500' : success ? 'text-green-500' : 'text-gray-500'
        )}>
          {error || hint}
        </p>
      )}
    </div>
  );
};

export default Input;

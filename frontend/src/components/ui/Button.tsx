/**
 * Button Component
 * Botón reutilizable con variantes y tamaños según diseño TailAdmin
 */

import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  startIcon,
  endIcon,
  isLoading = false,
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-[#0A36CC] text-white hover:bg-[#0A36CC] focus:ring-[#0A36CC]/80 shadow-sm',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500/20',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500/20',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500/20',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600/20 shadow-sm',
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Cargando...
        </>
      ) : (
        <>
          {startIcon && <span className="flex items-center">{startIcon}</span>}
          {children}
          {endIcon && <span className="flex items-center">{endIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;

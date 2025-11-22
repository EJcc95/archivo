/**
 * PageHeader Component
 * Header reutilizable para todas las páginas
 * Proporciona estructura consistente con icono, título, descripción y acciones
 */

import type { ReactNode } from 'react';
import { cn } from '@/utils';

interface ActionButtonConfig {
  id?: string;
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  className?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionButton?: ReactNode;
  actionButtons?: ActionButtonConfig[];
  backButton?: {
    onClick: () => void;
    label?: string;
  };
  className?: string;
}

const PageHeader = ({
  title,
  description,
  icon,
  actionButton,
  actionButtons,
  backButton,
  className = '',
}: PageHeaderProps) => {
  const getButtonStyles = (variant: ActionButtonConfig['variant'] = 'primary', disabled?: boolean) => {
    const baseStyles = 'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-white text-[#032dff] hover:bg-white/90 shadow-sm',
      secondary: 'bg-white/20 text-white border border-white/30 hover:bg-white/30',
      danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
      ghost: 'bg-transparent text-white border border-white/30 hover:bg-white/10',
    };

    return cn(baseStyles, variants[variant], disabled && 'opacity-50 cursor-not-allowed');
  };
  return (
    <div className={cn(
      'bg-linear-to-r from-[#032dff] to-[#032dff]/95 p-6 lg:p-8 border-b border-white/10',
      className
    )}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {backButton && (
            <button
              onClick={backButton.onClick}
              className="p-2 text-white/80 bg-white/15 hover:bg-white/25 rounded-lg transition-colors"
              title={backButton.label || 'Volver'}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          <div className="flex items-center gap-4">
            {icon && (
              <div className="p-3 bg-white/15 rounded-lg">
                {icon}
              </div>
            )}
            
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                {title}
              </h1>
              {description && (
                <p className="text-white/90 font-light mt-1">{description}</p>
              )}
            </div>
          </div>
        </div>

        {(actionButton || actionButtons) && (
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {actionButton && actionButton}
            {actionButtons && actionButtons.map((btn) => (
              <button
                key={btn.id || btn.label}
                onClick={btn.onClick}
                disabled={btn.disabled}
                className={cn(getButtonStyles(btn.variant, btn.disabled), btn.className)}
                title={btn.label}
              >
                {btn.icon && <span className="shrink-0">{btn.icon}</span>}
                <span>{btn.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;

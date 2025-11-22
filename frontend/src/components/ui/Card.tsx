/**
 * Card Component
 * Tarjeta reutilizable según diseño TailAdmin
 */

import type { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
}

export const Card = ({
  children,
  padding = 'md',
  shadow = true,
  className,
  ...props
}: CardProps) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5 md:p-6',
    lg: 'p-6 md:p-8',
  };
  
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-200 bg-white',
        shadow && 'shadow-sm',
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export const CardHeader = ({
  children,
  title,
  subtitle,
  action,
  className,
  ...props
}: CardHeaderProps) => {
  return (
    <div className={cn('mb-5', className)} {...props}>
      {title || subtitle ? (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      ) : (
        children
      )}
    </div>
  );
};

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardBody = ({
  children,
  className,
  ...props
}: CardBodyProps) => {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
};

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardFooter = ({
  children,
  className,
  ...props
}: CardFooterProps) => {
  return (
    <div className={cn('mt-5 pt-5 border-t border-gray-200', className)} {...props}>
      {children}
    </div>
  );
};

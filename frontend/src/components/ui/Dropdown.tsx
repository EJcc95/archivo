/**
 * Dropdown Component
 * Componente base para dropdowns con cierre automático
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/utils';

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: ReactNode;
}

export const Dropdown = ({ isOpen, onClose, className, children }: DropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={dropdownRef} className={cn('animate-slideIn', className)}>
      {children}
    </div>
  );
};

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  onItemClick?: () => void;
  className?: string;
  tag?: 'button' | 'a';
  to?: string;
}

export const DropdownItem = ({
  children,
  onClick,
  onItemClick,
  className,
  tag = 'button',
  to,
}: DropdownItemProps) => {
  const handleClick = () => {
    onClick?.();
    onItemClick?.();
  };

  if (tag === 'a' && to) {
    return (
      <a href={to} onClick={handleClick} className={className}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
};

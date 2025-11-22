/**
 * PageContainer Component
 * Contenedor reutilizable para todas las páginas
 * Proporciona estructura consistente: fondo gris + card blanca
 */

import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

const PageContainer = ({ children, className = '' }: PageContainerProps) => {
  return (
    <div className="bg-[#F5F5F5]">
      <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;

/**
 * Sidebar Component
 * Menú lateral colapsable con hover expansion
 */

import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { createPortal } from 'react-dom';

import {
  IconHome,
  IconFileText,
  IconUsers,
  IconShield,
  IconFolders,
  IconArchive,
  IconTransfer,
  IconChartBar,
  IconChevronRight,
  IconTrash,
  IconSettings,
  IconMessageCircle, IconSend, IconX,
  IconAlertCircle,
} from '@tabler/icons-react';
import { usePermissions } from '@/hooks';
import { useSidebar } from '@/context/SidebarContext';
import { cn } from '@/utils';
import logoAEM from '@/assets/logo-aem.png';
import iconoAEM from '@/assets/icono-aem.png';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  permission?: string;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: IconHome },
  { name: 'Documentos', href: '/documentos', icon: IconFileText, permission: 'docs_read' },
  { name: 'Usuarios', href: '/usuarios', icon: IconUsers, permission: 'users_read' },
  { name: 'Roles', href: '/roles', icon: IconShield, permission: 'users_admin' },
  { name: 'Áreas', href: '/areas', icon: IconFolders, permission: 'areas_read' },
  { name: 'Archivadores', href: '/archivadores', icon: IconArchive, permission: 'arch_read' },
  { name: 'Préstamos', href: '/prestamos', icon: IconTransfer, permission: 'prestamos_request' },
  { name: 'Reportes', href: '/reportes', icon: IconChartBar, permission: 'docs_stats' },
  { name: 'Configuración', href: '/configuracion', icon: IconSettings, permission: 'system_admin' },
  { name: 'Papelera', href: '/documentos/papelera', icon: IconTrash, permission: 'docs_delete' },
  { name: 'Sin Archivador', href: '/documentos/huerfanos', icon: IconAlertCircle, permission: 'docs_edit' },
];

const Sidebar = () => {
  const location = useLocation();
  const { hasPermission, hasAnyPermission } = usePermissions();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();

  const canAccess = (item: NavItem) => {
    if (!item.permission) return true;
    if (item.permission === 'docs_stats') {
      return hasAnyPermission(['docs_stats', 'system_admin']);
    }
    return hasPermission(item.permission);
  };

  const shouldShowText = isExpanded || isHovered || isMobileOpen;
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  return (
    <>
    <aside
      className={cn(
        'fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out',
        (isExpanded || isMobileOpen || isHovered) ? 'w-[260px]' : 'w-[90px]',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0'
      )}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex h-20 items-center px-6 border-b border-gray-200 transition-all duration-300',
          !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
        )}
      >
        <Link to="/dashboard" className="flex items-center space-x-4">
          {/* Logo icon - Mostrar icono cuando colapsado, logo completo cuando expandido */}
          {shouldShowText ? (
            <img
              src={logoAEM}
              alt="AEM Logo"
              className="h-16 shrink-0 object-contain"
            />
          ) : (
            <img
              src={iconoAEM}
              alt="AEM Icon"
              className="h-20 w-10 shrink-0 object-contain"
            />
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar">
        <ul className="space-y-2">
          {navigation.filter(canAccess).map((item) => {
            const isActive = location.pathname === item.href || 
                           (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                    className={cn(
                    'group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 relative overflow-hidden',
                    isActive
                      ? 'bg-[#032DFF] text-white shadow-lg shadow-[#032dff]/25'
                      : 'text-gray-700 hover:bg-linear-to-r hover:from-[#032dff]/10 hover:to-[#032dff]/10 hover:text-[#032dff] hover:shadow-md hover:shadow-[#032dff]/10',
                    !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-between'
                  )}
                >
                  {/* Efecto de fondo animado */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-linear-to-r from-[#032DFF]/0 via-[#032DFF]/5 to-[#032DFF]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                  )}
                  
                  <div className="flex items-center space-x-4 relative z-10">
                    <item.icon
                      size={20}
                      strokeWidth={2}
                      className={cn(
                        'transition-all duration-200 shrink-0',
                        isActive 
                          ? 'text-white' 
                          : 'text-gray-400 group-hover:text-[#032DFF] group-hover:scale-110'
                      )}
                    />
                    {shouldShowText && (
                      <span className="whitespace-nowrap group-hover:font-semibold transition-all duration-200">{item.name}</span>
                    )}
                  </div>
                  {isActive && shouldShowText && (
                    <IconChevronRight size={16} className="text-white shrink-0 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2.5} />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* Feedback Card */}
{shouldShowText && (
  <>
    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-linear-to-b from-white to-gray-50">
      <div className="bg-white border border-gray-200 rounded-lg p-3.5 shadow-sm hover:shadow-md transition-shadow duration-200">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="bg-[#032DFF]/10 rounded-lg p-2 shrink-0">
            <IconMessageCircle size={18} className="text-[#032DFF]" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-gray-900 mb-0.5">
              Tu Opinión Importa
            </h3>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Ayúdanos a mejorar el sistema
            </p>
          </div>
        </div>
        
        {/* Action */}
        <button 
          onClick={() => setShowFeedbackModal(true)}
          className="w-full bg-[#032DFF] hover:bg-blue-700 text-white font-medium text-xs py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <IconSend size={14} strokeWidth={2} />
          <span>Enviar Comentario</span>
        </button>
      </div>
    </div>

    </>
  )}      
    </aside>
    
    {showFeedbackModal && createPortal(
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-9999 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-[#032DFF]/10 rounded-lg p-2">
                <IconMessageCircle size={20} className="text-[#032DFF]" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Enviar Sugerencia o Comentario
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tu opinión nos ayuda a mejorar el sistema
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowFeedbackModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <IconX size={20} strokeWidth={2} />
            </button>
          </div>
          
          {/* Modal Body - Google Form Iframe */}
          <div className="flex-1 overflow-hidden min-h-0">
            <iframe 
              src="https://docs.google.com/forms/d/e/1FAIpQLSdlTRpiL5O-rwS0Xgdd1R-3mZTrHyYu1_3Wrwn60obFFOWY1Q/viewform?usp=dialog"
              className="w-full h-full border-0"
              title="Formulario de Feedback"
            >
              Cargando formulario…
            </iframe>
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
};

export default Sidebar;

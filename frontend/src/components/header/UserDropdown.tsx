/**
 * User Dropdown Component
 * Menú desplegable del usuario con opciones de perfil y logout
 * UPDATED: Modern design with gradients and smooth animations
 */

import { useState } from 'react';
import { IconUser, IconSettings, IconLogout, IconChevronDown } from '@tabler/icons-react';
import { useAuth } from '@/auth';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';

export default function UserDropdown() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const words = name.trim().split(' ').filter(w => w.length > 0);
    if (words.length === 0) return 'U';
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const displayName = `${user?.nombre || ''} ${user?.apellidos || ''}`.trim() || 'Usuario';

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-3 text-gray-700 hover:bg-blue-50/80 rounded-xl px-3 py-2 transition-all duration-200 group"
      >
        {/* Avatar with gradient */}
        <span className="relative flex items-center justify-center w-10 h-10 overflow-hidden rounded-full bg-gradient-to-br from-[#032DFF] via-[#0A36CC] to-[#1e40af] shadow-md group-hover:shadow-lg transition-shadow duration-200">
          <span className="text-white text-sm font-bold tracking-tight">
            {getInitials(displayName)}
          </span>
          {/* Ring on hover */}
          <span className="absolute inset-0 rounded-full ring-2 ring-[#032DFF]/0 group-hover:ring-[#032DFF]/20 transition-all duration-200"></span>
        </span>

        {/* Name and arrow */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="font-semibold text-sm text-gray-800 group-hover:text-[#032DFF] transition-colors duration-200">
            {displayName}
          </span>
          <IconChevronDown 
            size={16} 
            className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            strokeWidth={2.5}
          />
        </div>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-2 flex w-[280px] flex-col rounded-2xl border border-gray-200/80 bg-white shadow-2xl shadow-gray-900/10 z-50 overflow-hidden"
      >
        {/* Header with gradient background */}
        <div className="relative px-4 py-4 bg-gradient-to-br from-[#032DFF]/5 via-blue-50/50 to-transparent border-b border-gray-100">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative flex items-center justify-center w-12 h-12 overflow-hidden rounded-full bg-gradient-to-br from-[#032DFF] via-[#0A36CC] to-[#1e40af] shadow-md">
              <span className="text-white text-base font-bold tracking-tight">
                {getInitials(displayName)}
              </span>
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <span className="block font-bold text-sm text-gray-900 truncate">
                {displayName}
              </span>
              <span className="block text-xs text-gray-600 truncate mt-0.5">
                {user?.email}
              </span>
            </div>
          </div>
          {/* Role badge */}
          {user?.rol && (
            <div className="mt-3">
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-gradient-to-r from-[#032DFF] to-[#0A36CC] text-white rounded-full shadow-sm">
                {user.rol}
              </span>
            </div>
          )}
        </div>

        {/* Menu items */}
        <div className="py-2 px-2">
          <DropdownItem
            onItemClick={closeDropdown}
            tag="a"
            to="/profile"
            className="flex items-center gap-3 px-3 py-2.5 font-medium text-gray-700 rounded-xl group text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-50/50 transition-all duration-200 hover:shadow-sm"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-[#032DFF] group-hover:bg-blue-100 transition-colors duration-200">
              <IconUser size={18} strokeWidth={2} />
            </div>
            <span className="group-hover:text-[#032DFF] transition-colors duration-200">Mi Perfil</span>
          </DropdownItem>

          <DropdownItem
            onItemClick={closeDropdown}
            tag="a"
            to="/configuracion"
            className="flex items-center gap-3 px-3 py-2.5 font-medium text-gray-700 rounded-xl group text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-50/50 transition-all duration-200 hover:shadow-sm mt-1"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors duration-200">
              <IconSettings size={18} strokeWidth={2} />
            </div>
            <span className="group-hover:text-purple-600 transition-colors duration-200">Configuración</span>
          </DropdownItem>
        </div>

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-1"></div>

        {/* Logout button */}
        <div className="py-2 px-2">
          <button
            onClick={() => {
              closeDropdown();
              logout();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 font-medium text-red-600 rounded-xl group text-sm hover:bg-gradient-to-r hover:from-red-50 hover:to-red-50/50 transition-all duration-200 hover:shadow-sm"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-500 group-hover:bg-red-100 transition-colors duration-200">
              <IconLogout size={18} strokeWidth={2} />
            </div>
            <span className="group-hover:text-red-700 transition-colors duration-200">Cerrar Sesión</span>
          </button>
        </div>
      </Dropdown>
    </div>
  );
}

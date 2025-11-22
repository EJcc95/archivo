/**
 * User Dropdown Component
 * Menú desplegable del usuario con opciones de perfil y logout
 */

import { useState } from 'react';
import { IconUser, IconSettings, IconLogout } from '@tabler/icons-react';
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
        className="flex items-center gap-3 text-gray-700 hover:bg-blue-50 rounded-lg px-2 py-1.5 transition"
      >
        <span className="relative flex items-center justify-center w-11 h-11 overflow-hidden rounded-full bg-linear-to-br from-[#032DFF] to-[#032DFF]">
          <span className="text-white text-sm font-semibold">
            {getInitials(displayName)}
          </span>
        </span>

        <span className="hidden lg:block mr-1 font-medium text-sm">{displayName}</span>
        
        <svg
          className={`stroke-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg z-50"
      >
        <div className="pb-3 border-b border-gray-200">
          <span className="block font-medium text-sm text-gray-700">
            {displayName}
          </span>
          <span className="mt-0.5 block text-xs text-gray-500">
            {user?.email}
          </span>
          {user?.rol && (
            <span className="mt-1 inline-block px-2 py-0.5 text-xs font-medium bg-[#ecf3ff] text-[#3f37c9] rounded">
              {user.rol}
            </span>
          )}
        </div>

        <ul className="flex flex-col gap-1 pt-3 pb-3 border-b border-gray-200">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/perfil"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-sm hover:bg-gray-100 transition"
            >
              <IconUser size={20} strokeWidth={2} className="text-gray-500 group-hover:text-gray-700" />
              Mi Perfil
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/configuracion"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-sm hover:bg-gray-100 transition"
            >
              <IconSettings size={20} strokeWidth={2} className="text-gray-500 group-hover:text-gray-700" />
              Configuración
            </DropdownItem>
          </li>
        </ul>
        
        <button
          onClick={() => {
            closeDropdown();
            logout();
          }}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-red-600 rounded-lg group text-sm hover:bg-red-50 transition"
        >
          <IconLogout size={20} strokeWidth={2} className="text-red-500 group-hover:text-red-600" />
          Cerrar Sesión
        </button>
      </Dropdown>
    </div>
  );
}

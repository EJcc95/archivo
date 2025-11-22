/**
 * Header Component
 * Barra superior con fecha/hora y menú de usuario
 */

import { IconSun, IconMoon, IconSunset2, IconSunrise } from '@tabler/icons-react';
import { useSidebar } from '@/context/SidebarContext';
import { useEffect, useState } from 'react';
import { UserDropdown } from '@/components/header';
import { cn } from '@/utils';

const Header = () => {
  const { toggleSidebar, toggleMobileSidebar, isExpanded, isHovered, isMobileOpen } = useSidebar();
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar fecha y hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  // Obtener icono según la hora del día
  const getTimeIcon = () => {
    const hour = currentTime.getHours();
    
    if (hour >= 6 && hour < 12) {
      // Mañana (6am - 12pm)
      return <IconSunrise size={16} className="text-orange-500" strokeWidth={2} />;
    } else if (hour >= 12 && hour < 18) {
      // Tarde (12pm - 6pm)
      return <IconSun size={16} className="text-yellow-500" strokeWidth={2} />;
    } else if (hour >= 18 && hour < 21) {
      // Atardecer (6pm - 9pm)
      return <IconSunset2 size={16} className="text-orange-600" strokeWidth={2} />;
    } else {
      // Noche (9pm - 6am)
      return <IconMoon size={16} className="text-indigo-600" strokeWidth={2} />;
    }
  };

  // Formatear hora en 12 horas y extraer sufijo AM/PM
  const getFormattedTime = () => {
    const timeString = currentTime.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    // timeString: "10:52 p. m." o "09:15 a. m."
    const [time, period] = timeString.split(' ');
    return { time, period };
  };

  return (
    <header className={cn(
      'fixed top-0 right-0 z-40 h-20 bg-white border-b border-gray-200 transition-all duration-300 ease-in-out',
      (isExpanded || isHovered) ? 'lg:left-[260px]' : 'lg:left-[90px]',
      isMobileOpen ? 'left-0' : 'left-0'
    )}>
      <div className="flex items-center justify-between h-full px-3 lg:px-6">
        {/* Left section - Toggle button */}
        <button
          onClick={handleToggle}
          className="group flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-[#032DFF] hover:text-[#032DFF] transition-all duration-300 lg:h-11 lg:w-11"
          aria-label="Toggle Sidebar"
        >
          <svg
            width="16"
            height="12"
            viewBox="0 0 16 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
              fill="currentColor"
            />
          </svg>
          
        </button>

        {/* Center - Date and Time */}
        <div className="hidden lg:flex flex-1 items-center justify-center mx-6">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-linear-to-r from-gray-50 to-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-all duration-200">
            {/* Icono dinámico */}
            <div className="flex items-center justify-center w-7 h-7 bg-white rounded-md border border-gray-200">
              {getTimeIcon()}
            </div>
            
            {/* Separador vertical */}
            <div className="h-7 w-px bg-gray-300"></div>
            
            {/* Información de fecha y hora */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600 capitalize whitespace-nowrap">
                {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
              </span>
              <div className="flex items-center gap-2 min-w-[60px]">
                <span className="text-xs font-semibold text-[#032dff] tabular-nums">
                  {getFormattedTime().time}
                </span>
                <span className="text-xs font-medium text-gray-500">
                  {getFormattedTime().period}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={toggleApplicationMenu}
          className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg hover:bg-gray-100 transition lg:hidden"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
              fill="currentColor"
            />
          </svg>
        </button>
        
        {/* Right section - User Menu */}
        <div
          className={`${
            isApplicationMenuOpen ? 'flex' : 'hidden'
          } items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}
        >
          {/* Fecha y hora móvil */}
          <div className="flex lg:hidden items-center gap-3 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-center w-8 h-8 bg-gray-50 rounded-lg border border-gray-100">
              {getTimeIcon()}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-600 tracking-wide">
                {currentTime.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </span>
              <div className="flex items-center gap-2 min-w-[90px]">
                <span className="text-base font-bold text-[#3f37c9] tabular-nums">
                  {getFormattedTime().time}
                </span>
                <span className="text-sm font-medium text-gray-500">
                  {getFormattedTime().period}
                </span>
              </div>
            </div>
          </div>
          
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;

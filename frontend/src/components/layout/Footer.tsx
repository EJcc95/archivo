/**
 * Footer Component
 * Footer minimalista con información y links
 */

import { useEffect, useState } from 'react';
import { IconHeart,  } from '@tabler/icons-react';

const Footer = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-screen-2xl">
          {/* Bottom section */}
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-gray-800">
              © {currentYear} Archivo Electrónico Municipal. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span>Implementado con</span>
              <IconHeart size={14} className="text-[#f04438] fill-[#f04438]" strokeWidth={2} />
              <span>para la Municipalidad Distrital de Nuevo Imperial</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

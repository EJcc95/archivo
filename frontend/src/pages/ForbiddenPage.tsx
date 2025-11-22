/**
 * Forbidden Page (403)
 * Versión minimalista con gradiente #0A36CC
 */

import { Link } from 'react-router-dom';
import { IconShieldLock } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

const ForbiddenPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0A36CC] via-[#0A36CC]/80 to-[#0A36CC] overflow-hidden relative">
       {/* Archivo Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: '#0A36CC',
                backgroundImage: `
        linear-gradient(135deg, rgba(255,255,255,0.08) 50%, transparent 50%),
        linear-gradient(45deg, rgba(10,54,204,0.4) 35%, transparent 35%),
        radial-gradient(circle at 20px 20px, rgba(255,255,255,0.18) 2px, transparent 0),
        radial-gradient(circle at 50px 45px, rgba(255,255,255,0.12) 1.5px, transparent 0)
      `,
                backgroundSize: '140px 140px, 140px 140px, 90px 90px, 90px 90px',
                mixBlendMode: 'soft-light',
                boxShadow: 'inset 0 0 140px rgba(0, 20, 90, 0.35)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
        linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
      `,
                backgroundSize: '100px 60px',
                opacity: 0.7,
              }}
            />
          </div>
      {/* Capa de gradiente adicional para profundidad */}
      <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-black/20" />
      
      {/* Acento de color minimalista */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-white/20 to-transparent" />

      {/* Contenido principal */}
      <div 
        className={`text-center z-10 px-6 max-w-2xl mx-auto transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Icono simple */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-30 h-30 rounded-full bg-[#e7000b] border border-white/20 backdrop-blur-sm">
            <IconShieldLock size={64} className="text-white" strokeWidth={1.5} />
          </div>
        </div>

        {/* Código de error limpio */}
        <h1 className="text-[140px] md:text-[200px] font-light text-white/90 leading-none mb-6 tracking-tight">
          403
        </h1>

        {/* Título */}
        <h2 className="text-3xl md:text-4xl font-medium text-white mb-6 tracking-tight">
          Acceso Denegado
        </h2>

        {/* Descripción */}
        <p className="text-white/70 text-xs md:text-lg mb-12 max-w-md mx-auto leading-relaxed font-light">
          No tienes los permisos necesarios para acceder a este recurso.
        </p>

        {/* Botones minimalistas */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/dashboard"
            className="group relative inline-flex items-center justify-center px-8 py-3.5 bg-white text-[#0A36CC] font-medium rounded-lg transition-all duration-300 hover:bg-white/90 hover:shadow-lg hover:shadow-white/20 min-w-[200px]"
          >
            Ir al Dashboard
          </Link>

          <Link
            to="/"
            className="group relative inline-flex items-center justify-center px-8 py-3.5 bg-transparent text-white font-medium rounded-lg border border-white/30 hover:border-white/60 hover:bg-white/5 transition-all duration-300 min-w-[200px]"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;

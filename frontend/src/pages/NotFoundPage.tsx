/**
 * Not Found Page (404)
 * Versión animada con gradiente #0A36CC
 */

import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const NotFoundPage = () => {
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
        className={`text-center z-10 px-6 max-w-4xl mx-auto transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Texto ERROR superior */}
        <div className="mb-8">
          <h3 
            className="text-4xl md:text-5xl font-bold tracking-[0.3em] text-[#ffffff] mb-12"
            style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}
          >
            ERROR
          </h3>
        </div>

        {/* Gran 404 con diseño moderno */}
        <div className="relative mb-12">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {/* Primer 4 */}
            <div className="relative">
              <div 
                className="text-[120px] md:text-[200px] font-black leading-none"
                style={{
                  color: '#ffffff',
                  textShadow: '0 10px 30px rgba(65,105,225,0.5)',
                }}
              >
                4
              </div>
            </div>

            {/* 0 central con diseño especial - cara triste pixelada */}
            <div className="relative">
              <div 
                className="w-[120px] h-[120px] md:w-[200px] md:h-[200px] border-12 md:border-20 rounded-3xl flex items-center justify-center"
                style={{
                  borderColor: '#ffffff',
                  boxShadow: '0 10px 40px rgba(65,105,225,0.4)',
                }}
              >
                {/* Cara pixelada estilo Minecraft */}
                <svg 
                  viewBox="0 0 100 100" 
                  className="w-16 h-16 md:w-24 md:h-24"
                  fill="#ffffff"
                >
                  {/* Ojos */}
                  <rect x="25" y="30" width="15" height="15" />
                  <rect x="60" y="30" width="15" height="15" />
                  
                  {/* Boca triste pixelada */}
                  <rect x="30" y="65" width="10" height="8" />
                  <rect x="40" y="70" width="10" height="8" />
                  <rect x="50" y="70" width="10" height="8" />
                  <rect x="60" y="65" width="10" height="8" />
                </svg>
              </div>
            </div>

            {/* Segundo 4 */}
            <div className="relative">
              <div 
                className="text-[120px] md:text-[200px] font-black leading-none"
                style={{
                  color: '#ffffff',
                  textShadow: '0 10px 30px rgba(65,105,225,0.5)',
                }}
              >
                4
              </div>
            </div>
          </div>

          {/* Sombra decorativa */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full blur-3xl opacity-20 -z-10"
            style={{
              background: 'radial-gradient(circle, #4169E1 0%, transparent 70%)',
            }}
          />
        </div>

        {/* Mensaje de error */}
        <div className="mb-12 space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Página No Encontrada
          </h2>

          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
            <br />
            Por favor, verifica la URL o regresa a una ubicación segura.
          </p>
        </div>

        {/* Botones mejorados */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
          <Link
            to="/dashboard"
            className="group relative inline-flex items-center justify-center px-10 py-4 bg-[#4169E1] text-white font-bold text-lg rounded-2xl transition-all duration-300 hover:bg-[#5179F1] hover:scale-105 hover:shadow-2xl hover:shadow-[#4169E1]/50 min-w-[220px]"
          >
            <span className="relative z-10">Ir al Dashboard</span>
          </Link>

          <Link
            to="/"
            className="group relative inline-flex items-center justify-center px-10 py-4 bg-white/10 backdrop-blur-sm text-white font-bold text-lg rounded-2xl border-2 border-white/30 hover:border-white hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl min-w-[220px]"
          >
            <span className="relative z-10">Ir al Inicio</span>
          </Link>
        </div>

        
      </div>

      {/* Estilos de animación */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
            opacity: 0.3;
          }
        }

        .animate-float {
          animation: float ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;

/**
 * Layout Configuration
 * Configuración centralizada para el layout de la aplicación
 */

export const layoutConfig = {
  // Dimensiones del sidebar
  sidebar: {
    width: {
      expanded: 260, // píxeles
      collapsed: 90, // píxeles
    },
    breakpoint: 1024, // lg breakpoint (Tailwind)
  },

  // Dimensiones del header
  header: {
    height: 80, // píxeles (h-20 = 80px)
  },

  // Dimensiones del footer
  footer: {
    minHeight: 'auto',
  },

  // Animaciones
  transitions: {
    duration: 300, // milisegundos
    easing: 'ease-in-out',
  },

  // Z-index layers
  zIndex: {
    backdrop: 35,
    sidebar: 50,
    header: 40,
    modal: 9999,
    tooltip: 100,
  },

  // Colores principales
  colors: {
    primary: '#032DFF',
    primaryLight: '#ecf3ff',
    primaryDark: '#0225cc',
    border: '#e5e7eb',
    background: '#f9fafb',
    surface: '#ffffff',
  },

  // Estilos de sombras
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
};

export default layoutConfig;

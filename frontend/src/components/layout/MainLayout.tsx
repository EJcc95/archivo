/**
 * Main Layout
 * Layout principal con sidebar colapsable y header
 */

import { Outlet } from 'react-router-dom';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';
import Sidebar from './Sidebar.tsx';
import Header from './Header.tsx';
import Footer from './Footer.tsx';
import Backdrop from './Backdrop.tsx';

const LayoutContent = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Sidebar />
      <Backdrop />
      <Header />
      
      <div
        className={`flex-1 transition-all duration-300 ease-in-out overflow-y-auto ${
          isExpanded || isHovered ? 'lg:ml-[260px]' : 'lg:ml-[90px]'
        } ${isMobileOpen ? 'ml-0' : ''} pt-20`}
      >
        <main className="p-4 mx-auto w-full max-w-screen-2xl md:p-6 pb-8">
          <Outlet />
        </main>
      </div>
      
      <div
        className={`transition-all duration-300 ease-in-out shrink-0 ${
          isExpanded || isHovered ? 'lg:ml-[260px]' : 'lg:ml-[90px]'
        } ${isMobileOpen ? 'ml-0' : ''}`}
      >
        <Footer />
      </div>
    </div>
  );
};

const MainLayout = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default MainLayout;

import React from 'react';
import { NavLink } from 'react-router-dom';
import { ScanLine, History } from 'lucide-react';

export const NavBar: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-t border-white/10 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        <NavLink 
          to="/" 
          className={({ isActive }) => `flex flex-col items-center gap-1 w-full h-full justify-center ${isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <ScanLine size={24} />
          <span className="text-xs font-medium">Scan</span>
        </NavLink>
        
        <NavLink 
          to="/history" 
          className={({ isActive }) => `flex flex-col items-center gap-1 w-full h-full justify-center ${isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <History size={24} />
          <span className="text-xs font-medium">History</span>
        </NavLink>
      </div>
    </nav>
  );
};

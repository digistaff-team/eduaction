import React from 'react';
import { Icons } from '../Icons';

interface MobileNavigationProps {
  activeView: 'profile' | 'catalog' | 'course';
  onNavigate: (view: 'profile' | 'catalog') => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeView,
  onNavigate,
}) => {
  return (
    <nav className="mobile-bottom-nav">
      <button
        className={`nav-item ${activeView === 'profile' ? 'active' : ''}`}
        onClick={() => onNavigate('profile')}
      >
        <Icons.User />
        <span>Профиль</span>
      </button>

      <button
        className={`nav-item ${activeView === 'catalog' ? 'active' : ''}`}
        onClick={() => onNavigate('catalog')}
      >
        <Icons.Grid />
        <span>Каталог</span>
      </button>

      <button className="nav-item">
        <Icons.Brain />
        <span>AI</span>
      </button>
    </nav>
  );
};

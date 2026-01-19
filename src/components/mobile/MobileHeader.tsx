import React, { useState } from 'react';
import { Icons } from '../Icons';

interface MobileHeaderProps {
  userName: string;
  userEmail?: string;
  onLogout: () => void;
  onOpenAdmin: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  userName,
  userEmail,
  onLogout,
  onOpenAdmin,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <header className="mobile-header">
        <div className="mobile-logo">
          <Icons.Brain />
          <span>EduAction</span>
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setShowMenu(!showMenu)}
        >
          <div className="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </header>

      {showMenu && (
        <>
          <div
            className="mobile-menu-overlay"
            onClick={() => setShowMenu(false)}
          />
          <div className="mobile-menu">
            <div className="mobile-menu-header">
              <div className="user-avatar-large">
                {userName.substring(0, 2).toUpperCase()}
              </div>
              <strong>{userName}</strong>
              <span>{userEmail}</span>
            </div>

            <div className="mobile-menu-items">
              <button
                onClick={() => {
                  onOpenAdmin();
                  setShowMenu(false);
                }}
                className="mobile-menu-item"
              >
                <Icons.Settings />
                <span>Админ-панель</span>
              </button>

              <button
                onClick={() => {
                  onLogout();
                  setShowMenu(false);
                }}
                className="mobile-menu-item danger"
              >
                <Icons.X />
                <span>Выйти</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

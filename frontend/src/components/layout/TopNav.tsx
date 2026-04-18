import React from 'react';
import { LogOut, User as UserIcon, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

export const TopNav: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [isDark, setIsDark] = React.useState(() => {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    setIsDark(!isDark);
  };

  return (
    <header className="layout-topnav">
      <div className="topnav-left">
        {/* Breadcrumbs or Page Title could go here later */}
      </div>

      <div className="topnav-right">
        <button className="icon-button" onClick={toggleTheme} aria-label="Toggle Theme">
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div className="user-profile-chip">
          <div className="user-avatar">
            <UserIcon size={16} />
          </div>
          <div className="user-info">
            <span className="user-email">{user?.email || 'Unknown User'}</span>
            <span className="user-role">{user?.role || 'No Role'}</span>
          </div>
        </div>

        <button className="icon-button danger" onClick={handleLogout} aria-label="Logout">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

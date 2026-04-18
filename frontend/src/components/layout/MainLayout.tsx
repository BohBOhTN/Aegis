import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import './Layout.css';

export const MainLayout: React.FC = () => {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="layout-content-wrapper">
        <TopNav />
        <main className="layout-main-content">
          <Outlet /> {/* Renders the nested route native content */}
        </main>
      </div>
    </div>
  );
};

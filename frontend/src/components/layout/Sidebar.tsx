import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, Home, Users, Package, ShoppingCart, Truck, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const role = user?.role || 'Guest';

  return (
    <aside className="layout-sidebar">
      <div className="sidebar-header">
        <Shield size={28} className="sidebar-logo" />
        <h2>Aegis ERP</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <Home size={20} />
          <span>Dashboard</span>
        </NavLink>

        {(role === 'SuperAdmin' || role === 'Admin') && (
          <>
            <div className="nav-section-title">Administration</div>
            <NavLink to="/admin/users" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <Users size={20} />
              <span>Users Matrix</span>
            </NavLink>
          </>
        )}

        <div className="nav-section-title">Core Modules</div>
        
        {/* Placeholders for future sprints */}
        <NavLink to="/catalog/products" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <Package size={20} />
          <span>Catalog</span>
        </NavLink>
        
        <NavLink to="/sales/documents" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <ShoppingCart size={20} />
          <span>Sales & POS</span>
        </NavLink>

        <NavLink to="/supply/suppliers" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <Truck size={20} />
          <span>Supply Chain</span>
        </NavLink>

        {(role === 'SuperAdmin' || role === 'Manager') && (
          <NavLink to="/treasury/expenses" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <TrendingUp size={20} />
            <span>Treasury</span>
          </NavLink>
        )}
      </nav>
    </aside>
  );
};

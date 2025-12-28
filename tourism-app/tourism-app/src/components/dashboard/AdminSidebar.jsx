// src/components/dashboard/AdminSidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiHome,
  FiUsers,
  FiUser,
  FiChevronRight,
  FiChevronDown,
  FiLogOut,
  FiMenu,
  FiX,
  FiBarChart2,
  FiMap,
  FiCalendar,
  FiDollarSign,
  FiSettings
} from 'react-icons/fi';
import './AdminSidebar.css';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('guides');

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Tableau de Bord',
      icon: <FiHome size={20} />,
      path: '/admin',
      submenu: []
    },
    {
      id: 'guides',
      title: 'Gestion Guides',
      icon: <FiUsers size={20} />,
      path: '/admin/guides',
      submenu: [
        { title: 'Tous les guides', path: '/admin/guides' },
        { title: 'Ajouter un guide', path: '/admin/guides/add' },
    
      ]
    },
    
  ];

  const toggleSubmenu = (menuId) => {
    setActiveMenu(activeMenu === menuId ? null : menuId);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <>
      <div className={`modern-sidebar ${isOpen ? 'open' : 'closed'}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <div className="logo-gradient">MG</div>
            </div>
            {isOpen && (
              <div className="logo-text">
               
                <p className="logo-subtitle">Admin Panel</p>
              </div>
            )}
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <div key={item.id} className="menu-section">
              <div 
                className={`menu-item ${location.pathname === item.path ? 'active' : ''} ${location.pathname.includes(item.path) && item.path !== '/admin' ? 'active' : ''}`}
                onClick={() => {
                  if (item.submenu.length > 0) {
                    toggleSubmenu(item.id);
                  } else {
                    navigate(item.path);
                    if (window.innerWidth < 768) toggleSidebar();
                  }
                }}
              >
                <span className="menu-icon">{item.icon}</span>
                {isOpen && <span className="menu-title">{item.title}</span>}
                {isOpen && item.submenu.length > 0 && (
                  <span className="menu-arrow">
                    {activeMenu === item.id ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                  </span>
                )}
              </div>
              
              {isOpen && item.submenu.length > 0 && activeMenu === item.id && (
                <div className="submenu">
                  {item.submenu.map((subItem, index) => (
                    <Link
                      key={index}
                      to={subItem.path}
                      className={`submenu-item ${location.pathname === subItem.path ? 'active' : ''}`}
                      onClick={() => window.innerWidth < 768 && toggleSidebar()}
                    >
                      <span className="submenu-icon"></span>
                      <span className="submenu-title">{subItem.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="profile-avatar">
              <FiUser size={18} />
            </div>
            {isOpen && (
              <div className="profile-info">
                <h4>Administrateur</h4>
                <p>admin@medinaguides.com</p>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut size={18} />
            {isOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </div>
      {isOpen && window.innerWidth < 768 && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
    </>
  );
};

export default AdminSidebar;
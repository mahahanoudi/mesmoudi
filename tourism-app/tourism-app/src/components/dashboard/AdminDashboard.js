// src/components/dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import Navbar from '../common/Navbar';
import { guideService } from '../../services/guideService';
import { 
  FiUsers, 
  FiUserCheck, 
  FiDollarSign, 
  FiCalendar,
  FiTrendingUp,
  FiActivity,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiMoreVertical
} from 'react-icons/fi';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalGuides: 0,
    activeGuides: 0,
    totalUsers: 154,
    todayBookings: 12,
    totalRevenue: 42500,
    activeTours: 8,
    conversionRate: 68
  });

  useEffect(() => {
    loadGuides();
    loadStats();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const loadGuides = async () => {
    setLoading(true);
    try {
      const response = await guideService.getAllGuides();
      setGuides(response.guides || []);
    } catch (error) {
      console.error('Erreur chargement guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    // Simuler des données de stats
    setStats({
      totalGuides: guides.length,
      activeGuides: guides.filter(g => g.actif).length,
      totalUsers: 154,
      todayBookings: 12,
      totalRevenue: 42500,
      activeTours: 8,
      conversionRate: 68
    });
  };

  const handleDeleteGuide = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce guide ?')) {
      try {
        await guideService.deleteGuide(id);
        alert('✅ Guide supprimé avec succès');
        loadGuides();
      } catch (error) {
        alert('❌ Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="modern-admin-layout">
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className={`admin-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Navbar toggleSidebar={toggleSidebar} />
        
        <main className="dashboard-main">
          {/* Header */}
          <div className="dashboard-header">
            <div>
              <h1>Tableau de Bord</h1>
              <p className="welcome-text">Bienvenue, Administrateur. Voici ce qui se passe aujourd'hui.</p>
            </div>
            <div className="header-actions">
              <button className="btn-primary">
                <FiTrendingUp size={16} />
                <span>Générer Rapport</span>
              </button>
              <button className="btn-secondary">
                <FiCalendar size={16} />
                <span>Vue Calendrier</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">
                <FiUsers size={24} />
              </div>
              <div className="stat-info">
                <h3>Total Guides</h3>
                <p className="stat-number">{stats.totalGuides}</p>
                <div className="stat-trend positive">
                  <FiTrendingUp size={14} />
                  <span>+5 depuis hier</span>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon green">
                <FiUserCheck size={24} />
              </div>
              <div className="stat-info">
                <h3>Guides Actifs</h3>
                <p className="stat-number">{stats.activeGuides}</p>
                <div className="stat-trend">
                  <span>{Math.round((stats.activeGuides / stats.totalGuides) * 100) || 0}% actifs</span>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon purple">
                <FiUsers size={24} />
              </div>
              <div className="stat-info">
                <h3>Utilisateurs</h3>
                <p className="stat-number">{stats.totalUsers}</p>
                <div className="stat-trend positive">
                  <FiTrendingUp size={14} />
                  <span>+12 cette semaine</span>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon orange">
                <FiDollarSign size={24} />
              </div>
              <div className="stat-info">
                <h3>Revenu Total</h3>
                <p className="stat-number">{stats.totalRevenue.toLocaleString()} MAD</p>
                <div className="stat-trend positive">
                  <FiTrendingUp size={14} />
                  <span>+15% ce mois</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts & Data */}
          <div className="dashboard-content">
            {/* Left Column */}
            <div className="content-left">
              {/* Activity Chart */}
              <div className="card">
                <div className="card-header">
                  <h3>Activité des Guides</h3>
                  <select className="period-select">
                    <option>Cette semaine</option>
                    <option>Ce mois</option>
                    <option>Cette année</option>
                  </select>
                </div>
                <div className="chart-container">
                  <div className="chart-placeholder">
                    <FiActivity size={48} />
                    <p>Graphique des performances des guides</p>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="card">
                <div className="card-header">
                  <h3>Réservations Récentes</h3>
                  <button className="view-all">Voir tout</button>
                </div>
                <div className="bookings-list">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="booking-item">
                      <div className="booking-avatar">C{i}</div>
                      <div className="booking-info">
                        <p className="booking-title">Circuit Médina Historique</p>
                        <p className="booking-details">Client • Guide Ahmed • 450 MAD</p>
                      </div>
                      <span className="booking-time">Il y a {i}h</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="content-right">
              {/* Recent Activity */}
              <div className="card">
                <div className="card-header">
                  <h3>Activité Récente</h3>
                  <button className="view-all">Voir tout</button>
                </div>
                <div className="activity-list">
                  {[
                    { icon: '👤', title: 'Ahmed Benani', action: 'ajouté comme guide', time: '2h' },
                    { icon: '💰', title: '450 MAD', action: 'Nouvelle réservation', time: '4h' },
                    { icon: '📝', title: 'Fatima Alami', action: 'Mise à jour du profil', time: '6h' },
                    { icon: '⭐', title: 'Mohammed', action: 'Nouvelle évaluation 5⭐', time: '1j' }
                  ].map((activity, idx) => (
                    <div key={idx} className="activity-item">
                      <div className="activity-icon">{activity.icon}</div>
                      <div className="activity-content">
                        <p><strong>{activity.title}</strong> {activity.action}</p>
                        <span className="activity-time">Il y a {activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Guides */}
              <div className="card">
                <div className="card-header">
                  <h3>Guides Performants</h3>
                </div>
                <div className="top-guides">
                  {[
                    { name: 'Ahmed Benani', tours: 24, rating: 4.9 },
                    { name: 'Fatima Alami', tours: 19, rating: 4.8 },
                    { name: 'Karim Hassan', tours: 17, rating: 4.7 }
                  ].map((guide, idx) => (
                    <div key={idx} className="guide-item">
                      <div className="guide-rank">{idx + 1}</div>
                      <div className="guide-info">
                        <h4>{guide.name}</h4>
                        <p>{guide.tours} circuits • ⭐ {guide.rating}</p>
                      </div>
                      <div className="guide-revenue">
                        <span className="revenue-amount">+{guide.tours * 200} MAD</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Guides Table */}
          <div className="card">
            <div className="card-header">
              <h3>Derniers Guides</h3>
              <button className="btn-primary">+ Ajouter un guide</button>
            </div>
            <div className="table-container">
              <table className="guides-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Spécialité</th>
                    <th>Statut</th>
                    <th>Évaluations</th>
                    <th>Date d'ajout</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {guides.slice(0, 5).map((guide, index) => (
                    <tr key={index}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-small">
                            {guide.nom?.charAt(0) || 'G'}
                          </div>
                          <div>
                            <p className="user-name">{guide.nom || 'Guide'}</p>
                            <p className="user-email">{guide.email || 'email@exemple.com'}</p>
                          </div>
                        </div>
                      </td>
                      <td>{guide.specialite || 'Général'}</td>
                      <td>
                        <span className={`status-badge ${guide.actif ? 'active' : 'inactive'}`}>
                          {guide.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td>
                        <div className="rating">
                          ⭐ 4.5 <span className="rating-count">(24)</span>
                        </div>
                      </td>
                      <td>{new Date().toLocaleDateString()}</td>
                      <td>
                        <div className="actions">
                          <button className="action-btn view" title="Voir">
                            <FiEye size={16} />
                          </button>
                          <button className="action-btn edit" title="Modifier">
                            <FiEdit2 size={16} />
                          </button>
                          <button 
                            className="action-btn delete" 
                            title="Supprimer"
                            onClick={() => handleDeleteGuide(guide.id)}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
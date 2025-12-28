// src/components/dashboard/GuideManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

import { guideService } from '../../services/guideService';
import {
  FiSearch,
  FiFilter,
  FiUserPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiUser,
  FiChevronDown,
  FiMoreVertical,
  FiStar,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import './GuideManagement.css';

const GuideManagement = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVille, setFilterVille] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGuides, setSelectedGuides] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const guidesPerPage = 10;

  useEffect(() => {
    loadGuides();
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

  const handleToggleStatus = async (id) => {
    try {
      await guideService.toggleGuideStatus(id);
      alert('✅ Statut modifié avec succès');
      loadGuides();
    } catch (error) {
      alert('❌ Erreur lors du changement de statut');
    }
  };

  const handleEditGuide = (id) => {
    navigate(`/admin/guides/edit/${id}`);
  };

  const handleViewGuide = (id) => {
    navigate(`/admin/guides/view/${id}`);
  };

  const handleSelectGuide = (id) => {
    setSelectedGuides(prev =>
      prev.includes(id)
        ? prev.filter(guideId => guideId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedGuides.length === filteredGuides.length) {
      setSelectedGuides([]);
    } else {
      setSelectedGuides(filteredGuides.map(g => g.id));
    }
  };

  const handleBulkAction = (action) => {
    if (selectedGuides.length === 0) {
      alert('Veuillez sélectionner au moins un guide');
      return;
    }

    switch (action) {
      case 'activate':
        if (window.confirm(`Activer ${selectedGuides.length} guide(s) ?`)) {
          selectedGuides.forEach(id => handleToggleStatus(id));
        }
        break;
      case 'deactivate':
        if (window.confirm(`Désactiver ${selectedGuides.length} guide(s) ?`)) {
          selectedGuides.forEach(id => handleToggleStatus(id));
        }
        break;
      case 'delete':
        if (window.confirm(`Supprimer ${selectedGuides.length} guide(s) ?`)) {
          selectedGuides.forEach(id => handleDeleteGuide(id));
        }
        break;
      default:
        break;
    }
  };

  // Filtrage des guides
  const filteredGuides = guides.filter(guide => {
    const matchesSearch = searchTerm === '' ||
      (guide.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (guide.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (guide.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (guide.ville?.toLowerCase().includes(searchTerm.toLowerCase()) || '');

    const matchesVille = filterVille === '' || guide.ville === filterVille;
    const matchesStatus = filterStatus === '' ||
      (filterStatus === 'active' && guide.actif) ||
      (filterStatus === 'inactive' && !guide.actif);

    return matchesSearch && matchesVille && matchesStatus;
  });

  // Villes uniques pour le filtre
  const villes = [...new Set(guides.map(guide => guide.ville).filter(Boolean))].sort();

  // Pagination
  const indexOfLastGuide = currentPage * guidesPerPage;
  const indexOfFirstGuide = indexOfLastGuide - guidesPerPage;
  const currentGuides = filteredGuides.slice(indexOfFirstGuide, indexOfLastGuide);
  const totalPages = Math.ceil(filteredGuides.length / guidesPerPage);

  const stats = {
    totalGuides: guides.length,
    activeGuides: guides.filter(g => g.actif).length,
    inactiveGuides: guides.filter(g => !g.actif).length,
    averageRating: 4.7,
    totalRevenue: guides.reduce((sum, guide) => sum + (guide.tarifJournee || 0) * 20, 0)
  };

  return (
    <div className="modern-admin-layout">
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className={`admin-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>


        <main className="dashboard-main">
          {/* Header */}
          <div className="dashboard-header">
            <div>
              <h1>Gestion des Guides</h1>
              <p className="welcome-text">Gérez tous les guides de la plateforme Medina Guides</p>
            </div>
            <div className="header-actions">
              <button
                className="btn-secondary"
                onClick={() => navigate('/admin/guides')}
              >
                <FiRefreshCw size={16} />
                <span>Actualiser</span>
              </button>
              <button
                className="btn-primary"
                onClick={() => navigate('/admin/guides/add')}
              >
                <FiUserPlus size={16} />
                <span>Ajouter un Guide</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">
                <FiUser size={24} />
              </div>
              <div className="stat-info">
                <h3>Total Guides</h3>
                <p className="stat-number">{stats.totalGuides}</p>
                <div className="stat-trend">
                  <span>Tous les guides</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <FiCheckCircle size={24} />
              </div>
              <div className="stat-info">
                <h3>Guides Actifs</h3>
                <p className="stat-number">{stats.activeGuides}</p>
                <div className="stat-trend positive">
                  <span>{Math.round((stats.activeGuides / stats.totalGuides) * 100) || 0}% actifs</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">
                <FiXCircle size={24} />
              </div>
              <div className="stat-info">
                <h3>Guides Inactifs</h3>
                <p className="stat-number">{stats.inactiveGuides}</p>
                <div className="stat-trend">
                  <span>À vérifier</span>
                </div>
              </div>
            </div>


          </div>

          {/* Search and Filters Bar */}
          <div className="search-filters-bar">
            <div className="search-container">
              <FiSearch className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Rechercher par nom, email, ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filters-container">
              <button
                className={`filter-toggle ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <FiFilter size={16} />
                <span>Filtres</span>
                {showFilters ? <FiChevronDown size={14} /> : null}
              </button>

              {selectedGuides.length > 0 && (
                <div className="bulk-actions">
                  <span className="selected-count">{selectedGuides.length} sélectionné(s)</span>
                  <div className="bulk-buttons">
                    <button
                      className="bulk-btn success"
                      onClick={() => handleBulkAction('activate')}
                    >
                      <FiCheckCircle size={14} />
                      <span>Activer</span>
                    </button>
                    <button
                      className="bulk-btn warning"
                      onClick={() => handleBulkAction('deactivate')}
                    >
                      <FiXCircle size={14} />
                      <span>Désactiver</span>
                    </button>
                    <button
                      className="bulk-btn danger"
                      onClick={() => handleBulkAction('delete')}
                    >
                      <FiTrash2 size={14} />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Export actions removed */}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="filters-panel">
              <div className="filters-grid">
                <div className="filter-group">
                  <label className="filter-label">
                    <FiMapPin size={14} />
                    <span>Ville</span>
                  </label>
                  <select
                    value={filterVille}
                    onChange={(e) => setFilterVille(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Toutes les villes</option>
                    {villes.map((ville, index) => (
                      <option key={index} value={ville}>{ville}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">
                    <FiCheckCircle size={14} />
                    <span>Statut</span>
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="active">Actifs seulement</option>
                    <option value="inactive">Inactifs seulement</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">
                    <FiCalendar size={14} />
                    <span>Expérience</span>
                  </label>
                  <select className="filter-select">
                    <option value="">Toutes</option>
                    <option value="0-2">0-2 ans</option>
                    <option value="2-5">2-5 ans</option>
                    <option value="5+">5+ ans</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">
                    <FiDollarSign size={14} />
                    <span>Tarif</span>
                  </label>
                  <select className="filter-select">
                    <option value="">Tous les tarifs</option>
                    <option value="0-300">0-300 MAD</option>
                    <option value="300-600">300-600 MAD</option>
                    <option value="600+">600+ MAD</option>
                  </select>
                </div>

                <div className="filter-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setFilterVille('');
                      setFilterStatus('');
                      setSearchTerm('');
                    }}
                  >
                    <FiRefreshCw size={14} />
                    <span>Réinitialiser</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Guides Table */}
          <div className="card">
            <div className="card-header">
              <h3>Liste des Guides</h3>
              <div className="table-info">
                <span className="result-count">
                  {filteredGuides.length} guide{filteredGuides.length !== 1 ? 's' : ''} trouvé{filteredGuides.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="table-container">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Chargement des guides...</p>
                </div>
              ) : (
                <>
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th width="50">
                          <div className="checkbox-wrapper">
                            <input
                              type="checkbox"
                              checked={selectedGuides.length === filteredGuides.length && filteredGuides.length > 0}
                              onChange={handleSelectAll}
                              className="table-checkbox"
                            />
                          </div>
                        </th>
                        <th>Guide</th>
                        <th>Localisation</th>
                        <th>Expérience</th>
                        <th>Tarif</th>
                        <th>Statut</th>
                        <th>Évaluations</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentGuides.map(guide => (
                        <tr key={guide.id}>
                          <td>
                            <div className="checkbox-wrapper">
                              <input
                                type="checkbox"
                                checked={selectedGuides.includes(guide.id)}
                                onChange={() => handleSelectGuide(guide.id)}
                                className="table-checkbox"
                              />
                            </div>
                          </td>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar-large">
                                {guide.photoFileName ? (
                                  <img
                                    src={`http://localhost:8084${guide.photoFileName}`}
                                    alt={`${guide.prenom} ${guide.nom}`}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div className="avatar-fallback">
                                  {guide.prenom?.charAt(0)}{guide.nom?.charAt(0)}
                                </div>
                              </div>
                              <div className="user-info">
                                <h4 className="user-name">{guide.prenom} {guide.nom}</h4>
                                <p className="user-email">{guide.email}</p>
                                <p className="user-id">ID: #{guide.id}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="location-cell">
                              <FiMapPin size={14} className="location-icon" />
                              <span>{guide.ville || 'Non spécifiée'}</span>
                            </div>
                          </td>
                          <td>
                            <div className="experience-cell">
                              <span className="experience-badge">
                                {guide.experience || 0} ans
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="price-cell">
                              <FiDollarSign size={14} className="price-icon" />
                              <span className="price-amount">{guide.tarifJournee || 0} MAD</span>
                              <span className="price-period">/jour</span>
                            </div>
                          </td>
                          <td>
                            <div className="status-cell">
                              <span className={`status-badge ${guide.actif ? 'active' : 'inactive'}`}>
                                {guide.actif ? (
                                  <>
                                    <FiCheckCircle size={12} />
                                    <span>Actif</span>
                                  </>
                                ) : (
                                  <>
                                    <FiXCircle size={12} />
                                    <span>Inactif</span>
                                  </>
                                )}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="rating-cell">
                              <div className="stars">
                                <FiStar size={14} className="star-icon filled" />
                                <FiStar size={14} className="star-icon filled" />
                                <FiStar size={14} className="star-icon filled" />
                                <FiStar size={14} className="star-icon filled" />
                                <FiStar size={14} className="star-icon" />
                              </div>
                              <span className="rating-score">4.5</span>
                              <span className="rating-count">(24)</span>
                            </div>
                          </td>
                          <td>
                            <div className="actions-cell">
                              <button
                                className="action-btn view"
                                onClick={() => handleViewGuide(guide.id)}
                                title="Voir détails"
                              >
                                <FiEye size={16} />
                              </button>
                              <button
                                className="action-btn edit"
                                onClick={() => handleEditGuide(guide.id)}
                                title="Modifier"
                              >
                                <FiEdit2 size={16} />
                              </button>
                              <button
                                className="action-btn toggle"
                                onClick={() => handleToggleStatus(guide.id)}
                                title={guide.actif ? "Désactiver" : "Activer"}
                              >
                                {guide.actif ? <FiXCircle size={16} /> : <FiCheckCircle size={16} />}
                              </button>
                              <button
                                className="action-btn delete"
                                onClick={() => handleDeleteGuide(guide.id)}
                                title="Supprimer"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredGuides.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <FiUser size={48} />
                      </div>
                      <h3>Aucun guide trouvé</h3>
                      <p>Aucun guide ne correspond à vos critères de recherche.</p>
                      <button
                        className="btn-primary"
                        onClick={() => navigate('/admin/guides/add')}
                      >
                        <FiUserPlus size={16} />
                        <span>Ajouter un nouveau guide</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Pagination */}
            {filteredGuides.length > 0 && (
              <div className="table-footer">
                <div className="pagination-info">
                  Affichage {indexOfFirstGuide + 1}-{Math.min(indexOfLastGuide, filteredGuides.length)} sur {filteredGuides.length} guides
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <FiChevronLeft size={16} />
                    Précédent
                  </button>
                  <div className="page-numbers">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                    <FiChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default GuideManagement;
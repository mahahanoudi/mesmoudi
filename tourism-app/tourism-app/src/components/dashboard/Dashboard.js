import React, { useState, useEffect, useRef } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import Navbar from '../common/Navbar';
import './Dashboard.css';

const Dashboard = () => {
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  
  const [backendProfile, setBackendProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const hasFetched = useRef(false);


  useEffect(() => {
    const testToken = async () => {
      try {
      
        const token = await getToken();
      
        if (token) {
      
          const payload = JSON.parse(atob(token.split('.')[1]));
          const exp = new Date(payload.exp * 1000);
          const now = new Date();

        }
      } catch (err) {
        console.error('TEST: Erreur:', err);
      }
    };
    
    testToken();
  }, [getToken]);


  useEffect(() => {
    const fetchProfile = async () => {
      if (hasFetched.current) {
        console.log('⏭️ Profil déjà récupéré, skip');
        return;
      }
      
      hasFetched.current = true;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Chargement du profil depuis le backend...');
        
        const profileData = await authService.getUserProfile();
        console.log('✅ Profil reçu:', profileData);
        
        setBackendProfile(profileData);
      } catch (err) {
        console.error('❌ Erreur récupération profil:', err);
        
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log('🔄 Token invalide, redirection vers login...');
          navigate('/login');
        } else {
          setError('Impossible de charger votre profil. Veuillez rafraîchir la page.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [getToken, navigate]);

  const handleViewRestaurants = () => {
    navigate('/restaurants');
  };

  const handleEditProfile = () => {
    alert('Fonctionnalité d\'édition de profil à implémenter');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="dashboard-container">
          <div className="dashboard-loading">
            <div className="spinner"></div>
            <p>Chargement de votre tableau de bord...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="dashboard-container">
          <div className="dashboard-error">
            <h2>❌ Erreur</h2>
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={() => {
                hasFetched.current = false;
                window.location.reload();
              }}
            >
              Réessayer
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!backendProfile) {
    return (
      <>
        <Navbar />
        <div className="dashboard-container">
          <div className="dashboard-error">
            <h2>⚠️ Profil non disponible</h2>
            <p>Impossible de charger vos informations.</p>
            <button 
              className="retry-button"
              onClick={() => navigate('/login')}
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
   

        <section className="profile-section">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {clerkUser?.imageUrl ? (
                  <img 
                    src={clerkUser.imageUrl} 
                    alt={`${backendProfile?.firstName || 'Utilisateur'}`}
                    className="avatar-image"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {backendProfile?.firstName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="profile-info">
                <h2>
                  {backendProfile?.firstName} {backendProfile?.lastName}
                  <span className={`role-badge role-${backendProfile?.role?.toLowerCase()}`}>
                    {backendProfile?.role}
                  </span>
                </h2>
                <p className="profile-email">{backendProfile?.email}</p>
                <div className="profile-meta">
                  <span className="meta-item">
                    <strong>ID:</strong> {backendProfile?.id}
                  </span>
                  <span className="meta-item">
                    <strong>Statut:</strong> 
                    <span className={`status-badge ${backendProfile?.active ? 'active' : 'inactive'}`}>
                      {backendProfile?.active ? 'Actif' : 'Inactif'}
                    </span>
                  </span>
                  <span className="meta-item">
                    <strong>Clerk ID:</strong> {backendProfile?.clerkId}
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-details">
              <div className="detail-row">
                <div className="detail-item">
                  <span className="detail-label">Prénom</span>
                  <span className="detail-value">{backendProfile?.firstName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Nom</span>
                  <span className="detail-value">{backendProfile?.lastName}</span>
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{backendProfile?.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Rôle</span>
                  <span className="detail-value role-value">{backendProfile?.role}</span>
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-item">
                  <span className="detail-label">Compte créé</span>
                  <span className="detail-value">
                    {backendProfile?.createdAt ? 
                      new Date(backendProfile.createdAt).toLocaleDateString('fr-FR') 
                      : 'Non disponible'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Dernière mise à jour</span>
                  <span className="detail-value">
                    {backendProfile?.updatedAt ? 
                      new Date(backendProfile.updatedAt).toLocaleDateString('fr-FR') 
                      : 'Non disponible'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

       
      </div>
    </>
  );
};

export default Dashboard;
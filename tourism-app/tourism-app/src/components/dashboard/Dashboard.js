// src/components/dashboard/Dashboard.js
import React from 'react';
import Navbar from '../common/Navbar';


const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Navbar />
      
      <main className="dashboard-main">
        <div className="container">
          <h1 className="dashboard-title">Tableau de Bord</h1>
          
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Mon Profil</h3>
              <p>Gérez vos informations personnelles</p>
            </div>
            
            <div className="dashboard-card">
              <h3>Mes Favoris</h3>
              <p>Vos lieux préférés</p>
            </div>
            
            <div className="dashboard-card">
              <h3>Historique</h3>
              <p>Vos visites récentes</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
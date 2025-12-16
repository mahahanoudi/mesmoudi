// src/components/home/HeroSection.js
import React from 'react';
import './Home.css';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          Bienvenue à <span className="highlight">Tétouan</span>
        </h1>
        <p className="hero-subtitle">
          La ville blanche aux portes bleues, où l'histoire andalouse rencontre la modernité
        </p>
        <div className="hero-search">
          <input 
            type="text" 
            placeholder="Que souhaitez-vous découvrir ?" 
            className="search-input"
          />
          <button className="search-btn">Explorer</button>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">50+</span>
            <span className="stat-label">Monuments</span>
          </div>
          <div className="stat">
            <span className="stat-number">12</span>
            <span className="stat-label">Circuits</span>
          </div>
          <div className="stat">
            <span className="stat-number">24/7</span>
            <span className="stat-label">Guide virtuel</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
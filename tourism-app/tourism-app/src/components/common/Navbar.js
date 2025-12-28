// src/components/common/Navbar.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser, useClerk, SignedIn, SignedOut } from '@clerk/clerk-react';
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="logo-icon">ⵜⴰⵟⴰⵡⵉⵏ</span>
          <span>TétouanTour</span>
        </Link>

        {/* Menu Toggle Mobile */}
        <button className="navbar-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Liens de navigation */}
        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li className="navbar-item">
            <Link to="/" className="navbar-link" onClick={closeMenu}>Accueil</Link>
          </li>

          <li className="navbar-item">
            <Link to="/restaurants" className="navbar-link" onClick={closeMenu}>Restaurants</Link>
          </li>
          <li className="navbar-item">
            <Link to="/guide" className="navbar-link" onClick={closeMenu}>Guide</Link>
          </li>
          <li className="navbar-item">
            <Link to="/flights" className="navbar-link" onClick={closeMenu}>Vols</Link> {/* AJOUTER CECI */}
          </li>
          <li className="navbar-item">
            <Link to="/contact" className="navbar-link" onClick={closeMenu}>Contact</Link>
          </li>
          <li className="navbar-item">
            <Link to="/hotels" className="navbar-link" onClick={closeMenu}>Hôtels</Link>
          </li>
        </ul>

        {/* Actions utilisateur */}
        <div className="navbar-actions">
          <SignedIn>
            <div className="user-info">
              {user?.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt={user.firstName}
                  className="user-avatar"
                />
              )}
              <span className="navbar-welcome">
                <FaUser /> Bienvenue, {user?.firstName}
              </span>
            </div>
            <button className="navbar-button logout" onClick={handleLogout}>
              <FaSignOutAlt /> Déconnexion
            </button>
          </SignedIn>

          <SignedOut>
            <Link to="/login" className="navbar-button login" onClick={closeMenu}>
              Connexion
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
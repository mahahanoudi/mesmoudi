// src/components/auth/Register.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../common/Navbar';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeTerms: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Tous les champs obligatoires doivent être remplis');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    
    if (!formData.agreeTerms) {
      setError('Vous devez accepter les conditions d\'utilisation');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Préparer les données pour l'API
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
      };
      
      const result = await register(userData);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Une erreur est survenue lors de l\'inscription');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = (provider) => {
    setLoading(true);
    setTimeout(() => {
      alert(`Inscription avec ${provider} en cours de développement`);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="register-container">
      <Navbar />
      
      <div className="register-wrapper">
        <div className="register-form-section">
          <div className="register-card">
            <div className="register-header">
              <div className="register-logo">
                <h1>Rejoignez <span className="logo-highlight">TétouanTour</span></h1>
              </div>
              <p className="register-subtitle">Créez votre compte pour une expérience personnalisée</p>
            </div>
            
            {error && (
              <div className="register-error">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="firstName">Prénom *</label>
                  <div className="input-with-icon">
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      placeholder="Jean"
                      className="input-field"
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="form-group half">
                  <label htmlFor="lastName">Nom *</label>
                  <div className="input-with-icon">
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Dupont"
                      className="input-field"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <div className="input-with-icon">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="jean.dupont@email.com"
                    className="input-field"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Téléphone (optionnel)</label>
                <div className="input-with-icon">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+212 6 00 00 00 00"
                    className="input-field"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="password">Mot de passe *</label>
                  <div className="input-with-icon">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="input-field"
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="form-group half">
                  <label htmlFor="confirmPassword">Confirmer *</label>
                  <div className="input-with-icon">
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="input-field"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
              
              
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <span>
                    J'accepte les <Link to="/terms">Conditions d'utilisation</Link> et la <Link to="/privacy">Politique de confidentialité</Link> *
                  </span>
                </label>
              </div>
              
              <button 
                type="submit" 
                className="register-button" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Création du compte...</span>
                  </>
                ) : (
                  <>
                    <span className="button-icon">🚀</span>
                    <span>Créer mon compte</span>
                  </>
                )}
              </button>
              
              <div className="divider">
                <span>Ou s'inscrire avec</span>
              </div>
              
              <div className="social-register">
                <button 
                  type="button" 
                  className="social-button google"
                  onClick={() => handleSocialRegister('Google')}
                  disabled={loading}
                >
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" 
                    alt="Google" 
                    className="social-icon"
                  />
                  Google
                </button>
                <button 
                  type="button" 
                  className="social-button facebook"
                  onClick={() => handleSocialRegister('Facebook')}
                  disabled={loading}
                >
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/124/124010.png" 
                    alt="Facebook" 
                    className="social-icon"
                  />
                  Facebook
                </button>
              </div>
              
              <p className="login-link">
                Vous avez déjà un compte ?{' '}
                <Link to="/login" className="link-highlight">
                  Se connecter
                </Link>
              </p>
            </form>
            
            <div className="register-footer">
              <p>En vous inscrivant, vous acceptez nos conditions et notre politique de confidentialité.</p>
              <p>© 2024 TétouanTour. Tous droits réservés.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
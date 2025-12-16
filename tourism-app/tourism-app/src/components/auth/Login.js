// src/components/auth/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../common/Navbar';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation basique
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await login(formData);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Email ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Pour l'instant, simuler la connexion sociale
    setLoading(true);
    setTimeout(() => {
      alert(`Connexion avec ${provider} en cours de développement`);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="login-container">
      <Navbar />
      
      <div className="login-wrapper">
        <div className="login-form-section">
          <div className="login-card">
            <div className="login-header">
              <div className="login-logo">
                <h1>Tétouan<span className="logo-highlight">Tour</span></h1>
              </div>
              <p className="login-subtitle">Connectez-vous à votre compte</p>
            </div>
            
            {error && (
              <div className="login-error">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-with-icon">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="exemple@email.com"
                    className="input-field"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Mot de passe</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>
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
                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                    />
                    <span>Se souvenir de moi</span>
                  </label>
                  <Link to="/forgot-password" className="forgot-link">
                    Mot de passe oublié ?
                  </Link>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="login-button" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <span className="button-icon">→</span>
                    <span>Se connecter</span>
                  </>
                )}
              </button>
              
              <div className="divider">
                <span>Ou continuer avec</span>
              </div>
              
              <div className="social-login">
                <button 
                  type="button" 
                  className="social-button google"
                  onClick={() => handleSocialLogin('Google')}
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
                  onClick={() => handleSocialLogin('Facebook')}
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
              
              <p className="register-link">
                Nouveau sur TétouanTour ?{' '}
                <Link to="/register" className="link-highlight">
                  Créer un compte
                </Link>
              </p>
            </form>
            
            <div className="login-footer">
              <p>© 2024 TétouanTour. Tous droits réservés.</p>
            </div>
          </div>
        </div>
        
        
      </div>
    </div>
  );
};

export default Login;
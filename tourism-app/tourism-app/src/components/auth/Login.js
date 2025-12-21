// src/components/auth/Login.js
import React from 'react';
import { useSignIn, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';

import Navbar from '../common/Navbar';
import './Login.css';

const Login = () => {
  const { signIn } = useSignIn();
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');


  React.useEffect(() => {
    if (isSignedIn) {
      navigate('/');
    }
  }, [isSignedIn, navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/'
      });
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError('Erreur lors de la connexion. Veuillez réessayer.');
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Bienvenue sur TétouanTour</h1>
            <p>Connectez-vous pour accéder à votre compte</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="login-content">
            <button
              className="google-signin-button"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <FaGoogle className="google-icon" />
              <span>{loading ? 'Connexion...' : 'Continuer avec Google'}</span>
            </button>

            <div className="login-info">
              <p>🔒 Connexion sécurisée</p>
              <p>En vous connectant, vous acceptez nos conditions d'utilisation</p>
            </div>
          </div>

          <div className="login-footer">
            <button
              className="back-button"
              onClick={() => navigate('/')}
            >
              ← Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
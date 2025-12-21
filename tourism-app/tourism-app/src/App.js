// src/App.js - VERSION CORRIGÉE
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, useUser, useAuth } from '@clerk/clerk-react';
import Login from './components/auth/Login';
import RestaurantList from './components/restaurants/RestaurantList';
import RestaurantDetail from './components/restaurants/RestaurantDetail';
import ReservationForm from './components/restaurants/ReservationForm';
import MyReservations from './components/restaurants/MyReservations';
import Home from './components/home/Home';
import Dashboard from './components/dashboard/Dashboard';
import { initializeApiWithClerk, authService } from './services/api';
import './App.css';

function App() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [syncComplete, setSyncComplete] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // ✅ Initialisation de l'API (une seule fois)
  useEffect(() => {
    initializeApiWithClerk(getToken);
  }, [getToken]);

  // ✅ Synchronisation au moment du login
  useEffect(() => {
    const syncUserWithBackend = async () => {
      if (isSignedIn && user && !syncComplete && !isSyncing) {
        setIsSyncing(true);
        try {
          console.log("🔄 Synchronisation de l'utilisateur:", user.primaryEmailAddress?.emailAddress);
          await authService.syncUser(user);
          console.log("✅ Utilisateur synchronisé avec le backend");
          setSyncComplete(true);
        } catch (error) {
          console.error("❌ Erreur de synchronisation:", error);
          setSyncComplete(true); // On continue même en cas d'erreur
        } finally {
          setIsSyncing(false);
        }
      }
    };

    if (isLoaded) {
      syncUserWithBackend();
    }
  }, [isSignedIn, user, isLoaded, syncComplete, isSyncing]);

  // ✅ Attendre le chargement de Clerk
  if (!isLoaded) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        🔄 Chargement...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Routes Restaurants - Publiques */}
        <Route path="/restaurants" element={<RestaurantList />} />
        <Route path="/restaurants/:id" element={<RestaurantDetail />} />
        <Route path="/reservation/:restaurantId" element={<ReservationForm />} />
        <Route path="/my-reservations" element={<MyReservations />} />

        {/* Route Dashboard - Protégée */}
        <Route
          path="/dashboard"
          element={
            <>
              <SignedIn>
                {isSyncing ? (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    fontSize: '18px'
                  }}>
                    🔄 Synchronisation en cours...
                  </div>
                ) : (
                  <Dashboard />
                )}
              </SignedIn>
              <SignedOut>
                <Navigate to="/login" replace />
              </SignedOut>
            </>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
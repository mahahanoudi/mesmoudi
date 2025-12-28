// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, useUser, useAuth } from '@clerk/clerk-react';
import Login from './components/auth/Login';
import RestaurantList from './components/restaurants/RestaurantList';
import RestaurantDetail from './components/restaurants/RestaurantDetail';
import Home from './components/home/Home';
import Dashboard from './components/dashboard/Dashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import GuideManagement from './components/dashboard/GuideManagement';
import AddGuideForm from './components/guides/AddGuideForm';
import EditGuideForm from './components/guides/AddGuideForm';
import ActiveGuides from './components/guides/AddGuideForm';
import { initializeApiWithClerk, authService } from './services/api';
import './App.css';

// ===== NOUVEAUX IMPORTATIONS AJOUTÉES =====
import ReservationForm from './components/restaurants/ReservationForm';
import MyReservations from './components/restaurants/MyReservations';
import FlightSearch from './components/flights/flightSearch/FlightSearch';
import FlightDetails from './components/flights/flightDetails/FlightDetails';
import HotelList from './components/hotels/HotelList';
import HotelDetail from './components/hotels/HotelDetail';
import HotelReservationForm from './components/hotels/HotelReservationForm';
import MyHotelReservations from './components/hotels/MyHotelReservations';
// ==========================================

function App() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [syncComplete, setSyncComplete] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // 🔥 Déterminer le dashboard par défaut selon le rôle
  const getDefaultDashboard = () => {
    if (!user) return '/login';

    const role = user.publicMetadata?.role;
    console.log('🔍 Rôle détecté:', role);

    if (role === 'Admin') {
      console.log('🎯 Admin détecté -> /admin par défaut');
      return '/admin';
    } else {
      console.log('👤 Non-admin détecté -> /dashboard par défaut');
      return '/dashboard';
    }
  };

  useEffect(() => {
    initializeApiWithClerk(getToken);
  }, [getToken]);

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
          setSyncComplete(true);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    if (isLoaded) {
      syncUserWithBackend();
    }
  }, [isSignedIn, user, isLoaded, syncComplete, isSyncing]);

  // ✅ Redirection automatique selon le rôle - DÉSACTIVÉE pour permettre l'accueil
  useEffect(() => {
    // Redirection désactivée pour laisser l'utilisateur sur l'accueil s'il le souhaite
    // Les utilisateurs peuvent naviguer vers le dashboard via la navbar
  }, [isSignedIn, user, isSyncing]);

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
        <Route path="/restaurants" element={<RestaurantList />} />
        <Route path="/restaurants/:id" element={<RestaurantDetail />} />

        {/* ===== ROUTES AJOUTÉES DU DEUXIÈME FICHIER ===== */}
        <Route path="/reservation/:restaurantId" element={<ReservationForm />} />
        <Route path="/my-reservations" element={<MyReservations />} />
        <Route path="/flights" element={<FlightSearch />} />
        <Route path="/flight/:id" element={<FlightDetails />} />
        <Route path="/hotels" element={<HotelList />} />
        <Route path="/hotels/:id" element={<HotelDetail />} />
        <Route path="/hotel-reservation/:hotelId/:chambreId" element={<HotelReservationForm />} />
        <Route path="/my-hotel-reservations" element={<MyHotelReservations />} />
        {/* =============================================== */}

        {/* Route Dashboard - SEULEMENT pour les non-admin */}
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
                ) : user?.publicMetadata?.role === 'Admin' ? (
                  <Navigate to="/admin" replace />
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

        {/* Routes Admin - SEULEMENT pour les admin */}
        <Route
          path="/admin"
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
                ) : user?.publicMetadata?.role === 'Admin' ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/dashboard" replace />
                )}
              </SignedIn>
              <SignedOut>
                <Navigate to="/login" replace />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/admin/guides"
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
                ) : user?.publicMetadata?.role === 'Admin' ? (
                  <GuideManagement />
                ) : (
                  <Navigate to="/dashboard" replace />
                )}
              </SignedIn>
              <SignedOut>
                <Navigate to="/login" replace />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/admin/guides/add"
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
                ) : user?.publicMetadata?.role === 'Admin' ? (
                  <AddGuideForm />
                ) : (
                  <Navigate to="/dashboard" replace />
                )}
              </SignedIn>
              <SignedOut>
                <Navigate to="/login" replace />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/admin/guides/edit/:id"
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
                ) : user?.publicMetadata?.role === 'Admin' ? (
                  <EditGuideForm />
                ) : (
                  <Navigate to="/dashboard" replace />
                )}
              </SignedIn>
              <SignedOut>
                <Navigate to="/login" replace />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/admin/guides/active"
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
                ) : user?.publicMetadata?.role === 'Admin' ? (
                  <ActiveGuides />
                ) : (
                  <Navigate to="/dashboard" replace />
                )}
              </SignedIn>
              <SignedOut>
                <Navigate to="/login" replace />
              </SignedOut>
            </>
          }
        />

        {/* Redirection par défaut vers le dashboard approprié */}
        <Route
          path="*"
          element={
            isSignedIn ? (
              <Navigate to={getDefaultDashboard()} replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
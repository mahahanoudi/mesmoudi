// src/components/flights/FlightDetails.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import {
  FaPlane, FaCalendarAlt, FaUsers, FaChair,
  FaCheck, FaShieldAlt, FaWifi, FaUtensils, FaTv,
  FaLuggageCart, FaBed, FaUserFriends, FaArrowLeft,
  FaCreditCard, FaLock, FaStar, FaClock, FaTag,
  FaWineGlass, FaHeadset, FaBolt, FaChild, FaBaby,
  FaPassport, FaIdCard, FaChevronRight, FaInfoCircle,
  FaUserCircle, FaSpinner, FaExclamationTriangle
} from 'react-icons/fa';
import Navbar from '../../common/Navbar';
import './Detailsflight.css';

const FlightDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user: clerkUser, isSignedIn } = useUser();
  const { flight } = location.state || {};
  
  // États pour la réservation
  const [passengerCount, setPassengerCount] = useState(1);
  const [passengers, setPassengers] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isSidebarAtBottom, setIsSidebarAtBottom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Références pour le DOM
  const sidebarRef = useRef(null);
  const sidebarContentRef = useRef(null);
  const leftColumnRef = useRef(null);
  
  // Services par classe
  const classServices = {
    ECONOMY: [
      { icon: FaWifi, name: 'Wi-Fi', included: true },
      { icon: FaUtensils, name: 'Repas standard', included: true },
      { icon: FaTv, name: 'Divertissement', included: true },
      { icon: FaLuggageCart, name: '1 bagage cabine', included: true },
      { icon: FaHeadset, name: 'Service à bord', included: true },
      { icon: FaUserFriends, name: 'Service client', included: true }
    ],
    PREMIUM: [
      { icon: FaWifi, name: 'Wi-Fi haut débit', included: true },
      { icon: FaUtensils, name: 'Repas premium', included: true },
      { icon: FaTv, name: 'Divertissement premium', included: true },
      { icon: FaLuggageCart, name: '2 bagages (cabine + soute)', included: true },
      { icon: FaWineGlass, name: 'Boissons gratuites', included: true },
      { icon: FaHeadset, name: 'Service prioritaire', included: true },
      { icon: FaBolt, name: 'Enregistrement prioritaire', included: true },
      { icon: FaUserFriends, name: 'Service client premium', included: true }
    ],
    BUSINESS: [
      { icon: FaWifi, name: 'Wi-Fi illimité', included: true },
      { icon: FaUtensils, name: 'Repas gastronomique', included: true },
      { icon: FaTv, name: 'Écran grand format', included: true },
      { icon: FaLuggageCart, name: '3 bagages (2 soutes)', included: true },
      { icon: FaWineGlass, name: 'Bar à bord', included: true },
      { icon: FaBed, name: 'Siège convertible', included: true },
      { icon: FaBolt, name: 'Accès lounge', included: true },
      { icon: FaHeadset, name: 'Concierge privé', included: true },
      { icon: FaUserFriends, name: 'Service personnalisé', included: true }
    ],
    FIRST: [
      { icon: FaWifi, name: 'Wi-Fi ultra rapide', included: true },
      { icon: FaUtensils, name: 'Menu signé chef', included: true },
      { icon: FaTv, name: 'Suite privée avec écran', included: true },
      { icon: FaLuggageCart, name: 'Bagages illimités', included: true },
      { icon: FaWineGlass, name: 'Cave à vin sélection', included: true },
      { icon: FaBed, name: 'Lit plat', included: true },
      { icon: FaBolt, name: 'Service voiturier', included: true },
      { icon: FaHeadset, name: 'Assistance personnelle', included: true },
      { icon: FaUserFriends, name: 'Service VIP 24/7', included: true },
      { icon: FaShieldAlt, name: 'Assurance tout risque', included: true }
    ]
  };

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      try {
        if (isSignedIn && clerkUser) {
          const userData = {
            id: clerkUser.id,
            clerkId: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            fullName: clerkUser.fullName,
            imageUrl: clerkUser.imageUrl
          };
          setCurrentUser(userData);
          console.log('✅ Utilisateur Clerk connecté:', userData);
        } else {
          setCurrentUser(null);
          console.log('⚠️ Aucun utilisateur connecté');
        }
      } catch (error) {
        console.error('❌ Erreur vérification auth:', error);
        setCurrentUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [isSignedIn, clerkUser]);

  // Initialiser les passagers
  useEffect(() => {
    if (flight) {
      const initialPassengers = Array(passengerCount).fill().map((_, index) => ({
        type: 'adulte',
        classType: flight?.classes?.[0]?.classType || 'ECONOMY',
        firstName: '',
        lastName: '',
        nationality: 'marocaine',
        cin: '',
        passport: '',
        birthDate: '',
        id: index
      }));
      setPassengers(initialPassengers);
    }
  }, [passengerCount, flight]);

  // Calculer le prix total
  useEffect(() => {
    if (passengers.length > 0) {
      const total = passengers.reduce((sum, passenger) => {
        const price = getClassPrice(passenger.classType);
        return sum + price;
      }, 0);
      setTotalPrice(total);
    } else {
      setTotalPrice(0);
    }
  }, [passengers]);

  // Fonction pour détecter si la sidebar est en bas
  const checkSidebarPosition = useCallback(() => {
    if (!sidebarRef.current || !sidebarContentRef.current) return;
    
    const sidebar = sidebarRef.current;
    const sidebarContent = sidebarContentRef.current;
    
    const isContentOverflowing = sidebarContent.scrollHeight > sidebar.clientHeight;
    
    if (isContentOverflowing) {
      const scrollPosition = sidebar.scrollTop;
      const maxScroll = sidebarContent.scrollHeight - sidebar.clientHeight;
      const isAtBottom = scrollPosition >= maxScroll - 10;
      
      setIsSidebarAtBottom(isAtBottom);
    } else {
      setIsSidebarAtBottom(false);
    }
  }, []);

  // Effet pour gérer le scroll de la sidebar
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;
    
    sidebar.addEventListener('scroll', checkSidebarPosition);
    checkSidebarPosition();
    
    window.addEventListener('resize', checkSidebarPosition);
    
    return () => {
      if (sidebar) {
        sidebar.removeEventListener('scroll', checkSidebarPosition);
      }
      window.removeEventListener('resize', checkSidebarPosition);
    };
  }, [checkSidebarPosition]);

  // Vérifier la disponibilité quand la classe ou le nombre de passagers change
  useEffect(() => {
    const checkAvailability = async () => {
      if (!flight?.id || !passengers[0]?.classType || passengerCount <= 0) return;
      
      try {
        const availability = await checkRealTimeAvailability(
          flight.id,
          passengers[0].classType,
          passengerCount
        );
        
        if (!availability.available) {
          setAvailabilityError(`Seulement ${availability.availableSeats} place(s) disponible(s)`);
        } else {
          setAvailabilityError('');
        }
      } catch (error) {
        console.error('Erreur vérification disponibilité:', error);
      }
    };
    
    const timer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timer);
  }, [passengers, passengerCount, flight?.id]);

  // Fonctions utilitaires
  const formatDate = (dateTime) => {
    if (!dateTime) return 'N/A';
    try {
      const date = new Date(dateTime);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins.toString().padStart(2, '0')}m`;
  };

  const formatCurrency = (price) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0
    }).format(price || 0);
  };

  // FONCTION : Calculer le prix par classe
  const getClassPrice = (classType) => {
    if (!flight) return 0;
    
    const basePrice = flight.basePrice || flight.price || 0;
    
    if (!flight.classes || flight.classes.length === 0) {
      return basePrice;
    }
    
    const flightClass = flight.classes.find(c => c.classType === classType);
    
    if (!flightClass) {
      return basePrice;
    }
    
    if (flightClass.totalPrice !== undefined && flightClass.totalPrice !== null && flightClass.totalPrice > 0) {
      return flightClass.totalPrice;
    }
    
    const classSupplement = flightClass.classPrice || 0;
    return basePrice + classSupplement;
  };

  // Fonction pour obtenir le supplément de classe
  const getClassSupplement = (classType) => {
    const flightClass = flight?.classes?.find(c => c.classType === classType);
    return flightClass?.classPrice || 0;
  };

  // Fonction pour obtenir le prix de base
  const getBasePrice = () => {
    return flight?.basePrice || flight?.price || 0;
  };

  // Obtenir les places disponibles par classe
  const getAvailableSeats = (classType) => {
    if (!flight?.classes || flight.classes.length === 0) {
      return 0;
    }
    
    const flightClass = flight.classes.find(c => c.classType === classType);
    return flightClass?.availableSeats || 0;
  };

  // Vérifier la disponibilité en temps réel
  const checkRealTimeAvailability = async (flightId, classType, passengersCount) => {
    try {
      const response = await axios.get(
        `http://localhost:8082/api/flights/${flightId}/availability`,
        {
          params: {
            classType: classType,
            passengers: passengersCount
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Erreur vérification disponibilité:', error);
      return { available: false, message: 'Erreur de vérification' };
    }
  };

  // Gérer le changement de passager
  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    
    if (field === 'nationality' && value !== 'marocaine') {
      updatedPassengers[index].cin = '';
    }
    if (field === 'nationality' && value === 'marocaine') {
      updatedPassengers[index].passport = '';
    }
    
    setPassengers(updatedPassengers);
  };

  // Vérifier si le formulaire est valide
  const isFormValid = () => {
    if (passengers.length === 0) return false;
    
    return passengers.every(passenger => {
      if (!passenger.firstName?.trim() || !passenger.lastName?.trim() || !passenger.nationality) {
        return false;
      }
      
      if (passenger.nationality === 'marocaine' && passenger.type === 'adulte') {
        if (!passenger.cin || passenger.cin.length !== 8) {
          return false;
        }
      }
      
      if (passenger.nationality !== 'marocaine') {
        if (!passenger.passport || passenger.passport.length < 6) {
          return false;
        }
      }
      
      const seatsTaken = passengers.filter(p => p.classType === passenger.classType).length;
      if (seatsTaken > getAvailableSeats(passenger.classType)) {
        return false;
      }
      
      return true;
    });
  };

  // FONCTION PRINCIPALE : Gérer la réservation
  const handleReservation = async () => {
    // 1. Validation du formulaire
    if (!isFormValid()) {
      alert('❌ Veuillez remplir correctement tous les champs obligatoires.');
      return;
    }
    
    // 2. Vérifier si l'utilisateur est connecté avec Clerk
    if (!currentUser || !isSignedIn) {
      const redirectToLogin = window.confirm(
        '🔐 Vous devez être connecté pour effectuer une réservation.\n\nVoulez-vous être redirigé vers la page de connexion?'
      );
      
      if (redirectToLogin) {
        navigate('/login', { 
          state: { 
            from: location.pathname,
            flightData: flight,
            passengerCount: passengerCount
          }
        });
      }
      return;
    }
    
    // 3. Demander confirmation
    const confirmed = window.confirm(
      `🎫 CONFIRMER LA RÉSERVATION\n\n` +
      `✈️ Vol: ${flight.airline} ${flight.flightNumber}\n` +
      `👤 Passagers: ${passengerCount} personne(s)\n` +
      `💰 Montant total: ${formatCurrency(totalPrice)}\n` +
      `👨‍✈️ Pour: ${currentUser.firstName} ${currentUser.lastName}\n\n` +
      `Confirmez-vous cette réservation?`
    );
    
    if (!confirmed) return;
    
    setIsLoading(true);
    
    try {
      // 4. Préparer les données
      const getFlightClassId = (classType) => {
    if (!flight?.classes) return null;
    const flightClass = flight.classes.find(c => c.classType === classType);
    return flightClass?.id; // Assurez-vous que votre DTO retourne l'ID
};

// Dans handleReservation, modifier la préparation des données
const reservationData = {
    flightId: flight.id,
    passengersCount: passengerCount,
    passengers: passengers.map(p => {
        const flightClass = flight.classes?.find(fc => fc.classType === p.classType);
        return {
            ...p,
            flightClassId: flightClass?.id, // ✅ TOUJOURS inclure cet ID
            passengerType: p.type.toUpperCase(),
            classType: p.classType
        };
    }),
    totalPrice,
    userId: currentUser?.clerkId
};


console.log('📤 Données de réservation envoyées:', {
    ...reservationData,
    passengers: reservationData.passengers.map(p => ({
        ...p,
        flightClassId: p.flightClassId
    }))
});
      
      console.log('📤 Données de réservation:', reservationData);
      console.log('👤 Utilisateur Clerk:', currentUser.clerkId);
      
      // 5. Récupérer le token Clerk
      const token = await getToken();
      if (!token) {
        throw new Error('Token Clerk non disponible');
      }

      const commonHeaders = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
  'X-User-Id': currentUser.clerkId      // <‑‑ ajout
};
      
      // 6. Créer la réservation (PENDING)
      const createResponse = await axios.post(
        'http://localhost:8082/api/reservations/create',
        reservationData,
        { headers: commonHeaders }
      );
      
      if (createResponse.data.status === 'SUCCESS') {
        const reservationId = createResponse.data.reservationId;
        const confirmationCode = createResponse.data.confirmationCode;
        
        // 7. Confirmer la réservation (CONFIRMED)
        const confirmResponse = await axios.post(
          `http://localhost:8082/api/reservations/confirm/${reservationId}`,
          {},
          { headers: commonHeaders }
        );
        
        if (confirmResponse.data.status === 'SUCCESS') {
          // SUCCÈS COMPLET
          alert(`✅ RÉSERVATION CONFIRMÉE !\n\n` +
                `📋 Code de confirmation: ${confirmationCode}\n` +
                `💰 Montant: ${formatCurrency(totalPrice)}\n` +
                `👤 Client: ${currentUser.firstName} ${currentUser.lastName}\n` +
                `✈️ Vol: ${flight.airline} ${flight.flightNumber}\n` +
                `📅 Date: ${formatDate(flight.departureTime)}\n\n` +
                `Un email de confirmation vous a été envoyé.`);
          
          // Rediriger vers la page des vols
          navigate('/flights', { 
            state: { 
              reservationSuccess: true,
              confirmationCode: confirmationCode,
              flightDetails: {
                airline: flight.airline,
                flightNumber: flight.flightNumber,
                departure: flight.departureCity
              }
            }
          });
        } else {
          throw new Error('Erreur lors de la confirmation de la réservation');
        }
      } else {
        if (createResponse.data.requiresLogin) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error(createResponse.data.message || 'Erreur lors de la création de la réservation');
      }
      
    } catch (error) {
      console.error('❌ Erreur réservation:', error);
      
      // Messages d'erreur spécifiques
      if (error.message.includes('Session expirée') || 
          error.message.includes('non connecté') || 
          error.message.includes('connecter') ||
          error.response?.status === 401) {
        alert('🔐 Erreur d\'authentification\n\nVotre session a expiré ou vous n\'êtes pas connecté.\nVeuillez vous reconnecter avec Clerk.');
        navigate('/login');
      } 
    } finally {
      setIsLoading(false);
    }
  };

  // Obtenir le nom de la classe
  const getClassName = (classType) => {
    const names = {
      ECONOMY: 'Économique',
      PREMIUM: 'Premium',
      BUSINESS: 'Affaires',
      FIRST: 'Première'
    };
    return names[classType] || classType;
  };

  // Obtenir la couleur de la classe
  const getClassColor = (classType) => {
    const colors = {
      ECONOMY: '#27ae60',
      PREMIUM: '#3498db',
      BUSINESS: '#d4af37',
      FIRST: '#e74c3c'
    };
    return colors[classType] || '#27ae60';
  };

  // Vérification si le vol existe
  if (!flight) {
    return (
      <div className="flight-details-container">
        <Navbar />
        <div className="no-flight-message">
          <h2>Aucune information de vol disponible</h2>
          <button onClick={() => navigate('/flights')}>
            Retour à la recherche
          </button>
        </div>
      </div>
    );
  }

  // Obtenir le prix de base
  const basePrice = getBasePrice();

  return (
    <div className="flight-details-container">
      <Navbar />

      <div className="details-content">
        {/* Header */}
        <div className="details-header">
          <h1>Détails du vol</h1>
        </div>

        <div className="details-layout">
          {/* Colonne de gauche - Informations du vol et passagers */}
          <div className="details-left-column" ref={leftColumnRef}>
            {/* Informations du vol */}
            <div className="flight-info-card">
              <div className="flight-header">
                <div className="airline-info">
                  <div className="airline-logo-large">
                    <FaPlane />
                  </div>
                  <div>
                    <h2>{flight.airline}</h2>
                    <p className="flight-number">Vol {flight.flightNumber}</p>
                  </div>
                </div>
                <div className="flight-status">
                  <span className="status-badge">{flight.status}</span>
                  {availabilityError && (
                    <span className="availability-warning">
                      <FaExclamationTriangle /> {availabilityError}
                    </span>
                  )}
                </div>
              </div>

              {/* Itinéraire */}
              <div className="detailed-route">
                <div className="departure-details">
                  <div className="time">{formatDate(flight.departureTime)}</div>
                  <div className="location">
                    <h3>{flight.departureCity}</h3>
                    <p>{flight.departureAirport || 'Aéroport'}</p>
                  </div>
                </div>

                <div className="route-middle">
                  <div className="duration-info">
                    <FaClock />
                    <span>{formatDuration(flight.duration)}</span>
                  </div>
                  <div className="route-line-detailed">
                    <div className="line"></div>
                    <FaPlane className="plane" />
                  </div>
                  <div className="route-type">Vol direct</div>
                </div>

                <div className="arrival-details">
                  <div className="time">{formatDate(flight.arrivalTime)}</div>
                  <div className="location">
                    <h3>Tétouan</h3>
                    <p>Aéroport Sania Ramel</p>
                  </div>
                </div>
              </div>

              {/* Informations avion */}
              <div className="aircraft-info">
                <FaPlane />
                <span>{flight.aircraftType || 'Boeing 737'}</span>
              </div>
            </div>

            {/* Nombre de passagers */}
            <div className="passenger-count-card">
              <h3><FaUsers /> Nombre de passagers</h3>
              <div className="passenger-count-controls">
                <button 
                  onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                  disabled={passengerCount <= 1}
                >
                  -
                </button>
                <div className="passenger-count-display">
                  <FaUsers />
                  <span>{passengerCount} passager{passengerCount > 1 ? 's' : ''}</span>
                </div>
                <button 
                  onClick={() => setPassengerCount(passengerCount + 1)}
                  disabled={passengerCount >= 9}
                >
                  +
                </button>
              </div>
            </div>

            {/* Informations des passagers */}
            {passengerCount > 0 && (
              <div className="passenger-info-card">
                <h3><FaUserFriends /> Informations des passagers</h3>
                <p className="passenger-instruction">
                  Remplissez les informations pour chaque passager. Vous pouvez choisir une classe différente pour chaque personne.
                </p>
                
                {passengers.map((passenger, index) => {
                  const seatsTaken = passengers.filter(p => p.classType === passenger.classType).length;
                  const availableSeats = getAvailableSeats(passenger.classType);
                  const seatsAvailable = availableSeats - seatsTaken + 1;
                  const classSupplement = getClassSupplement(passenger.classType);
                  const totalPriceForClass = getClassPrice(passenger.classType);
                  
                  return (
                    <div key={passenger.id} className="passenger-form-section">
                      <div className="passenger-section-header">
                        <h4>Passager {index + 1}</h4>
                        <div className="passenger-class-info">
                          <div 
                            className="class-indicator" 
                            style={{ backgroundColor: getClassColor(passenger.classType) }}
                          />
                          <span>{getClassName(passenger.classType)}</span>
                          <span className="class-price-small">
                            {formatCurrency(totalPriceForClass)}
                            {classSupplement > 0 && (
                              <small className="class-supplement">
                                (Base: {formatCurrency(basePrice)} + {formatCurrency(classSupplement)})
                              </small>
                            )}
                          </span>
                        </div>
                      </div>
                      
                      <div className="class-selection-passenger">
                        <label>Classe pour ce passager</label>
                        <div className="class-buttons">
                          {flight.classes?.map((flightClass) => {
                            const color = getClassColor(flightClass.classType);
                            const seatsTakenForClass = passengers.filter(p => p.classType === flightClass.classType).length;
                            const availableForClass = flightClass.availableSeats - seatsTakenForClass + (passenger.classType === flightClass.classType ? 1 : 0);
                            const classSupplement = flightClass.classPrice || 0;
                            const totalForClass = getClassPrice(flightClass.classType);
                            
                            return (
                              <button
                                key={flightClass.classType}
                                className={`class-btn ${passenger.classType === flightClass.classType ? 'selected' : ''}`}
                                onClick={() => handlePassengerChange(index, 'classType', flightClass.classType)}
                                disabled={availableForClass <= 0}
                                style={{
                                  borderColor: passenger.classType === flightClass.classType ? color : '#e2e8f0',
                                  color: passenger.classType === flightClass.classType ? color : '#64748b'
                                }}
                              >
                                <span>{getClassName(flightClass.classType)}</span>
                                <span className="class-btn-price">
                                  {formatCurrency(totalForClass)}
                                  {classSupplement > 0 && (
                                    <div className="class-btn-supplement">
                                      <small>(+{formatCurrency(classSupplement)})</small>
                                    </div>
                                  )}
                                </span>
                                <span className="class-btn-seats">
                                  {availableForClass} place{availableForClass > 1 ? 's' : ''}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="passenger-form">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Type de passager</label>
                            <select
                              value={passenger.type}
                              onChange={(e) => handlePassengerChange(index, 'type', e.target.value)}
                            >
                              <option value="adulte">Adulte (16+ ans)</option>
                              <option value="enfant">Enfant (2-15 ans)</option>
                              <option value="bebe">Bébé (0-1 an)</option>
                            </select>
                            {passenger.type === 'enfant' && <FaChild className="passenger-type-icon" />}
                            {passenger.type === 'bebe' && <FaBaby className="passenger-type-icon" />}
                          </div>
                          
                          <div className="form-group">
                            <label>Nationalité</label>
                            <select
                              value={passenger.nationality}
                              onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                            >
                              <option value="marocaine">Marocaine</option>
                              <option value="française">Française</option>
                              <option value="espagnole">Espagnole</option>
                              <option value="autre">Autre</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="form-row">
                          <div className="form-group">
                            <label>Prénom *</label>
                            <input
                              type="text"
                              placeholder="Prénom"
                              value={passenger.firstName}
                              onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                              required
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>Nom *</label>
                            <input
                              type="text"
                              placeholder="Nom de famille"
                              value={passenger.lastName}
                              onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="form-row">
                          <div className="form-group">
                            <label>Date de naissance</label>
                            <input
                              type="date"
                              value={passenger.birthDate}
                              onChange={(e) => handlePassengerChange(index, 'birthDate', e.target.value)}
                            />
                          </div>
                          
                          {/* CIN pour marocains adultes */}
                          {passenger.nationality === 'marocaine' && passenger.type === 'adulte' && (
                            <div className="form-group">
                              <label><FaIdCard /> Numéro CIN *</label>
                              <input
                                type="text"
                                placeholder="C1234567"
                                value={passenger.cin}
                                onChange={(e) => handlePassengerChange(index, 'cin', e.target.value)}
                                maxLength="8"
                                pattern="[A-Za-z][0-9]{7}"
                                required
                              />
                              <small className="hint">Format: Lettre + 7 chiffres (ex: C1234567)</small>
                            </div>
                          )}
                        </div>
                        
                        {/* Passeport pour non-marocains */}
                        {passenger.nationality !== 'marocaine' && (
                          <div className="form-row">
                            <div className="form-group">
                              <label><FaPassport /> Numéro de passeport *</label>
                              <input
                                type="text"
                                placeholder="AA123456"
                                value={passenger.passport}
                                onChange={(e) => handlePassengerChange(index, 'passport', e.target.value)}
                                required
                              />
                              <small className="hint">Format: 2 lettres + 6 chiffres minimum</small>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Services pour la classe choisie */}
                      <div className="passenger-services">
                        <h5><FaStar /> Services inclus pour {getClassName(passenger.classType)}</h5>
                        <div className="service-tags">
                          {classServices[passenger.classType]?.slice(0, 4).map((service, i) => (
                            <span key={i} className="service-tag">
                              <service.icon size={12} />
                              {service.name}
                            </span>
                          ))}
                          <button 
                            className="see-more-services"
                            onClick={() => {
                              const serviceNames = classServices[passenger.classType]?.map(s => s.name).join(', ');
                              alert(`Tous les services pour ${getClassName(passenger.classType)}:\n\n${serviceNames}`);
                            }}
                          >
                            <FaInfoCircle /> Voir plus
                          </button>
                        </div>
                      </div>
                      
                      {index < passengers.length - 1 && <hr className="passenger-separator" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Colonne de droite - Résumé et services */}
          <div 
            ref={sidebarRef}
            className={`details-right-column ${isSidebarAtBottom ? 'sidebar-sticky-bottom' : ''}`}
          >
            <div ref={sidebarContentRef} className="sidebar-content">
              {/* Services par classe */}
              <div className="services-summary-card">
                <h3><FaStar /> Services par classe</h3>
                
                <div className="services-classes">
                  {flight.classes?.map((flightClass) => {
                    const color = getClassColor(flightClass.classType);
                    const totalForClass = getClassPrice(flightClass.classType);
                    const classSupplement = flightClass.classPrice || 0;
                    
                    return (
                      <div key={flightClass.classType} className="service-class-item">
                        <div className="service-class-header">
                          <div 
                            className="class-dot" 
                            style={{ backgroundColor: color }}
                          />
                          <span className="service-class-name">{getClassName(flightClass.classType)}</span>
                          <span className="service-class-price">
                            {formatCurrency(totalForClass)}
                            {classSupplement > 0 && (
                              <div style={{ 
                                fontSize: '11px', 
                                color: '#666',
                                fontWeight: 'normal'
                              }}>
                                <small>
                                  {formatCurrency(basePrice)} + {formatCurrency(classSupplement)}
                                </small>
                              </div>
                            )}
                          </span>
                        </div>
                        
                        <div className="service-class-services">
                          {classServices[flightClass.classType]?.slice(0, 3).map((service, i) => (
                            <div key={i} className="service-class-service">
                              <service.icon size={12} />
                              <span>{service.name}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="service-class-availability">
                          <FaInfoCircle />
                          <small>
                            {flightClass.availableSeats || 0} 
                            place{flightClass.availableSeats > 1 ? 's' : ''} 
                            disponible{flightClass.availableSeats > 1 ? 's' : ''}
                          </small>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="services-note">
                  <FaInfoCircle />
                  <small>Chaque passager peut choisir une classe différente</small>
                </div>
              </div>

              {/* Résumé du prix */}
              <div className="price-summary-card">
                <h3><FaCreditCard /> Récapitulatif</h3>
                
                <div className="price-breakdown">
                  <div className="price-items-list">
                    {passengers.map((passenger, index) => {
                      const totalForClass = getClassPrice(passenger.classType);
                      const classSupplement = getClassSupplement(passenger.classType);
                      
                      return (
                        <div key={passenger.id} className="price-item-detail">
                          <div className="price-item-header">
                            <span>Passager {index + 1} - {getClassName(passenger.classType)}</span>
                            <span className="item-price">{formatCurrency(totalForClass)}</span>
                          </div>
                          <div className="price-item-sub">
                            <small>
                              {classSupplement > 0 
                                ? `${formatCurrency(basePrice)} + ${formatCurrency(classSupplement)}`
                                : 'Prix de base'
                              }
                            </small>
                            <small>{passenger.nationality} - {passenger.type}</small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="price-total">
                    <span>Total à payer</span>
                    <span className="total-amount">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
                
                <div className="tax-info">
                  <small>Toutes taxes et frais inclus</small>
                </div>
                
                <div className="security-info">
                  <FaLock />
                  <span>Paiement 100% sécurisé SSL</span>
                </div>
                
                <button 
                  className="book-now-btn" 
                  onClick={handleReservation}
                  disabled={!isFormValid() || isLoading || !currentUser}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="spinner-icon" />
                      Traitement en cours...
                    </>
                  ) : !currentUser ? (
                    <>
                      <FaUserCircle /> 
                      Se connecter avec Clerk pour réserver
                    </>
                  ) : (
                    <>
                      <FaCreditCard /> 
                      Confirmer la réservation
                    </>
                  )}
                </button>
                
                <div className="guarantee">
                  <FaShieldAlt />
                  <span>Garantie satisfait ou remboursé sous 24h</span>
                </div>
                
                {!isFormValid() && (
                  <div className="form-validation">
                    <small>
                      {passengers.some(p => !p.firstName || !p.lastName) 
                        ? 'Veuillez remplir tous les champs obligatoires (*)'
                        : passengers.some(p => p.nationality === 'marocaine' && p.type === 'adulte' && (!p.cin || p.cin.length !== 8))
                        ? 'CIN invalide pour les adultes marocains'
                        : passengers.some(p => p.nationality !== 'marocaine' && !p.passport)
                        ? 'Passeport requis pour les non-marocains'
                        : passengers.some(p => {
                            const seatsTaken = passengers.filter(ps => ps.classType === p.classType).length;
                            return seatsTaken > getAvailableSeats(p.classType);
                          })
                        ? 'Problème de disponibilité des places'
                        : 'Veuillez vérifier toutes les informations'}
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDetails;
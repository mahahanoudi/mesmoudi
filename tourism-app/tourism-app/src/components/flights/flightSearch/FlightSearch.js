// FlightSearch.js
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, FaPlane, FaCalendarAlt, FaMapMarkerAlt,
  FaFilter, FaTimes, FaInfoCircle, FaCity, FaChair,
  FaExclamationTriangle, FaSpinner, FaClock, FaDollarSign,
  FaSortAmountDown, FaCalendar, FaCheck
} from 'react-icons/fa';
import Navbar from '../../common/Navbar';
import './FlightSearch.css';
import FlightService from '../../../services/flight.service';

// Fonctions utilitaires
const formatDisplayDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Fonctions pour les dates dynamiques
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Stats Bar Component avec les couleurs des classes
const StatsBar = ({ stats, flights, cities, airlines }) => {
  // Définir les couleurs en fonction des types de classes
  const statsData = [
    { 
      icon: FaPlane, 
      label: 'Vols Disponibles', 
      value: flights?.length || 0, 
      color: '#27ae60' // Vert comme Economique
    },
    { 
      icon: FaCity, 
      label: "Villes desservies", 
      value: cities?.length || 0, 
      color: '#3498db' // Bleu comme Premium
    },
    { 
      icon: FaPlane, // Utiliser FaPlane pour compagnies
      label: 'Compagnies', 
      value: airlines?.length || 0, 
      color: '#d4af37' // Or comme Business
    },
    { 
      icon: FaDollarSign, 
      label: 'Prix à partir de', 
      value: stats?.minPrice ? `${Math.round(stats.minPrice)} MAD` : '---', 
      color: '#e74c3c' // Rouge comme First
    },
  ];

  return (
    <div className="stats-bar">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ 
              background: `${stat.color}15`,
              border: `2px solid ${stat.color}30`
            }}>
              <Icon size={20} style={{ color: stat.color }} />
            </div>
            <div className="stat-content">
              <p className="stat-label" style={{ color: stat.color }}>{stat.label}</p>
              <h3 className="stat-value" style={{ color: stat.color }}>{stat.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Carousel Component
const CarouselSection = () => {
  const carouselImages = [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      title: 'Vols vers Tétouan',
      subtitle: 'Découvrez la Perle Blanche du Maroc'
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      title: 'Aéroport Sania Ramel',
      subtitle: 'Votre porte d\'entrée vers Tétouan'
    },
    {
      id: 3,
      url: 'data:image/jpeg;base64,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',
      title: 'Voyagez en Confort',
      subtitle: 'Les meilleures compagnies à votre service'
    }
  ];

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="carousel-section">
      <div className="carousel-container">
        {carouselImages.map((img, index) => (
          <div 
            key={img.id}
            className={`carousel-slide ${index === currentImage ? 'active' : ''}`}
            style={{ backgroundImage: `url(${img.url})` }}
          >
            <div className="slide-overlay">
              <div className="slide-content">
                <h2>{img.title}</h2>
                <p>{img.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
        
        <div className="carousel-indicators">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentImage ? 'active' : ''}`}
              onClick={() => setCurrentImage(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Search Card Component - CORRIGÉ
const SearchCard = ({ onSearch, cities, filters, setFilters, loading }) => {
  const handleSearch = async (e) => {
    e.preventDefault();
    await onSearch();
  };

  const today = getTodayDate();

  return (
    <div className="search-card" style={{}}>
      <div className="search-header">
        <p className="search-subtitle">Découvrez Tétouan</p>
        <h2 className="search-title">Rechercher un Vol</h2>
      </div>

      <CarouselSection />

      <form className="search-form" onSubmit={handleSearch}>
        {/* Première ligne: Indication de destination Tétouan */}
        <div className="form-row destination-row">
          <div className="destination-badge">
            <div className="destination-icon">
              <FaMapMarkerAlt size={24} />
            </div>
            <div className="destination-content">
              <span className="destination-label">Destination</span>
              <span className="destination-value">Tétouan (TTU)</span>
              <span className="destination-sub">Aéroport Sania Ramel</span>
            </div>
          </div>
        </div>

        {/* Deuxième ligne: Tous les champs sur une ligne */}
        <div className="search-fields-row">
          {/* Ville de départ */}
          <div className="form-group">
            <label className="form-label">
              <FaPlane /> Départ de
            </label>
            <div className="form-input-wrapper">
              <FaCity size={18} className="form-icon" />
              <select
  value={filters.departureCity}
  onChange={(e) =>
    setFilters({ ...filters, departureCity: e.target.value })
  }
  style={{
    border: "none",
    cursor: "pointer",
    appearance: "none",
    padding: "4px 8px"
  }}
  className="select-no-border"
>

                <option value="">Sélectionnez une ville</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date d'aller */}
          <div className="form-group">
            <label className="form-label">
              <FaCalendarAlt /> Date
            </label>
            <div className="form-input-wrapper">
              <FaCalendarAlt size={18} className="form-icon" />
              <input
                type="date"
                value={filters.departureDate}
                onChange={(e) => setFilters({...filters, departureDate: e.target.value})}
                style={{border:"none",
    cursor: "pointer",
    appearance: "none",
    width: "280px",
    padding: "4px 8px"}}
                className="no-date-icon"
                min={today}
                required
              />
            </div>
          </div>

          {/* Bouton recherche */}
          <div className="form-group ">
            <button type="submit" disabled={loading} className="search-button">
              {loading ? (
                <>
                  <FaSpinner className="loading-spinner-small" />
                  <span style={{ marginLeft: '8px' }}>Recherche...</span>
                </>
              ) : (
                <>
                  <FaSearch size={18} /> Rechercher
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// Filter Sidebar Component - AVEC SCROLL
const FilterSidebar = ({ airlines, filters, onApplyFilters, flightsCount }) => {
  const [sidebarFilters, setSidebarFilters] = useState({
    maxPrice: 5000,
    maxDuration: '',
    selectedAirlines: [],
    departureTime: ''
  });

  const toggleAirline = (airline) => {
    setSidebarFilters(prev => ({
      ...prev,
      selectedAirlines: prev.selectedAirlines.includes(airline)
        ? prev.selectedAirlines.filter(a => a !== airline)
        : [...prev.selectedAirlines, airline]
    }));
  };

  const handleApply = () => {
    onApplyFilters(sidebarFilters);
  };

  const resetFilters = () => {
    setSidebarFilters({
      maxPrice: 5000,
      maxDuration: '',
      selectedAirlines: [],
      departureTime: ''
    });
    onApplyFilters({
      maxPrice: 5000,
      maxDuration: '',
      selectedAirlines: [],
      departureTime: ''
    });
  };

  const formatCurrency = (price) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="filter-sidebar">
      <div className="filter-scroll-container">
        <div className="filter-header">
          <h3 className="filter-title"><FaFilter size={18} /> Filtres</h3>
          {flightsCount > 0 && (
            <button className="filter-reset" onClick={resetFilters}>
              <FaTimes size={16} /> Réinitialiser
            </button>
          )}
        </div>

        <div className="filter-section">
          <h4 className="filter-section-title"><FaDollarSign /> Prix maximum</h4>
          <div className="price-filter">
            <div className="price-display">
              <span className="price-current">{formatCurrency(sidebarFilters.maxPrice)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={sidebarFilters.maxPrice}
              onChange={(e) => setSidebarFilters({
                ...sidebarFilters,
                maxPrice: parseInt(e.target.value)
              })}
              className="price-slider"
            />
            <div className="price-limits">
              <span>0 MAD</span>
              <span>5000 MAD</span>
            </div>
          </div>
        </div>

        <div className="filter-section">
          <h4 className="filter-section-title"><FaClock /> Durée max</h4>
          <div className="duration-options">
            {['2h', '3h', '4h', '5h', '6h', 'Toutes'].map(duration => (
              <button
                key={duration}
                className={`duration-btn ${sidebarFilters.maxDuration === duration ? 'active' : ''}`}
                onClick={() => setSidebarFilters({
                  ...sidebarFilters,
                  maxDuration: sidebarFilters.maxDuration === duration ? '' : duration
                })}
              >
                {duration}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h4 className="filter-section-title">Compagnies aériennes</h4>
          <div className="airlines-list">
            {airlines.slice(0, 6).map(airline => (
              <label key={airline} className="airline-checkbox">
                <input
                  type="checkbox"
                  checked={sidebarFilters.selectedAirlines.includes(airline)}
                  onChange={() => toggleAirline(airline)}
                  className="checkbox-input"
                />
                <div className={`checkbox-box ${sidebarFilters.selectedAirlines.includes(airline) ? 'checked' : ''}`}>
                  {sidebarFilters.selectedAirlines.includes(airline) && <FaCheck size={14} />}
                </div>
                <span className="airline-label">{airline}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h4 className="filter-section-title">Heure de départ</h4>
          <div className="time-options">
            <label className="time-option">
              <input
                type="radio"
                name="departureTime"
                checked={sidebarFilters.departureTime === 'morning'}
                onChange={() => setSidebarFilters({...sidebarFilters, departureTime: 'morning'})}
              />
              <span>Matin (6h-12h)</span>
            </label>
            <label className="time-option">
              <input
                type="radio"
                name="departureTime"
                checked={sidebarFilters.departureTime === 'afternoon'}
                onChange={() => setSidebarFilters({...sidebarFilters, departureTime: 'afternoon'})}
              />
              <span>Après-midi (12h-18h)</span>
            </label>
            <label className="time-option">
              <input
                type="radio"
                name="departureTime"
                checked={sidebarFilters.departureTime === 'evening'}
                onChange={() => setSidebarFilters({...sidebarFilters, departureTime: 'evening'})}
              />
              <span>Soir/Nuit (18h-6h)</span>
            </label>
          </div>
        </div>

        {sidebarFilters.selectedAirlines.length > 0 && (
          <div className="active-filters">
            <h4 className="filter-section-title">Filtres actifs</h4>
            <div className="filter-tags">
              {sidebarFilters.selectedAirlines.map(airline => (
                <span key={airline} className="filter-tag">
                  {airline}
                  <button onClick={() => toggleAirline(airline)}>×</button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <button className="apply-filters-btn" onClick={handleApply}>
        Appliquer les filtres
      </button>
    </div>
  );
};

// Flight Card Component
const FlightCard = ({ flight, onViewDetails }) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? mins : '00'}`;
  };

  const formatCurrency = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Mappage des classes avec couleurs
  const getClassColor = (classType) => {
    switch(classType) {
      case 'ECONOMY': return '#27ae60'; // vert
      case 'PREMIUM': return '#3498db'; // bleu
      case 'BUSINESS': return '#d4af37'; // or
      case 'FIRST': return '#e74c3c'; // rouge
      default: return '#95a5a6'; // gris
    }
  };

  // Afficher les informations des classes sur une ligne
  const renderClassInfo = () => {
    if (!flight.classes || flight.classes.length === 0) {
      return null;
    }

    return (
      <div className="flight-classes-horizontal">
        <span className="classes-label">Places disponibles:</span>
        <div className="class-tags">
          {flight.classes.map((flightClass, index) => {
            const color = getClassColor(flightClass.classType);
            const classLabel = flightClass.classType === 'ECONOMY' ? 'Éco' :
                              flightClass.classType === 'PREMIUM' ? 'Premium' :
                              flightClass.classType === 'BUSINESS' ? 'Affaires' : 'Première';
            
            return (
              <div 
                key={index} 
                className="class-tag"
                style={{ 
                  backgroundColor: `${color}15`,
                  
                  color: color
                }}
              >
                <span className="class-name">{classLabel}</span>
                <span className="class-seats-count">{flightClass.availableSeats}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flight-card">
      <div className="flight-header">
        <div className="flight-date">
          <FaCalendar size={16} />
          <span>{formatDate(flight.departureTime)}</span>
        </div>
      </div>

      <div className="flight-route">
        <div className="flight-location departure">
          <div className="location-code">{flight.departureCode || flight.departureCity?.substring(0, 3).toUpperCase() || 'DEP'}</div>
          <div className="location-name">{flight.departureCity}</div>
          <div className="location-time">{formatTime(flight.departureTime)}</div>
        </div>

        <div className="flight-timeline">
          <div className="timeline-line">
            <div className="timeline-dot departure-dot"></div>
            <div className="timeline-path"></div>
            <FaPlane size={18} className="timeline-plane" />
            <div className="timeline-path"></div>
            <div className="timeline-dot arrival-dot"></div>
          </div>
          <div className="timeline-duration">
            <FaClock size={14} />
            <span>{formatDuration(flight.duration)}</span>
          </div>
        </div>

        <div className="flight-location arrival">
          <div className="location-code">TTU</div>
          <div className="location-name">Tétouan</div>
          <div className="location-time">{formatTime(flight.arrivalTime)}</div>
        </div>
      </div>

      <div className="flight-details">
        <div className="flight-info">
          <div className="airline-badge">
            <div className="airline-icon">
              <FaPlane size={14} />
            </div>
            <span className="airline-name">{flight.airline}</span>
          </div>
          <div className="flight-meta">
            {flight.aircraftType || 'Boeing 737'} · Vol {flight.flightNumber}
          </div>
          
          {/* Informations des classes */}
          {flight.classes && flight.classes.length > 0 && (
            <div className="classes-section">
              {renderClassInfo()}
            </div>
          )}
        </div>

        <div className="flight-action">
          <div className="flight-price">
            <span className="price-label">À partir de</span>
            <span className="price-value">
              {formatCurrency(flight.basePrice || 0)}
            </span>
          </div>
          <button 
            className="select-button"
            onClick={() => onViewDetails(flight)}
          >
            <FaInfoCircle size={16} /> 
            Voir détails
          </button>
        </div>
      </div>
    </div>
  );
};

// Flight Results Component
const FlightResults = ({ flights, loading, sortBy, setSortBy, filters, onViewDetails }) => {
  const sortedFlights = useMemo(() => {
    let result = [...flights];
    
    switch(sortBy) {
      case 'price_low':
        result.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
        break;
      case 'price_high':
        result.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
        break;
      case 'duration':
        result.sort((a, b) => (a.duration || 0) - (b.duration || 0));
        break;
      case 'departure_early':
        result.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
        break;
      default:
        result.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
        break;
    }
    
    return result;
  }, [flights, sortBy]);

  const filteredFlights = useMemo(() => {
    return sortedFlights.filter(flight => {
      const flightPrice = flight.basePrice || 0;
      if (filters.maxPrice && flightPrice > filters.maxPrice) {
        return false;
      }
      
      if (filters.maxDuration && filters.maxDuration !== 'Toutes') {
        const maxHours = parseInt(filters.maxDuration);
        if (flight.duration > maxHours * 60) {
          return false;
        }
      }
      
      if (filters.selectedAirlines && filters.selectedAirlines.length > 0) {
        if (!filters.selectedAirlines.includes(flight.airline)) {
          return false;
        }
      }
      
      if (filters.departureTime) {
        const departureHour = new Date(flight.departureTime).getHours();
        switch(filters.departureTime) {
          case 'morning':
            if (departureHour < 6 || departureHour >= 12) return false;
            break;
          case 'afternoon':
            if (departureHour < 12 || departureHour >= 18) return false;
            break;
          case 'evening':
            if (departureHour < 18 && departureHour >= 6) return false;
            break;
        }
      }
      
      return true;
    });
  }, [sortedFlights, filters]);

  return (
    <div className="flight-results">
      <div className="results-header">
        <div className="results-info">
          <h3 className="results-title">
            {filteredFlights.length} vol{filteredFlights.length !== 1 ? 's' : ''} trouvé{filteredFlights.length !== 1 ? 's' : ''}
          </h3>
        </div>
        <div className="results-controls">
          <span className="results-sort-label">Trier par</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="results-sort-select">
            <option value="departure_early">Départ plus tôt</option>
            <option value="price_low">Prix croissant</option>
            <option value="price_high">Prix décroissant</option>
            <option value="duration">Durée</option>
          </select>
          <FaSortAmountDown size={18} className="results-sort-icon" />
        </div>
      </div>

      {loading ? (
        <div className="results-loading">
          <FaSpinner className="loading-spinner" />
          <p>Recherche des meilleurs vols...</p>
        </div>
      ) : filteredFlights.length > 0 ? (
        <div className="results-list">
          {filteredFlights.map(flight => (
            <FlightCard 
              key={flight.id} 
              flight={flight} 
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="results-empty">
          <FaPlane size={64} className="empty-icon" />
          <h4>Aucun vol trouvé</h4>
          <p>Essayez de modifier vos critères de recherche</p>
        </div>
      )}
    </div>
  );
};

// Main Component
const FlightSearch = () => {
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [cities, setCities] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [sortBy, setSortBy] = useState('departure_early');
  const [currentDate, setCurrentDate] = useState(getTodayDate());

  const [filters, setFilters] = useState({
    departureCity: '',
    arrivalCity: 'Tétouan',
    departureDate: getTodayDate(),
    maxPrice: 5000,
    maxDuration: '',
    selectedAirlines: [],
    departureTime: ''
  });

  useEffect(() => {
    const checkDateChange = () => {
      const today = getTodayDate();
      if (today !== currentDate) {
        setCurrentDate(today);
        setFilters(prev => ({
          ...prev,
          departureDate: today
        }));
        loadFlights();
      }
    };

    const interval = setInterval(checkDateChange, 60000);
    return () => clearInterval(interval);
  }, [currentDate]);

  const loadFlights = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {
        departureDate: filters.departureDate
      };

      if (filters.departureCity) {
        params.departureCity = filters.departureCity;
      }

      const response = await FlightService.searchFlights(params);
      
      const flightData = Array.isArray(response) ? response : [];
      const transformedFlights = flightData.map(flight => ({
        ...flight,
        minPrice: flight.basePrice || 0,
        classes: flight.classes || []
      }));
      
      setFlights(transformedFlights);
      
      if (transformedFlights.length === 0) {
        setError('Aucun vol disponible pour cette date');
      }
      
    } catch (err) {
      console.error('Erreur chargement vols:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des vols');
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setInitialLoading(true);
        
        const [citiesRes, airlinesRes] = await Promise.allSettled([
          FlightService.getCitiesList(),
          FlightService.getAirlinesList()
        ]);
        
        if (citiesRes.status === 'fulfilled') {
          setCities(citiesRes.value || []);
        } else {
          setCities(['Paris', 'Casablanca', 'Rabat', 'Tanger', 'Fès']);
        }
        
        if (airlinesRes.status === 'fulfilled') {
          setAirlines(airlinesRes.value || []);
        } else {
          setAirlines(['Royal Air Maroc', 'Air France', 'Iberia', 'Lufthansa']);
        }
        
        await loadFlights();
        
      } catch (err) {
        console.error('Erreur chargement initial:', err);
        setError('Erreur lors du chargement des données initiales');
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError('');

    try {
      if (!filters.departureCity) {
        setError('Veuillez sélectionner une ville de départ');
        setLoading(false);
        return;
      }

      const params = {
        departureCity: filters.departureCity,
        departureDate: filters.departureDate
      };

      if (filters.selectedAirlines && filters.selectedAirlines.length > 0) {
        params.airline = filters.selectedAirlines[0];
      }

      const response = await FlightService.searchFlights(params);
      
      const flightData = Array.isArray(response) ? response : [];
      const transformedFlights = flightData.map(flight => ({
        ...flight,
        minPrice: flight.basePrice || 0,
        classes: flight.classes || []
      }));
      
      setFlights(transformedFlights);
      
    } catch (err) {
      console.error('Erreur recherche vols:', err);
      setError(err.response?.data?.message || 'Erreur lors de la recherche de vols');
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (appliedFilters) => {
    const newFilters = {
      ...filters,
      ...appliedFilters,
      maxPrice: appliedFilters.maxPrice || filters.maxPrice
    };
    setFilters(newFilters);
    
    handleSearch();
  };

  const handleViewDetails = (flight) => {
    navigate(`/flight/${flight.id}`, { 
      state: { 
        flight,
        filters: {
          departureDate: filters.departureDate
        }
      } 
    });
  };

  const stats = useMemo(() => {
    if (flights.length === 0) return { minPrice: 0, maxPrice: 0, avgPrice: 0 };
    
    const prices = flights.map(f => f.basePrice || 0);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    return { minPrice, maxPrice, avgPrice };
  }, [flights]);

  if (initialLoading) {
    return (
      <div className="flight-search-container">
        <Navbar />
        <div className="loading-fullscreen">
          <FaSpinner className="loading-spinner-large" />
          <p>Chargement des vols disponibles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flight-search-container">
      <Navbar />
      
      <div className="content-area">
        <StatsBar 
          stats={stats} 
          flights={flights}
          cities={cities}
          airlines={airlines}
        />
        
        <div className="home-content">
          <div className="home-main">
            <SearchCard 
              onSearch={handleSearch} 
              cities={cities} 
              filters={filters}
              setFilters={setFilters}
              loading={loading}
            />
            
            {error && (
              <div className="error-message">
                <FaExclamationTriangle />
                <span>{error}</span>
                <button onClick={() => setError('')} className="error-close">
                  <FaTimes />
                </button>
              </div>
            )}

            {loading ? (
              <div className="loading-container">
                <FaSpinner className="loading-spinner" />
                <p>Chargement des vols...</p>
              </div>
            ) : flights.length > 0 ? (
              <FlightResults 
                flights={flights}
                loading={loading}
                sortBy={sortBy}
                setSortBy={setSortBy}
                filters={filters}
                onViewDetails={handleViewDetails}
              />
            ) : !error ? (
              <div className="no-flights-message">
                <FaPlane className="no-flights-icon" />
                <h3>Aucun vol disponible</h3>
                <p>
                  {filters.departureDate === getTodayDate()
                    ? "Aucun vol trouvé pour les critères sélectionnés."
                    : "Il n'y a aucun vol disponible pour aujourd'hui"}
                </p>
              </div>
            ) : null}
          </div>
          
          {!initialLoading && (
            <FilterSidebar 
              airlines={airlines}
              filters={filters}
              onApplyFilters={handleApplyFilters}
              flightsCount={flights.length}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FlightSearch;
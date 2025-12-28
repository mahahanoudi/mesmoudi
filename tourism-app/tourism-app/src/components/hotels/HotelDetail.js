import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import HotelService from '../../services/hotel.service';
import Navbar from '../common/Navbar';

const HotelDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isSignedIn } = useUser();
    const [hotel, setHotel] = useState(null);
    const [chambres, setChambres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState('a-propos');
    const [hoverStates, setHoverStates] = useState({});
    const [buttonHoverStates, setButtonHoverStates] = useState({});

    useEffect(() => {
        const fetchHotelData = async () => {
            try {
                const hotelResponse = await HotelService.getHotelById(id);
                setHotel(hotelResponse.data);
                
                const chambresResponse = await HotelService.getAvailableRooms(id);
                setChambres(chambresResponse.data);
            } catch (err) {
                console.error('Error fetching hotel:', err);
                setError('Impossible de charger les détails de l\'hôtel.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchHotelData();
        }
    }, [id]);

    const handleReserveClick = (chambreId) => {
        if (!isSignedIn) {
            navigate('/login');
            return;
        }
        navigate(`/hotel-reservation/${id}/${chambreId}`);
    };

    const handleChambreMouseEnter = (chambreId) => {
        setHoverStates(prev => ({ ...prev, [chambreId]: true }));
    };

    const handleChambreMouseLeave = (chambreId) => {
        setHoverStates(prev => ({ ...prev, [chambreId]: false }));
    };

    const handleButtonMouseEnter = (chambreId) => {
        setButtonHoverStates(prev => ({ ...prev, [chambreId]: true }));
    };

    const handleButtonMouseLeave = (chambreId) => {
        setButtonHoverStates(prev => ({ ...prev, [chambreId]: false }));
    };

    // Fonction pour obtenir une image de carte stylisée
    const getMapImageUrl = () => {
        // Utilisation d'un service de carte statique alternatif
        const lat = hotel?.latitude || 35.5881;
        const lng = hotel?.longitude || -5.3626;
        
        // Plusieurs options d'images de cartes
        const mapOptions = [
            // Option 1: OpenStreetMap (gratuit, pas besoin de clé API)
            `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=300&center=lonlat:${lng},${lat}&zoom=14&marker=lonlat:${lng},${lat};color:%23ff0000;size:medium&apiKey=YOUR_GEOAPIFY_KEY`,
            
            // Option 2: Stadia Maps (gratuit pour les faibles volumes)
            `https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.jpg`,
            
            // Option 3: Image de carte générique
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
            
            // Option 4: Carte vectorielle simple
            'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80'
        ];
        
        // Option de secours si les images ne chargent pas
        return 'data:image/svg+xml;base64,' + btoa(`
            <svg width="600" height="300" xmlns="http://www.w3.org/2000/svg">
                <rect width="600" height="300" fill="#e0e7ff"/>
                <rect x="50" y="50" width="500" height="200" fill="#ffffff" rx="10"/>
                <rect x="70" y="70" width="460" height="160" fill="#f8fafc" rx="5"/>
                <circle cx="300" cy="150" r="15" fill="#2a6ba5"/>
                <path d="M280,150 L320,150 M300,130 L300,170" stroke="#ffffff" stroke-width="3"/>
                <rect x="250" y="180" width="100" height="30" fill="#2a6ba5" rx="5"/>
                <text x="300" y="200" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="14" font-weight="bold">📍 Hôtel</text>
                <text x="300" y="100" text-anchor="middle" fill="#374151" font-family="Arial" font-size="16" font-weight="bold">Localisation de l'hôtel</text>
            </svg>
        `);
    };

    const styles = {
        page: {
            backgroundColor: '#f8f9fa',
            minHeight: '100vh',
            paddingBottom: '50px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        },
        hero: {
            height: '400px',
            width: '100%',
            position: 'relative',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        },
        heroOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))'
        },
        heroContent: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '40px 20px',
            color: 'white',
            zIndex: 2
        },
        titleContainer: {
            maxWidth: '1200px',
            margin: '0 auto'
        },
        title: {
            fontSize: '2.8rem',
            fontWeight: '800',
            marginBottom: '10px',
            textShadow: '2px 2px 8px rgba(0,0,0,0.5)'
        },
        hotelInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '25px',
            flexWrap: 'wrap'
        },
        stars: {
            color: '#FFD700',
            fontSize: '1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
        },
        infoItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '1rem',
            backgroundColor: 'rgba(0,0,0,0.4)',
            padding: '8px 16px',
            borderRadius: '25px',
            backdropFilter: 'blur(5px)'
        },
        contentContainer: {
            maxWidth: '1200px',
            margin: '-50px auto 0',
            padding: '0 20px',
            position: 'relative',
            zIndex: 10,
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '30px'
        },
        navigation: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            marginBottom: '25px',
            overflow: 'hidden'
        },
        navList: {
            display: 'flex',
            listStyle: 'none',
            margin: 0,
            padding: 0
        },
        navItem: {
            flex: 1,
            textAlign: 'center'
        },
        navButton: {
            padding: '18px 20px',
            border: 'none',
            background: 'none',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            color: '#666',
            transition: 'all 0.3s ease',
            width: '100%',
            position: 'relative'
        },
        navButtonActive: {
            color: '#2a6ba5',
            backgroundColor: '#f0f7ff'
        },
        navIndicator: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            backgroundColor: '#2a6ba5',
            transform: 'scaleX(0)',
            transition: 'transform 0.3s ease'
        },
        navButtonActiveIndicator: {
            transform: 'scaleX(1)'
        },
        section: {
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '35px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            marginBottom: '30px',
            animation: 'fadeIn 0.5s ease'
        },
        sectionTitle: {
            fontSize: '1.6rem',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '25px',
            paddingBottom: '15px',
            borderBottom: '2px solid #f0f0f0',
            position: 'relative'
        },
        sectionTitleUnderline: {
            position: 'absolute',
            bottom: '-2px',
            left: 0,
            width: '60px',
            height: '2px',
            backgroundColor: '#2a6ba5'
        },
        description: {
            fontSize: '1.05rem',
            lineHeight: '1.8',
            color: '#4a5568',
            marginBottom: '25px'
        },
        equipementsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '15px',
            marginTop: '25px'
        },
        equipementCard: {
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.3s ease'
        },
        equipementIcon: {
            width: '40px',
            height: '40px',
            backgroundColor: '#e3f2fd',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            color: '#2a6ba5'
        },
        equipementName: {
            fontSize: '0.95rem',
            fontWeight: '600',
            color: '#2d3748'
        },
        chambreGrid: {
            display: 'grid',
            gap: '25px'
        },
        chambreCard: {
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '25px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'white',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
        },
        chambreCardHover: {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            borderColor: '#2a6ba5'
        },
        chambreInfo: {
            flex: 1
        },
        chambreHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '15px'
        },
        chambreTitle: {
            fontSize: '1.3rem',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '5px'
        },
        chambreNumber: {
            fontSize: '0.9rem',
            color: '#718096',
            fontWeight: '500'
        },
        chambreDesc: {
            fontSize: '0.95rem',
            color: '#4a5568',
            lineHeight: '1.6',
            marginBottom: '20px'
        },
        chambreFeatures: {
            display: 'flex',
            gap: '20px',
            marginBottom: '15px'
        },
        feature: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            color: '#5a6c7d'
        },
        featureIcon: {
            fontSize: '1rem',
            color: '#2a6ba5'
        },
        priceContainer: {
            textAlign: 'center',
            marginRight: '25px',
            minWidth: '120px'
        },
        priceAmount: {
            fontSize: '2rem',
            fontWeight: '800',
            color: '#27ae60',
            marginBottom: '5px'
        },
        priceLabel: {
            fontSize: '0.85rem',
            color: '#718096',
            fontWeight: '500'
        },
        reserveButton: {
            backgroundColor: '#2a6ba5',
            color: 'white',
            padding: '14px 28px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            minWidth: '140px'
        },
        reserveButtonHover: {
            backgroundColor: '#1e5a8a',
            transform: 'scale(1.05)'
        },
        sidebarCard: {
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            marginBottom: '20px'
        },
        mapContainer: {
            height: '250px',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '20px',
            position: 'relative',
            backgroundColor: '#e0e7ff',
            border: '1px solid #c7d2fe'
        },
        mapContent: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)'
        },
        mapPlaceholder: {
            width: '80px',
            height: '80px',
            backgroundColor: '#2a6ba5',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '15px',
            boxShadow: '0 4px 12px rgba(42, 107, 165, 0.3)'
        },
        mapPlaceholderIcon: {
            fontSize: '2rem',
            color: 'white'
        },
        mapPlaceholderText: {
            fontSize: '1rem',
            color: '#374151',
            fontWeight: '600',
            marginBottom: '5px',
            textAlign: 'center'
        },
        mapPlaceholderSubtext: {
            fontSize: '0.85rem',
            color: '#6b7280',
            textAlign: 'center',
            maxWidth: '80%'
        },
        mapImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
        },
        mapOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.3s ease'
        },
        directionButton: {
            display: 'block',
            width: '100%',
            backgroundColor: '#2a6ba5',
            color: 'white',
            textAlign: 'center',
            padding: '16px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            marginTop: '15px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
        },
        backButton: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 25px',
            backgroundColor: 'white',
            color: '#4a5568',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            border: '1px solid #e2e8f0',
            transition: 'all 0.3s ease'
        },
        backButtonHover: {
            backgroundColor: '#f8f9fa',
            borderColor: '#2a6ba5',
            color: '#2a6ba5'
        },
        loadingContainer: {
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8f9fa'
        },
        spinner: {
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #2a6ba5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
        }
    };

    if (!loading && !hotel) {
        return (
            <div style={styles.page}>
                <Navbar />
                <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                    <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '20px' }}>{error || 'Hôtel non trouvé'}</p>
                    <Link 
                        to="/hotels" 
                        style={{
                            display: 'inline-block',
                            padding: '12px 25px',
                            backgroundColor: '#2a6ba5',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontWeight: '600'
                        }}
                    >
                        Retour à la liste des hôtels
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) return (
        <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>Chargement des détails de l'hôtel...</p>
        </div>
    );

    return (
        <div style={styles.page}>
            <Navbar />
            
            {/* Hero Section */}
            <div style={{
                ...styles.hero,
                backgroundImage: `url(${hotel.images && hotel.images.length > 0 ? hotel.images[0] : hotel.imageUrl || `/images/hotels/hotel-${(hotel.id % 12) + 1}-1.jpg`})`
            }}>
                <div style={styles.heroOverlay}></div>
                <div style={styles.heroContent}>
                    <div style={styles.titleContainer}>
                        <h1 style={styles.title}>{hotel.nom}</h1>
                        <div style={styles.hotelInfo}>
                            {hotel.etoiles && (
                                <div style={styles.infoItem}>
                                    <span style={styles.stars}>
                                        {'★'.repeat(hotel.etoiles)}
                                        {'☆'.repeat(5 - hotel.etoiles)}
                                    </span>
                                    <span style={{ fontSize: '0.9rem', marginLeft: '5px' }}>
                                        {hotel.etoiles} étoiles
                                    </span>
                                </div>
                            )}
                            <div style={styles.infoItem}>
                                <span style={{ fontSize: '1.1rem' }}>📍</span>
                                <span>{hotel.adresse}</span>
                            </div>
                            {hotel.telephone && (
                                <div style={styles.infoItem}>
                                    <span style={{ fontSize: '1rem' }}>📞</span>
                                    <span>{hotel.telephone}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={styles.contentContainer}>
                {/* Left Column - Main Content */}
                <div>
                    {/* Navigation */}
                    <div style={styles.navigation}>
                        <ul style={styles.navList}>
                            <li style={styles.navItem}>
                                <button
                                    style={{
                                        ...styles.navButton,
                                        ...(activeSection === 'a-propos' && styles.navButtonActive)
                                    }}
                                    onClick={() => setActiveSection('a-propos')}
                                >
                                    À propos
                                    <div style={{
                                        ...styles.navIndicator,
                                        ...(activeSection === 'a-propos' && styles.navButtonActiveIndicator)
                                    }}></div>
                                </button>
                            </li>
                            <li style={styles.navItem}>
                                <button
                                    style={{
                                        ...styles.navButton,
                                        ...(activeSection === 'chambres' && styles.navButtonActive)
                                    }}
                                    onClick={() => setActiveSection('chambres')}
                                >
                                    Chambres ({chambres.filter(ch => ch.disponible).length})
                                    <div style={{
                                        ...styles.navIndicator,
                                        ...(activeSection === 'chambres' && styles.navButtonActiveIndicator)
                                    }}></div>
                                </button>
                            </li>
                            <li style={styles.navItem}>
                                <button
                                    style={{
                                        ...styles.navButton,
                                        ...(activeSection === 'equipements' && styles.navButtonActive)
                                    }}
                                    onClick={() => setActiveSection('equipements')}
                                >
                                    Équipements
                                    <div style={{
                                        ...styles.navIndicator,
                                        ...(activeSection === 'equipements' && styles.navButtonActiveIndicator)
                                    }}></div>
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* À propos Section */}
                    {activeSection === 'a-propos' && (
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>
                                À propos
                                <div style={styles.sectionTitleUnderline}></div>
                            </h2>
                            <p style={styles.description}>{hotel.description}</p>
                            
                            {hotel.equipements && hotel.equipements.length > 0 && (
                                <div>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '15px', color: '#2c3e50' }}>
                                        Équipements de l'hôtel
                                    </h3>
                                    <div style={styles.equipementsGrid}>
                                        {hotel.equipements.map((eq, index) => (
                                            <div key={index} style={styles.equipementCard}>
                                                <div style={styles.equipementIcon}>
                                                    {eq.includes('Wifi') || eq.includes('wifi') ? '📶' :
                                                     eq.includes('Parking') ? '🅿️' :
                                                     eq.includes('Piscine') ? '🏊' :
                                                     eq.includes('Spa') ? '💆' :
                                                     eq.includes('Gym') ? '💪' :
                                                     eq.includes('Restaurant') ? '🍽️' :
                                                     eq.includes('Petit déjeuner') ? '☕' :
                                                     eq.includes('Climatisation') ? '❄️' :
                                                     eq.includes('Bar') ? '🍸' : '✨'}
                                                </div>
                                                <span style={styles.equipementName}>{eq}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Chambres Section */}
                    {activeSection === 'chambres' && (
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>
                                Chambres disponibles
                                <div style={styles.sectionTitleUnderline}></div>
                            </h2>
                            <div style={styles.chambreGrid}>
                                {chambres && chambres.length > 0 ? (
                                    chambres.filter(ch => ch.disponible).map(chambre => (
                                        <div 
                                            key={chambre.id}
                                            style={{
                                                ...styles.chambreCard,
                                                ...(hoverStates[chambre.id] && styles.chambreCardHover)
                                            }}
                                            onMouseEnter={() => handleChambreMouseEnter(chambre.id)}
                                            onMouseLeave={() => handleChambreMouseLeave(chambre.id)}
                                        >
                                            <div style={styles.chambreInfo}>
                                                <div style={styles.chambreHeader}>
                                                    <div>
                                                        <div style={styles.chambreTitle}>{chambre.type}</div>
                                                        <div style={styles.chambreNumber}>Chambre {chambre.numero}</div>
                                                    </div>
                                                </div>
                                                
                                                <p style={styles.chambreDesc}>{chambre.description}</p>
                                                
                                                <div style={styles.chambreFeatures}>
                                                    <div style={styles.feature}>
                                                        <span style={styles.featureIcon}>🛏️</span>
                                                        <span>{chambre.nombreLits} lit{chambre.nombreLits > 1 ? 's' : ''}</span>
                                                    </div>
                                                    <div style={styles.feature}>
                                                        <span style={styles.featureIcon}>👥</span>
                                                        <span>{chambre.capacitePersonnes} personne{chambre.capacitePersonnes > 1 ? 's' : ''}</span>
                                                    </div>
                                                    {chambre.superficie && (
                                                        <div style={styles.feature}>
                                                            <span style={styles.featureIcon}>📐</span>
                                                            <span>{chambre.superficie} m²</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {chambre.equipements && chambre.equipements.length > 0 && (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' }}>
                                                        {chambre.equipements.map((eq, index) => (
                                                            <span 
                                                                key={index}
                                                                style={{
                                                                    backgroundColor: '#e3f2fd',
                                                                    color: '#1976d2',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '20px',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: '500'
                                                                }}
                                                            >
                                                                {eq}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div style={styles.priceContainer}>
                                                <div style={styles.priceAmount}>{chambre.prixParNuit} DH</div>
                                                <div style={styles.priceLabel}>par nuit</div>
                                            </div>
                                            
                                            <button
                                                style={{
                                                    ...styles.reserveButton,
                                                    ...(buttonHoverStates[chambre.id] && styles.reserveButtonHover)
                                                }}
                                                onClick={() => handleReserveClick(chambre.id)}
                                                onMouseEnter={() => handleButtonMouseEnter(chambre.id)}
                                                onMouseLeave={() => handleButtonMouseLeave(chambre.id)}
                                            >
                                                Réserver
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '50px 20px',
                                        backgroundColor: '#f8fafc',
                                        borderRadius: '10px',
                                        border: '2px dashed #e2e8f0'
                                    }}>
                                        <p style={{ fontSize: '1.1rem', color: '#718096', marginBottom: '20px' }}>
                                            Aucune chambre disponible pour le moment.
                                        </p>
                                        <p style={{ color: '#a0aec0' }}>
                                            Veuillez vérifier ultérieurement ou contacter l'hôtel directement.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Équipements Section */}
                    {activeSection === 'equipements' && (
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>
                                Équipements & Services
                                <div style={styles.sectionTitleUnderline}></div>
                            </h2>
                            <p style={styles.description}>
                                Profitez de tous nos équipements et services pour rendre votre séjour inoubliable.
                            </p>
                            
                            {hotel.equipements && hotel.equipements.length > 0 && (
                                <div style={styles.equipementsGrid}>
                                    {hotel.equipements.map((eq, index) => (
                                        <div key={index} style={styles.equipementCard}>
                                            <div style={styles.equipementIcon}>
                                                {eq.includes('Wifi') || eq.includes('wifi') ? '📶' :
                                                 eq.includes('Parking') ? '🅿️' :
                                                 eq.includes('Piscine') ? '🏊' :
                                                 eq.includes('Spa') ? '💆' :
                                                 eq.includes('Gym') ? '💪' :
                                                 eq.includes('Restaurant') ? '🍽️' :
                                                 eq.includes('Petit déjeuner') ? '☕' :
                                                 eq.includes('Climatisation') ? '❄️' :
                                                 eq.includes('Bar') ? '🍸' : '✨'}
                                            </div>
                                            <span style={styles.equipementName}>{eq}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column - Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    {/* Localisation Card */}
                    <div style={styles.sidebarCard}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '15px', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.5rem' }}>📍</span>
                            Localisation
                        </h3>
                        
                        <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '10px', marginBottom: '20px' }}>
                            <p style={{ fontSize: '1rem', color: '#374151', fontWeight: '600', marginBottom: '5px' }}>
                                {hotel.adresse}
                            </p>
                            <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: '1.5' }}>
                                Au cœur de Tétouan, à proximité des principaux sites touristiques.
                            </p>
                        </div>

                        {/* Carte interactive */}
                        <div style={styles.mapContainer}>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${hotel.latitude || 35.5881},${hotel.longitude || -5.3626}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: 'block', width: '100%', height: '100%', textDecoration: 'none' }}
                            >
                                <div style={styles.mapContent}>
                                    <div style={styles.mapPlaceholder}>
                                        <span style={styles.mapPlaceholderIcon}>📍</span>
                                    </div>
                                    <div style={styles.mapPlaceholderText}>Voir sur Google Maps</div>
                                    <div style={styles.mapPlaceholderSubtext}>
                                        Cliquez pour ouvrir la localisation exacte
                                    </div>
                                </div>
                            </a>
                        </div>

                        {/* Bouton d'itinéraire */}
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${hotel.latitude || 35.5881},${hotel.longitude || -5.3626}`}
                            target="_blank"
                            rel="noreferrer"
                            style={styles.directionButton}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#1e5a8a';
                                e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#2a6ba5';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>🚗</span>
                            <span>Obtenir l'itinéraire</span>
                        </a>

                        {/* Informations de transport */}
                        <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '15px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>🚌</span>
                                <span>Accès & Transport</span>
                            </h4>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', backgroundColor: '#e0f2fe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ color: '#0369a1' }}>🅿️</span>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151' }}>Parking</div>
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Disponible sur place</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', backgroundColor: '#f0f9ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ color: '#0c4a6e' }}>🚕</span>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151' }}>Taxi</div>
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>À 100 mètres de l'entrée</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', backgroundColor: '#fef3c7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ color: '#92400e' }}>🚌</span>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151' }}>Bus</div>
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Arrêt à 300 mètres</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Back Button */}
                    <Link 
                        to="/hotels" 
                        style={styles.backButton}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = styles.backButtonHover.backgroundColor;
                            e.target.style.borderColor = styles.backButtonHover.borderColor;
                            e.target.style.color = styles.backButtonHover.color;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = styles.backButton.backgroundColor;
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.color = '#4a5568';
                        }}
                    >
                        ← Retour à la liste
                    </Link>
                </div>
            </div>

            {/* Inline CSS Animations */}
            <style>
                {`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                
                .fade-in {
                    animation: fadeIn 0.5s ease;
                }
                
                .map-container:hover {
                    animation: pulse 2s infinite;
                }
                `}
            </style>
        </div>
    );
};

export default HotelDetail;
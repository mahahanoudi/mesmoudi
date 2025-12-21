import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import RestaurantService from '../../services/restaurant.service';
import Navbar from '../common/Navbar';

const RestaurantDetail = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);

    useEffect(() => {
        RestaurantService.getRestaurantById(id)
            .then(response => {
                setRestaurant(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }, [id]);

    const styles = {
        page: {
            backgroundColor: '#f8f9fa',
            minHeight: '100vh',
            paddingBottom: '50px'
        },
        hero: {
            height: '400px',
            width: '100%',
            position: 'relative',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'end'
        },
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8))'
        },
        heroContent: {
            position: 'relative',
            zIndex: 2,
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '2rem',
            color: 'white'
        },
        title: {
            fontSize: '3rem',
            marginBottom: '0.5rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        },
        info: {
            fontSize: '1.1rem',
            display: 'flex',
            gap: '20px',
            opacity: 0.9
        },
        container: {
            maxWidth: '1100px',
            margin: '-50px auto 0',
            position: 'relative',
            zIndex: 10,
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '30px',
            padding: '0 20px'
        },
        card: {
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '2rem',
            boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
            marginBottom: '30px'
        },
        sectionTitle: {
            fontSize: '1.5rem',
            borderBottom: '3px solid #5aa2d3', // Tetouan Light Blue
            paddingBottom: '10px',
            marginBottom: '20px',
            display: 'inline-block',
            color: '#333'
        },
        menuGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px'
        },
        menuItem: {
            border: '1px solid #eee',
            borderRadius: '10px',
            padding: '15px',
            transition: 'background 0.2s',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        menuName: {
            fontWeight: 'bold',
            color: '#2d3748',
            marginBottom: '5px'
        },
        menuDesc: {
            fontSize: '0.85rem',
            color: '#718096',
            fontStyle: 'italic'
        },
        price: {
            color: '#c45c40', // Terracotta
            fontWeight: 'bold',
            fontSize: '1.1rem'
        },
        sidebar: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        mapCard: {
            height: '300px',
            backgroundColor: '#eee',
            borderRadius: '15px',
            overflow: 'hidden',
            position: 'relative'
        },
        mapButton: {
            display: 'block',
            width: '100%',
            backgroundColor: '#2a6ba5', // Tetouan Blue
            color: 'white',
            textAlign: 'center',
            padding: '15px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
            marginTop: '15px',
            transition: 'background 0.2s'
        },
        backLink: {
            display: 'inline-block',
            marginTop: '20px',
            color: '#666',
            textDecoration: 'none'
        },
        reserveButton: {
            backgroundColor: '#27ae60',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(39, 174, 96, 0.3)'
        },
        menuHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '15px'
        }
    };

    if (!restaurant) return <div style={{ textAlign: 'center', padding: '50px' }}>Chargement...</div>;

    return (
        <div style={styles.page}>
            <Navbar />
            <div style={{ ...styles.hero, backgroundImage: `url(${restaurant.imageUrl || 'https://via.placeholder.com/1200x600'})` }}>
                <div style={styles.overlay}></div>
                <div style={styles.heroContent} className="fade-in">
                    <h1 style={styles.title}>{restaurant.nom}</h1>
                    <div style={styles.info}>
                        <span>📍 {restaurant.adresse}</span>
                        <span>📞 {restaurant.telephone}</span>
                    </div>
                </div>
            </div>

            <div style={styles.container}>
                <div className="main-content">
                    <div style={styles.card} className="fade-in">
                        <h2 style={styles.sectionTitle}>À propos</h2>
                        <p style={{ lineHeight: '1.6', color: '#555' }}>{restaurant.description}</p>
                    </div>

                    <div style={styles.card} className="fade-in">
                        <div style={styles.menuHeader}>
                            <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>Menu / Carte</h2>
                            <Link
                                to={`/reservation/${restaurant.id}`}
                                style={styles.reserveButton}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#219a52'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#27ae60'}
                            >
                                🍽️ Réserver une table
                            </Link>
                        </div>
                        <div style={styles.menuGrid}>
                            {restaurant.menus && restaurant.menus.length > 0 ? (
                                restaurant.menus.map(menu => (
                                    <div key={menu.id} style={styles.menuItem}>
                                        <div>
                                            <div style={styles.menuName}>{menu.nomPlat}</div>
                                            <div style={styles.menuDesc}>{menu.description}</div>
                                        </div>
                                        <div style={styles.price}>{menu.prix} DH</div>
                                    </div>
                                ))
                            ) : (
                                <p>Menu en cours de mise à jour...</p>
                            )}
                        </div>
                    </div>
                </div>

                <div style={styles.sidebar}>
                    <div style={{ ...styles.card, padding: '1.5rem' }}>
                        <h3>Localisation</h3>
                        <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>Retrouvez ce restaurant au cœur de Tétouan.</p>

                        {/* Placeholder Map Image that links to Google Maps */}
                        <div style={styles.mapCard}>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <img
                                    src="https://media.wired.com/photos/59269cd37034dc5f91bec0f1/master/pass/GoogleMapTA.jpg"
                                    alt="Carte"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </a>
                        </div>

                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            style={styles.mapButton}
                        >
                            ➤ Itinéraire
                        </a>
                    </div>
                    <Link to="/restaurants" style={styles.backLink}>← Retour à la liste</Link>
                </div>
            </div>
        </div>
    );
};

export default RestaurantDetail;

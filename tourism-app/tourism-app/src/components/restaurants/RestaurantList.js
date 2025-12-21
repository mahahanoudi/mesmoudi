import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import RestaurantService from '../../services/restaurant.service';
import Navbar from '../common/Navbar';

const RestaurantList = () => {
    const { isSignedIn } = useUser();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        RestaurantService.getAllRestaurants()
            .then(response => {
                console.log("Données reçues:", response.data);
                setRestaurants(response.data);
                setLoading(false);
            })
            .catch(e => {
                console.error("Erreur API:", e);
                setError("Impossible de charger les restaurants. Vérifiez que le Backend est lancé.");
                setLoading(false);
            });
    }, []);

    const styles = {
        container: {
            padding: '2rem',
            maxWidth: '1200px',
            margin: '0 auto',
            minHeight: '80vh',
            position: 'relative',
            zIndex: 1
        },
        background: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            filter: 'brightness(0.3)',
            zIndex: 0
        },
        header: {
            textAlign: 'center',
            marginBottom: '3rem',
            color: '#27ae60', // Vert Tétouan (du thème)
            fontSize: '2.5rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem'
        },
        card: {
            backgroundColor: 'white',
            borderRadius: '15px',
            overflow: 'hidden',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer',
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            flexDirection: 'column'
        },
        cardHover: {
            transform: 'translateY(-5px)',
            boxShadow: '0 15px 30px rgba(0,0,0,0.15)'
        },
        imageContainer: {
            height: '200px',
            overflow: 'hidden',
            position: 'relative'
        },
        image: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
        },
        content: {
            padding: '1.5rem',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column'
        },
        title: {
            fontSize: '1.4rem',
            color: '#333',
            marginBottom: '0.5rem',
            fontWeight: '600'
        },
        address: {
            color: '#666',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1rem',
            gap: '5px'
        },
        tag: {
            marginTop: 'auto',
            alignSelf: 'flex-start',
            backgroundColor: '#e6f4ea',
            color: '#1e7e34',
            padding: '5px 10px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 'bold'
        },
        loading: {
            textAlign: 'center',
            padding: '50px',
            fontSize: '1.2rem',
            color: '#666'
        }
    };

    if (loading) return <div style={styles.loading}>Chargement des saveurs de Tétouan...</div>;
    if (error) return <div style={{ ...styles.loading, color: 'red' }}>{error}</div>;
    if (restaurants.length === 0) return <div style={styles.loading}>Aucun restaurant trouvé dans la base de données.</div>;

    return (
        <div>
            <div style={styles.background}></div>
            {/* Si Navbar existe on peut l'ajouter ici, sinon on laisse le layout global gérer */}
            <div style={styles.container}>
                <h2 style={styles.header} className="fade-in">
                    Restaurants & Saveurs
                    <div style={{ fontSize: '1.5rem', marginTop: '0.5rem', fontWeight: 'normal', opacity: 0.9 }}>
                        ⵉⵙⴻⵏⵟⴰⵔⴰⵏⵜⴻⵏ ⴷ ⵉⵎⴻⵜⵜⵉ
                    </div>
                </h2>

                {isSignedIn && (
                    <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '-2rem' }}>
                        <Link
                            to="/my-reservations"
                            className="fade-in"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '12px 25px',
                                background: 'white',
                                color: '#27ae60',
                                borderRadius: '50px',
                                textDecoration: 'none',
                                fontWeight: 'bold',
                                boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                                transition: 'transform 0.3s ease',
                                border: '2px solid #27ae60'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <span>📅</span> Mes Réservations
                        </Link>
                    </div>
                )}

                <div style={styles.grid}>
                    {restaurants.map((restaurant) => (
                        <Link
                            to={`/restaurants/${restaurant.id}`}
                            key={restaurant.id}
                            style={styles.card}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = styles.cardHover.transform;
                                e.currentTarget.style.boxShadow = styles.cardHover.boxShadow;
                                e.currentTarget.querySelector('img').style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = styles.card.boxShadow;
                                e.currentTarget.querySelector('img').style.transform = 'none';
                            }}
                        >
                            <div style={styles.imageContainer}>
                                <img
                                    src={restaurant.imageUrl || 'https://via.placeholder.com/300x200?text=Restaurant'}
                                    alt={restaurant.nom}
                                    style={styles.image}
                                />
                            </div>
                            <div style={styles.content}>
                                <h3 style={styles.title}>{restaurant.nom}</h3>
                                <div style={styles.address}>
                                    <span>📍</span> {restaurant.adresse}
                                </div>
                                <span style={styles.tag}>Voir le Menu</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RestaurantList;

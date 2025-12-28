import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import HotelService from '../../services/hotel.service';
import Navbar from '../common/Navbar';

const HotelList = () => {
    const { isSignedIn } = useUser();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchForm, setSearchForm] = useState({
        dateArrivee: '',
        dateDepart: '',
        nombrePersonnes: 2,
        etoilesMin: 0,
        budgetMax: ''
    });
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        loadAllHotels();
    }, []);

    const loadAllHotels = () => {
        setLoading(true);
        setError(null);
        HotelService.getAllHotels()
            .then(response => {
                console.log("Hotels reçus:", response.data);
                setHotels(response.data);
                setLoading(false);
            })
            .catch(e => {
                console.error("Erreur API:", e);
                setError("Impossible de charger les hôtels. Vérifiez que le service est lancé sur le port 8086.");
                setLoading(false);
            });
    };

    const handleSearch = async () => {
        setIsSearching(true);
        setError(null);
        try {
            const searchParams = {
                dateArrivee: searchForm.dateArrivee || null,
                dateDepart: searchForm.dateDepart || null,
                nombrePersonnes: searchForm.nombrePersonnes || null,
                nombreChambres: 1,
                etoilesMin: searchForm.etoilesMin > 0 ? searchForm.etoilesMin : null,
                budgetMax: searchForm.budgetMax ? parseFloat(searchForm.budgetMax) : null
            };
            
            const response = await HotelService.searchHotels(searchParams);
            setHotels(response.data);
            console.log("Recherche effectuée:", response.data);
        } catch (e) {
            console.error("Erreur recherche:", e);
            setError("Erreur lors de la recherche. Affichage de tous les hôtels.");
            loadAllHotels();
        } finally {
            setIsSearching(false);
        }
    };

    const handleReset = () => {
        setSearchForm({
            dateArrivee: '',
            dateDepart: '',
            nombrePersonnes: 2,
            etoilesMin: 0,
            budgetMax: ''
        });
        loadAllHotels();
    };

    const styles = {
        container: {
            padding: '2rem',
            paddingTop: '6rem',
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
            backgroundImage: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            filter: 'brightness(0.3)',
            zIndex: 0
        },
        header: {
            textAlign: 'center',
            marginBottom: '3rem',
            color: '#2a6ba5',
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
        stars: {
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: '#ffd700',
            padding: '5px 10px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: 'bold'
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
        price: {
            marginTop: 'auto',
            fontSize: '1.2rem',
            color: '#27ae60',
            fontWeight: 'bold'
        },
        loading: {
            textAlign: 'center',
            padding: '50px',
            fontSize: '1.2rem',
            color: 'white'
        },
        errorBox: {
            backgroundColor: '#fee',
            color: '#c33',
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '2rem',
            border: '2px solid #c33',
            textAlign: 'center'
        },
        searchForm: {
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        },
        searchTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#2a6ba5',
            marginBottom: '1.5rem',
            textAlign: 'center'
        },
        searchGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
        },
        formGroup: {
            display: 'flex',
            flexDirection: 'column'
        },
        formLabel: {
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#333',
            marginBottom: '0.5rem'
        },
        formInput: {
            padding: '0.75rem',
            border: '2px solid #e0e0e0',
            borderRadius: '10px',
            fontSize: '1rem',
            transition: 'border-color 0.3s'
        },
        searchButtons: {
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center'
        },
        searchButton: {
            padding: '0.75rem 2rem',
            borderRadius: '25px',
            border: 'none',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s'
        },
        searchButtonPrimary: {
            backgroundColor: '#2a6ba5',
            color: 'white'
        },
        searchButtonSecondary: {
            backgroundColor: '#e0e0e0',
            color: '#333'
        },
        disponibleTag: {
            marginTop: '0.5rem',
            alignSelf: 'flex-start',
            backgroundColor: '#e6f4ea',
            color: '#1e7e34',
            padding: '5px 10px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 'bold'
        }
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div style={styles.background}></div>
                <div style={styles.loading}>Chargement des hôtels de Tétouan...</div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div style={styles.background}></div>
            <div style={styles.container}>
                <h2 style={styles.header} className="fade-in">
                    Hôtels & Hébergements
                    <div style={{ fontSize: '1.5rem', marginTop: '0.5rem', fontWeight: 'normal', opacity: 0.9 }}>
                        ⵏⵏⵓⵡⴰⵏ ⴷ ⵉⵎⵓⵣⵣⵓⵔⵏ
                    </div>
                </h2>

                {error && (
                    <div style={styles.errorBox}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Formulaire de recherche */}
                <div style={styles.searchForm} className="fade-in">
                    <h3 style={styles.searchTitle}>🔍 Rechercher un hôtel</h3>
                    <div style={styles.searchGrid}>
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Date d'arrivée</label>
                            <input
                                type="date"
                                style={styles.formInput}
                                value={searchForm.dateArrivee}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => {
                                    setSearchForm({ ...searchForm, dateArrivee: e.target.value });
                                    if (searchForm.dateDepart && e.target.value >= searchForm.dateDepart) {
                                        setSearchForm(prev => ({ ...prev, dateArrivee: e.target.value, dateDepart: '' }));
                                    }
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#2a6ba5'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Date de départ</label>
                            <input
                                type="date"
                                style={styles.formInput}
                                value={searchForm.dateDepart}
                                min={searchForm.dateArrivee || new Date().toISOString().split('T')[0]}
                                onChange={(e) => setSearchForm({ ...searchForm, dateDepart: e.target.value })}
                                onFocus={(e) => e.target.style.borderColor = '#2a6ba5'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Nombre de personnes</label>
                            <input
                                type="number"
                                style={styles.formInput}
                                min="1"
                                max="10"
                                value={searchForm.nombrePersonnes}
                                onChange={(e) => setSearchForm({ ...searchForm, nombrePersonnes: parseInt(e.target.value) || 1 })}
                                onFocus={(e) => e.target.style.borderColor = '#2a6ba5'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Étoiles minimum</label>
                            <select
                                style={styles.formInput}
                                value={searchForm.etoilesMin}
                                onChange={(e) => setSearchForm({ ...searchForm, etoilesMin: parseInt(e.target.value) })}
                                onFocus={(e) => e.target.style.borderColor = '#2a6ba5'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            >
                                <option value="0">Toutes</option>
                                <option value="1">1 étoile minimum</option>
                                <option value="2">2 étoiles minimum</option>
                                <option value="3">3 étoiles minimum</option>
                                <option value="4">4 étoiles minimum</option>
                                <option value="5">5 étoiles</option>
                            </select>
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Budget max (DH)</label>
                            <input
                                type="number"
                                style={styles.formInput}
                                min="0"
                                placeholder="Optionnel"
                                value={searchForm.budgetMax}
                                onChange={(e) => setSearchForm({ ...searchForm, budgetMax: e.target.value })}
                                onFocus={(e) => e.target.style.borderColor = '#2a6ba5'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                        </div>
                    </div>
                    <div style={styles.searchButtons}>
                        <button
                            style={{ ...styles.searchButton, ...styles.searchButtonPrimary }}
                            onClick={handleSearch}
                            disabled={isSearching}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#1e5a8a'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#2a6ba5'}
                        >
                            {isSearching ? 'Recherche...' : '🔍 Rechercher'}
                        </button>
                        <button
                            style={{ ...styles.searchButton, ...styles.searchButtonSecondary }}
                            onClick={handleReset}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#d0d0d0'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#e0e0e0'}
                        >
                            🔄 Réinitialiser
                        </button>
                    </div>
                </div>

                {isSignedIn && (
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <Link
                            to="/my-hotel-reservations"
                            className="fade-in"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '12px 25px',
                                background: 'white',
                                color: '#2a6ba5',
                                borderRadius: '50px',
                                textDecoration: 'none',
                                fontWeight: 'bold',
                                boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                                transition: 'transform 0.3s ease',
                                border: '2px solid #2a6ba5'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <span>📅</span> Mes Réservations
                        </Link>
                    </div>
                )}

                <div style={styles.grid}>
                    {hotels.map((hotel) => (
                        <Link
                            to={`/hotels/${hotel.id}`}
                            key={hotel.id}
                            style={styles.card}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.15)';
                                const img = e.currentTarget.querySelector('img');
                                if (img) img.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = styles.card.boxShadow;
                                const img = e.currentTarget.querySelector('img');
                                if (img) img.style.transform = 'none';
                            }}
                        >
                            <div style={styles.imageContainer}>
                                <img
                                    src={hotel.imageUrl || `/images/hotels/hotel-${(hotel.id % 12) + 1}-1.jpg`}
                                    alt={hotel.nom}
                                    style={styles.image}
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945';
                                    }}
                                />
                                {hotel.etoiles && (
                                    <div style={styles.stars}>
                                        {'★'.repeat(hotel.etoiles)}
                                    </div>
                                )}
                            </div>
                            <div style={styles.content}>
                                <h3 style={styles.title}>{hotel.nom}</h3>
                                <div style={styles.address}>
                                    <span>📍</span> {hotel.adresse}
                                </div>
                                {hotel.prixMinimum && (
                                    <div style={styles.price}>
                                        À partir de {hotel.prixMinimum} DH/nuit
                                    </div>
                                )}
                                {hotel.disponible && (
                                    <span style={styles.disponibleTag}>
                                        Disponible
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>

                {hotels.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'white', background: 'rgba(255,255,255,0.9)', borderRadius: '15px' }}>
                        <p style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#666' }}>
                            Aucun hôtel trouvé avec ces critères de recherche.
                        </p>
                        <button
                            onClick={handleReset}
                            style={{
                                padding: '0.75rem 2rem',
                                borderRadius: '25px',
                                border: '2px solid #2a6ba5',
                                backgroundColor: 'white',
                                color: '#2a6ba5',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#2a6ba5';
                                e.target.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.color = '#2a6ba5';
                            }}
                        >
                            Voir tous les hôtels
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HotelList;
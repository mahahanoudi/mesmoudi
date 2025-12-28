import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import HotelService from '../../services/hotel.service';
import Navbar from '../common/Navbar';
import './HotelReservationForm.css';

const HotelReservationForm = () => {
    const { hotelId, chambreId } = useParams();
    const navigate = useNavigate();
    const { isLoaded, isSignedIn, user } = useUser();

    const [hotel, setHotel] = useState(null);
    const [chambre, setChambre] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Form states
    const [dateArrivee, setDateArrivee] = useState('');
    const [dateDepart, setDateDepart] = useState('');
    const [nombreAdultes, setNombreAdultes] = useState(2);
    const [nombreEnfants, setNombreEnfants] = useState(0);
    const [demandesSpeciales, setDemandesSpeciales] = useState('');
    const [prixTotal, setPrixTotal] = useState(0);
    const [clientTelephone, setClientTelephone] = useState('');

    useEffect(() => {
        const fetchHotelData = async () => {
            try {
                const hotelResponse = await HotelService.getHotelById(hotelId);
                setHotel(hotelResponse.data);
                
                const chambresResponse = await HotelService.getAvailableRooms(hotelId);
                const selectedChambre = chambresResponse.data.find(c => c.id === parseInt(chambreId));
                setChambre(selectedChambre);
            } catch (err) {
                console.error('Error fetching hotel:', err);
                setError('Impossible de charger les détails de l\'hôtel.');
            } finally {
                setLoading(false);
            }
        };

        if (hotelId && chambreId) {
            fetchHotelData();
        }
    }, [hotelId, chambreId]);

    useEffect(() => {
        if (dateArrivee && dateDepart && chambre) {
            const arrivee = new Date(dateArrivee);
            const depart = new Date(dateDepart);
            const diffTime = Math.abs(depart - arrivee);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 0 && chambre.prixParNuit) {
                const total = parseFloat(chambre.prixParNuit) * diffDays;
                setPrixTotal(total);
            } else {
                setPrixTotal(0);
            }
        }
    }, [dateArrivee, dateDepart, chambre]);

    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isSignedIn || !user) {
            navigate('/login');
            return;
        }

        setSubmitting(true);
        setError('');

        const reservationData = {
            chambreId: parseInt(chambreId),
            clientNom: user.lastName || '',
            clientPrenom: user.firstName || '',
            clientEmail: user.primaryEmailAddress?.emailAddress || '',
            clientTelephone: clientTelephone, // ✅ AJOUTÉ
            clientAdresse: '',
            dateArrivee: dateArrivee,
            dateDepart: dateDepart,
            nombreAdultes: parseInt(nombreAdultes),
            nombreEnfants: parseInt(nombreEnfants),
            demandesSpeciales: demandesSpeciales
        };

        try {
            await HotelService.createReservation(reservationData);
            navigate('/my-hotel-reservations');
        } catch (err) {
            console.error('Error creating reservation:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Une erreur est survenue lors de la réservation. Veuillez réessayer.');
            }
        } finally {
            setSubmitting(false);
        }
    };


    if (!isLoaded || loading) {
        return (
            <div className="reservation-container">
                <Navbar />
                <div className="reservation-loading">
                    <div className="spinner-large"></div>
                    <p>Chargement...</p>
                </div>
            </div>
        );
    }

    if (!isSignedIn) {
        return (
            <div className="reservation-container">
                <Navbar />
                <div className="reservation-wrapper">
                    <div className="auth-required">
                        <span className="auth-icon">🔒</span>
                        <h2>Connexion Requise</h2>
                        <p>Veuillez vous connecter pour faire une réservation d'hôtel.</p>
                        <Link to="/login" className="login-button">Se connecter</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !hotel) {
        return (
            <div className="reservation-container">
                <Navbar />
                <div className="reservation-wrapper">
                    <div className="reservation-error">
                        <p>{error}</p>
                        <Link to="/hotels" className="back-link">Retour aux hôtels</Link>
                    </div>
                </div>
            </div>
        );
    }

    // Get today's date for min attribute
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    return (
        <div className="reservation-container">
            <Navbar />
            <div className="reservation-wrapper">
                <div className="reservation-card">
                    {/* Hotel Info Header */}
                    <div className="restaurant-header">
                        {hotel && hotel.images && hotel.images.length > 0 && (
                            <img
                                src={hotel.images[0]}
                                alt={hotel.nom}
                                className="restaurant-thumbnail"
                            />
                        )}
                        <div className="restaurant-info">
                            <h2>{hotel?.nom}</h2>
                            <p>📍 {hotel?.adresse}</p>
                            {chambre && (
                                <p>🛏️ {chambre.type} - Chambre {chambre.numero}</p>
                            )}
                        </div>
                    </div>

                    <div className="reservation-header">
                        <h1>Réserver une chambre</h1>
                        <p className="reservation-subtitle">Remplissez le formulaire ci-dessous</p>
                    </div>

                    {error && (
                        <div className="reservation-error">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="reservation-form">
                        <div className="form-row">
                            <div className="form-group half">
                                <label>Date d'arrivée</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={dateArrivee}
                                    min={today}
                                    onChange={(e) => {
                                        setDateArrivee(e.target.value);
                                        if (dateDepart && e.target.value >= dateDepart) {
                                            setDateDepart('');
                                        }
                                    }}
                                    required
                                />
                            </div>
                            <div className="form-group half">
                                <label>Date de départ</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={dateDepart}
                                    min={dateArrivee || tomorrowStr}
                                    onChange={(e) => setDateDepart(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
<div className="form-group">
                            <label>Numéro de téléphone *</label>
                            <input
                                type="tel"
                                className="input-field"
                                placeholder="+212 6XX XXX XXX"
                                value={clientTelephone}
                                onChange={(e) => setClientTelephone(e.target.value)}
                                pattern="[0-9+\s\-()]+"
                                required
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group half">
                                <label>Nombre d'adultes</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    min="1"
                                    max="10"
                                    value={nombreAdultes}
                                    onChange={(e) => setNombreAdultes(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group half">
                                <label>Nombre d'enfants</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    min="0"
                                    max="10"
                                    value={nombreEnfants}
                                    onChange={(e) => setNombreEnfants(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Demandes spéciales (Optionnel)</label>
                            <textarea
                                className="input-field textarea"
                                placeholder="Demandes particulières, préférences..."
                                value={demandesSpeciales}
                                onChange={(e) => setDemandesSpeciales(e.target.value)}
                                rows="4"
                            />
                        </div>

                        <div className="reservation-summary">
                            <h3>Résumé de la réservation</h3>
                            <div className="summary-item">
                                <span>Hôtel</span>
                                <strong>{hotel?.nom}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Chambre</span>
                                <strong>{chambre?.type} - {chambre?.numero}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Date d'arrivée</span>
                                <strong>{dateArrivee || '-'}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Date de départ</span>
                                <strong>{dateDepart || '-'}</strong>
                            </div>
                            {dateArrivee && dateDepart && (
                                <div className="summary-item">
                                    <span>Nombre de nuits</span>
                                    <strong>
                                        {Math.ceil((new Date(dateDepart) - new Date(dateArrivee)) / (1000 * 60 * 60 * 24))}
                                    </strong>
                                </div>
                            )}
                            <div className="summary-item">
                                <span>Voyageurs</span>
                                <strong>{nombreAdultes} adulte(s) {nombreEnfants > 0 && `, ${nombreEnfants} enfant(s)`}</strong>
                            </div>
                            {chambre && prixTotal > 0 && (
                                <div className="summary-item" style={{ borderTop: '2px solid #eee', paddingTop: '10px', marginTop: '10px' }}>
                                    <span>Prix par nuit</span>
                                    <strong>{chambre.prixParNuit} DH</strong>
                                </div>
                            )}
                            {prixTotal > 0 && (
                                <div className="summary-item" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#27ae60' }}>
                                    <span>Total</span>
                                    <strong>{prixTotal.toFixed(2)} DH</strong>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={submitting || !dateArrivee || !dateDepart}
                        >
                            {submitting ? (
                                <>
                                    <div className="spinner"></div> Confirmation...
                                </>
                            ) : (
                                <>Confirmer la réservation</>
                            )}
                        </button>
                    </form>

                    <Link to={`/hotels/${hotelId}`} className="back-link">
                        Annuler et retourner à l'hôtel
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HotelReservationForm;






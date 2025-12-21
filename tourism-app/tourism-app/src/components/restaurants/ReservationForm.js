import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import ReservationService from '../../services/reservation.service';
import RestaurantService from '../../services/restaurant.service';
import Navbar from '../common/Navbar';
import './ReservationForm.css';

const ReservationForm = () => {
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    const { isLoaded, isSignedIn, user } = useUser();

    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Form states
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [partySize, setPartySize] = useState(2);
    const [specialRequests, setSpecialRequests] = useState('');

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const response = await RestaurantService.getRestaurantById(restaurantId);
                setRestaurant(response.data);
            } catch (err) {
                console.error('Error fetching restaurant:', err);
                setError('Impossible de charger les détails du restaurant.');
            } finally {
                setLoading(false);
            }
        };

        if (restaurantId) {
            fetchRestaurant();
        }
    }, [restaurantId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isSignedIn || !user) {
            navigate('/login');
            return;
        }

        setSubmitting(true);
        setError('');

        const reservationData = {
            userId: user.id, // Clerk ID (String)
            userName: user.fullName || user.firstName,
            userEmail: user.primaryEmailAddress?.emailAddress,
            userPhone: "", // Optional
            restaurantId: parseInt(restaurantId),
            reservationDate: date,
            reservationTime: time,
            partySize: parseInt(partySize),
            specialRequests: specialRequests
        };

        try {
            await ReservationService.createReservation(reservationData);
            navigate('/my-reservations');
        } catch (err) {
            console.error('Error creating reservation:', err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
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
                        <p>Veuillez vous connecter pour faire une réservation.</p>
                        <Link to="/login" className="login-button">Se connecter</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !restaurant) {
        return (
            <div className="reservation-container">
                <Navbar />
                <div className="reservation-wrapper">
                    <div className="reservation-error">
                        <p>{error}</p>
                        <Link to="/restaurants" className="back-link">Retour aux restaurants</Link>
                    </div>
                </div>
            </div>
        );
    }

    // Get today's date for min attribute
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="reservation-container">
            <Navbar />
            <div className="reservation-wrapper">
                <div className="reservation-card">
                    {/* Restaurant Info Header */}
                    <div className="restaurant-header">
                        <img
                            src={restaurant?.imageUrl || 'https://via.placeholder.com/100'}
                            alt={restaurant?.nom}
                            className="restaurant-thumbnail"
                        />
                        <div className="restaurant-info">
                            <h2>{restaurant?.nom}</h2>
                            <p>📍 {restaurant?.adresse}</p>
                        </div>
                    </div>

                    <div className="reservation-header">
                        <h1>Réserver une table</h1>
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
                                <label>Date</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={date}
                                    min={today}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group half">
                                <label>Heure</label>
                                <input
                                    type="time"
                                    className="input-field"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Nombre de personnes</label>
                            <div className="party-size-selector">
                                {[1, 2, 3, 4, 5, 6, 8, 10].map(size => (
                                    <button
                                        key={size}
                                        type="button"
                                        className={`party-size-btn ${partySize === size ? 'active' : ''}`}
                                        onClick={() => setPartySize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Demandes spéciales (Optionnel)</label>
                            <textarea
                                className="input-field textarea"
                                placeholder="Allergies, préférence de table, occasion spéciale..."
                                value={specialRequests}
                                onChange={(e) => setSpecialRequests(e.target.value)}
                            />
                        </div>

                        <div className="reservation-summary">
                            <h3>Résumé</h3>
                            <div className="summary-item">
                                <span>Restaurant</span>
                                <strong>{restaurant?.nom}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Date</span>
                                <strong>{date || '-'}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Heure</span>
                                <strong>{time || '-'}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Invités</span>
                                <strong>{partySize} personnes</strong>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={submitting}
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

                    <Link to={`/restaurants/${restaurantId}`} className="back-link">
                        Annuler et retourner au restaurant
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ReservationForm;

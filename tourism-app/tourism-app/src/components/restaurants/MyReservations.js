import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import ReservationService from '../../services/reservation.service';
import Navbar from '../common/Navbar';
import './MyReservations.css';

const MyReservations = () => {
    const { user, isSignedIn, isLoaded } = useUser();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        if (isLoaded) {
            if (isSignedIn && user?.id) {
                fetchReservations();
            } else {
                setLoading(false);
            }
        }
    }, [isLoaded, isSignedIn, user]);

    const fetchReservations = async () => {
        try {
            const response = await ReservationService.getReservationsByUser(user.id);
            setReservations(response.data);
        } catch (err) {
            console.error('Error fetching reservations:', err);
            setError('Erreur lors du chargement des réservations');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (reservationId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
            return;
        }

        setCancellingId(reservationId);
        try {
            await ReservationService.cancelReservation(reservationId);
            // Update the local state
            setReservations(prev =>
                prev.map(res =>
                    res.id === reservationId
                        ? { ...res, status: 'CANCELLED' }
                        : res
                )
            );
        } catch (err) {
            console.error('Error cancelling reservation:', err);
            alert('Erreur lors de l\'annulation de la réservation');
        } finally {
            setCancellingId(null);
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'PENDING': { text: 'En attente', class: 'status-pending' },
            'CONFIRMED': { text: 'Confirmée', class: 'status-confirmed' },
            'CANCELLED': { text: 'Annulée', class: 'status-cancelled' },
            'COMPLETED': { text: 'Terminée', class: 'status-completed' },
            'NO_SHOW': { text: 'Absent', class: 'status-noshow' }
        };
        return labels[status] || { text: status, class: '' };
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    if (!isLoaded) {
        return (
            <div className="my-reservations-container">
                <Navbar />
                <div className="loading-state">
                    <div className="spinner-large"></div>
                    <p>Chargement...</p>
                </div>
            </div>
        );
    }

    if (!isSignedIn) {
        return (
            <div className="my-reservations-container">
                <Navbar />
                <div className="reservations-wrapper">
                    <div className="auth-required-card">
                        <span className="auth-icon">🔒</span>
                        <h2>Connexion Requise</h2>
                        <p>Vous devez être connecté pour voir vos réservations.</p>
                        <Link to="/login" className="login-button">Se connecter</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-reservations-container">
            <Navbar />

            <div className="reservations-wrapper">
                <div className="reservations-header">
                    <h1>🍽️ Mes Réservations</h1>
                    <p>Gérez vos réservations de restaurants</p>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner-large"></div>
                        <p>Chargement de vos réservations...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <span className="error-icon">⚠️</span>
                        <p>{error}</p>
                        <button onClick={fetchReservations} className="retry-button">
                            Réessayer
                        </button>
                    </div>
                ) : reservations.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📅</span>
                        <h3>Aucune réservation</h3>
                        <p>Vous n'avez pas encore de réservation.</p>
                        <Link to="/restaurants" className="explore-button">
                            Explorer les restaurants
                        </Link>
                    </div>
                ) : (
                    <div className="reservations-list">
                        {reservations.map(reservation => {
                            const statusInfo = getStatusLabel(reservation.status);
                            const isPast = new Date(reservation.reservationDate) < new Date();
                            const canCancel = !isPast && ['PENDING', 'CONFIRMED'].includes(reservation.status);

                            return (
                                <div key={reservation.id} className={`reservation-card ${isPast ? 'past' : ''}`}>
                                    <div className="reservation-restaurant">
                                        <img
                                            src={reservation.restaurantImage || 'https://via.placeholder.com/80'}
                                            alt={reservation.restaurantName}
                                            className="restaurant-image"
                                        />
                                        <div className="restaurant-details">
                                            <h3>{reservation.restaurantName}</h3>
                                            <p>📍 {reservation.restaurantAddress}</p>
                                        </div>
                                        <span className={`status-badge ${statusInfo.class}`}>
                                            {statusInfo.text}
                                        </span>
                                    </div>

                                    <div className="reservation-details">
                                        <div className="detail-item">
                                            <span className="detail-icon">📅</span>
                                            <span>{formatDate(reservation.reservationDate)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-icon">🕐</span>
                                            <span>{reservation.reservationTime}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-icon">👥</span>
                                            <span>{reservation.partySize} personne{reservation.partySize > 1 ? 's' : ''}</span>
                                        </div>
                                    </div>

                                    {reservation.specialRequests && (
                                        <div className="special-requests">
                                            <strong>Note:</strong> {reservation.specialRequests}
                                        </div>
                                    )}

                                    <div className="reservation-actions">
                                        <Link
                                            to={`/restaurants/${reservation.restaurantId}`}
                                            className="action-button view"
                                        >
                                            Voir le restaurant
                                        </Link>

                                        {canCancel && (
                                            <button
                                                onClick={() => handleCancel(reservation.id)}
                                                className="action-button cancel"
                                                disabled={cancellingId === reservation.id}
                                            >
                                                {cancellingId === reservation.id ? 'Annulation...' : 'Annuler'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyReservations;

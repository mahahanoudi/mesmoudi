import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import HotelService from '../../services/hotel.service';
import Navbar from '../common/Navbar';

const MyHotelReservations = () => {
    const { isLoaded, isSignedIn, user } = useUser();
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancellingId, setCancellingId] = useState(null);
    const [activeFilter, setActiveFilter] = useState('toutes');

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            navigate('/login');
            return;
        }

        if (isLoaded && isSignedIn && user) {
            loadReservations();
        }
    }, [isLoaded, isSignedIn, user, navigate]);

    const loadReservations = async () => {
        try {
            setLoading(true);
            setError('');
            const email = user.primaryEmailAddress?.emailAddress;
            
            if (!email) {
                setError('Email non disponible');
                return;
            }

            const response = await HotelService.getReservationsByClient(email);
            console.log('Réservations récupérées:', response.data);
            setReservations(response.data);
        } catch (err) {
            console.error('Erreur lors du chargement des réservations:', err);
            setError('Impossible de charger vos réservations');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelReservation = async (reservationId, numeroReservation) => {
        if (!window.confirm(`Voulez-vous vraiment annuler la réservation ${numeroReservation} ?`)) {
            return;
        }

        try {
            setCancellingId(reservationId);
            await HotelService.cancelReservation(reservationId);
            
            await loadReservations();
            
            alert('Réservation annulée avec succès');
        } catch (err) {
            console.error('Erreur lors de l\'annulation:', err);
            alert('Erreur lors de l\'annulation de la réservation');
        } finally {
            setCancellingId(null);
        }
    };

    const getStatutBadge = (statut) => {
        const styles = {
            EN_ATTENTE: { 
                bg: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)', 
                color: '#856404', 
                text: 'En attente',
                icon: '⏳'
            },
            CONFIRMEE: { 
                bg: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', 
                color: '#065f46', 
                text: 'Confirmée',
                icon: '✅'
            },
            ANNULEE: { 
                bg: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', 
                color: '#991b1b', 
                text: 'Annulée',
                icon: '❌'
            },
            TERMINEE: { 
                bg: 'linear-gradient(135deg, #d1f5f3 0%, #a5f3fc 100%)', 
                color: '#0c4a6e', 
                text: 'Terminée',
                icon: '🏁'
            },
            EN_COURS: { 
                bg: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)', 
                color: '#1e40af', 
                text: 'En cours',
                icon: '🏨'
            }
        };

        const style = styles[statut] || styles.EN_ATTENTE;

        return (
            <span style={{
                background: style.bg,
                color: style.color,
                padding: '8px 20px',
                borderRadius: '25px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: `2px solid ${style.color}20`
            }}>
                {style.icon} {style.text}
            </span>
        );
    };

    const canCancelReservation = (reservation) => {
        return reservation.statut === 'EN_ATTENTE' || reservation.statut === 'CONFIRMEE';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Date non disponible';
        try {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('fr-FR', options);
        } catch (error) {
            return 'Date invalide';
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Date non disponible';
        try {
            const date = new Date(dateString);
            const options = { 
                day: '2-digit', 
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return date.toLocaleDateString('fr-FR', options);
        } catch (error) {
            return 'Date invalide';
        }
    };

    const filterReservations = () => {
        if (activeFilter === 'toutes') return reservations;
        return reservations.filter(res => res.statut === activeFilter);
    };

    const getDaysRemaining = (dateArrivee) => {
        if (!dateArrivee) return 0;
        const arrival = new Date(dateArrivee);
        const today = new Date();
        const diffTime = arrival - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getProgressPercentage = (dateArrivee, dateDepart) => {
        if (!dateArrivee || !dateDepart) return 0;
        const start = new Date(dateArrivee);
        const end = new Date(dateDepart);
        const now = new Date();
        
        if (now < start) return 0;
        if (now > end) return 100;
        
        const totalDuration = end - start;
        const elapsed = now - start;
        return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    };

    const styles = {
        container: {
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            paddingTop: '80px',
            paddingBottom: '3rem'
        },
        wrapper: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
        },
        header: {
            textAlign: 'center',
            marginBottom: '3rem'
        },
        title: {
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            color: '#065f46',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
        },
        subtitle: {
            fontSize: '1.1rem',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto 2rem'
        },
        statsContainer: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
        },
        statCard: {
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '1.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            border: '1px solid #e5e7eb'
        },
        statNumber: {
            fontSize: '2.2rem',
            fontWeight: 'bold',
            color: '#065f46',
            marginBottom: '0.5rem'
        },
        statLabel: {
            fontSize: '0.9rem',
            color: '#6b7280',
            fontWeight: '600'
        },
        filterContainer: {
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
        },
        filterButton: {
            padding: '8px 16px',
            backgroundColor: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '50px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '0.9rem',
            color: '#4b5563'
        },
        activeFilter: {
            backgroundColor: '#065f46',
            color: 'white',
            borderColor: '#065f46'
        },
        backButton: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 24px',
            backgroundColor: '#065f46',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            marginBottom: '2rem',
            border: 'none',
            cursor: 'pointer'
        },
        reservationCard: {
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            border: '1px solid #e5e7eb',
            position: 'relative'
        },
        reservationHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1.5rem',
            paddingBottom: '1.5rem',
            borderBottom: '2px solid #f3f4f6'
        },
        hotelInfo: {
            flex: 1
        },
        hotelName: {
            fontSize: '1.6rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '0.5rem'
        },
        reservationNumber: {
            color: '#6b7280',
            fontSize: '0.9rem',
            backgroundColor: '#f9fafb',
            padding: '4px 12px',
            borderRadius: '20px',
            display: 'inline-block'
        },
        timeline: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
            padding: '1.2rem',
            backgroundColor: '#f0fdf4',
            borderRadius: '12px',
            border: '1px solid #d1fae5'
        },
        timelineDate: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1
        },
        timelineLabel: {
            fontSize: '0.8rem',
            color: '#065f46',
            fontWeight: '600',
            marginBottom: '0.3rem'
        },
        timelineValue: {
            fontSize: '0.95rem',
            fontWeight: '600',
            color: '#1f2937',
            padding: '6px 12px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #d1fae5'
        },
        durationInfo: {
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#6b7280',
            fontWeight: '500'
        },
        progressBar: {
            height: '6px',
            backgroundColor: '#e5e7eb',
            borderRadius: '3px',
            marginTop: '0.5rem',
            overflow: 'hidden'
        },
        progressFill: {
            height: '100%',
            backgroundColor: '#10b981',
            borderRadius: '3px',
            transition: 'width 0.5s ease'
        },
        reservationGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
        },
        detailItem: {
            backgroundColor: '#f9fafb',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.3rem'
        },
        detailLabel: {
            fontSize: '0.8rem',
            color: '#6b7280',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        },
        detailValue: {
            fontSize: '1rem',
            color: '#1f2937',
            fontWeight: '600'
        },
        priceSection: {
            backgroundColor: '#f0fdf4',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: '1px solid #d1fae5'
        },
        priceItem: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.8rem',
            paddingBottom: '0.8rem',
            borderBottom: '1px dashed #cbd5e1'
        },
        priceLabel: {
            color: '#6b7280'
        },
        priceAmount: {
            fontWeight: '600',
            color: '#1f2937'
        },
        totalPrice: {
            fontSize: '1.3rem',
            fontWeight: 'bold',
            color: '#065f46',
            borderTop: '2px solid #10b981',
            paddingTop: '0.8rem',
            marginTop: '0.5rem'
        },
        buttonGroup: {
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap'
        },
        cancelButton: {
            padding: '10px 20px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        cancelButtonHover: {
            backgroundColor: '#b91c1c',
            transform: 'translateY(-2px)'
        },
        viewButton: {
            padding: '10px 20px',
            backgroundColor: '#065f46',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
        },
        viewButtonHover: {
            backgroundColor: '#064e3b',
            transform: 'translateY(-2px)'
        },
        emptyState: {
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '4rem 2rem',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            marginTop: '2rem'
        },
        emptyIcon: {
            fontSize: '4rem',
            marginBottom: '1.5rem',
            opacity: '0.8'
        },
        emptyTitle: {
            fontSize: '1.8rem',
            color: '#1f2937',
            marginBottom: '1rem',
            fontWeight: 'bold'
        },
        emptyText: {
            color: '#6b7280',
            marginBottom: '2rem',
            fontSize: '1rem',
            lineHeight: '1.6'
        },
        browseButton: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 30px',
            backgroundColor: '#065f46',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            transition: 'all 0.3s ease'
        },
        browseButtonHover: {
            backgroundColor: '#064e3b',
            transform: 'translateY(-2px)'
        },
        loading: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5rem',
            textAlign: 'center'
        },
        spinner: {
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #065f46',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '1rem'
        },
        error: {
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: '1px solid #fecaca',
            textAlign: 'center',
            fontWeight: '600'
        },
        demandesSpeciales: {
            backgroundColor: '#fffbeb',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem',
            fontSize: '0.9rem',
            color: '#92400e',
            border: '1px solid #fde68a'
        },
        daysRemaining: {
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 'bold'
        }
    };

    if (!isLoaded || loading) {
        return (
            <div style={styles.container}>
                <Navbar />
                <div style={styles.loading}>
                    <div style={styles.spinner}></div>
                    <p style={{ color: '#6b7280', fontSize: '1rem' }}>
                        Chargement de vos réservations...
                    </p>
                </div>
            </div>
        );
    }

    if (!isSignedIn) {
        return null;
    }

    const filteredReservations = filterReservations();
    const confirmedReservations = reservations.filter(r => r.statut === 'CONFIRMEE').length;
    const upcomingReservations = reservations.filter(r => 
        r.statut === 'CONFIRMEE' && new Date(r.dateArrivee) > new Date()
    ).length;

    return (
        <div style={styles.container}>
            <Navbar />
            <div style={styles.wrapper}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Mes Réservations d'Hôtels</h1>
                    <p style={styles.subtitle}>
                        Gérez toutes vos réservations en un seul endroit
                    </p>

                    {/* Statistiques */}
                    <div style={styles.statsContainer}>
                        <div style={styles.statCard}>
                            <div style={styles.statNumber}>{reservations.length}</div>
                            <div style={styles.statLabel}>Total</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statNumber}>{confirmedReservations}</div>
                            <div style={styles.statLabel}>Confirmées</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statNumber}>{upcomingReservations}</div>
                            <div style={styles.statLabel}>À venir</div>
                        </div>
                    </div>

                    {/* Filtres */}
                    <div style={styles.filterContainer}>
                        {['toutes', 'CONFIRMEE', 'EN_ATTENTE', 'EN_COURS', 'ANNULEE', 'TERMINEE'].map((filter) => (
                            <button
                                key={filter}
                                style={{
                                    ...styles.filterButton,
                                    ...(activeFilter === filter && styles.activeFilter)
                                }}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter === 'toutes' ? 'Toutes' : 
                                 filter === 'CONFIRMEE' ? 'Confirmées' :
                                 filter === 'EN_ATTENTE' ? 'En attente' :
                                 filter === 'EN_COURS' ? 'En cours' :
                                 filter === 'ANNULEE' ? 'Annulées' : 'Terminées'}
                            </button>
                        ))}
                    </div>
                </div>

                <Link 
                    to="/hotels" 
                    style={styles.backButton}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#064e3b'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#065f46'}
                >
                    ← Retour aux hôtels
                </Link>

                {error && (
                    <div style={styles.error}>
                        ⚠️ {error}
                    </div>
                )}

                {filteredReservations.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>🏨</div>
                        <h2 style={styles.emptyTitle}>
                            {activeFilter === 'toutes' ? 'Aucune réservation' : 'Aucune réservation dans cette catégorie'}
                        </h2>
                        <p style={styles.emptyText}>
                            {activeFilter === 'toutes' 
                                ? 'Vous n\'avez pas encore effectué de réservation d\'hôtel. Découvrez nos hôtels à Tétouan et réservez votre séjour !'
                                : 'Aucune réservation ne correspond à ce filtre.'}
                        </p>
                        <Link 
                            to="/hotels" 
                            style={styles.browseButton}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#064e3b'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#065f46'}
                        >
                            Découvrir les hôtels
                        </Link>
                    </div>
                ) : (
                    <div>
                        {filteredReservations.map((reservation) => {
                            const daysRemaining = getDaysRemaining(reservation.dateArrivee);
                            const progress = getProgressPercentage(reservation.dateArrivee, reservation.dateDepart);
                            const dateArrivee = reservation.dateArrivee ? formatDate(reservation.dateArrivee) : 'Date non disponible';
                            const dateDepart = reservation.dateDepart ? formatDate(reservation.dateDepart) : 'Date non disponible';
                            const dateReservation = reservation.createdAt ? formatDateTime(reservation.createdAt) : 
                                                   reservation.dateReservation ? formatDateTime(reservation.dateReservation) : 'Date non disponible';
                            
                            return (
                                <div 
                                    key={reservation.id} 
                                    style={styles.reservationCard}
                                >
                                    {reservation.statut === 'CONFIRMEE' && daysRemaining > 0 && (
                                        <div style={styles.daysRemaining}>
                                            {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}
                                        </div>
                                    )}

                                    <div style={styles.reservationHeader}>
                                        <div style={styles.hotelInfo}>
                                            <h2 style={styles.hotelName}>{reservation.hotelNom || 'Hôtel non spécifié'}</h2>
                                            <div style={styles.reservationNumber}>
                                                Réservation N° {reservation.numeroReservation || 'N/A'}
                                            </div>
                                        </div>
                                        {getStatutBadge(reservation.statut)}
                                    </div>

                                    {/* Timeline */}
                                    <div style={styles.timeline}>
                                        <div style={styles.timelineDate}>
                                            <div style={styles.timelineLabel}>Arrivée</div>
                                            <div style={styles.timelineValue}>
                                                {dateArrivee}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '1.2rem', color: '#10b981' }}>→</div>
                                        <div style={styles.timelineDate}>
                                            <div style={styles.timelineLabel}>Départ</div>
                                            <div style={styles.timelineValue}>
                                                {dateDepart}
                                            </div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={styles.durationInfo}>
                                                Durée : {reservation.nombreNuits || 0} nuit{reservation.nombreNuits > 1 ? 's' : ''}
                                            </div>
                                            {reservation.statut === 'EN_COURS' && (
                                                <div style={styles.progressBar}>
                                                    <div 
                                                        style={{ 
                                                            ...styles.progressFill, 
                                                            width: `${progress}%` 
                                                        }} 
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Détails */}
                                    <div style={styles.reservationGrid}>
                                        <div style={styles.detailItem}>
                                            <div style={styles.detailLabel}>
                                                🛏️ Chambre
                                            </div>
                                            <div style={styles.detailValue}>
                                                Chambre {reservation.chambreNumero || 'N/A'}
                                            </div>
                                        </div>
                                        <div style={styles.detailItem}>
                                            <div style={styles.detailLabel}>
                                                👥 Voyageurs
                                            </div>
                                            <div style={styles.detailValue}>
                                                {reservation.nombreAdultes || 0} adulte{reservation.nombreAdultes > 1 ? 's' : ''}
                                                {reservation.nombreEnfants > 0 && `, ${reservation.nombreEnfants} enfant${reservation.nombreEnfants > 1 ? 's' : ''}`}
                                            </div>
                                        </div>
                                        <div style={styles.detailItem}>
                                            <div style={styles.detailLabel}>
                                                💳 Réservé le
                                            </div>
                                            <div style={styles.detailValue}>
                                                {dateReservation}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Prix */}
                                    <div style={styles.priceSection}>
                                        <div style={styles.priceItem}>
                                            <span style={styles.priceLabel}>Prix par nuit</span>
                                            <span style={styles.priceAmount}>
                                                {reservation.prixTotal && reservation.nombreNuits 
                                                    ? `${(reservation.prixTotal / reservation.nombreNuits).toFixed(2)} DH`
                                                    : '0.00 DH'}
                                            </span>
                                        </div>
                                        <div style={styles.priceItem}>
                                            <span style={styles.priceLabel}>Nombre de nuits</span>
                                            <span style={styles.priceAmount}>{reservation.nombreNuits || 0}</span>
                                        </div>
                                        <div style={{ ...styles.priceItem, ...styles.totalPrice }}>
                                            <span>Montant total</span>
                                            <span>{reservation.prixTotal || 0} DH</span>
                                        </div>
                                    </div>

                                    {/* Demandes spéciales */}
                                    {reservation.demandesSpeciales && (
                                        <div style={styles.demandesSpeciales}>
                                            <strong>📝 Demandes spéciales :</strong>
                                            <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                                                {reservation.demandesSpeciales}
                                            </p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div style={styles.buttonGroup}>
                                        <Link
                                            to={`/hotels/${reservation.chambreId}`}
                                            style={styles.viewButton}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = styles.viewButtonHover.backgroundColor;
                                                e.currentTarget.style.transform = styles.viewButtonHover.transform;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = styles.viewButton.backgroundColor;
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            Voir l'hôtel
                                        </Link>
                                        
                                        {canCancelReservation(reservation) && (
                                            <button
                                                style={styles.cancelButton}
                                                onClick={() => handleCancelReservation(reservation.id, reservation.numeroReservation)}
                                                disabled={cancellingId === reservation.id}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = styles.cancelButtonHover.backgroundColor;
                                                    e.currentTarget.style.transform = styles.cancelButtonHover.transform;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = styles.cancelButton.backgroundColor;
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }}
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

            {/* Styles CSS */}
            <style>
                {`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                `}
            </style>
        </div>
    );
};

export default MyHotelReservations;
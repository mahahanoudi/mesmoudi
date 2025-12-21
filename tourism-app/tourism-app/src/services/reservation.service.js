import api from './api';

const ReservationService = {
    // Créer une réservation
    createReservation: (data) => {
        return api.post('/reservations', data);
    },

    // Récupérer les réservations d'un utilisateur
    getReservationsByUser: (userId) => {
        return api.get(`/reservations/user/${userId}`);
    },

    // Récupérer les réservations d'un restaurant (pour admin/dashboard si nécessaire)
    getReservationsByRestaurant: (restaurantId) => {
        return api.get(`/reservations/restaurant/${restaurantId}`);
    },

    // Annuler une réservation
    cancelReservation: (id) => {
        return api.put(`/reservations/${id}/cancel`);
    },

    // Récupérer une réservation par ID
    getReservationById: (id) => {
        return api.get(`/reservations/${id}`);
    }
};

export default ReservationService;

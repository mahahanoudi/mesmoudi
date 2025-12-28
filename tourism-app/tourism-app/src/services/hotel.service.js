import axios from 'axios';

const API_URL = 'http://localhost:8082/api/hotels';
const RESERVATION_URL = 'http://localhost:8082/api/hotel-reservations';

class HotelService {
    
    /**
     * Récupère tous les hôtels
     */
    getAllHotels() {
        return axios.get(API_URL);
    }

    /**
     * Récupère un hôtel par son ID
     */
    getHotelById(id) {
        return axios.get(`${API_URL}/${id}`);
    }

    /**
     * Recherche d'hôtels avec critères
     */
    searchHotels(searchParams) {
        return axios.post(`${API_URL}/search`, searchParams);
    }

    /**
     * Récupère les chambres disponibles d'un hôtel
     */
    getAvailableRooms(hotelId) {
        return axios.get(`${API_URL}/${hotelId}/chambres`);
    }

    /**
     * Vérifie la disponibilité d'une chambre
     */
    checkDisponibilite(disponibiliteRequest) {
        return axios.post(`${RESERVATION_URL}/check-disponibilite`, disponibiliteRequest);
    }

    /**
     * Crée une nouvelle réservation
     */
    createReservation(reservationData) {
        return axios.post(RESERVATION_URL, reservationData);
    }

    /**
     * Récupère une réservation par son numéro
     */
    getReservationByNumero(numeroReservation) {
        return axios.get(`${RESERVATION_URL}/${numeroReservation}`);
    }

    /**
     * Récupère toutes les réservations d'un client
     */
    getReservationsByClient(email) {
        return axios.get(`${RESERVATION_URL}/client/${email}`);
    }

    /**
     * Annule une réservation
     */
    cancelReservation(id) {
        return axios.delete(`${RESERVATION_URL}/${id}`);
    }

    /**
     * Met à jour le statut d'une réservation
     */
    updateReservationStatus(id, statut) {
        return axios.put(`${RESERVATION_URL}/${id}/statut`, { statut });
    }
}

export default new HotelService();
// src/services/reservation.service.js
import axios from 'axios';

const API_GATEWAY_URL = 'http://localhost:8082/api';

class ReservationFlightService {
  // Créer une réservation avec Clerk
  async createReservation(reservationData, getToken) {
    try {
      // Récupérer le token Clerk
      const token = await getToken();
      if (!token) {
        throw new Error('Token non disponible. Veuillez vous reconnecter.');
      }

      console.log('📤 Envoi réservation avec token Clerk');

      const response = await axios.post(
        `${API_GATEWAY_URL}/reservations/create`,
        reservationData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('❌ Erreur création réservation:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      
      throw error;
    }
  }

  // Confirmer une réservation
  async confirmReservation(reservationId, getToken) {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Token non disponible.');
      }

      const response = await axios.post(
        `${API_GATEWAY_URL}/reservations/confirm/${reservationId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('❌ Erreur confirmation réservation:', error);
      throw error;
    }
  }

  // Obtenir les réservations de l'utilisateur
  async getUserReservations(getToken) {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Token non disponible.');
      }

      const response = await axios.get(
        `${API_GATEWAY_URL}/reservations/my-reservations`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération réservations:', error);
      throw error;
    }
  }

  // Vérifier l'authentification
  async checkAuth(getToken) {
    try {
      const token = await getToken();
      if (!token) {
        return { authenticated: false };
      }

      const response = await axios.get(
        `${API_GATEWAY_URL}/reservations/check-auth`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Erreur vérification auth:', error);
      return { authenticated: false };
    }
  }
}

export default new ReservationFlightService();
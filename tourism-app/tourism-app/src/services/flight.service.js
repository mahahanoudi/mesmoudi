// src/services/flight.service.js
import axios from 'axios';

const API_GATEWAY_URL = 'http://localhost:8082/api';

class FlightService {
  constructor() {
    this.API_URL = `${API_GATEWAY_URL}/flights`;
  }

  // ==================== VOLS ====================
  
  // Rechercher des vols
  async searchFlights(params) {
    try {
      const cleanParams = {};
      if (params.departureCity) cleanParams.departureCity = params.departureCity;
      if (params.departureDate) cleanParams.departureDate = params.departureDate;
      if (params.airline) cleanParams.airline = params.airline;
      
      const response = await axios.get(`${this.API_URL}/search`, { 
        params: cleanParams 
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Erreur recherche vols:', error);
      throw error;
    }
  }

  // Liste des compagnies
  async getAirlinesList() {
    try {
      const response = await axios.get(`${this.API_URL}/airlines/list`);
      return response.data;
    } catch (error) {
      console.error('Erreur liste compagnies:', error);
      return ['Royal Air Maroc', 'Air France', 'Iberia', 'Lufthansa', 'British Airways'];
    }
  }

  // Liste des villes
  async getCitiesList() {
    try {
      const response = await axios.get(`${this.API_URL}/cities/list`);
      return response.data;
    } catch (error) {
      console.error('Erreur liste villes:', error);
      return ['Paris', 'Casablanca', 'Rabat', 'Tanger', 'Fès', 'Madrid', 'Londres'];
    }
  }

  // Détails d'un vol
  async getFlightDetails(flightId) {
    try {
      const response = await axios.get(`${this.API_URL}/${flightId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur détails vol:', error);
      throw error;
    }
  }

  // Vérifier la disponibilité
  async checkAvailability(flightId, classType, passengers) {
    try {
      const response = await axios.get(
        `${this.API_URL}/${flightId}/availability`,
        {
          params: {
            classType: classType,
            passengers: passengers
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Erreur vérification disponibilité:', error);
      return { available: false };
    }
  }

  // Statistiques
  async getDashboardStats() {
    try {
      const response = await axios.get(`${this.API_URL}/stats/db`);
      return response.data;
    } catch (error) {
      console.error('Erreur statistiques:', error);
      return {};
    }
  }

  // Santé du service
  async healthCheck() {
    try {
      const response = await axios.get(`${this.API_URL}/health`);
      return response.data;
    } catch (error) {
      console.error('Erreur health check:', error);
      return { status: 'DOWN' };
    }
  }

  // ==================== RÉSERVATIONS ====================

  // Créer une réservation
  async createReservation(reservationData, getToken) {
    try {
      // Récupérer le token Clerk
      const token = await getToken();
      if (!token) {
        throw new Error('Token non disponible. Veuillez vous reconnecter.');
      }

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

export default new FlightService();
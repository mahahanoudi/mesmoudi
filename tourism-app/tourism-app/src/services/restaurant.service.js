import axios from 'axios';

const API_URL = 'http://127.0.0.1:8083/api/restaurants'; // Direct au Backend (Contournement Gateway)

class RestaurantService {
    getAllRestaurants() {
        return axios.get(API_URL);
    }

    getRestaurantById(id) {
        return axios.get(`${API_URL}/${id}`);
    }
}

export default new RestaurantService();

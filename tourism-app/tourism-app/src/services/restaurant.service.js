import api from './api';

class RestaurantService {
    getAllRestaurants() {
        return api.get('/restaurants');
    }

    getRestaurantById(id) {
        return api.get(`/restaurants/${id}`);
    }
}

export default new RestaurantService();

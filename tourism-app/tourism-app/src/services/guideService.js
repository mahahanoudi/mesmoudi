// services/guideService.js
import axios from 'axios';

const API_URL = 'http://localhost:8087/api/guides';

const createGuide = async (formData) => {
    const response = await axios.post(API_URL, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

const getGuides = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

const getGuideById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

const updateGuide = async (id, formData) => {
    const response = await axios.put(`${API_URL}/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

const deleteGuide = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

// ✅ Ajoutez toggleGuideStatus qui manque aussi !
const toggleGuideStatus = async (id) => {
    const response = await axios.patch(`${API_URL}/${id}/toggle-status`);
    return response.data;
};

export const guideService = {
    createGuide,
    getGuides,
    getAllGuides: getGuides, // ✅ Alias pour compatibilité
    getGuideById,
    updateGuide,
    deleteGuide,
    toggleGuideStatus, // ✅ Méthode manquante
};
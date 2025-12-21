import axios from 'axios';

const API_URL = 'http://localhost:8082/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let getClerkToken = null;

export const initializeApiWithClerk = (tokenGetter) => {
  getClerkToken = tokenGetter;
  console.log('✅ API initialisée avec le token getter de Clerk');
};

// ✅ Intercepteur avec JWT Template (durée de 10 minutes)
api.interceptors.request.use(
  async (config) => {
    // Ne pas ajouter de token pour /auth/sync
    if (config.url === '/auth/sync') {
      return config;
    }

    if (getClerkToken) {
      try {
        // 🔑 IMPORTANT : Utiliser le template 'backend-api' avec durée de 10 minutes
        // Si vous n'avez pas encore créé le template, créez-le d'abord dans Clerk Dashboard
        const token = await getClerkToken({ template: 'backend-api' });

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ Token ajouté à la requête:', config.url);
        } else {
          console.error('❌ Token null reçu');
        }
      } catch (error) {
        console.error('❌ Erreur récupération token:', error);
      }
    } else {
      console.error('❌ getClerkToken non initialisé');
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Gestion des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('❌ Non autorisé - Redirection vers login');

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  syncUser: async (clerkUser) => {
    try {
      const userData = {
        clerkId: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        role: clerkUser.publicMetadata?.role || 'Member'
      };

      console.log('🔄 Synchronisation utilisateur:', userData.email);
      const response = await api.post('/auth/sync', userData);
      console.log('✅ Synchronisation réussie');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
      throw error;
    }
  },

  getUserProfile: async () => {
    try {
      console.log('📥 Appel /api/auth/profile...');
      const response = await api.get('/auth/profile');
      console.log('✅ Profil récupéré');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération profil:', error);
      throw error;
    }
  }
};

export default api;
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost';

export const api = {
  membres: axios.create({ baseURL: `${API_BASE_URL}:3001` }),
  parcelles: axios.create({ baseURL: `${API_BASE_URL}:3002` }),
  taches: axios.create({ baseURL: `${API_BASE_URL}:3003` }),
  catalogue: axios.create({ baseURL: `${API_BASE_URL}:3004` }),
};

// Intercepteur pour ajouter le token JWT
Object.values(api).forEach((instance) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
});

export default api;

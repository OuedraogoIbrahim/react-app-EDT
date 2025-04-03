import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000/api", // URL de votre API Laravel
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Intercepteur pour ajouter le token JWT si nécessaire
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("authToken");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;

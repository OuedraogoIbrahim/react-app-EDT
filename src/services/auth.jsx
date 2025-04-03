const API_BASE_URL = "http://localhost:8000/api";

export const authService = {
    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Échec de la connexion");
            }

            const data = await response.json();
            // Stocker le token dans localStorage
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            window.location.reload();

            return data;
        } catch (error) {
            throw error;
        }
    },

    async register(nom, prenom, email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ nom, prenom, email, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Échec de l'inscription");
            }

            const data = await response.json();
            // Stocker le token dans localStorage
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            window.location.reload();

            return data;
        } catch (error) {
            throw error;
        }
    },

    logout() {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.reload();
    },

    getCurrentUser() {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated() {
        return !!localStorage.getItem("authToken");
    },

    getAuthToken() {
        return localStorage.getItem("authToken");
    },
};

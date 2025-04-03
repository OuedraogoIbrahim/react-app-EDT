"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import { authService } from "../services/auth";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Vérifier si l'utilisateur est déjà connecté au chargement
    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        setLoading(false);
    }, []);

    const login = useCallback(
        async (email, password) => {
            try {
                setLoading(true);
                setError(null);
                const data = await authService.login(email, password);
                setUser(data.user);
                navigate("/");
                return true;
            } catch (err) {
                setError(err.message);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [navigate]
    );

    const register = useCallback(
        async (nom, prenom, email, password) => {
            try {
                setLoading(true);
                setError(null);
                const data = await authService.register(
                    nom,
                    prenom,
                    email,
                    password
                );
                setUser(data.user);
                navigate("/");
                return true;
            } catch (err) {
                setError(err.message);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [navigate]
    );

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
        navigate("/login");
    }, [navigate]);

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

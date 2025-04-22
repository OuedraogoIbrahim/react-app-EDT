import { useAuth } from "@/context/AuthContext";
import configApi from "./api"; 
import { AxiosError } from "axios";

export function authentification() {
  const { setUser, setToken, setIsConnected } = useAuth();

  const login = async (email: string, password: string) => {
    try {
      const response = await configApi.post("/login", { email, password , device : 'web' });
      if(response.status == 200){
      const data = response.data;

      // Stocker le token dans localStorage
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setToken(data.token);
      setIsConnected(true);

      return;
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Échec de la connexion");
    }
  };

  const register = async (nom: string, prenom: string, email: string, password: string) => {
    try {
      const response = await configApi.post("/register", { nom, prenom, email, password });

      if(response.status == 200){

      const data = response.data;

      // Stocker le token dans localStorage
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setToken(data.token);
      setIsConnected(true);

      return;
      }

    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Échec de l'inscription");
    }
  };

  const logout = async () => {
   
    try {
      const response = await configApi.post("/logout");
      if (response.status == 200) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        setUser(null);
        setToken('');
        setIsConnected(false);
      }
    } catch (error) {
      const err = error as AxiosError;
      throw err.response?.data || new Error("Erreur lors de la Deconnexion");
    }
  

    return
  };

  return {
    login,
    register,
    logout,
  };
}

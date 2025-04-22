import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const LoginSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { setUser, setToken, setIsConnected } = useAuth();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    const user = query.get("user");

    if (token && user) {
      // Stocke le token dans localStorage, etc.
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", user);
      setUser(JSON.parse(user));
      setToken(token);
      setIsConnected(true);
      navigate("/emploi-du-temps");
    } else {
      navigate("login");
    }
  }, []);

  return <p>Connexion en cours...</p>;
};

export default LoginSuccess;

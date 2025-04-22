import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const Guest = () => {
  const { isConnected } = useAuth();
  return !isConnected ? <Outlet /> : <Navigate to="/emploi-du-temps" />;
};

export default Guest;

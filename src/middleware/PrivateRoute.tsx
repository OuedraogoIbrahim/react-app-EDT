import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const { isConnected } = useAuth();

  // if (loading) {
  //     return <div>Chargement...</div>;
  // }

  // return <Outlet />;

  return isConnected ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;

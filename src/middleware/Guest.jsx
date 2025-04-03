import { Navigate, Outlet } from "react-router-dom";

const Guest = () => {
    const auth = localStorage.getItem("authToken");
    return !auth ? <Outlet /> : <Navigate to="/" />;
};

export default Guest;

import { useRoutes } from "react-router-dom";
import DashboardOverview1 from "../pages/DashboardOverview1";
import Settings from "../pages/Settings";
import Calendar from "../pages/Calendar";
import Login from "../pages/Login";
import LandingPage from "../pages/LandingPage";

import Layout from "../themes";
import PrivateRoute from "@/middleware/PrivateRoute";
import Guest from "@/middleware/Guest";
import LoginSuccess from "@/pages/LoginSuccessSocialNetwork";

import Filiere from "../pages/Filiere";
import Matiere from "../pages/Matiere";
import Niveau from "../pages/Niveau";
import Provisoire from "../pages/Provisoire";
import Professeur from "../pages/Professeur";
import Salle from "../pages/Salle";

function Router() {
  const routes = [
    {
      // path: "/",
      element: <PrivateRoute />,
      children: [
        {
          // path: "/",
          element: <Layout />,
          children: [
            {
              path: "/dashboard",
              element: <DashboardOverview1 />,
            },
            {
              path: "filieres",
              element: <Filiere />,
            },
            {
              path: "matieres",
              element: <Matiere />,
            },
            {
              path: "niveaux",
              element: <Niveau />,
            },
            {
              path: "emploi-du-temps",
              element: <Calendar />,
            },
            {
              path: "provisoire",
              element: <Provisoire />,
            },
            {
              path: "professeurs",
              element: <Professeur />,
            },
            {
              path: "settings",
              element: <Settings />,
            },
            {
              path: "salles",
              element: <Salle />,
            },
          ],
        },
      ],
    },

    {
      path: "/login/success",
      element: <LoginSuccess />,
    },

    {
      element: <Guest />,
      children: [
        // {
        //   path: "/login/success",
        //   element: <LoginSuccess />,
        // },
        {
          path: "/login",
          element: <Login />,
        },
        // {
        //   path: "/register",
        //   element: <Register />,
        // },
        {
          path: "/landing-page",
          element: <LandingPage />,
        },
      ],
    },
  ];

  return useRoutes(routes);
}

export default Router;

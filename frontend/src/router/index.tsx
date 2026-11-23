// Arbol de rutas centralizado (data router). Tres niveles de acceso: publico, privado y privado por rol.
import { createBrowserRouter } from "react-router";
import { Layout } from "../layouts/Layout";
import { ProtectedRoute } from "./ProtectedRoute";
import { Home } from "../pages/Home";
import { MovieDetail } from "../pages/MovieDetail";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { MyMovies } from "../pages/MyMovies";
import { Admin } from "../pages/Admin";
import { AdminUsers } from "../pages/AdminUsers";
import { NotFound } from "../pages/NotFound";

export const router = createBrowserRouter([
  // Fuera del Layout: pantalla completa, sin header
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  {
    path: "/",
    element: <Layout />,
    children: [
      // Publicas
      { index: true, element: <Home /> },
      { path: "peliculas/:id", element: <MovieDetail /> },

      // Privadas: cualquier usuario con sesion
      {
        element: <ProtectedRoute />,
        children: [
          { path: "mis-peliculas", element: <MyMovies /> },
          // Carga diferida: react-markdown pesa bastante y solo se usa en el chat.
          { path: "asistente", lazy: async () => ({ Component: (await import("../pages/Chat")).Chat }) },
        ],
      },

      // Privadas por rol: solo admin. Un user comun ve "Sin permisos".
      {
        element: <ProtectedRoute roles={["admin"]} />,
        children: [
          { path: "admin", element: <Admin /> },
          { path: "admin/usuarios", element: <AdminUsers /> },
        ],
      },

      { path: "*", element: <NotFound /> },
    ],
  },
]);

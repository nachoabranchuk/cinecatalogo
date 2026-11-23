// Panel de admin: ABM de TODAS las peliculas. La ruta esta protegida por rol (ProtectedRoute roles=["admin"]):
// un usuario comun ve "Sin permisos", y aunque llamara a la API a mano el backend lo frena con 403.
import { AdminTabs } from "../components/AdminTabs";
import { MoviesManager } from "../components/MoviesManager";

export const Admin = () => (
  <section className="flex flex-col gap-6">
    <h1 className="text-2xl font-bold tracking-tight">Panel de administracion</h1>
    <AdminTabs />
    <MoviesManager scope="all" />
  </section>
);

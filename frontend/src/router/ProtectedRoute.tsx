import { Link, Navigate, Outlet, useLocation } from "react-router";
import { useSession } from "../lib/auth-client";
import { btnGhost } from "../lib/ui";
import type { UserRole } from "../types/auth";

interface ProtectedRouteProps {
  roles?: UserRole[];
}

// Tres niveles: publico (sin este componente), privado (cualquier sesion) y privado por rol (prop `roles`).
export const ProtectedRoute = ({ roles }: ProtectedRouteProps) => {
  // isPending: true hasta que responde /api/auth/get-session (evita "parpadear" el login al recargar).
  const { data: session, isPending } = useSession();
  const location = useLocation();

  if (isPending) {
    return <p className="py-10 text-center text-zinc-400">Verificando sesion...</p>;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes((session.user.role ?? "user") as UserRole)) {
    return (
      <section role="alert" className="mx-auto max-w-md py-16 text-center">
        <h2 className="text-2xl font-semibold">Sin permisos</h2>
        <p className="mt-2 text-zinc-400">Esta seccion es solo para administradores.</p>
        <Link to="/" className={`${btnGhost} mt-6`}>
          Volver al catalogo
        </Link>
      </section>
    );
  }

  return <Outlet />;
};

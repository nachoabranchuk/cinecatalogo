// Layout general: header con navegacion segun la sesion y el rol. Se monta una sola vez;
// al navegar solo cambia lo que renderiza <Outlet />.
import { Link, NavLink, Outlet } from "react-router";
import { signOut, useSession } from "../lib/auth-client";
import { btnGhost, btnPrimary } from "../lib/ui";

const navLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm transition ${isActive ? "bg-zinc-800 text-amber-300" : "text-zinc-300 hover:bg-zinc-900"}`;

export const Layout = () => {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const isAdmin = user?.role === "admin";

  // signOut borra la sesion EN LA BASE (no solo la cookie).
  // Recarga completa en vez de navigate(): useSession refresca async y la recarga limpia tambien el cache de RTK Query.
  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      alert(error.message ?? "No se pudo cerrar sesion");
      return;
    }
    window.location.replace("/");
  };

  return (
    <div className="min-h-screen font-sans">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="text-lg font-bold tracking-tight text-amber-400">
            🎬 CineCatalogo
          </Link>

          <nav className="flex flex-wrap items-center gap-1" aria-label="Principal">
            <NavLink to="/" end className={navLink}>
              Catalogo
            </NavLink>
            {user && (
              <>
                <NavLink to="/mis-peliculas" className={navLink}>
                  Mis peliculas
                </NavLink>
                <NavLink to="/asistente" className={navLink}>
                  Asistente
                </NavLink>
              </>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={navLink}>
                Admin
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {isPending ? null : user ? (
              <>
                <span className="hidden text-sm text-zinc-400 sm:inline">
                  {user.name}
                  {isAdmin && <span className="ml-2 rounded bg-amber-400/15 px-1.5 py-0.5 text-xs text-amber-300">admin</span>}
                </span>
                <button type="button" onClick={handleLogout} className={btnGhost}>
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={btnGhost}>
                  Ingresar
                </Link>
                <Link to="/register" className={btnPrimary}>
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

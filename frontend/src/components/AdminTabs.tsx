import { NavLink } from "react-router";

const tab = ({ isActive }: { isActive: boolean }) =>
  `border-b-2 px-3 py-2 text-sm transition ${isActive ? "border-amber-400 text-amber-300" : "border-transparent text-zinc-400 hover:text-zinc-200"}`;

export const AdminTabs = () => (
  <nav aria-label="Administracion" className="flex gap-2 border-b border-zinc-800">
    <NavLink to="/admin" end className={tab}>
      Peliculas
    </NavLink>
    <NavLink to="/admin/usuarios" className={tab}>
      Usuarios y roles
    </NavLink>
  </nav>
);

import { Link } from "react-router";
import { btnGhost } from "../lib/ui";

export const NotFound = () => (
  <section className="mx-auto max-w-md py-16 text-center">
    <p className="text-6xl font-bold text-amber-400">404</p>
    <h1 className="mt-2 text-xl font-semibold">Esta pagina no existe</h1>
    <Link to="/" className={`${btnGhost} mt-6`}>
      Volver al catalogo
    </Link>
  </section>
);

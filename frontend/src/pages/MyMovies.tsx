// Privada (cualquier sesion): el usuario crea peliculas, que quedan a su nombre, y edita/elimina solo las suyas.
import { MoviesManager } from "../components/MoviesManager";

export const MyMovies = () => (
  <section className="flex flex-col gap-6">
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Mis peliculas</h1>
      <p className="mt-1 text-zinc-400">Las peliculas que cargues quedan a tu nombre y solo vos podes editarlas o eliminarlas.</p>
    </div>
    <MoviesManager scope="mine" />
  </section>
);

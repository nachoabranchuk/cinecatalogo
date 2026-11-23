// Detalle publico de una pelicula. GET /api/movies/:id → 400 si el id es invalido, 404 si no existe.
import { Link, useParams } from "react-router";
import { MoviePoster } from "../components/MoviePoster";
import { getErrorMessage } from "../lib/api";
import { btnGhost, formatDate } from "../lib/ui";
import { useGetMovieByIdQuery } from "../store/api";

const Fact = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs uppercase tracking-wide text-zinc-500">{label}</dt>
    <dd className="mt-0.5 text-zinc-100">{value}</dd>
  </div>
);

export const MovieDetail = () => {
  const { id = "" } = useParams();
  const { data: movie, error, isLoading } = useGetMovieByIdQuery(id);

  if (isLoading) return <p className="py-10 text-center text-zinc-500">Cargando...</p>;

  if (error || !movie) {
    return (
      <section className="py-10 text-center">
        <p role="alert" className="text-red-300">
          {error ? getErrorMessage(error) : "Pelicula no encontrada"}
        </p>
        <Link to="/" className={`${btnGhost} mt-4`}>
          ← Volver al catalogo
        </Link>
      </section>
    );
  }

  return (
    <article className="flex flex-col gap-6">
      <Link to="/" className="text-sm text-zinc-400 hover:text-amber-300">
        ← Volver al catalogo
      </Link>

      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        <MoviePoster
          title={movie.title}
          posterUrl={movie.posterUrl}
          className="aspect-[2/3] w-full max-w-xs rounded-2xl border border-zinc-800"
        />

        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{movie.title}</h1>
            <p className="mt-1 text-zinc-400">
              Dirigida por {movie.director}
              {movie.inTheaters && (
                <span className="ml-3 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-zinc-950">
                  En cartelera
                </span>
              )}
            </p>
          </div>

          <p className="text-4xl font-bold text-amber-300">
            ★ {movie.rating.toFixed(1)} <span className="text-base font-normal text-zinc-500">/ 10</span>
          </p>

          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Fact label="Genero" value={movie.genre} />
            <Fact label="Estreno" value={formatDate(movie.releaseDate)} />
            <Fact label="Duracion" value={`${movie.durationMinutes} min`} />
          </dl>

          {movie.synopsis && (
            <div>
              <h2 className="text-sm uppercase tracking-wide text-zinc-500">Sinopsis</h2>
              <p className="mt-1 max-w-prose leading-relaxed text-zinc-200">{movie.synopsis}</p>
            </div>
          )}

          <p className="text-xs text-zinc-500">Cargada por {movie.createdByName}</p>
        </div>
      </div>
    </article>
  );
};

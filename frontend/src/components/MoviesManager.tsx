// ABM de peliculas, compartido por dos pantallas:
//   scope="mine" → /mis-peliculas: el usuario ve y edita SOLO las suyas (mine=true en la API).
//   scope="all"  → /admin: el admin ve y edita TODAS.
// El backend es el que realmente decide (403 si el user toca una ajena): esto solo arma la pantalla.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getErrorMessage } from "../lib/api";
import { useDebounce } from "../lib/useDebounce";
import { btnDanger, btnGhost, card, formatDate, inputClass } from "../lib/ui";
import type { MovieFormValues } from "../schemas/movie.schema";
import {
  useCreateMovieMutation,
  useDeleteMovieMutation,
  useGetMoviesQuery,
  useUpdateMovieMutation,
} from "../store/api";
import type { Movie } from "../types/movie";
import { MovieForm } from "./MovieForm";
import { MoviePoster } from "./MoviePoster";
import { Pagination } from "./Pagination";

const PAGE_SIZE = 8;

export const MoviesManager = ({ scope }: { scope: "mine" | "all" }) => {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const search = useDebounce(searchText);
  // Estado de UI de esta pantalla: no es global, se queda en useState.
  const [editing, setEditing] = useState<Movie | null>(null);

  const { data, error: loadError, isFetching } = useGetMoviesQuery({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    mine: scope === "mine" ? true : undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [createMovie] = useCreateMovieMutation();
  const [updateMovie] = useUpdateMovieMutation();
  const [deleteMovie, { error: deleteError }] = useDeleteMovieMutation();

  const movies = data?.data ?? [];
  const meta = data?.meta;

  // Si se borra el ultimo item de la ultima pagina, volver a la anterior en vez de mostrar una pagina vacia.
  useEffect(() => {
    if (meta && meta.totalPages > 0 && page > meta.totalPages) setPage(meta.totalPages);
  }, [meta, page]);

  // Cada mutation invalida el tag "Movies" y RTK Query vuelve a pedir el listado. unwrap() lanza el error para que lo muestre el form.
  const handleSave = async (values: MovieFormValues) => {
    if (editing) {
      await updateMovie({ id: editing._id, values }).unwrap();
      setEditing(null);
    } else {
      await createMovie(values).unwrap();
      setPage(1);
    }
  };

  const handleDelete = async (movie: Movie) => {
    if (!window.confirm(`¿Eliminar "${movie.title}"? No se puede deshacer.`)) return;
    // Sin unwrap: si falla, el error queda en `deleteError` y se muestra abajo.
    const result = await deleteMovie(movie._id);
    if (!result.error && editing?._id === movie._id) setEditing(null);
  };

  const startEditing = (movie: Movie) => {
    setEditing(movie);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const error = loadError ?? deleteError;

  return (
    <div className="flex flex-col gap-6">
      <MovieForm movie={editing} onSave={handleSave} onCancel={() => setEditing(null)} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">{scope === "mine" ? "Tus peliculas" : "Todas las peliculas"}</h3>
        <input
          type="search"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar por titulo o director..."
          aria-label="Buscar"
          className={`${inputClass} max-w-xs`}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-950/60 p-3 text-sm text-red-300">
          {getErrorMessage(error)}
        </p>
      )}

      <ul className={`${card} divide-y divide-zinc-800 ${isFetching ? "opacity-70" : ""}`}>
        {movies.map((movie) => (
          <li key={movie._id} className="flex flex-wrap items-center gap-4 p-3">
            <MoviePoster title={movie.title} posterUrl={movie.posterUrl} className="h-20 w-14 shrink-0 rounded-md text-xl" />
            <div className="min-w-0 flex-1">
              <Link to={`/peliculas/${movie._id}`} className="font-medium hover:text-amber-300">
                {movie.title}
              </Link>
              <p className="text-sm text-zinc-400">
                {movie.director} · {movie.genre} · {formatDate(movie.releaseDate)} · {movie.durationMinutes} min · ★{" "}
                {movie.rating.toFixed(1)}
                {movie.inTheaters && " · En cartelera"}
              </p>
              {scope === "all" && <p className="text-xs text-zinc-500">Cargada por {movie.createdByName}</p>}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => startEditing(movie)} className={btnGhost}>
                Editar
              </button>
              <button type="button" onClick={() => handleDelete(movie)} className={btnDanger}>
                Eliminar
              </button>
            </div>
          </li>
        ))}
        {!isFetching && movies.length === 0 && (
          <li className="p-4 text-sm text-zinc-500">
            {search ? "No hay resultados para esa busqueda." : "Todavia no hay peliculas cargadas."}
          </li>
        )}
      </ul>

      {meta && <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} onChange={setPage} />}
    </div>
  );
};

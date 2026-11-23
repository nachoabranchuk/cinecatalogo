// Catalogo publico: listado con busqueda, filtros, orden y paginacion.
// Los filtros viven en la URL (?q=&genre=&page=...): se puede compartir el link y F5 no los pierde.
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { MovieCard } from "../components/MovieCard";
import { Pagination } from "../components/Pagination";
import { getErrorMessage } from "../lib/api";
import { GENRES, type Genre } from "../lib/genres";
import { inputClass } from "../lib/ui";
import { useDebounce } from "../lib/useDebounce";
import { useGetMoviesQuery } from "../store/api";
import type { MovieListParams } from "../types/movie";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Agregadas recientemente" },
  { value: "rating:desc", label: "Mejor puntuadas" },
  { value: "releaseDate:desc", label: "Estreno mas nuevo" },
  { value: "title:asc", label: "Titulo (A-Z)" },
  { value: "durationMinutes:asc", label: "Duracion (mas cortas)" },
] as const;

export const Home = () => {
  const [params, setParams] = useSearchParams();

  const q = params.get("q") ?? "";
  const genre = GENRES.includes(params.get("genre") as Genre) ? (params.get("genre") as Genre) : undefined;
  const inTheaters = params.get("cartelera") === "1" ? true : undefined;
  const sort = params.get("sort") ?? "createdAt:desc";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const [sortBy, sortOrder] = sort.split(":") as [NonNullable<MovieListParams["sortBy"]>, "asc" | "desc"];

  // Cambia un filtro y vuelve a la pagina 1 (si no, podrias quedar en una pagina que ya no existe).
  const update = (changes: Record<string, string | undefined>) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(changes)) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        if (!("page" in changes)) next.delete("page");
        return next;
      },
      { replace: true },
    );

  // El texto se escribe en estado local y recien se manda a la URL (y a la API) cuando se deja de tipear.
  const [searchText, setSearchText] = useState(q);
  const debouncedSearch = useDebounce(searchText);
  useEffect(() => {
    if (debouncedSearch !== q) update({ q: debouncedSearch || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { data, error, isFetching } = useGetMoviesQuery({
    page,
    limit: PAGE_SIZE,
    search: q || undefined,
    genre,
    inTheaters,
    sortBy,
    sortOrder,
  });

  const movies = data?.data ?? [];

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Catalogo de peliculas</h1>
        <p className="mt-1 text-zinc-400">Explora, busca y filtra. Inicia sesion para cargar tus propias peliculas.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <input
          type="search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Buscar por titulo o director..."
          aria-label="Buscar"
          className={inputClass}
        />
        <select
          value={genre ?? ""}
          onChange={(e) => update({ genre: e.target.value || undefined })}
          aria-label="Genero"
          className={inputClass}
        >
          <option value="">Todos los generos</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <select
          value={SORT_OPTIONS.some((o) => o.value === sort) ? sort : "createdAt:desc"}
          onChange={(e) => update({ sort: e.target.value === "createdAt:desc" ? undefined : e.target.value })}
          aria-label="Ordenar por"
          className={inputClass}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={!!inTheaters}
            onChange={(e) => update({ cartelera: e.target.checked ? "1" : undefined })}
            className="size-4 accent-amber-400"
          />
          Solo en cartelera
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-950/60 p-3 text-sm text-red-300">
          {getErrorMessage(error)}
        </p>
      )}

      {isFetching && !data && <p className="py-10 text-center text-zinc-500">Cargando peliculas...</p>}

      {data && movies.length === 0 && (
        <p className="py-10 text-center text-zinc-500">No encontramos peliculas con esos filtros.</p>
      )}

      <ul className={`grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 ${isFetching ? "opacity-70" : ""}`}>
        {movies.map((movie) => (
          <MovieCard key={movie._id} movie={movie} />
        ))}
      </ul>

      {data && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          total={data.meta.total}
          onChange={(next) => update({ page: String(next) })}
        />
      )}
    </section>
  );
};

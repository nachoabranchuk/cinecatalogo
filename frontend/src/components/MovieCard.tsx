import { Link } from "react-router";
import type { Movie } from "../types/movie";
import { MoviePoster } from "./MoviePoster";

export const MovieCard = ({ movie }: { movie: Movie }) => (
  <li>
    <Link
      to={`/peliculas/${movie._id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 transition hover:border-amber-400/60"
    >
      <div className="relative">
        <MoviePoster title={movie.title} posterUrl={movie.posterUrl} className="aspect-[2/3] w-full" />
        {movie.inTheaters && (
          <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-zinc-950">
            En cartelera
          </span>
        )}
        <span className="absolute bottom-2 right-2 rounded-full bg-zinc-950/80 px-2 py-0.5 text-sm font-semibold text-amber-300">
          ★ {movie.rating.toFixed(1)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-amber-300">{movie.title}</h3>
        <p className="text-sm text-zinc-400">
          {movie.genre} · {new Date(movie.releaseDate).getUTCFullYear()}
        </p>
        <p className="text-xs text-zinc-500">{movie.director}</p>
      </div>
    </Link>
  </li>
);

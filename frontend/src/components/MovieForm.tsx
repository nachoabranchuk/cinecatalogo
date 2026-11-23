import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getErrorMessage } from "../lib/api";
import { GENRES } from "../lib/genres";
import { btnGhost, btnPrimary, card, inputClass } from "../lib/ui";
import { emptyMovie, movieSchema, toMovieFormValues, type MovieFormValues } from "../schemas/movie.schema";
import type { Movie } from "../types/movie";

interface MovieFormProps {
  movie: Movie | null; // null = alta, con valor = edicion
  onSave: (values: MovieFormValues) => Promise<void>;
  onCancel: () => void;
}

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <label className="flex flex-col gap-1 text-sm text-zinc-300">
    {label}
    {children}
    {error && <span className="text-xs text-red-400">{error}</span>}
  </label>
);

export const MovieForm = ({ movie, onSave, onCancel }: MovieFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MovieFormValues>({
    resolver: zodResolver(movieSchema),
    // `values` re-sincroniza el formulario cuando cambia la pelicula que se edita.
    values: movie ? toMovieFormValues(movie) : emptyMovie,
  });

  const onSubmit = async (values: MovieFormValues) => {
    try {
      await onSave(values);
      reset(emptyMovie);
    } catch (err) {
      // Error del backend (400 de Zod del servidor, 403, etc.): se muestra arriba del boton.
      setError("root.server", { message: getErrorMessage(err) });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={`${card} flex flex-col gap-4 p-5`}>
      <h3 className="text-lg font-semibold">{movie ? `Editando: ${movie.title}` : "Nueva pelicula"}</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Titulo" error={errors.title?.message}>
          <input type="text" aria-invalid={!!errors.title} {...register("title")} className={inputClass} />
        </Field>
        <Field label="Director" error={errors.director?.message}>
          <input type="text" aria-invalid={!!errors.director} {...register("director")} className={inputClass} />
        </Field>
        <Field label="Genero" error={errors.genre?.message}>
          <select aria-invalid={!!errors.genre} {...register("genre")} className={inputClass}>
            {GENRES.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Fecha de estreno" error={errors.releaseDate?.message}>
          <input type="date" aria-invalid={!!errors.releaseDate} {...register("releaseDate")} className={inputClass} />
        </Field>
        <Field label="Duracion (minutos)" error={errors.durationMinutes?.message}>
          <input
            type="number"
            inputMode="numeric"
            aria-invalid={!!errors.durationMinutes}
            {...register("durationMinutes", { valueAsNumber: true })}
            className={inputClass}
          />
        </Field>
        <Field label="Puntuacion (0 a 10)" error={errors.rating?.message}>
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            aria-invalid={!!errors.rating}
            {...register("rating", { valueAsNumber: true })}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="URL del poster (opcional)" error={errors.posterUrl?.message}>
        <input
          type="url"
          placeholder="https://..."
          aria-invalid={!!errors.posterUrl}
          {...register("posterUrl")}
          className={inputClass}
        />
      </Field>

      <Field label="Sinopsis (opcional)" error={errors.synopsis?.message}>
        <textarea rows={3} aria-invalid={!!errors.synopsis} {...register("synopsis")} className={inputClass} />
      </Field>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input type="checkbox" {...register("inTheaters")} className="size-4 accent-amber-400" />
        En cartelera
      </label>

      {errors.root?.server && (
        <p role="alert" className="rounded-lg bg-red-950/60 p-3 text-sm text-red-300">
          {errors.root.server.message}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={isSubmitting} className={btnPrimary}>
          {isSubmitting ? "Guardando..." : movie ? "Guardar cambios" : "Crear pelicula"}
        </button>
        {movie && (
          <button type="button" onClick={onCancel} className={btnGhost}>
            Cancelar edicion
          </button>
        )}
      </div>
    </form>
  );
};

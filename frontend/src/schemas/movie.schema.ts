import { z } from "zod";
import { GENRES } from "../lib/genres";
import type { Movie } from "../types/movie";

// Mismas reglas que createMovieSchema del backend: el front avisa antes, el back es la ultima palabra.
export const movieSchema = z.object({
  title: z.string().trim().min(1, { error: "El titulo es obligatorio" }).max(150, { error: "Maximo 150 caracteres" }),
  director: z.string().trim().min(1, { error: "El director es obligatorio" }).max(100, { error: "Maximo 100 caracteres" }),
  genre: z.enum(GENRES, { error: "Elegi un genero" }),
  releaseDate: z
    .string()
    .min(1, { error: "La fecha de estreno es obligatoria" })
    .refine((value) => !Number.isNaN(Date.parse(value)), { error: "La fecha no es valida" }),
  // valueAsNumber de RHF devuelve NaN si el input esta vacio: z.number() lo rechaza con este mensaje.
  durationMinutes: z
    .number({ error: "Ingresa la duracion en minutos" })
    .int({ error: "Tiene que ser un numero entero" })
    .min(1, { error: "Minimo 1 minuto" })
    .max(600, { error: "Maximo 600 minutos" }),
  rating: z
    .number({ error: "Ingresa una puntuacion de 0 a 10" })
    .min(0, { error: "Minimo 0" })
    .max(10, { error: "Maximo 10" }),
  inTheaters: z.boolean(),
  synopsis: z.string().trim().max(1000, { error: "Maximo 1000 caracteres" }),
  // "" = sin poster (el backend lo acepta); si hay texto tiene que ser una URL.
  posterUrl: z.union([z.literal(""), z.url({ error: "Tiene que ser una URL valida (https://...)" })]),
});

export type MovieFormValues = z.infer<typeof movieSchema>;

export const emptyMovie: MovieFormValues = {
  title: "",
  director: "",
  genre: "Drama",
  releaseDate: "",
  durationMinutes: 90,
  rating: 7,
  inTheaters: false,
  synopsis: "",
  posterUrl: "",
};

export const toMovieFormValues = (m: Movie): MovieFormValues => ({
  title: m.title,
  director: m.director,
  genre: m.genre,
  releaseDate: m.releaseDate.slice(0, 10), // <input type="date"> espera AAAA-MM-DD
  durationMinutes: m.durationMinutes,
  rating: m.rating,
  inTheaters: m.inTheaters,
  synopsis: m.synopsis ?? "",
  posterUrl: m.posterUrl ?? "",
});

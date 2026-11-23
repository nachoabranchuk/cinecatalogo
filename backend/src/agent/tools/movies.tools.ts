// PASO 3 — Las tools (las "manos" del agente).
// Una tool = funcion + nombre + descripcion + schema Zod. El LLM NO ejecuta nada: lee la descripcion,
// decide llamarla y devuelve los argumentos; LangChain valida con Zod y ejecuta.
// La tool es un "controller cuyo cliente es el LLM": llama al MISMO service que la API REST y aplica
// las MISMAS reglas de permisos (canModify) adentro de la tool: el prompt se puede saltear, este if no.
import { tool, type ToolRuntime } from "langchain";
import { z } from "zod";
import { isValidObjectId } from "mongoose";
import * as moviesService from "../../services/movies.service.js";
import { createMovieSchema, SORT_FIELDS, type ListMoviesInput } from "../../schemas/movie.schema.js";
import type { IMovieDocument } from "../../models/Movie.js";
import { GENRES } from "../../lib/genres.js";
import type { AgentContext } from "../context.js";
import { withoutNulls } from "./without-nulls.js";

const MAX_RESULTS = 20;

// Solo los campos que el modelo necesita: menos tokens y nada interno (__v, createdBy).
function toPublic(m: IMovieDocument) {
  return {
    id: m._id.toString(),
    title: m.title,
    director: m.director,
    genre: m.genre,
    releaseDate: m.releaseDate.toISOString().slice(0, 10),
    durationMinutes: m.durationMinutes,
    rating: m.rating,
    inTheaters: m.inTheaters,
    addedBy: m.createdByName,
  };
}

const actorOf = (context: AgentContext) => ({ id: context.user.id, name: context.user.name, role: context.user.role });

export const listMoviesTool = tool(
  async (args, runtime: ToolRuntime<unknown, AgentContext>) => {
    const clean = withoutNulls(args);
    // Mismo tipo que usa la API: se arma directo (la tool ya valido genero y orden con su schema).
    const filters: ListMoviesInput = {
      page: 1,
      limit: MAX_RESULTS,
      sortBy: clean.sortBy ?? "createdAt",
      sortOrder: clean.sortOrder ?? "desc",
      genre: clean.genre,
      inTheaters: clean.inTheaters,
      search: clean.search,
      mine: clean.mine,
    };
    const { data, meta } = await moviesService.listMovies(filters, runtime.context?.user.id);
    return JSON.stringify({ total: meta.total, shown: data.length, movies: data.map(toPublic) });
  },
  {
    name: "list_movies",
    description:
      "Lista peliculas del catalogo. Filtros opcionales: genero, si esta en cartelera, texto a buscar en titulo/director, " +
      "'mine' para solo las peliculas del usuario, y orden (por puntuacion, estreno, titulo o duracion). " +
      "Devuelve el total y hasta 20 resultados.",
    // .nullish(): el modelo puede mandar null en los filtros que no usa (ver without-nulls.ts).
    schema: z.object({
      genre: z.enum(GENRES).nullish().describe("Genero exacto"),
      inTheaters: z.boolean().nullish().describe("true = solo en cartelera, false = solo fuera de cartelera"),
      search: z.string().trim().max(120).nullish().describe("Texto a buscar en titulo o director"),
      mine: z.boolean().nullish().describe("true = solo las peliculas cargadas por el usuario actual"),
      sortBy: z.enum(SORT_FIELDS).nullish().describe("Campo de orden. Para 'las mejores' usar rating"),
      sortOrder: z.enum(["asc", "desc"]).nullish().describe("desc = de mayor a menor"),
    }),
  }
);

export const getMovieByIdTool = tool(
  async ({ id }) => {
    if (!isValidObjectId(id)) return "El id no es valido.";
    const movie = await moviesService.findMovieById(id);
    return movie ? JSON.stringify({ ...toPublic(movie), synopsis: movie.synopsis ?? null }) : "No existe una pelicula con ese id.";
  },
  {
    name: "get_movie_by_id",
    description: "Trae una pelicula por su id de MongoDB (24 caracteres hexadecimales), con su sinopsis.",
    schema: z.object({ id: z.string().describe("El id de la pelicula") }),
  }
);

// ── Escritura ────────────────────────────────────────────────────────────────────────────────
// runtime.context = { user } que armo el controller con req.user (ver agent/context.ts).
// Los errores se DEVUELVEN como texto (no se tiran): asi el LLM los lee y le explica al usuario.

export const createMovieTool = tool(
  async (args, runtime: ToolRuntime<unknown, AgentContext>) => {
    if (!runtime.context) return "Permiso denegado: falta la sesion.";

    // Se limpian los null y se valida con el schema ORIGINAL de la API (mismas reglas y mensajes).
    const parsed = createMovieSchema.safeParse(withoutNulls(args));
    if (!parsed.success) return `Datos invalidos: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`;

    try {
      const movie = await moviesService.createMovie(parsed.data, actorOf(runtime.context));
      return `Pelicula creada: ${JSON.stringify(toPublic(movie))}`;
    } catch (error) {
      if (error instanceof Error && error.name === "ValidationError") return `Datos invalidos: ${error.message}`;
      throw error; // error inesperado (Mongo caido, etc.): que lo maneje el controller
    }
  },
  {
    name: "create_movie",
    description:
      "Crea una pelicula nueva a nombre del usuario actual. Usala SOLO si el usuario pide explicitamente agregar una " +
      "pelicula y dio titulo, director, genero, fecha de estreno (AAAA-MM-DD), duracion en minutos y puntuacion de 0 a 10. " +
      "Si falta alguno, no la llames: pedile el dato.",
    // El MISMO schema que valida POST /movies, con los opcionales aceptando null (el modelo los manda asi).
    schema: createMovieSchema.extend({
      inTheaters: z.boolean().nullish(),
      synopsis: z.string().trim().max(1000).nullish(),
      posterUrl: z.string().nullish(),
    }),
  }
);

export const deleteMovieTool = tool(
  async ({ id }, runtime: ToolRuntime<unknown, AgentContext>) => {
    if (!runtime.context) return "Permiso denegado: falta la sesion.";
    if (!isValidObjectId(id)) return "El id no es valido.";

    const movie = await moviesService.findMovieById(id);
    if (!movie) return "No existe una pelicula con ese id.";

    // Misma regla que DELETE /movies/:id: admin borra cualquiera, user solo las suyas.
    if (!moviesService.canModify(actorOf(runtime.context), movie)) {
      return "Permiso denegado: solo podes eliminar tus propias peliculas (los administradores pueden eliminar cualquiera).";
    }

    await moviesService.deleteMovie(id);
    return `Pelicula eliminada: ${movie.title} (${movie.director}).`;
  },
  {
    name: "delete_movie",
    description:
      "Elimina una pelicula por su id. Usala SOLO si el usuario pide explicitamente eliminar/borrar una pelicula. " +
      "Primero buscala con list_movies para obtener el id; si hay mas de una que coincide, NO elimines: " +
      "mostra las opciones y pedi que aclare cual.",
    schema: z.object({ id: z.string().describe("El id de la pelicula a eliminar (obtenido con list_movies)") }),
  }
);

// Controller = capa HTTP: lee req, llama al service, traduce el resultado a status + JSON.
import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import * as moviesService from "../services/movies.service.js";
import { CreateMovieInput, ListMoviesInput, UpdateMovieInput } from "../schemas/movie.schema.js";
import { sendError } from "../lib/http-errors.js";

// Actor que hace el request, sacado de la SESION (authMiddleware ya garantizo que existe).
function actorOf(req: Request): moviesService.Actor {
  const user = req.user!;
  return { id: user.id, name: user.name, role: user.role ?? "user" };
}

// GET /api/movies — publico. La query ya viene validada y con defaults (res.locals.query).
export async function listMovies(req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ListMoviesInput;

  if (query.mine && !req.user) {
    sendError(res, 401, "Tenes que iniciar sesion para ver tus peliculas");
    return;
  }

  try {
    res.status(200).json(await moviesService.listMovies(query, req.user?.id));
  } catch (error) {
    console.error("[movies] error listing:", error);
    sendError(res, 500, "No se pudieron obtener las peliculas");
  }
}

// GET /api/movies/:id — publico.
export async function getMovieById(req: Request<{ id: string }>, res: Response): Promise<void> {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    sendError(res, 400, "El id no es valido");
    return;
  }

  try {
    const movie = await moviesService.findMovieById(id);

    if (!movie) {
      sendError(res, 404, "Pelicula no encontrada");
      return;
    }

    res.status(200).json(movie);
  } catch (error) {
    console.error("[movies] error fetching by id:", error);
    sendError(res, 500, "No se pudo obtener la pelicula");
  }
}

// POST /api/movies — user o admin; la pelicula queda a nombre de quien la crea.
export async function createMovie(req: Request<{}, {}, CreateMovieInput>, res: Response): Promise<void> {
  try {
    const movie = await moviesService.createMovie(req.body, actorOf(req));
    res.status(201).json(movie);
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      sendError(res, 400, error.message);
      return;
    }

    console.error("[movies] error creating:", error);
    sendError(res, 500, "No se pudo crear la pelicula");
  }
}

// PUT / PATCH /api/movies/:id — el admin edita cualquiera; el user solo las suyas.
export async function updateMovie(req: Request<{ id: string }, {}, UpdateMovieInput>, res: Response): Promise<void> {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    sendError(res, 400, "El id no es valido");
    return;
  }

  try {
    const existing = await moviesService.findMovieById(id);

    if (!existing) {
      sendError(res, 404, "Pelicula no encontrada");
      return;
    }

    if (!moviesService.canModify(actorOf(req), existing)) {
      sendError(res, 403, "Solo podes editar tus propias peliculas");
      return;
    }

    const updated = await moviesService.updateMovie(id, req.body);

    // Pudo borrarse entre el find y el update.
    if (!updated) {
      sendError(res, 404, "Pelicula no encontrada");
      return;
    }

    res.status(200).json(updated);
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      sendError(res, 400, error.message);
      return;
    }

    console.error("[movies] error updating:", error);
    sendError(res, 500, "No se pudo actualizar la pelicula");
  }
}

// DELETE /api/movies/:id — el admin borra cualquiera; el user solo las suyas.
export async function deleteMovie(req: Request<{ id: string }>, res: Response): Promise<void> {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    sendError(res, 400, "El id no es valido");
    return;
  }

  try {
    const existing = await moviesService.findMovieById(id);

    if (!existing) {
      sendError(res, 404, "Pelicula no encontrada");
      return;
    }

    if (!moviesService.canModify(actorOf(req), existing)) {
      sendError(res, 403, "Solo podes eliminar tus propias peliculas");
      return;
    }

    await moviesService.deleteMovie(id);
    res.status(204).send();
  } catch (error) {
    console.error("[movies] error deleting:", error);
    sendError(res, 500, "No se pudo eliminar la pelicula");
  }
}

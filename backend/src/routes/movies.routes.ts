// Mapeo entre (metodo HTTP + ruta) y controller. Sin logica de negocio aca.
//   Lectura: publica.
//   Escritura: sesion + rol user/admin. El dueño (o admin) se verifica en el controller → 403.
import { Router } from "express";
import {
  listMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} from "../controllers/movies.controller.js";
import { validateBody, validateQuery } from "../middlewares/validate.js";
import { createMovieSchema, listMoviesSchema, updateMovieSchema } from "../schemas/movie.schema.js";
import { authMiddleware, optionalAuth, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();
const writers = [authMiddleware, requireRole("user", "admin")];

router.get("/", optionalAuth, validateQuery(listMoviesSchema), listMovies);
router.get("/:id", getMovieById);
router.post("/", writers, validateBody(createMovieSchema), createMovie);
router.put("/:id", writers, validateBody(createMovieSchema), updateMovie); // reemplazo completo
router.patch("/:id", writers, validateBody(updateMovieSchema), updateMovie); // cambios parciales
router.delete("/:id", writers, deleteMovie);

export default router;

// Junta todas las tools. Para darle una capacidad nueva al agente: crear la tool y sumarla aca.
// Lo que NO esta en esta lista, el modelo no lo puede hacer (ej: editar peliculas).
import { listMoviesTool, getMovieByIdTool, createMovieTool, deleteMovieTool } from "./movies.tools.js";

export const tools = [listMoviesTool, getMovieByIdTool, createMovieTool, deleteMovieTool];

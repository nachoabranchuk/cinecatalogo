import express, { NextFunction, Request, Response } from "express";
// dotenv primero: lib/auth.ts lee las variables de entorno apenas se importa.
import "dotenv/config";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import apiRouter from "./routes/index.js";
import { connectMongoDB } from "./config/db.js";
import { sendError } from "./lib/http-errors.js";

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;

// Detras de Render hay un proxy: sin esto Express ve http y la IP del proxy.
app.set("trust proxy", 1);

// Sin cors ni cookie-parser: el front llama a /api en su mismo origen (proxy de Vite en local,
// rewrite del Static Site en Render), asi que no hay requests cross-origin.

// Better Auth ANTES de express.json(): el handler lee el body crudo del request.
// "*splat" es la sintaxis de comodin de Express 5.
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", uptimeSeconds: process.uptime(), timestamp: new Date().toISOString() });
});

// Recursos de la API: /api/movies, /api/agent/chat
app.use("/api", apiRouter);

// Cualquier otra /api/* → 404 en JSON (no el HTML por defecto de Express).
app.use("/api", (_req: Request, res: Response) => sendError(res, 404, "Ruta no encontrada"));

// Manejo de errores global (ej: JSON mal formado en el body → 400 en vez de un 500 con stack).
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (typeof error === "object" && error !== null && "type" in error && error.type === "entity.parse.failed") {
    sendError(res, 400, "El body no es un JSON valido");
    return;
  }
  console.error("[server] unhandled error:", error);
  sendError(res, 500, "Error interno del servidor");
});

async function startServer(): Promise<void> {
  await connectMongoDB();

  app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("[server] failed to start:", error);
  process.exit(1);
});

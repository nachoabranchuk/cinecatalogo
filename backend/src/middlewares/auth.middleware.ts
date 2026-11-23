// Better Auth lee la cookie de sesion y la busca en Mongo. La sesion vive en la base: se puede revocar.
import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { sendError } from "../lib/http-errors.js";
import { UserRole } from "../types/auth.types.js";

// Obligatoria: sin sesion → 401.
export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });

    if (!session) {
      sendError(res, 401, "Sesion requerida");
      return;
    }

    req.user = session.user;
    next();
  } catch (error) {
    console.error("[auth] error reading session:", error);
    sendError(res, 500, "No se pudo verificar la sesion");
  }
}

// Opcional: si hay sesion llena req.user, si no sigue igual. Para rutas publicas que se comportan
// distinto si ademas hay un usuario (ej: GET /movies?mine=true).
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (session) req.user = session.user;
  } catch (error) {
    console.error("[auth] error reading optional session:", error);
  }
  next();
}

// requireRole: siempre se usa DESPUES de authMiddleware, asume que req.user ya esta seteado.
export function requireRole(...rolesPermitidos: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, "Sesion requerida");
      return;
    }

    if (!rolesPermitidos.includes((req.user.role ?? "user") as UserRole)) {
      sendError(res, 403, "No tenes permisos para realizar esta accion");
      return;
    }

    next();
  };
}

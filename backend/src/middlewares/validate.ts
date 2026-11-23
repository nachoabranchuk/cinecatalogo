// Middlewares genericos: validan body o query contra cualquier schema de Zod.
import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { sendError } from "../lib/http-errors.js";

export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      sendError(res, 400, "Los datos enviados no son validos", result.error.flatten().fieldErrors as Record<string, string[]>);
      return;
    }

    // Reemplaza el body por la version parseada: defaults aplicados, strings con trim,
    // fechas convertidas y campos desconocidos descartados (ej: nadie puede mandar "createdBy").
    req.body = result.data;
    next();
  };
}

// En Express 5 req.query es de solo lectura: el resultado parseado queda en res.locals.query.
export function validateQuery(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // "?genre=" llega como "": se descarta para que no falle el enum ni el min(1).
    const raw = Object.fromEntries(Object.entries(req.query).filter(([, value]) => value !== ""));
    const result = schema.safeParse(raw);

    if (!result.success) {
      sendError(res, 400, "Los parametros de la consulta no son validos", result.error.flatten().fieldErrors as Record<string, string[]>);
      return;
    }

    res.locals.query = result.data;
    next();
  };
}

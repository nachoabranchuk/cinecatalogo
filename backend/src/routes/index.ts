// Junta todos los routers de la API. Las entidades nuevas se montan aca, no en server.ts.
import { Router } from "express";
import moviesRouter from "./movies.routes.js";
import agentRouter from "./agent.routes.js";

const router = Router();

router.use("/movies", moviesRouter);
router.use("/agent", agentRouter);

export default router;

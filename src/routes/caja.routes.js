import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import {
  crearCaja,
  actualizarCaja,
  eliminarCaja,
  getCaja,
  getCajas,
} from "../controllers/caja.controllers.js";
import { isAdmin } from "../middlewares/salidas.middleware.js";

const router = Router();

// Obtener todas las cajas
router.get("/cajas", isAuth, isAdmin, getCajas);

// Obtener caja por ID
router.get("/cajas/:id", isAuth, isAdmin, getCaja);

// Crear nueva caja
router.post("/cajas", isAuth, isAdmin, crearCaja);

// Actualizar caja por ID
router.put("/cajas/:id", isAuth, isAdmin, actualizarCaja);

// Eliminar caja por ID
router.delete("/cajas/:id", isAuth, isAdmin, eliminarCaja);

export default router;

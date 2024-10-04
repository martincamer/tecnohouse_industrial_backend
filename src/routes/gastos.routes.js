import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import {
  actualizarGasto,
  crearGasto,
  eliminarGasto,
  getGasto,
  getGastos,
  getGastosAdmin,
} from "../controllers/gastos.controllers.js";
import { isAdmin } from "../middlewares/salidas.middleware.js";

const router = Router();

// Define routes for ingresos
router.get("/gastos/:id", isAuth, isAdmin, getGasto);

router.get("/gastos", isAuth, isAdmin, getGastos);

router.get("/gastos-admin", isAuth, isAdmin, getGastosAdmin);

router.post("/gastos", isAuth, isAdmin, crearGasto);

router.put("/gastos/:id", isAuth, isAdmin, actualizarGasto);

router.delete("/gastos/:id", isAuth, isAdmin, eliminarGasto);

export default router;

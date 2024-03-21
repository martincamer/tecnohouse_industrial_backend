import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import {
  actualizarOrden,
  crearOrden,
  eliminarOrden,
  getOrden,
  getOrdenes,
  getOrdenesMensuales,
  getOrdenesPorRangoDeFechas,
} from "../controllers/ordenes.controllers.js";
import { isAdmin } from "../middlewares/salidas.middleware.js";

const router = Router();

router.get("/ordenes", isAuth, isAdmin, getOrdenes);

router.get("/ordenes-mes", isAuth, isAdmin, getOrdenesMensuales);

router.post(
  "/ordenes/rango-fechas",
  isAuth,
  isAdmin,
  getOrdenesPorRangoDeFechas
);

router.get("/ordenes/:id", isAuth, isAdmin, getOrden);

router.post("/crear-orden", isAuth, isAdmin, crearOrden);

router.put("/ordenes/:id", isAuth, isAdmin, actualizarOrden);

router.delete("/ordenes/:id", isAuth, isAdmin, eliminarOrden);

router.post(
  "/ordenes-rango-fechas",
  isAuth,
  isAdmin,
  getOrdenesPorRangoDeFechas
);

export default router;

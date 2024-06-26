import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import {
  actualizarChofer,
  actualizarSalida,
  crearChoferes,
  crearSalida,
  eliminarChofer,
  eliminarSalida,
  getChofer,
  getChoferes,
  getSalida,
  getSalidaMensual,
  getSalidaMensualAdmin,
  getSalidaPorRangoDeFechas,
  getSalidasPorRangoDeFechasAdmin,
  getSalidas,
  getSalidasAdmin,
} from "../controllers/salidas.controllers.js";
import { isAdmin } from "../middlewares/salidas.middleware.js";

const router = Router();

router.get("/salidas", isAuth, isAdmin, getSalidas);

router.get("/salidas-admin", isAuth, isAdmin, getSalidasAdmin);

router.get("/salidas-mes", isAuth, isAdmin, getSalidaMensual);

router.get("/salidas-mes-todas", isAuth, isAdmin, getSalidaMensualAdmin);

router.get("/salidas/:id", isAuth, isAdmin, getSalida);

router.post("/salidas", isAuth, isAdmin, crearSalida);

router.put("/salidas/:id", isAuth, isAdmin, actualizarSalida);

router.delete("/salidas/:id", isAuth, isAdmin, eliminarSalida);

router.post("/chofer", isAuth, isAdmin, crearChoferes);

router.post(
  "/salidas-rango-fechas",
  isAuth,
  isAdmin,
  getSalidaPorRangoDeFechas
);

router.post(
  "/salidas-rango-fechas-admin",
  isAuth,
  isAdmin,
  getSalidasPorRangoDeFechasAdmin
);

router.get("/chofer", isAuth, isAdmin, getChoferes);

router.put("/chofer/:id", isAuth, isAdmin, actualizarChofer);

router.get("/chofer/:id", isAuth, isAdmin, getChofer);

router.delete("/chofer/:id", isAuth, isAdmin, eliminarChofer);

export default router;

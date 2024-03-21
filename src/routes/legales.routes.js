import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import {
  actualizarLegal,
  crearLegal,
  eliminarLegal,
  getLegal,
  getLegalMensual,
  getLegalPorRangoDeFechas,
  getLegales,
} from "../controllers/legales.controllers.js";
import { isAdmin } from "../middlewares/salidas.middleware.js";

const router = Router();

router.get("/legales", isAuth, isAdmin, getLegales);

router.get("/legales-mes", isAuth, isAdmin, getLegalMensual);

router.post("/legales/rango-fechas", isAuth, isAdmin, getLegalPorRangoDeFechas);

router.get("/legales/:id", isAuth, isAdmin, getLegal);

router.post("/crear-legal", isAuth, isAdmin, crearLegal);

router.put("/legales/:id", isAuth, isAdmin, actualizarLegal);

router.delete("/legales/:id", isAuth, isAdmin, eliminarLegal);

router.post("/legales-rango-fechas", isAuth, isAdmin, getLegalPorRangoDeFechas);

export default router;

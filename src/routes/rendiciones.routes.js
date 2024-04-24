import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import {
  actualizarRendicion,
  crearRendicion,
  eliminarRendicion,
  getRendicion,
  getRendicionMensual,
  getRendicionMensualAdmin,
  getRendicionPorRangoDeFechas,
  getRendiciones,
  getRendicionesAdmin,
  getRendicionesPorRangoDeFechasAdmin,
} from "../controllers/rendiciones.controllers.js";
import { isAdmin } from "../middlewares/salidas.middleware.js";

const router = Router();

router.get("/rendiciones", isAuth, isAdmin, getRendiciones);

router.get("/rendiciones-admin", isAuth, isAdmin, getRendicionesAdmin);

router.get("/rendicion-mes", isAuth, isAdmin, getRendicionMensual);

router.get("/rendicion-mes-admin", isAuth, isAdmin, getRendicionMensualAdmin);

router.get("/rendiciones/:id", isAuth, isAdmin, getRendicion);

router.post("/crear-rendicion", isAuth, isAdmin, crearRendicion);

router.put("/rendiciones/:id", isAuth, isAdmin, actualizarRendicion);

router.delete("/rendiciones/:id", isAuth, isAdmin, eliminarRendicion);

router.post(
  "/rendiciones-rango-fechas",
  isAuth,
  isAdmin,
  getRendicionPorRangoDeFechas
);

router.post(
  "/rendiciones-rango-fechas-admin",
  isAuth,
  isAdmin,
  getRendicionesPorRangoDeFechasAdmin
);

export default router;

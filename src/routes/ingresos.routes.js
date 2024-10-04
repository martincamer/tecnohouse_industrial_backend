import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import {
  actualizarIngreso,
  crearIngreso,
  eliminarIngreso,
  getIngreso,
  getIngresos,
  getIngresosAdmin,
} from "../controllers/ingresos.controllers.js";
import { isAdmin } from "../middlewares/salidas.middleware.js";

const router = Router();

router.get("/ingresos/:id", isAuth, isAdmin, getIngreso);

router.get("/ingresos", isAuth, isAdmin, getIngresos);

router.get("/ingresos-admin", isAuth, isAdmin, getIngresosAdmin);

router.post("/ingresos", isAuth, isAdmin, crearIngreso);

router.put("/ingresos/:id", isAuth, isAdmin, actualizarIngreso);

router.delete("/ingresos/:id", isAuth, isAdmin, eliminarIngreso);

export default router;

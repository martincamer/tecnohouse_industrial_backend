import { pool } from "../db.js";

export const getOrdenes = async (req, res, next) => {
  // Obtener órdenes
  const result = await pool.query("SELECT * FROM ordenes");
  return res.json(result.rows);
};

export const getOrden = async (req, res) => {
  const result = await pool.query("SELECT * FROM ordenes WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ninguna orden con ese id",
    });
  }

  return res.json(result.rows[0]);
};

export const crearOrden = async (req, res, next) => {
  const { chofer, fecha_llegada, orden_firma } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO ordenes (chofer, fecha_llegada, orden_firma) VALUES ($1, $2, $3) RETURNING *",
      [chofer, fecha_llegada, orden_firma]
    );

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe una orden con ese id",
      });
    }
    next(error);
  }
};

export const actualizarOrden = async (req, res) => {
  const id = req.params.id;

  const { chofer, fecha_llegada, orden_firma, finalizado } = req.body;

  const result = await pool.query(
    "UPDATE ordenes SET chofer = $1, fecha_llegada = $2, orden_firma = $3, finalizado = $4 WHERE id = $5",
    [chofer, fecha_llegada, orden_firma, finalizado, id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe una orden con ese id",
    });
  }

  return res.json({
    message: "Orden actualizada",
  });
};

export const eliminarOrden = async (req, res) => {
  const result = await pool.query("DELETE FROM ordenes WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ninguna orden con ese id",
    });
  }

  return res.sendStatus(204);
};

export const getOrdenesMensuales = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM ordenes WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)"
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getOrdenesPorRangoDeFechas = async (req, res, next) => {
  try {
    const { fechaInicio, fechaFin } = req.body;

    // Validación de fechas
    if (
      !fechaInicio ||
      !fechaFin ||
      !isValidDate(fechaInicio) ||
      !isValidDate(fechaFin)
    ) {
      return res.status(400).json({ message: "Fechas inválidas" });
    }

    // Función de validación de fecha
    function isValidDate(dateString) {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      return dateString.match(regex) !== null;
    }

    // Ajuste de zona horaria UTC
    const result = await pool.query(
      "SELECT * FROM ordenes WHERE created_at BETWEEN $1 AND $2 ORDER BY created_at",
      [fechaInicio, fechaFin]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

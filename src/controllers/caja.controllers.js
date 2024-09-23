import { pool } from "../db.js";

// OBTENER TODAS LAS CAJAS
export const getCajas = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM caja WHERE localidad = $1 AND sucursal = $2",
      [req.localidad, req.sucursal]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener cajas por localidad y sucursal:", error);
    return next(error);
  }
};

export const getCaja = async (req, res) => {
  const result = await pool.query("SELECT * FROM caja WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ninguna caja con ese id",
    });
  }

  return res.json(result.rows[0]);
};

export const crearCaja = async (req, res, next) => {
  const {
    total, // Asegúrate de incluir el campo total
  } = req.body;

  const { localidad, sucursal } = req;

  try {
    const result = await pool.query(
      "INSERT INTO caja (total, localidad ,sucursal) VALUES ($1, $2, $3) RETURNING *",
      [
        total, // Asegúrate de insertar el total
        localidad,
        sucursal,
      ]
    );

    const todasLasCajas = await pool.query("SELECT * FROM caja");

    res.json(todasLasCajas.rows);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe una caja con ese id",
      });
    }
    next(error);
  }
};

export const actualizarCaja = async (req, res) => {
  const id = req.params.id;

  const { total } = req.body;

  try {
    const result = await pool.query(
      "UPDATE caja SET total = $1 WHERE id = $2",
      [total, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No existe ninguna caja con ese id",
      });
    }

    const todasLasCajas = await pool.query("SELECT * FROM caja");

    res.json(todasLasCajas.rows);
  } catch (error) {
    console.error("Error al actualizar la caja:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
export const eliminarCaja = async (req, res) => {
  const result = await pool.query("DELETE FROM caja WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ninguna caja con ese id",
    });
  }

  const todasLasCajas = await pool.query("SELECT * FROM caja");

  res.json(todasLasCajas.rows);
};

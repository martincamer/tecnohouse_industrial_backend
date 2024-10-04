import { pool } from "../db.js";

//OBTENER TODOS LOS INGRESOS
export const getIngresos = async (req, res, next) => {
  try {
    // Consulta SQL con filtro por localidad
    const result = await pool.query(
      "SELECT * FROM ingresos WHERE localidad = $1",
      [req.localidad]
    );

    // Retorna el resultado como JSON
    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener ingresos por localidad:", error);
    return next(error);
  }
};

export const getIngresosAdmin = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM ingresos");

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "No se encontraron ingresos" });
    }

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener ingresos:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getIngreso = async (req, res) => {
  const result = await pool.query("SELECT * FROM ingresos WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningún ingreso con ese id",
    });
  }

  return res.json(result.rows[0]);
};

export const crearIngreso = async (req, res, next) => {
  const { observacion, recaudacion } = req.body;
  const { username, userRole, localidad, sucursal } = req;

  try {
    // Insertar el nuevo ingreso
    const result = await pool.query(
      "INSERT INTO ingresos (observacion, recaudacion, localidad, sucursal, usuario, role_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        observacion,
        parseFloat(recaudacion),
        localidad,
        sucursal,
        username,
        userRole,
      ]
    );

    // Actualizar el total en la caja correspondiente a la localidad
    await pool.query(
      "UPDATE caja SET total = (total::numeric + $1) WHERE localidad = $2",
      [parseFloat(recaudacion), localidad]
    );

    const todosLosIngresos = await pool.query("SELECT * FROM ingresos");
    const todasLasCajas = await pool.query("SELECT * FROM caja");

    res.json({
      ingresos: todosLosIngresos.rows,
      caja: todasLasCajas.rows,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe un ingreso con ese id",
      });
    }
    next(error);
  }
};

export const actualizarIngreso = async (req, res) => {
  const id = req.params.id;
  const { username, userRole, localidad } = req;
  const { tipo, recaudacion } = req.body;

  try {
    const currentIngreso = await pool.query(
      "SELECT recaudacion FROM ingresos WHERE id = $1",
      [id]
    );

    if (currentIngreso.rowCount === 0) {
      return res.status(404).json({
        message: "No existe un ingreso con ese id",
      });
    }

    const currentRecaudacion = parseFloat(currentIngreso.rows[0].recaudacion);
    const newRecaudacionNum = parseFloat(recaudacion);

    await pool.query(
      "UPDATE caja SET total = (total::numeric - $1 + $2) WHERE localidad = $3",
      [currentRecaudacion, newRecaudacionNum, localidad]
    );

    const result = await pool.query(
      "UPDATE ingresos SET tipo = $1, recaudacion = $2, usuario = $3, role_id = $4 WHERE id = $5",
      [tipo, newRecaudacionNum, username, userRole, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No existe un ingreso con ese id",
      });
    }

    const todosLosIngresos = await pool.query("SELECT * FROM ingresos");
    const todasLasCajas = await pool.query("SELECT * FROM caja");

    res.json({
      ingresos: todosLosIngresos.rows,
      caja: todasLasCajas.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el ingreso" });
  }
};

export const eliminarIngreso = async (req, res) => {
  const { id } = req.params;
  const { localidad } = req;

  try {
    const currentIngreso = await pool.query(
      "SELECT recaudacion FROM ingresos WHERE id = $1",
      [id]
    );

    if (currentIngreso.rowCount === 0) {
      return res.status(404).json({
        message: "No existe ningún ingreso con ese id",
      });
    }

    const currentRecaudacion = parseFloat(currentIngreso.rows[0].recaudacion);

    await pool.query(
      "UPDATE caja SET total = (total::numeric - $1) WHERE localidad = $2",
      [currentRecaudacion, localidad]
    );

    const result = await pool.query("DELETE FROM ingresos WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No existe ningún ingreso con ese id",
      });
    }

    const todosLosIngresos = await pool.query("SELECT * FROM ingresos");
    const todasLasCajas = await pool.query("SELECT * FROM caja");

    res.json({
      ingresos: todosLosIngresos.rows,
      caja: todasLasCajas.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el ingreso" });
  }
};

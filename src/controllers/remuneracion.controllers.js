import { pool } from "../db.js";

export const getRemuneraciones = async (req, res, next) => {
  //obtener perfiles
  const result = await pool.query("SELECT * FROM remuneracion");
  return res.json(result.rows);
};

export const getRemuneracion = async (req, res) => {
  const result = await pool.query("SELECT * FROM remuneracion WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningun salida con ese id",
    });
  }

  return res.json(result.rows[0]);
};

export const crearRemuneracion = async (req, res, next) => {
  const {
    armador,
    fecha_carga,
    fecha_entrega,
    km_lineal,
    pago_fletero_espera,
    viaticos,
    refuerzo,
    recaudacion,
    chofer,
    datos_cliente,
  } = req.body;

  const { username, userRole } = req;

  const datosClienteJSON = JSON.stringify(datos_cliente);

  try {
    const result = await pool.query(
      "INSERT INTO remuneracion (armador, fecha_carga, fecha_entrega, km_lineal, pago_fletero_espera, viaticos, refuerzo, recaudacion,chofer, datos_cliente, usuario, role_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
      [
        armador,
        fecha_carga,
        fecha_entrega,
        km_lineal,
        pago_fletero_espera,
        viaticos,
        refuerzo,
        recaudacion,
        chofer,
        datosClienteJSON,
        username,
        userRole,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe una remuneracion con ese id",
      });
    }
    next(error);
  }
};

export const actualizarRemuneracion = async (req, res) => {
  const id = req.params.id;

  const { username, userRole } = req;

  const {
    armador,
    fecha_carga,
    fecha_entrega,
    km_lineal,
    pago_fletero_espera,
    viaticos,
    refuerzo,
    recaudacion,
    chofer,
    datos_cliente,
  } = req.body;

  // Convertir el objeto datos_cliente a JSON
  const datos_cliente_json = JSON.stringify(datos_cliente);

  const result = await pool.query(
    "UPDATE remuneracion SET armador = $1, fecha_carga = $2, fecha_entrega = $3, km_lineal = $4, pago_fletero_espera = $5, viaticos = $6, refuerzo = $7, recaudacion = $8, chofer = $9, datos_cliente = $10, usuario = $11, role_id = $12 WHERE id = $13",
    [
      armador,
      fecha_carga,
      fecha_entrega,
      km_lineal,
      pago_fletero_espera,
      viaticos,
      refuerzo,
      recaudacion,
      chofer,
      datos_cliente_json, // Usar el objeto JSON en la consulta
      username,
      userRole,
      id,
    ]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe una salida con ese id",
    });
  }

  return res.json({
    message: "Salida actualizada",
  });
};

export const eliminarRemuneracion = async (req, res) => {
  const result = await pool.query("DELETE FROM remuneracion WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningun presupuesto con ese id",
    });
  }

  return res.sendStatus(204);
};

export const getRemuneracionMensual = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM remuneracion WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)"
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener remuneracion:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getRemuneracionPorRangoDeFechas = async (req, res, next) => {
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
      "SELECT * FROM remuneracion WHERE created_at BETWEEN $1 AND $2 ORDER BY created_at",
      [fechaInicio, fechaFin]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener salidas:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

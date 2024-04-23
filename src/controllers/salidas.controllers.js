import { pool } from "../db.js";

export const getSalidas = async (req, res, next) => {
  try {
    // Consulta SQL con filtro por localidad
    const result = await pool.query(
      "SELECT * FROM salidas WHERE localidad = $1",
      [req.localidad]
    );

    // Retorna el resultado como JSON
    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener salidas por localidad:", error);
    // Llama a next con el error para pasar al middleware de manejo de errores
    return next(error);
  }
};

export const getSalida = async (req, res) => {
  const result = await pool.query("SELECT * FROM salidas WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningun salida con ese id",
    });
  }

  return res.json(result.rows[0]);
};

export const crearSalida = async (req, res, next) => {
  const {
    chofer,
    km_viaje_control,
    km_viaje_control_precio,
    fletes_km,
    fletes_km_precio,
    armadores,
    total_viaticos,
    motivo,
    total_flete,
    total_control,
    fabrica,
    salida,
    espera,
    chofer_vehiculo,
    datos_cliente,
  } = req.body;

  const { username, userRole, localidad, sucursal } = req;

  const datosClienteJSON = JSON.stringify(datos_cliente);

  // Verificar si algún campo está vacío
  if (
    !chofer ||
    !km_viaje_control ||
    !km_viaje_control_precio ||
    !fletes_km ||
    !fletes_km_precio ||
    !armadores ||
    !total_viaticos ||
    !total_flete ||
    !total_control ||
    !fabrica ||
    !salida ||
    !espera ||
    !chofer_vehiculo ||
    !datos_cliente
  ) {
    return res.status(400).json({
      message: "Todos los campos son obligatorios.",
    });
  }

  try {
    const result = await pool.query(
      "INSERT INTO salidas (chofer, km_viaje_control, km_viaje_control_precio, fletes_km, fletes_km_precio, armadores, total_viaticos, motivo, total_flete, total_control, fabrica, salida, espera, chofer_vehiculo, datos_cliente,localidad,sucursal,usuario, role_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,$18,$19) RETURNING *",
      [
        chofer,
        km_viaje_control,
        km_viaje_control_precio,
        fletes_km,
        fletes_km_precio,
        armadores,
        total_viaticos,
        motivo,
        total_flete,
        total_control,
        fabrica,
        salida,
        espera,
        chofer_vehiculo,
        datosClienteJSON,
        localidad,
        sucursal,
        username,
        userRole,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe una salida con ese id",
      });
    }
    next(error);
  }
};

export const actualizarSalida = async (req, res) => {
  const id = req.params.id;

  const { username, userRole } = req;

  const {
    chofer,
    km_viaje_control,
    km_viaje_control_precio,
    fletes_km,
    fletes_km_precio,
    armadores,
    total_viaticos,
    motivo,
    total_flete,
    total_control,
    fabrica,
    salida,
    espera,
    chofer_vehiculo,
    datos_cliente,
  } = req.body;

  // Convertir el objeto datos_cliente a JSON
  const datos_cliente_json = JSON.stringify(datos_cliente);

  const result = await pool.query(
    "UPDATE salidas SET chofer = $1, km_viaje_control = $2, km_viaje_control_precio = $3, fletes_km = $4, fletes_km_precio = $5, armadores = $6, total_viaticos = $7, motivo = $8, total_flete = $9, total_control = $10, fabrica = $11, salida = $12, espera = $13, chofer_vehiculo = $14, datos_cliente = $15, usuario = $16, role_id = $17 WHERE id = $18",
    [
      chofer,
      km_viaje_control,
      km_viaje_control_precio,
      fletes_km,
      fletes_km_precio,
      armadores,
      total_viaticos,
      motivo,
      total_flete,
      total_control,
      fabrica,
      salida,
      espera,
      chofer_vehiculo,
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

//ELIMINAR SALIDA UNICA
export const eliminarSalida = async (req, res) => {
  const result = await pool.query("DELETE FROM salidas WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningun presupuesto con ese id",
    });
  }

  return res.sendStatus(204);
};

//OBTENER SALIDAS MENSUALES
export const getSalidaMensual = async (req, res, next) => {
  try {
    console.log("req.localidad:", req.localidad);

    const result = await pool.query(
      "SELECT * FROM salidas WHERE localidad = $1 AND " +
        "(" +
        "  (created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 days') AND " +
        "   created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '5 days')" +
        "  OR " +
        "  (DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE))" +
        ")",
      [req.localidad]
    );

    // Retorna el resultado como JSON
    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener salidas mensuales:", error);
    return next(error); // Pasa el error al middleware de manejo de errores
  }
};

//FILTRAR POR RANGO DE FECHAS
export const getSalidaPorRangoDeFechas = async (req, res, next) => {
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

    // Validación de zona horaria y ajuste UTC
    const result = await pool.query(
      "SELECT * FROM salidas WHERE localidad = $1 AND created_at BETWEEN $2 AND $3 ORDER BY created_at",
      [req.localidad, fechaInicio, fechaFin]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener salidas:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

//PARTE DE CHOFERES
export const crearChoferes = async (req, res, next) => {
  const { chofer } = req.body;

  try {
    // Verificar si el chofer es un número
    if (!isNaN(chofer)) {
      return res.status(400).json({
        message:
          "El valor proporcionado para el chofer debe ser un texto no numérico.",
      });
    }

    const result = await pool.query(
      "INSERT INTO choferes (chofer, localidad, sucursal) VALUES ($1, $2, $3) RETURNING *",
      [chofer, req.localidad, req.sucursal]
    );

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe un chofer con ese id",
      });
    }
    next(error);
  }
};

export const getChoferes = async (req, res) => {
  //obtener choferes
  const result = await pool.query(
    "SELECT * FROM choferes WHERE localidad = $1",
    [req.localidad]
  );
  return res.json(result.rows);
};

export const actualizarChofer = async (req, res) => {
  const id = req.params.id;
  const { chofer } = req.body;

  const result = await pool.query(
    "UPDATE choferes SET chofer = $1  WHERE id = $2",
    [chofer, id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe un chofer con ese id",
    });
  }

  return res.json({
    message: "chofer actualizado",
  });
};

export const getChofer = async (req, res) => {
  const result = await pool.query("SELECT * FROM choferes WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningun salida con ese id",
    });
  }

  return res.json(result.rows[0]);
};

export const eliminarChofer = async (req, res) => {
  const result = await pool.query("DELETE FROM choferes WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningun chofer con ese id",
    });
  }

  return res.sendStatus(204);
};

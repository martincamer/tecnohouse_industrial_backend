import { pool } from "../db.js";

export const getSalidas = async (req, res, next) => {
  //obtener perfiles
  const result = await pool.query("SELECT * FROM salidas");
  return res.json(result.rows);
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

  const { username, userRole } = req;

  const datosClienteJSON = JSON.stringify(datos_cliente);

  try {
    const result = await pool.query(
      "INSERT INTO salidas (chofer, km_viaje_control, km_viaje_control_precio, fletes_km, fletes_km_precio, armadores, total_viaticos, motivo,total_flete, total_control,fabrica, salida,espera, chofer_vehiculo, datos_cliente, usuario, role_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *",
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

export const getSalidaMensual = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM salidas WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)"
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener salidas:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

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

    // Ajuste de zona horaria UTC
    const result = await pool.query(
      "SELECT * FROM salidas WHERE created_at BETWEEN $1 AND $2 ORDER BY created_at",
      [fechaInicio, fechaFin]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener salidas:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// export const getIngresoMesActualNew = async (req, res, next) => {
//   try {
//     // Obtener ingresos del mes actual hasta el quinto día
//     const result = await pool.query(
//       "SELECT * FROM ingresos WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) AND created_at <= CURRENT_DATE + INTERVAL '5 days'"
//     );

//     // Calcular el total de la cantidad
//     const totalIngresos = result.rows.reduce((total, ingreso) => {
//       return total + parseFloat(ingreso.cantidad); // Asegúrate de adaptar la columna de cantidad según tu esquema
//     }, 0);

//     // Verificar si estamos después del quinto día del mes
//     const today = new Date();
//     if (today.getDate() > 5) {
//       // Calcular la fecha del primer día del mes siguiente (día sexto)
//       const nextMonthFirstDay = today;
//       nextMonthFirstDay.setMonth(today.getMonth() + 1, 6);

//       // Guardar el total en la tabla totalPresupuesto para el mes siguiente
//       await pool.query(
//         "INSERT INTO totalPresupuesto (mes, total) VALUES ($1, $2)",
//         [nextMonthFirstDay, totalIngresos]
//       );
//     }

//     return res.json(result.rows);
//   } catch (error) {
//     console.error("Error al obtener ingresos:", error);
//     return res.status(500).json({ message: "Error interno del servidor" });
//   }
// };

export const crearChoferes = async (req, res, next) => {
  const { chofer } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO choferes (chofer) VALUES ($1) RETURNING *",
      [chofer]
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

export const getChoferes = async (req, res, next) => {
  //obtener choferes
  const result = await pool.query("SELECT * FROM choferes");
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

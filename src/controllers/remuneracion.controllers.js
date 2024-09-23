import { pool } from "../db.js";

//OBTENER TODAS LAS REMUNERACIONES
export const getRemuneraciones = async (req, res, next) => {
  try {
    // Consulta SQL con filtro por localidad
    const result = await pool.query(
      "SELECT * FROM remuneracion WHERE localidad = $1",
      [req.localidad]
    );

    // Retorna el resultado como JSON
    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener remuneraciones por localidad:", error);
    // Llama a next con el error para pasar al middleware de manejo de errores
    return next(error);
  }
};

export const getRemuneracionesAdmin = async (req, res, next) => {
  try {
    // Verifica si el pool está conectado
    if (!pool) {
      throw new Error("Pool de conexiones no está disponible");
    }

    const result = await pool.query("SELECT * FROM remuneracion");

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "No se encontraron remuneraciones" });
    }

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener remuneraciones:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
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
    auto,
    refuerzo,
    recaudacion,
    chofer,
    datos_cliente,
  } = req.body;

  const { username, userRole, localidad, sucursal } = req;

  const datosClienteJSON = JSON.stringify(datos_cliente);

  try {
    // Insert new remuneration
    const result = await pool.query(
      "INSERT INTO remuneracion (armador, fecha_carga, fecha_entrega, km_lineal, pago_fletero_espera, viaticos, auto, refuerzo, recaudacion, chofer, datos_cliente, localidad, sucursal, usuario, role_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *",
      [
        armador,
        fecha_carga,
        fecha_entrega,
        km_lineal,
        pago_fletero_espera,
        viaticos,
        auto,
        refuerzo,
        recaudacion,
        chofer,
        datosClienteJSON,
        localidad,
        sucursal,
        username,
        userRole,
      ]
    );

    // Convert recaudacion to a number
    const recaudacionNum = parseFloat(recaudacion);

    // Update the total in the caja for the corresponding localidad
    await pool.query(
      "UPDATE caja SET total = (total::numeric + $1) WHERE localidad = $2",
      [recaudacionNum, localidad]
    );

    const todasLasRemuneraciones = await pool.query(
      "SELECT * FROM remuneracion"
    );

    const todasLasCajas = await pool.query("SELECT * FROM caja");

    res.json({
      remuneraciones: todasLasRemuneraciones.rows,
      caja: todasLasCajas.rows,
    });
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

  const { username, userRole, localidad } = req;

  const {
    armador,
    fecha_carga,
    fecha_entrega,
    km_lineal,
    pago_fletero_espera,
    viaticos,
    auto,
    refuerzo,
    recaudacion,
    chofer,
    datos_cliente,
  } = req.body;

  // Convertir el objeto datos_cliente a JSON
  const datos_cliente_json = JSON.stringify(datos_cliente);

  try {
    // Fetch the current recaudacion
    const currentRemuneracion = await pool.query(
      "SELECT recaudacion FROM remuneracion WHERE id = $1",
      [id]
    );

    if (currentRemuneracion.rowCount === 0) {
      return res.status(404).json({
        message: "No existe una remuneracion con ese id",
      });
    }

    const currentRecaudacion = parseFloat(
      currentRemuneracion.rows[0].recaudacion
    );

    // Update caja total: subtract current recaudacion and add new recaudacion
    const newRecaudacionNum = parseFloat(recaudacion);
    // const localidad = req.localidad; // Make sure you have localidad in your request body

    await pool.query(
      "UPDATE caja SET total = (total::numeric - $1 + $2) WHERE localidad = $3",
      [currentRecaudacion, newRecaudacionNum, localidad]
    );

    // Update the remuneration
    const result = await pool.query(
      "UPDATE remuneracion SET armador = $1, fecha_carga = $2, fecha_entrega = $3, km_lineal = $4, pago_fletero_espera = $5, viaticos = $6, auto = $7, refuerzo = $8, recaudacion = $9, chofer = $10, datos_cliente = $11, usuario = $12, role_id = $13 WHERE id = $14",
      [
        armador,
        fecha_carga,
        fecha_entrega,
        km_lineal,
        pago_fletero_espera,
        viaticos,
        auto,
        refuerzo,
        newRecaudacionNum, // Use the new recaudacion
        chofer,
        datos_cliente_json,
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

    const todasLasRemuneraciones = await pool.query(
      "SELECT * FROM remuneracion"
    );

    const todasLasCajas = await pool.query("SELECT * FROM caja");

    res.json({
      remuneraciones: todasLasRemuneraciones.rows,
      caja: todasLasCajas.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la remuneración" });
  }
};

// export const crearRemuneracion = async (req, res, next) => {
//   const {
//     armador,
//     fecha_carga,
//     fecha_entrega,
//     km_lineal,
//     pago_fletero_espera,
//     viaticos,
//     auto,
//     refuerzo,
//     recaudacion,
//     chofer,
//     datos_cliente,
//   } = req.body;

//   const { username, userRole, localidad, sucursal } = req;

//   const datosClienteJSON = JSON.stringify(datos_cliente);

//   try {
//     const result = await pool.query(
//       "INSERT INTO remuneracion (armador, fecha_carga, fecha_entrega, km_lineal, pago_fletero_espera, viaticos, auto, refuerzo, recaudacion, chofer, datos_cliente, localidad, sucursal, usuario, role_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *",
//       [
//         armador,
//         fecha_carga,
//         fecha_entrega,
//         km_lineal,
//         pago_fletero_espera,
//         viaticos,
//         auto,
//         refuerzo,
//         recaudacion,
//         chofer,
//         datosClienteJSON,
//         localidad,
//         sucursal,
//         username,
//         userRole,
//       ]
//     );

//     const todasLasRemuneraciones = await pool.query(
//       "SELECT * FROM remuneracion"
//     );

//     res.json(todasLasRemuneraciones.rows);
//   } catch (error) {
//     if (error.code === "23505") {
//       return res.status(409).json({
//         message: "Ya existe una remuneracion con ese id",
//       });
//     }
//     next(error);
//   }
// };

// export const actualizarRemuneracion = async (req, res) => {
//   const id = req.params.id;

//   const { username, userRole } = req;

//   const {
//     armador,
//     fecha_carga,
//     fecha_entrega,
//     km_lineal,
//     pago_fletero_espera,
//     viaticos,
//     auto,
//     refuerzo,
//     recaudacion,
//     chofer,
//     datos_cliente,
//   } = req.body;

//   // Convertir el objeto datos_cliente a JSON
//   const datos_cliente_json = JSON.stringify(datos_cliente);

//   const result = await pool.query(
//     "UPDATE remuneracion SET armador = $1, fecha_carga = $2, fecha_entrega = $3, km_lineal = $4, pago_fletero_espera = $5, viaticos = $6, auto = $7, refuerzo = $8, recaudacion = $9, chofer = $10, datos_cliente = $11, usuario = $12, role_id = $13 WHERE id = $14",
//     [
//       armador,
//       fecha_carga,
//       fecha_entrega,
//       km_lineal,
//       pago_fletero_espera,
//       viaticos,
//       auto,
//       refuerzo,
//       recaudacion,
//       chofer,
//       datos_cliente_json,
//       username,
//       userRole,
//       id,
//     ]
//   );

//   if (result.rowCount === 0) {
//     return res.status(404).json({
//       message: "No existe una salida con ese id",
//     });
//   }

//   const todasLasRemuneraciones = await pool.query("SELECT * FROM remuneracion");

//   res.json(todasLasRemuneraciones.rows);
// };

// export const eliminarRemuneracion = async (req, res) => {
//   const result = await pool.query("DELETE FROM remuneracion WHERE id = $1", [
//     req.params.id,
//   ]);

//   if (result.rowCount === 0) {
//     return res.status(404).json({
//       message: "No existe ningun presupuesto con ese id",
//     });
//   }

//   const todasLasRemuneraciones = await pool.query("SELECT * FROM remuneracion");

//   res.json(todasLasRemuneraciones.rows);
// };

export const eliminarRemuneracion = async (req, res) => {
  const { id } = req.params;
  const { localidad } = req; // Asegúrate de tener la localidad en la solicitud

  try {
    // Obtener la recaudación actual antes de eliminar
    const currentRemuneracion = await pool.query(
      "SELECT recaudacion FROM remuneracion WHERE id = $1",
      [id]
    );

    if (currentRemuneracion.rowCount === 0) {
      return res.status(404).json({
        message: "No existe ninguna remuneración con ese id",
      });
    }

    const currentRecaudacion = parseFloat(
      currentRemuneracion.rows[0].recaudacion
    );

    // Actualizar la caja restando la recaudación de la remuneración que se va a eliminar
    await pool.query(
      "UPDATE caja SET total = (total::numeric - $1) WHERE localidad = $2",
      [currentRecaudacion, localidad]
    );

    // Eliminar la remuneración
    const result = await pool.query("DELETE FROM remuneracion WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No existe ninguna remuneración con ese id",
      });
    }

    // Obtener todas las remuneraciones después de eliminar
    const todasLasRemuneraciones = await pool.query(
      "SELECT * FROM remuneracion"
    );

    const todasLasCajas = await pool.query("SELECT * FROM caja");

    res.json({
      remuneraciones: todasLasRemuneraciones.rows,
      caja: todasLasCajas.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la remuneración" });
  }
};

//REMUNERACION MENSUAL
export const getRemuneracionMensual = async (req, res, next) => {
  try {
    console.log("req.localidad:", req.localidad);

    // Obtener el inicio del mes actual y el inicio del próximo mes
    const currentMonthStart = "DATE_TRUNC('month', CURRENT_DATE)";
    const nextMonthStart =
      "DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')";

    const result = await pool.query(
      `SELECT * FROM remuneracion WHERE localidad = $1 
       AND created_at >= ${currentMonthStart} 
       AND created_at < ${nextMonthStart}`,
      [req.localidad]
    );

    // Retorna el resultado como JSON
    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener datos legales mensuales:", error);
    return next(error); // Pasa el error al middleware de manejo de errores
  }
};

//OBTENER REMUNERACIONES MENSUALES ADMIN
export const getRemuneracionMensualAdmin = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM remuneracion
       WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) 
         AND created_at < DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')`
    );

    // Retorna el resultado como JSON
    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener salidas mensuales:", error);
    return next(error); // Pasa el error al middleware de manejo de errores
  }
};

//REMUNERACIONES POR FECHA
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

    // Validación de zona horaria y ajuste UTC
    const result = await pool.query(
      "SELECT * FROM remuneracion WHERE localidad = $1 AND created_at BETWEEN $2 AND $3 ORDER BY created_at",
      [req.localidad, fechaInicio, fechaFin]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener remuneraciones:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

//ADMIN GET FECHAS
// Función para obtener salidas dentro de un rango de fechas
export const getRemuneracionPorRangoDeFechasAdmin = async (req, res, next) => {
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
    console.error("Error al obtener órdenes:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

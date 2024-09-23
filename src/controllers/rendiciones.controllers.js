import { pool } from "../db.js";

//OBTENER TODAS LAS RENDICIONES
export const getRendiciones = async (req, res, next) => {
  try {
    // Consulta SQL con filtro por localidad
    const result = await pool.query(
      "SELECT * FROM rendicion WHERE localidad = $1",
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

//OBTENER TODAS LAS RENDICIONES ADMIN
export const getRendicionesAdmin = async (req, res, next) => {
  try {
    // Consulta SQL con filtro por localidad
    const result = await pool.query("SELECT * FROM rendicion");

    // Retorna el resultado como JSON
    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener salidas por localidad:", error);
    // Llama a next con el error para pasar al middleware de manejo de errores
    return next(error);
  }
};

//OBTENER UNICA RENDICION
export const getRendicion = async (req, res) => {
  const result = await pool.query("SELECT * FROM rendicion WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ninguna rendicion con ese id",
    });
  }

  return res.json(result.rows[0]);
};

// CREAR NUEVA RENDICION
export const crearRendicion = async (req, res, next) => {
  const { armador, rendicion_final, detalle } = req.body;
  const { username, userRole, localidad, sucursal } = req;

  try {
    // Insertar nueva rendición
    const result = await pool.query(
      "INSERT INTO rendicion (armador, rendicion_final, detalle, localidad, sucursal, usuario, role_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        armador,
        rendicion_final,
        detalle,
        localidad,
        sucursal,
        username,
        userRole,
      ]
    );

    // Sumar la rendición final al total de la caja
    const rendicionFinalNum = parseFloat(rendicion_final);

    await pool.query(
      "UPDATE caja SET total = (total::numeric + $1) WHERE localidad = $2",
      [rendicionFinalNum, localidad]
    );

    // Obtener todas las rendiciones después de la inserción
    const todasLasRendiciones = await pool.query("SELECT * FROM rendicion");

    const todasLasCajas = await pool.query("SELECT * FROM caja");

    // Responder con las rendiciones y caja actualizadas
    res.json({
      rendiciones: todasLasRendiciones.rows,
      caja: todasLasCajas.rows,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe una rendición con ese id",
      });
    }
    next(error);
  }
};

// //CREAR NUEVA RENDICION
// export const crearRendicion = async (req, res, next) => {
//   const { armador, rendicion_final, detalle } = req.body;

//   const { username, userRole, localidad, sucursal } = req;

//   try {
//     const result = await pool.query(
//       "INSERT INTO rendicion (armador, rendicion_final, detalle,localidad, sucursal, usuario, role_id) VALUES ($1, $2, $3, $4, $5,$6,$7) RETURNING *",
//       [
//         armador,
//         rendicion_final,
//         detalle,
//         localidad,
//         sucursal,
//         username,
//         userRole,
//       ]
//     );

//     const todasLasRemuneraciones = await pool.query("SELECT * FROM rendicion");

//     res.json(todasLasRemuneraciones.rows);
//   } catch (error) {
//     if (error.code === "23505") {
//       return res.status(409).json({
//         message: "Ya existe una rendición con ese id",
//       });
//     }
//     next(error);
//   }
// };

//ACTUALIZAR RENDICIÓN
export const actualizarRendicion = async (req, res) => {
  const id = req.params.id;

  const { username, userRole } = req;

  const { armador, rendicion_final, detalle } = req.body;

  // Convertir el objeto datos_cliente a JSON

  const result = await pool.query(
    "UPDATE rendicion SET armador = $1, rendicion_final = $2, detalle = $3, usuario = $4, role_id = $5 WHERE id = $6",
    [armador, rendicion_final, detalle, username, userRole, id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe una rendición con ese id",
    });
  }

  const todasLasRemuneraciones = await pool.query("SELECT * FROM rendicion");

  res.json(todasLasRemuneraciones.rows);
};

// ELIMINAR RENDICION
export const eliminarRendicion = async (req, res) => {
  const { id } = req.params;
  const { localidad } = req; // Asegúrate de tener la localidad en la solicitud

  try {
    // Obtener la rendición final antes de eliminar
    const currentRendicion = await pool.query(
      "SELECT rendicion_final FROM rendicion WHERE id = $1",
      [id]
    );

    if (currentRendicion.rowCount === 0) {
      return res.status(404).json({
        message: "No existe ninguna rendición con ese id",
      });
    }

    const rendicionFinalNum = parseFloat(
      currentRendicion.rows[0].rendicion_final
    );

    // Actualizar la caja restando la rendición final de la rendición que se va a eliminar
    await pool.query(
      "UPDATE caja SET total = (total::numeric - $1) WHERE localidad = $2",
      [rendicionFinalNum, localidad]
    );

    // Eliminar la rendición
    const result = await pool.query("DELETE FROM rendicion WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No existe ninguna rendición con ese id",
      });
    }

    // Obtener todas las rendiciones después de eliminar
    const todasLasRendiciones = await pool.query("SELECT * FROM rendicion");
    const todasLasCajas = await pool.query("SELECT * FROM caja");

    res.json({
      rendiciones: todasLasRendiciones.rows,
      caja: todasLasCajas.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la rendición" });
  }
};
// //ELIMINAR RENDICION
// export const eliminarRendicion = async (req, res) => {
//   const result = await pool.query("DELETE FROM rendicion WHERE id = $1", [
//     req.params.id,
//   ]);

//   if (result.rowCount === 0) {
//     return res.status(404).json({
//       message: "No existe ninguna rendición con ese id",
//     });
//   }

//   const todasLasRemuneraciones = await pool.query("SELECT * FROM rendicion");

//   res.json(todasLasRemuneraciones.rows);
// };

//RENDICION MENSUAL
export const getRendicionMensual = async (req, res, next) => {
  try {
    console.log("req.localidad:", req.localidad);

    // Obtener el inicio del mes actual y el inicio del próximo mes
    const currentMonthStart = "DATE_TRUNC('month', CURRENT_DATE)";
    const nextMonthStart =
      "DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')";

    const result = await pool.query(
      `SELECT * FROM rendicion WHERE localidad = $1 
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
//OBTENER RENDICIONES MENSUALES ADMIN
export const getRendicionMensualAdmin = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM rendicion
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

//RENDICIONES POR FECHA
export const getRendicionPorRangoDeFechas = async (req, res, next) => {
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
      "SELECT * FROM rendicion WHERE localidad = $1 AND created_at BETWEEN $2 AND $3 ORDER BY created_at",
      [req.localidad, fechaInicio, fechaFin]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener salidas:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

//ADMIN GET FECHAS
// Función para obtener salidas dentro de un rango de fechas
export const getRendicionesPorRangoDeFechasAdmin = async (req, res, next) => {
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
      "SELECT * FROM rendicion WHERE created_at BETWEEN $1 AND $2 ORDER BY created_at",
      [fechaInicio, fechaFin]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

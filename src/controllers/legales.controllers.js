//imports
import { pool } from "../db.js";

//OBTENER TODAS LAS LEGALES
export const getLegales = async (req, res, next) => {
  try {
    // Consulta SQL con filtro por localidad
    const result = await pool.query(
      "SELECT * FROM legal WHERE localidad = $1",
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

//OBTENER TODAS LAS LEGALES ADMIN
export const getLegalesAdmin = async (req, res, next) => {
  try {
    // Consulta SQL con filtro por localidad
    const result = await pool.query("SELECT * FROM legal");

    // Retorna el resultado como JSON
    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener remuneraciones por localidad:", error);
    // Llama a next con el error para pasar al middleware de manejo de errores
    return next(error);
  }
};

//OBTENER UNICO LEGAL
export const getLegal = async (req, res) => {
  const result = await pool.query("SELECT * FROM legal WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningun legal con ese id",
    });
  }

  return res.json(result.rows[0]);
};

// //CREAR LEGAL
// export const crearLegal = async (req, res, next) => {
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

//   // // Validación de campos
//   // if (
//   //   !armador ||
//   //   typeof armador !== "string" ||
//   //   !fecha_carga ||
//   //   !fecha_entrega ||
//   //   isNaN(km_lineal) ||
//   //   isNaN(pago_fletero_espera) ||
//   //   isNaN(viaticos) ||
//   //   isNaN(auto) ||
//   //   isNaN(refuerzo) ||
//   //   isNaN(recaudacion) ||
//   //   !chofer ||
//   //   !datos_cliente
//   // ) {
//   //   return res.status(400).json({
//   //     message:
//   //       "Todos los campos son obligatorios y deben tener el formato correcto.",
//   //   });
//   // }

//   const datosClienteJSON = JSON.stringify(datos_cliente);

//   try {
//     const result = await pool.query(
//       "INSERT INTO legal (armador, fecha_carga, fecha_entrega, km_lineal, pago_fletero_espera, viaticos, auto, refuerzo, recaudacion, chofer, datos_cliente,localidad, sucursal, usuario, role_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,$14, $15) RETURNING *",
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

//     const todasLasRemuneraciones = await pool.query("SELECT * FROM legal");

//     res.json(todasLasRemuneraciones.rows);
//   } catch (error) {
//     if (error.code === "23505") {
//       return res.status(409).json({
//         message: "Ya existe una legal con ese id",
//       });
//     }
//     next(error);
//   }
// };

export const crearLegal = async (req, res, next) => {
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
    // Insert new legal record
    const result = await pool.query(
      "INSERT INTO legal (armador, fecha_carga, fecha_entrega, km_lineal, pago_fletero_espera, viaticos, auto, refuerzo, recaudacion, chofer, datos_cliente, localidad, sucursal, usuario, role_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *",
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

    const todasLasLegales = await pool.query("SELECT * FROM legal");

    const todasLasCajas = await pool.query("SELECT * FROM caja");

    res.json({
      legales: todasLasLegales.rows,
      caja: todasLasCajas.rows,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe un registro legal con ese id",
      });
    }
    next(error);
  }
};

// export const actualizarLegal = async (req, res) => {
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
//     "UPDATE legal SET armador = $1, fecha_carga = $2, fecha_entrega = $3, km_lineal = $4, pago_fletero_espera = $5, viaticos = $6, auto = $7, refuerzo = $8, recaudacion = $9, chofer = $10, datos_cliente = $11, usuario = $12, role_id = $13 WHERE id = $14",
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
//       datos_cliente_json, // Usar el objeto JSON en la consulta
//       username,
//       userRole,
//       id,
//     ]
//   );

//   if (result.rowCount === 0) {
//     return res.status(404).json({
//       message: "No existe un legal con ese id",
//     });
//   }

//   const todasLasRemuneraciones = await pool.query("SELECT * FROM legal");

//   res.json(todasLasRemuneraciones.rows);
// };

export const actualizarLegal = async (req, res) => {
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
    // Fetch the current recaudacion from the existing legal record
    const currentLegal = await pool.query(
      "SELECT recaudacion FROM legal WHERE id = $1",
      [id]
    );

    if (currentLegal.rowCount === 0) {
      return res.status(404).json({
        message: "No existe un registro legal con ese id",
      });
    }

    const currentRecaudacion = parseFloat(currentLegal.rows[0].recaudacion);

    // Update caja total: subtract current recaudacion and add new recaudacion
    const newRecaudacionNum = parseFloat(recaudacion);

    await pool.query(
      "UPDATE caja SET total = (total::numeric - $1 + $2) WHERE localidad = $3",
      [currentRecaudacion, newRecaudacionNum, localidad]
    );

    // Update the legal record
    const result = await pool.query(
      "UPDATE legal SET armador = $1, fecha_carga = $2, fecha_entrega = $3, km_lineal = $4, pago_fletero_espera = $5, viaticos = $6, auto = $7, refuerzo = $8, recaudacion = $9, chofer = $10, datos_cliente = $11, usuario = $12, role_id = $13 WHERE id = $14",
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
        message: "No existe un registro legal con ese id",
      });
    }

    const todasLasLegales = await pool.query("SELECT * FROM legal");
    const todasLasCajas = await pool.query("SELECT * FROM caja");

    res.json({
      legales: todasLasLegales.rows,
      caja: todasLasCajas.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el registro legal" });
  }
};

// export const eliminarLegal = async (req, res) => {
//   const result = await pool.query("DELETE FROM legal WHERE id = $1", [
//     req.params.id,
//   ]);

//   if (result.rowCount === 0) {
//     return res.status(404).json({
//       message: "No existe ningun legal con ese id",
//     });
//   }

//   const todasLasRemuneraciones = await pool.query("SELECT * FROM legal");

//   res.json(todasLasRemuneraciones.rows);
// };

export const eliminarLegal = async (req, res) => {
  const { id } = req.params;
  const { localidad } = req; // Asegúrate de que la localidad esté en la solicitud

  try {
    // Obtener la recaudación actual antes de eliminar
    const currentLegal = await pool.query(
      "SELECT recaudacion FROM legal WHERE id = $1",
      [id]
    );

    if (currentLegal.rowCount === 0) {
      return res.status(404).json({
        message: "No existe ningún registro legal con ese id",
      });
    }

    const currentRecaudacion = parseFloat(currentLegal.rows[0].recaudacion);

    // Actualizar la caja restando la recaudación que se va a eliminar
    await pool.query(
      "UPDATE caja SET total = (total::numeric - $1) WHERE localidad = $2",
      [currentRecaudacion, localidad]
    );

    // Eliminar el registro legal
    const result = await pool.query("DELETE FROM legal WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No existe ningún registro legal con ese id",
      });
    }

    // Obtener todos los registros legales después de eliminar
    const todosLosLegales = await pool.query("SELECT * FROM legal");

    const todasLasCajas = await pool.query("SELECT * FROM caja");

    res.json({
      legales: todosLosLegales.rows,
      caja: todasLasCajas.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el registro legal" });
  }
};

//LEGAL MENSUAL
export const getLegalMensual = async (req, res, next) => {
  try {
    console.log("req.localidad:", req.localidad);

    // Obtener el inicio del mes actual y el inicio del próximo mes
    const currentMonthStart = "DATE_TRUNC('month', CURRENT_DATE)";
    const nextMonthStart =
      "DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')";

    const result = await pool.query(
      `SELECT * FROM legal WHERE localidad = $1 
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

//OBTENER LEGAL MENSUALES ADMIN
export const getLegalMensualAdmin = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM legal
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

//LEGAL POR FECHA
export const getLegalPorRangoDeFechas = async (req, res, next) => {
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
      "SELECT * FROM legal WHERE localidad = $1 AND created_at BETWEEN $2 AND $3 ORDER BY created_at",
      [req.localidad, fechaInicio, fechaFin]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener legal:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

//ADMIN GET FECHAS
// Función para obtener salidas dentro de un rango de fechas
export const getLegalesPorRangoDeFechasAdmin = async (req, res, next) => {
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
      "SELECT * FROM legal WHERE created_at BETWEEN $1 AND $2 ORDER BY created_at",
      [fechaInicio, fechaFin]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

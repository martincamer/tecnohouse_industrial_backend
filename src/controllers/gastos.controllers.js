import { pool } from "../db.js";

//OBTENER TODAS LAS REMUNERACIONES
export const getGastos = async (req, res, next) => {
  try {
    // Consulta SQL con filtro por localidad
    const result = await pool.query(
      "SELECT * FROM egresos WHERE localidad = $1",
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

export const getGastosAdmin = async (req, res, next) => {
  try {
    // Verifica si el pool está conectado
    if (!pool) {
      throw new Error("Pool de conexiones no está disponible");
    }

    const result = await pool.query("SELECT * FROM egresos");

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "No se encontraron egresos" });
    }

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener egresos:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getGasto = async (req, res) => {
  const result = await pool.query("SELECT * FROM gasto WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningun salida con ese id",
    });
  }

  return res.json(result.rows[0]);
};

export const crearGasto = async (req, res, next) => {
  const { observacion, recaudacion } = req.body;
  const { username, userRole, localidad, sucursal } = req;

  try {
    // Insert new expense, converting recaudacion to a negative number
    const result = await pool.query(
      "INSERT INTO egresos (observacion, recaudacion, localidad, sucursal, usuario, role_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        observacion,
        -Math.abs(parseFloat(recaudacion)),
        localidad,
        sucursal,
        username,
        userRole,
      ]
    );

    // Update the total in the caja for the corresponding localidad
    await pool.query(
      "UPDATE caja SET total = (total::numeric - $1) WHERE localidad = $2",
      [Math.abs(parseFloat(recaudacion)), localidad]
    );

    const todosLosGastos = await pool.query("SELECT * FROM egresos");
    const todasLasCajas = await pool.query("SELECT * FROM caja");

    res.json({
      gastos: todosLosGastos.rows,
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

export const actualizarGasto = async (req, res) => {
  const id = req.params.id;

  const { username, userRole, localidad } = req;

  const { tipo, recaudacion } = req.body;

  try {
    // Fetch the current recaudacion
    const currentRemuneracion = await pool.query(
      "SELECT recaudacion FROM gastos WHERE id = $1",
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
      "UPDATE gastos SET tipo = $1, recaudacion = $2 usuario = $3, role_id = $4 WHERE id = $5",
      [
        tipo,
        newRecaudacionNum, // Use the new recaudacion
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

    const todosLosGastos = await pool.query("SELECT * FROM gastos");

    const todasLasCajas = await pool.query("SELECT * FROM caja");

    res.json({
      gastos: todosLosGastos.rows,
      caja: todasLasCajas.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la remuneración" });
  }
};

export const eliminarGasto = async (req, res) => {
  const { id } = req.params;
  const { localidad } = req; // Asegúrate de tener la localidad en la solicitud

  try {
    // Obtener la recaudación actual antes de eliminar
    const currentRemuneracion = await pool.query(
      "SELECT recaudacion FROM egresos WHERE id = $1",
      [id]
    );

    if (currentRemuneracion.rowCount === 0) {
      return res.status(404).json({
        message: "No existe ninguna remuneración con ese id",
      });
    }

    // Convertir recaudación a un valor positivo
    const currentRecaudacion = Math.abs(
      parseFloat(currentRemuneracion.rows[0].recaudacion)
    );

    // Actualizar la caja restando la recaudación de la remuneración que se va a eliminar
    await pool.query(
      "UPDATE caja SET total = (total::numeric + $1) WHERE localidad = $2",
      [currentRecaudacion, localidad]
    );

    // Eliminar la remuneración
    const result = await pool.query("DELETE FROM egresos WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No existe ninguna remuneración con ese id",
      });
    }

    // Obtener todas las remuneraciones después de eliminar
    const todosLosGastos = await pool.query("SELECT * FROM egresos");

    const todasLasCajas = await pool.query("SELECT * FROM caja");

    res.json({
      gastos: todosLosGastos.rows,
      caja: todasLasCajas.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la remuneración" });
  }
};

// export const eliminarGasto = async (req, res) => {
//   const { id } = req.params;
//   const { localidad } = req; // Asegúrate de tener la localidad en la solicitud

//   try {
//     // Obtener la recaudación actual antes de eliminar
//     const currentRemuneracion = await pool.query(
//       "SELECT recaudacion FROM egresos WHERE id = $1",
//       [id]
//     );

//     if (currentRemuneracion.rowCount === 0) {
//       return res.status(404).json({
//         message: "No existe ninguna remuneración con ese id",
//       });
//     }

//     const currentRecaudacion = parseFloat(
//       currentRemuneracion.rows[0].recaudacion
//     );

//     // Actualizar la caja restando la recaudación de la remuneración que se va a eliminar
//     await pool.query(
//       "UPDATE caja SET total = (total::numeric + $1) WHERE localidad = $2",
//       [currentRecaudacion, localidad]
//     );

//     // Eliminar la remuneración
//     const result = await pool.query("DELETE FROM egresos WHERE id = $1", [id]);

//     if (result.rowCount === 0) {
//       return res.status(404).json({
//         message: "No existe ninguna remuneración con ese id",
//       });
//     }

//     // Obtener todas las remuneraciones después de eliminar
//     const todosLosGastos = await pool.query("SELECT * FROM egresos");

//     const todasLasCajas = await pool.query("SELECT * FROM caja");

//     res.json({
//       gastos: todosLosGastos.rows,
//       caja: todasLasCajas.rows,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error al eliminar la remuneración" });
//   }
// };

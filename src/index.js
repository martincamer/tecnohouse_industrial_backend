// Importa el servidor de Express desde tu archivo app.js
import app from "./app.js";
import { ORIGIN } from "./config.js";

// Importa createServer y Server de http y socket.io respectivamente
import { createServer } from "http";
import { Server } from "socket.io";

// Importa el puerto desde tu configuración
import { PORT } from "./config.js";

// Crea el servidor HTTP utilizando Express
const httpServer = createServer(app);

// const io = new Server(server, {
// cors: {
// origin: “*”,
// methods: [“GET”, “POST”],
// allowedHeaders: [‘Access-Control-Allow-Origin’]
// },
// maxHttpBufferSize: 1e8
// });

// Crea el servidor de Socket.io y adjúntalo al servidor HTTP
const io = new Server(httpServer, {
  cors: {
    origin: ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Access-Control-Allow-Origin"],
  },
  maxHttpBufferSize: 1e8,
});

// Maneja eventos de Socket.io
io.on("connection", (socket) => {
  console.log("A user connected");

  // Maneja el evento "nueva-salida"
  socket.on("nueva-salida", (datosSalida) => {
    console.log("Nueva salida:", datosSalida);
    // Aquí puedes realizar acciones con los datos de la nueva salida, como almacenarlos en la base de datos
    // o emitir el evento a otros clientes si es necesario
    // Por ejemplo, puedes enviar un mensaje a todos los clientes conectados para informarles sobre la nueva salida
    io.emit("nueva-salida", datosSalida); // Esto emitirá el evento "nueva-salida" a todos los clientes conectados
  });

  socket.on("editar-salida", (datosSalida) => {
    console.log("editar salida:", datosSalida);
    io.emit("editar-salida", datosSalida); // Esto emitirá el evento "editar-salida" a todos los clientes conectados
  });

  // Maneja el evento "eliminar-salida"
  socket.on("eliminar-salida", (datosSalida) => {
    console.log("Eliminar salida:", datosSalida);
    // Aquí puedes realizar acciones con los datos de la salida eliminada, como eliminarla de la base de datos
    // o emitir el evento a otros clientes si es necesario
    // Por ejemplo, puedes enviar un mensaje a todos los clientes conectados para informarles sobre la salida eliminada
    io.emit("eliminar-salida", datosSalida); // Esto emitirá el evento "eliminar-salida" a todos los clientes conectados
  });

  // RECIBIMOS EL EVENTOS DE ABRIR PROYECTO
  socket.on("abrir-app", (app) => {
    socket.join(app);
  });

  socket.on("actualizar-salidas", (nuevasSalidas) => {
    // Procesar las nuevas salidas recibidas desde el cliente
    console.log("Nuevas salidas recibidas:", nuevasSalidas);
    // Actualizar el estado, almacenar en la base de datos, etc.
  });

  socket.on("actualizar-choferes", (nuevosChoferes) => {
    // Procesar los nuevos choferes recibidos desde el cliente
    console.log("Nuevos choferes recibidos:", nuevosChoferes);
    // Actualizar el estado, almacenar en la base de datos, etc.
  });

  // socket.on("disconnect", () => {
  //   console.log("User disconnected");
  // });

  // Agrega más controladores de eventos de Socket.io aquí
});

// Escucha el servidor HTTP en el puerto especificado en la configuración
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

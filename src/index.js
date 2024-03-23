// Importa el servidor de Express desde tu archivo app.js
import app from "./app.js";
import { ORIGIN, PORT } from "./config.js";

// Importa createServer y Server de http y socket.io respectivamente
import { createServer } from "http";
import { Server } from "socket.io";

// Crea el servidor HTTP utilizando Express
const httpServer = createServer(app);

// app.use(express.static(resolve("frontend/dist")));

// Crea el servidor de Socket.io y adjúntalo al servidor HTTP
const io = new Server(httpServer, {
  cors: {
    origin: ORIGIN,
    credentials: true,
  },
});

// Maneja eventos de Socket.io
io.on("connection", (socket) => {
  console.log("A user connected");

  // Maneja el evento "nueva-salida"
  socket.on("nueva-salida", (datosSalida) => {
    console.log("Nueva salida:", datosSalida);
    io.emit("nueva-salida", datosSalida); // Esto emitirá el evento "nueva-salida" a todos los clientes conectados
  });

  socket.on("editar-salida", (datosSalida) => {
    console.log("editar salida:", datosSalida);
    io.emit("editar-salida", datosSalida); // Esto emitirá el evento "editar-salida" a todos los clientes conectados
  });

  // Maneja el evento "eliminar-salida"
  socket.on("eliminar-salida", (datosSalida) => {
    console.log("Eliminar salida:", datosSalida);

    io.emit("eliminar-salida", datosSalida); // Esto emitirá el evento "eliminar-salida" a todos los clientes conectados
  });

  // RECIBIMOS EL EVENTOS DE ABRIR PROYECTO
  socket.on("abrir-app", (app) => {
    socket.join(app);
  });

  socket.on("actualizar-salidas", (nuevasSalidas) => {
    console.log("Nuevas salidas recibidas:", nuevasSalidas);
  });

  socket.on("actualizar-choferes", (nuevosChoferes) => {
    console.log("Nuevos choferes recibidos:", nuevosChoferes);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

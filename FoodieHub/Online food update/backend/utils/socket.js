// utils/socket.js
//
// Central place to initialize Socket.IO and hand out the `io` instance
// to controllers, without creating circular requires with index.js.

const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: function (origin, callback) {
        if (
          !origin ||
          origin === "null" ||
          origin.startsWith("http://localhost") ||
          origin.startsWith("http://127.0.0.1")
        ) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    },
  });

  // Authenticate the socket using the same JWT used for REST calls.
  // Client sends it as: io(URL, { auth: { token } })
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        // Allow anonymous connections (e.g. a public "live orders" board),
        // they just won't be joined to any private room.
        socket.user = null;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      socket.user = user || null;
      next();
    } catch (error) {
      // Bad/expired token: still let the socket connect anonymously
      // instead of hard-failing the handshake.
      socket.user = null;
      next();
    }
  });

  io.on("connection", (socket) => {
    if (socket.user) {
      // Personal room so a specific customer can be notified about
      // their own order without broadcasting to everyone.
      socket.join(`user_${socket.user._id}`);

      if (socket.user.isAdmin) {
        socket.join("admins");
      }
    }

    socket.on("disconnect", () => {
      // no-op, rooms are cleaned up automatically
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.IO not initialized. Call initSocket(server) first.");
  }
  return io;
}

module.exports = { initSocket, getIO };

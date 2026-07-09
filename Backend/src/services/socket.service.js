import { Server } from "socket.io";

let io;
const userSockets = new Map(); // Map to store userId -> socketId

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // Listen for user registering their socket
        socket.on("register", (userId) => {
            if (userId) {
                userSockets.set(userId.toString(), socket.id);
                console.log(`User ${userId} registered with socket ${socket.id}`);
            }
        });

        // Handle disconnect
        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`);
            // Remove the socket from the map
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    console.log(`User ${userId} unregistered`);
                    break;
                }
            }
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

export const notifySeller = (sellerId, payload) => {
    if (!io) return;
    const socketId = userSockets.get(sellerId.toString());
    if (socketId) {
        io.to(socketId).emit("new_order", payload);
    }
};

export const notifyBuyer = (buyerId, payload) => {
    if (!io) return;
    const socketId = userSockets.get(buyerId.toString());
    if (socketId) {
        io.to(socketId).emit("order_status_updated", payload);
    }
};

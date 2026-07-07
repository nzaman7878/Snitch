import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

let socket;

export const useSocket = () => {
    const user = useSelector(state => state.auth?.user);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!user) {
            if (socket) {
                socket.disconnect();
                socket = null;
                setIsConnected(false);
            }
            return;
        }

        if (!socket) {
            socket = io("http://localhost:3000", {
                withCredentials: true
            });

            socket.on("connect", () => {
                setIsConnected(true);
                // Register user immediately upon connection
                socket.emit("register", user.id || user._id);
            });

            socket.on("disconnect", () => {
                setIsConnected(false);
            });
        } else if (socket.connected) {
            // Already connected but component mounted, emit register just in case
            socket.emit("register", user.id || user._id);
        }

        return () => {
            // We do NOT disconnect here so the socket persists across page navigations.
            // It will only disconnect if `!user` is true (logout).
        };
    }, [user]);

    return { socket, isConnected };
};

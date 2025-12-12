import { io } from 'socket.io-client';

// Connect to Backend
const socket = io(import.meta.env.VITE_API_URL);

export default socket;

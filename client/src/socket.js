import { io } from 'socket.io-client';

// Connect to Backend
const socket = io('http://localhost:3001');

export default socket;

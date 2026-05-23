import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.static('public'));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

interface User {
  id: string;
  lat?: number;
  lng?: number;
  lastUpdated: number;
}

interface Room {
  code: string;
  targetDate: string | null;
  users: Record<string, User>;
  lastActive: number;
}

const rooms = new Map<string, Room>();

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create-room', () => {
    const code = generateRoomCode();
    const room: Room = {
      code,
      targetDate: null,
      users: {},
      lastActive: Date.now()
    };
    rooms.set(code, room);
    socket.join(code);
    socket.emit('room-created', room);
    console.log(`Room created: ${code}`);
  });

  socket.on('join-room', (code: string) => {
    const room = rooms.get(code);
    if (room) {
      socket.join(code);
      room.lastActive = Date.now();
      socket.emit('room-joined', room);
      io.to(code).emit('user-joined', { id: socket.id });
      console.log(`User ${socket.id} joined room: ${code}`);
    } else {
      socket.emit('error', 'Room not found');
    }
  });

  socket.on('update-location', ({ code, lat, lng }: { code: string, lat: number, lng: number }) => {
    const room = rooms.get(code);
    if (room) {
      room.users[socket.id] = {
        id: socket.id,
        lat,
        lng,
        lastUpdated: Date.now()
      };
      room.lastActive = Date.now();
      io.to(code).emit('location-updated', { userId: socket.id, lat, lng, lastUpdated: room.users[socket.id].lastUpdated });
    }
  });

  socket.on('update-target-date', ({ code, date }: { code: string, date: string }) => {
    const room = rooms.get(code);
    if (room) {
      room.targetDate = date;
      room.lastActive = Date.now();
      io.to(code).emit('target-date-updated', date);
    }
  });

  socket.on('disconnecting', () => {
    for (const roomCode of socket.rooms) {
      if (rooms.has(roomCode)) {
        const room = rooms.get(roomCode)!;
        delete room.users[socket.id];
        io.to(roomCode).emit('user-left', socket.id);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Cleanup: Every hour, remove rooms inactive for 24h
setInterval(() => {
  const now = Date.now();
  const TTL = 24 * 60 * 60 * 1000;
  for (const [code, room] of rooms.entries()) {
    if (now - room.lastActive > TTL) {
      rooms.delete(code);
      console.log(`Room ${code} expired and was removed.`);
    }
  }
}, 60 * 60 * 1000);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

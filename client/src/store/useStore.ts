import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface User {
  id: string;
  lat?: number;
  lng?: number;
  lastUpdated: number;
}

interface AppState {
  socket: Socket | null;
  roomCode: string | null;
  targetDate: string | null;
  users: Record<string, User>;
  myLocation: { lat: number; lng: number } | null;
  isJoining: boolean;
  error: string | null;

  connect: () => void;
  createRoom: () => void;
  joinRoom: (code: string) => void;
  setMyLocation: (lat: number, lng: number) => void;
  updateTargetDate: (date: string) => void;
  setError: (error: string | null) => void;
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const useStore = create<AppState>((set, get) => ({
  socket: null,
  roomCode: null,
  targetDate: null,
  users: {},
  myLocation: null,
  isJoining: false,
  error: null,

  connect: () => {
    if (get().socket) return;
    const socket = io(SOCKET_URL);

    socket.on('room-created', (room) => {
      set({ roomCode: room.code, targetDate: room.targetDate, users: room.users, isJoining: false });
    });

    socket.on('room-joined', (room) => {
      set({ roomCode: room.code, targetDate: room.targetDate, users: room.users, isJoining: false });
    });

    socket.on('user-joined', ({ id }) => {
      set((state) => ({
        users: { ...state.users, [id]: { id, lastUpdated: Date.now() } }
      }));
    });

    socket.on('location-updated', ({ userId, lat, lng, lastUpdated }) => {
      set((state) => ({
        users: {
          ...state.users,
          [userId]: { ...state.users[userId], lat, lng, lastUpdated }
        }
      }));
    });

    socket.on('target-date-updated', (date) => {
      set({ targetDate: date });
    });

    socket.on('user-left', (userId) => {
      set((state) => {
        const newUsers = { ...state.users };
        delete newUsers[userId];
        return { users: newUsers };
      });
    });

    socket.on('error', (msg) => {
      set({ error: msg, isJoining: false });
    });

    set({ socket });
  },

  createRoom: () => {
    const { socket } = get();
    if (socket) {
      set({ isJoining: true, error: null });
      socket.emit('create-room');
    }
  },

  joinRoom: (code: string) => {
    const { socket } = get();
    if (socket) {
      set({ isJoining: true, error: null });
      socket.emit('join-room', code.toUpperCase());
    }
  },

  setMyLocation: (lat, lng) => {
    const { socket, roomCode } = get();
    set({ myLocation: { lat, lng } });
    if (socket && roomCode) {
      socket.emit('update-location', { code: roomCode, lat, lng });
    }
  },

  updateTargetDate: (date) => {
    const { socket, roomCode } = get();
    if (socket && roomCode) {
      socket.emit('update-target-date', { code: roomCode, date });
    }
  },

  setError: (error) => set({ error }),
}));

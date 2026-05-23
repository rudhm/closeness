import { create } from 'zustand';
import { Peer } from 'peerjs';
import type { DataConnection } from 'peerjs';

interface User {
  id: string;
  lat?: number;
  lng?: number;
  lastUpdated: number;
}

interface AppState {
  peer: Peer | null;
  conn: DataConnection | null;
  roomCode: string | null;
  targetDate: string | null;
  users: Record<string, User>;
  myLocation: { lat: number; lng: number } | null;
  isJoining: boolean;
  isHost: boolean;
  error: string | null;

  createRoom: () => void;
  joinRoom: (code: string) => void;
  setMyLocation: (lat: number, lng: number) => void;
  updateTargetDate: (date: string) => void;
  setError: (error: string | null) => void;
}

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const setupConnection = (connection: DataConnection, set: any, get: any) => {
  connection.on('data', (data: any) => {
    const { type, payload } = data;
    if (type === 'LOCATION_UPDATE') {
      set((state: any) => ({
        users: {
          ...state.users,
          [connection.peer]: { id: connection.peer, ...payload, lastUpdated: Date.now() }
        }
      }));
    } else if (type === 'TARGET_DATE_UPDATE') {
      set({ targetDate: payload });
    }
  });

  connection.on('open', () => {
    set({ conn: connection, isJoining: false });
    const { targetDate } = get();
    if (targetDate) {
      connection.send({ type: 'TARGET_DATE_UPDATE', payload: targetDate });
    }
  });

  connection.on('close', () => {
    set({ conn: null, error: 'Partner disconnected' });
  });
};

export const useStore = create<AppState>((set, get) => ({
  peer: null,
  conn: null,
  roomCode: null,
  targetDate: null,
  users: {},
  myLocation: null,
  isJoining: false,
  isHost: false,
  error: null,

  createRoom: () => {
    const code = generateRoomCode();
    const peer = new Peer(code);
    
    set({ isJoining: true, error: null });

    peer.on('open', (id) => {
      set({ peer, roomCode: id, isHost: true, isJoining: false });
    });

    peer.on('connection', (connection) => {
      setupConnection(connection, set, get);
    });

    peer.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        // Retry if code taken
        get().createRoom();
      } else {
        set({ error: err.message, isJoining: false });
      }
    });
  },

  joinRoom: (code: string) => {
    const peer = new Peer(); // Guest gets a random ID
    set({ isJoining: true, error: null });

    peer.on('open', () => {
      const connection = peer.connect(code);
      setupConnection(connection, set, get);
      
      connection.on('open', () => {
        set({ peer, conn: connection, roomCode: code, isJoining: false, isHost: false });
      });

      connection.on('error', () => {
        set({ error: 'Failed to connect to room. Check the code.', isJoining: false });
      });
    });

    peer.on('error', (err) => {
      set({ error: err.message, isJoining: false });
    });
  },

  setMyLocation: (lat, lng) => {
    const { conn } = get();
    set({ myLocation: { lat, lng } });
    if (conn && conn.open) {
      conn.send({ type: 'LOCATION_UPDATE', payload: { lat, lng } });
    }
  },

  updateTargetDate: (date) => {
    const { conn } = get();
    set({ targetDate: date });
    if (conn && conn.open) {
      conn.send({ type: 'TARGET_DATE_UPDATE', payload: date });
    }
  },

  setError: (error) => set({ error }),
}));

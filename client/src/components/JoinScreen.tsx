import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Heart, ArrowRight, Loader2 } from 'lucide-react';

export const JoinScreen = () => {
  const { createRoom, joinRoom, isJoining, error, setError } = useStore();
  const [code, setCode] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      joinRoom(code);
    } else {
      setError('Please enter a 6-character code');
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center gap-12 max-w-md mx-auto">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-accent-coral/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-accent-coral fill-accent-coral/20" />
        </div>
        <h1 className="text-5xl font-serif text-white tracking-tight">Closer</h1>
        <p className="text-white/40 text-lg">Distance means nothing when someone means everything.</p>
      </div>

      <div className="w-full space-y-8">
        <form onSubmit={handleJoin} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="ENTER ROOM CODE"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-center text-xl font-bold tracking-[0.5em] placeholder:tracking-normal placeholder:font-normal placeholder:text-white/20 focus:outline-none focus:border-accent-coral/50 transition-colors"
            />
            <button
              type="submit"
              disabled={isJoining || code.length !== 6}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-accent-coral rounded-xl flex items-center justify-center disabled:opacity-50 disabled:bg-white/10"
            >
              {isJoining ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6 text-black" />}
            </button>
          </div>
          {error && <p className="text-accent-coral text-sm text-center">{error}</p>}
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest text-white/20">
            <span className="bg-background px-4">or</span>
          </div>
        </div>

        <button
          onClick={createRoom}
          disabled={isJoining}
          className="w-full bg-white text-black font-bold py-5 rounded-2xl hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          {isJoining ? 'Creating...' : 'Create New Room'}
        </button>
      </div>

      <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-8">
        Private • Real-time • No Login
      </p>
    </div>
  );
};

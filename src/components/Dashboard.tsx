import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Share2, Timer } from 'lucide-react';
import { calculateDistance, estimateTravelTime, formatTime } from '../lib/utils';

export const Dashboard = () => {
  const { roomCode, users, targetDate, myLocation, setMyLocation, updateTargetDate, peer } = useStore();
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setMyLocation(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [setMyLocation]);

  // Countdown timer
  useEffect(() => {
    if (!targetDate) return;

    const interval = setInterval(() => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const partner = Object.values(users).find((u) => u.id !== peer?.id && u.lat !== undefined);
  const distance = myLocation && partner ? calculateDistance(myLocation.lat, myLocation.lng, partner.lat!, partner.lng!) : null;
  const travelTimes = distance ? estimateTravelTime(distance.km) : null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Closer Room',
          text: `Join my Closer room: ${roomCode}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(roomCode || '');
      alert('Room code copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-md mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif text-accent-coral">Closer</h1>
          <p className="text-xs text-white/40 uppercase tracking-widest">Room: {roomCode}</p>
        </div>
        <button onClick={handleShare} className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
          <Share2 className="w-5 h-5 text-accent-amber" />
        </button>
      </div>

      {/* Distance Display */}
      <div className="text-center py-8">
        {distance ? (
          <div className="space-y-2">
            <span className="text-7xl font-serif text-white tracking-tighter">
              {Math.round(distance.km)}
              <span className="text-xl text-white/40 ml-2">km</span>
            </span>
            <p className="text-white/40 text-sm">≈ {Math.round(distance.miles)} miles away</p>
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center">
            <p className="text-white/20 animate-pulse">Waiting for partner location...</p>
          </div>
        )}
      </div>

      {/* Countdown Card */}
      <div className="bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl">
        <div className="flex items-center gap-2 mb-4 text-accent-amber/80 text-xs font-bold uppercase tracking-widest">
          <Timer className="w-4 h-4" />
          <span>Next Meeting</span>
        </div>
        
        {timeLeft ? (
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { val: timeLeft.d, label: 'Days' },
              { val: timeLeft.h, label: 'Hours' },
              { val: timeLeft.m, label: 'Mins' },
              { val: timeLeft.s, label: 'Secs' }
            ].map((t) => (
              <div key={t.label} className="flex flex-col">
                <span className="text-3xl font-serif">{String(t.val).padStart(2, '0')}</span>
                <span className="text-[10px] text-white/40 uppercase">{t.label}</span>
              </div>
            ))}
          </div>
        ) : targetDate && new Date(targetDate).getTime() < Date.now() ? (
          <div className="text-center py-2">
            <p className="text-accent-coral font-serif text-xl italic">You should be together right now! ❤️</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-white/40 text-sm">No meeting set yet.</p>
            <input 
              type="datetime-local" 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm"
              onChange={(e) => updateTargetDate(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <p className="text-[10px] text-white/40 uppercase mb-2">Travel Estimates</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Car</span>
              <span>{travelTimes ? formatTime(travelTimes.car) : '--'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Train</span>
              <span>{travelTimes ? formatTime(travelTimes.train) : '--'}</span>
            </div>
          </div>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <p className="text-[10px] text-white/40 uppercase mb-2">Presence</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              <span>You</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${partner ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-white/20'}`}></div>
              <span>Partner</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-auto text-center space-y-1">
        <p className="text-[10px] text-white/20 italic">
          {partner?.lastUpdated ? `Partner location updated ${Math.round((Date.now() - partner.lastUpdated) / 1000 / 60)} min ago` : 'Waiting for partner...'}
        </p>
      </div>
    </div>
  );
};

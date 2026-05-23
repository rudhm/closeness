import { useStore } from './store/useStore';
import { JoinScreen } from './components/JoinScreen';
import { Dashboard } from './components/Dashboard';

function App() {
  const { roomCode } = useStore();

  return (
    <div className="min-h-screen bg-background text-white selection:bg-accent-coral/30">
      {roomCode ? <Dashboard /> : <JoinScreen />}
    </div>
  );
}

export default App;

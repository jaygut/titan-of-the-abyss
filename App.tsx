import React, { useState, useEffect, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import CausticsLayer from './components/CausticsLayer';
import Controls from './components/Controls';
import { soundService } from './utils/soundService';
import { SoundType, CreatureType } from './types';

const App: React.FC = () => {
  const [score, setScore] = useState(0);
  const [isRoaring, setIsRoaring] = useState(false);
  const [bioluminescence, setBioluminescence] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [creatureType, setCreatureType] = useState<CreatureType>(CreatureType.MOSASAUR);

  // Initialize Audio on first interaction
  const startGame = () => {
    soundService.resume();
    setGameStarted(true);
  };

  const handleRoar = useCallback(() => {
    if (isRoaring) return;
    setIsRoaring(true);
    soundService.play(SoundType.ROAR);
    
    // Screen shake effect handled in CSS classes on the container
    setTimeout(() => {
      setIsRoaring(false);
    }, 1500); // Roar duration
  }, [isRoaring]);

  const handleSonar = useCallback(() => {
    soundService.play(SoundType.SONAR);
  }, []);

  const handleToggleBio = useCallback(() => {
    setBioluminescence(prev => !prev);
    // soundService.play(SoundType.SWITCH); // Optional
  }, []);

  const handleMutate = useCallback(() => {
    setCreatureType(prev => prev === CreatureType.MOSASAUR ? CreatureType.KAIJU : CreatureType.MOSASAUR);
    soundService.play(SoundType.ROAR); // Roar on transform
  }, []);

  const handleScoreUpdate = useCallback((points: number) => {
    setScore(prev => prev + points);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans select-none">
      
      {/* Background Gradient (The Deep) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#00111a] via-[#000508] to-black z-0" />
      
      {/* Caustics Effect */}
      <CausticsLayer />

      {/* Start Screen */}
      {!gameStarted && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center p-8 border border-cyan-500/30 bg-[#001220] rounded-3xl max-w-md shadow-[0_0_50px_rgba(0,200,255,0.2)]">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-blue-700 mb-4 tracking-tighter filter drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
              TITAN
            </h1>
            <h2 className="text-2xl text-blue-200 mb-8 font-light tracking-widest">OF THE ABYSS</h2>
            <p className="text-gray-400 mb-8 text-lg">
              Move your mouse to swim.<br/>
              Press <span className="text-white font-bold">ROAR</span> to scare prey.<br/>
              Eat the glowing fish.
            </p>
            <button 
              onClick={startGame}
              className="px-12 py-4 bg-cyan-600 hover:bg-cyan-500 text-white text-2xl font-bold rounded-full transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(0,255,255,0.6)]"
            >
              DIVE IN
            </button>
          </div>
        </div>
      )}

      {/* Game Content */}
      <div className={`transition-transform duration-100 ${isRoaring ? 'animate-[shake_0.5s_ease-in-out_infinite]' : ''}`}>
        <GameCanvas 
          onScoreUpdate={handleScoreUpdate}
          isRoaring={isRoaring}
          bioluminescence={bioluminescence}
          creatureType={creatureType}
        />
      </div>

      {/* Vignette Overlay for atmosphere */}
      <div className="absolute inset-0 pointer-events-none z-20 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

      {/* UI Controls */}
      {gameStarted && (
        <Controls 
          onRoar={handleRoar}
          onToggleBio={handleToggleBio}
          onSonar={handleSonar}
          onMutate={handleMutate}
          isRoaring={isRoaring}
          bioluminescence={bioluminescence}
          score={score}
          creatureType={creatureType}
        />
      )}

      {/* CSS for Shake Animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-5px, 5px) rotate(-1deg); }
          50% { transform: translate(5px, -5px) rotate(1deg); }
          75% { transform: translate(-5px, -5px) rotate(-1deg); }
        }
      `}</style>
    </div>
  );
};

export default App;
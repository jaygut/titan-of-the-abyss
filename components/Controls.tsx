import React from 'react';
import { Circle, Zap, Waves } from 'lucide-react';

interface ControlsProps {
  onRoar: () => void;
  onToggleBio: () => void;
  onSonar: () => void;
  isRoaring: boolean;
  bioluminescence: boolean;
  score: number;
}

const Controls: React.FC<ControlsProps> = ({ 
  onRoar, 
  onToggleBio, 
  onSonar,
  isRoaring, 
  bioluminescence, 
  score 
}) => {
  return (
    <div className="absolute bottom-8 left-0 right-0 flex justify-center items-end gap-6 pointer-events-none z-50 pb-safe">
      
      {/* Sonar Button */}
      <button
        onPointerDown={onSonar}
        className="pointer-events-auto bg-blue-900/80 backdrop-blur-sm border-4 border-blue-400 rounded-full p-6 transition-all active:scale-95 shadow-[0_0_30px_rgba(0,100,255,0.5)] group"
      >
        <Waves className="w-12 h-12 text-blue-200 group-hover:animate-pulse" />
        <span className="sr-only">Sonar</span>
      </button>

      {/* Roar Button (Main Action) */}
      <button
        onPointerDown={onRoar}
        className={`pointer-events-auto transition-all transform active:scale-90 ${
          isRoaring 
            ? 'bg-red-600 border-red-400 scale-110 shadow-[0_0_50px_rgba(255,0,0,0.8)]' 
            : 'bg-red-900/80 border-red-500 shadow-[0_0_30px_rgba(255,0,0,0.4)]'
        } backdrop-blur-md border-8 rounded-full p-8 mb-4`}
      >
        <div className="flex flex-col items-center">
            {/* Simple mouth icon */}
            <div className={`w-16 h-8 border-t-8 border-white rounded-t-full transition-all duration-75 ${isRoaring ? 'h-16 rounded-b-full border-b-8 mb-2' : ''}`}></div>
            <span className="text-white font-black text-xl tracking-widest uppercase">ROAR</span>
        </div>
      </button>

      {/* Bioluminescence Toggle */}
      <button
        onPointerDown={onToggleBio}
        className={`pointer-events-auto backdrop-blur-sm border-4 rounded-full p-6 transition-all active:scale-95 shadow-lg group ${
          bioluminescence 
            ? 'bg-cyan-500/80 border-white shadow-[0_0_40px_rgba(0,255,255,0.6)]' 
            : 'bg-gray-900/80 border-gray-500'
        }`}
      >
        <Zap className={`w-12 h-12 ${bioluminescence ? 'text-white fill-current' : 'text-gray-400'}`} />
        <span className="sr-only">Light</span>
      </button>

      {/* Score Display (Floating) */}
      <div className="absolute top-[-80vh] right-8 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
          <p className="text-cyan-400 text-sm font-bold uppercase tracking-wider">Biomass Consumed</p>
          <p className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">{score}</p>
        </div>
      </div>

    </div>
  );
};

export default Controls;
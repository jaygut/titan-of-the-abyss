import React from 'react';
import { Circle, Zap, Waves, Dna } from 'lucide-react';
import { CreatureType } from '../types';

interface ControlsProps {
  onRoar: () => void;
  onToggleBio: () => void;
  onSonar: () => void;
  onMutate: () => void;
  isRoaring: boolean;
  bioluminescence: boolean;
  score: number;
  creatureType: CreatureType;
}

const Controls: React.FC<ControlsProps> = ({ 
  onRoar, 
  onToggleBio, 
  onSonar,
  onMutate,
  isRoaring, 
  bioluminescence, 
  score,
  creatureType
}) => {
  return (
    <div className="absolute bottom-8 left-0 right-0 flex justify-center items-end gap-6 pointer-events-none z-50 pb-safe px-4">
      
      {/* Sonar Button */}
      <button
        onPointerDown={onSonar}
        className="pointer-events-auto bg-blue-900/80 backdrop-blur-sm border-4 border-blue-400 rounded-full p-4 lg:p-6 transition-all active:scale-95 shadow-[0_0_30px_rgba(0,100,255,0.5)] group"
        title="Sonar"
      >
        <Waves className="w-8 h-8 lg:w-12 lg:h-12 text-blue-200 group-hover:animate-pulse" />
      </button>

      {/* Mutate Button */}
      <button
        onPointerDown={onMutate}
        className="pointer-events-auto bg-purple-900/80 backdrop-blur-sm border-4 border-purple-400 rounded-full p-4 lg:p-6 transition-all active:scale-95 shadow-[0_0_30px_rgba(150,0,255,0.5)] group"
        title="Mutate"
      >
        <Dna className={`w-8 h-8 lg:w-12 lg:h-12 ${creatureType === CreatureType.KAIJU ? 'text-green-400' : 'text-purple-200'} group-hover:spin`} />
      </button>

      {/* Roar Button (Main Action) */}
      <button
        onPointerDown={onRoar}
        className={`pointer-events-auto transition-all transform active:scale-90 ${
          isRoaring 
            ? 'bg-red-600 border-red-400 scale-110 shadow-[0_0_50px_rgba(255,0,0,0.8)]' 
            : 'bg-red-900/80 border-red-500 shadow-[0_0_30px_rgba(255,0,0,0.4)]'
        } backdrop-blur-md border-8 rounded-full p-6 lg:p-8 mb-4`}
      >
        <div className="flex flex-col items-center">
            {/* Simple mouth icon */}
            <div className={`w-12 h-6 lg:w-16 lg:h-8 border-t-8 border-white rounded-t-full transition-all duration-75 ${isRoaring ? 'h-12 lg:h-16 rounded-b-full border-b-8 mb-2' : ''}`}></div>
            <span className="text-white font-black text-sm lg:text-xl tracking-widest uppercase mt-2">ROAR</span>
        </div>
      </button>

      {/* Bioluminescence Toggle */}
      <button
        onPointerDown={onToggleBio}
        className={`pointer-events-auto backdrop-blur-sm border-4 rounded-full p-4 lg:p-6 transition-all active:scale-95 shadow-lg group ${
          bioluminescence 
            ? 'bg-cyan-500/80 border-white shadow-[0_0_40px_rgba(0,255,255,0.6)]' 
            : 'bg-gray-900/80 border-gray-500'
        }`}
        title="Toggle Light"
      >
        <Zap className={`w-8 h-8 lg:w-12 lg:h-12 ${bioluminescence ? 'text-white fill-current' : 'text-gray-400'}`} />
      </button>

      {/* Score Display (Floating) */}
      <div className="absolute top-[-80vh] right-4 lg:right-8 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
          <p className="text-cyan-400 text-xs lg:text-sm font-bold uppercase tracking-wider">Biomass Consumed</p>
          <p className="text-4xl lg:text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">{score}</p>
        </div>
      </div>

    </div>
  );
};

export default Controls;
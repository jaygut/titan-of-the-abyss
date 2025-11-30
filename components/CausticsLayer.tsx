import React from 'react';

const CausticsLayer: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 opacity-30 mix-blend-overlay">
      {/* Simulation of light rays using CSS gradients and transforms */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-teal-500/20 to-transparent"
        style={{
          backgroundSize: '200% 200%',
          animation: 'drift 8s infinite ease-in-out alternate'
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.1) 0%, transparent 60%)',
        }}
      />
    </div>
  );
};

export default CausticsLayer;
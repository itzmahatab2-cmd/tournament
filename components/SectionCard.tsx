import React from 'react';

interface SectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  isActive?: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, description, children, isActive = false }) => {
  return (
    <div className={`relative mb-6 transition-all duration-300 group ${isActive ? 'scale-[1.01]' : 'opacity-90 hover:opacity-100'}`}>
      {/* Background glow for active state */}
      {isActive && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-primary to-cyber-accent rounded-lg blur opacity-30 animate-pulse transition duration-1000"></div>
      )}
      
      <div className={`relative bg-slate-900/80 backdrop-blur-md border ${isActive ? 'border-cyber-primary/50' : 'border-slate-700/50'} p-6 sm:p-8 rounded-lg overflow-hidden`}>
        {/* Scanline effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-700/50 pb-3">
            <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-cyber-primary shadow-[0_0_10px_#8b5cf6]' : 'bg-slate-600'}`}></div>
            <h2 className="text-xl font-display font-bold uppercase tracking-wider text-gray-100">
              {title}
            </h2>
          </div>
          
          {description && <p className="text-sm font-tech text-cyan-400/80 mb-6">{`>> ${description}`}</p>}
          
          <div className="mt-4">
              {children}
          </div>
        </div>
      </div>
    </div>
  );
};
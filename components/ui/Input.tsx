import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, error, required, className = '', ...props }) => {
  return (
    <div className={`mb-6 group ${className}`}>
      <label className="block text-xs font-tech font-bold text-cyber-accent uppercase tracking-wider mb-2 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          className={`w-full bg-slate-900/50 border border-slate-700 text-gray-100 px-4 py-3 rounded-none clip-corner
          focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary focus:outline-none focus:bg-slate-900/80
          placeholder-gray-600 transition-all duration-300 font-tech tracking-wide
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'hover:border-slate-500'}`}
          {...props}
        />
        {/* Decorative corner accent */}
        <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r transition-colors duration-300 ${error ? 'border-red-500' : 'border-slate-500 group-hover:border-cyber-primary'}`}></div>
        <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l transition-colors duration-300 ${error ? 'border-red-500' : 'border-slate-500 group-hover:border-cyber-primary'}`}></div>
      </div>
      
      {error && <p className="mt-2 text-xs text-red-400 font-tech flex items-center animate-pulse">
        <span className="mr-1">⚠</span> {error}
      </p>}
      
      <style>{`
        .clip-corner {
          clip-path: polygon(
            0 0, 
            100% 0, 
            100% calc(100% - 10px), 
            calc(100% - 10px) 100%, 
            0 100%
          );
        }
      `}</style>
    </div>
  );
};
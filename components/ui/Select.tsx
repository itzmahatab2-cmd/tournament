import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
  error?: string;
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({ label, options, error, required, ...props }) => {
  return (
    <div className="mb-6 group">
      <label className="block text-xs font-tech font-bold text-cyber-accent uppercase tracking-wider mb-2 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          className={`w-full appearance-none bg-slate-900/50 border border-slate-700 text-gray-100 px-4 py-3 pr-10 rounded-none
          focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary focus:outline-none focus:bg-slate-900/80
          transition-all duration-300 font-tech tracking-wide
          ${error ? 'border-red-500' : 'hover:border-slate-500'}`}
          {...props}
        >
          <option value="" disabled className="bg-slate-900 text-gray-500">SELECT OPTION_</option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-slate-900 text-gray-100">
              {opt.toUpperCase()}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-cyber-primary">
          <ChevronDown className="h-5 w-5" />
        </div>
        
        {/* Decorative corner accent */}
        <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 transition-colors duration-300 ${error ? 'border-red-500' : 'border-slate-600 group-hover:border-cyber-primary'}`}></div>
      </div>
       {error && <p className="mt-2 text-xs text-red-400 font-tech flex items-center animate-pulse">
        <span className="mr-1">⚠</span> {error}
      </p>}
    </div>
  );
};
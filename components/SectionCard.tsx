import React from 'react';

interface SectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  isActive?: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, description, children, isActive = false }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 mb-4 overflow-hidden relative transition-all duration-200 ${isActive ? 'ring-2 ring-purple-100' : ''}`}>
      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 z-10"></div>}
      <div className="p-6">
        <h2 className="text-xl text-gray-800 mb-2">{title}</h2>
        {description && <p className="text-sm text-gray-500 mb-6">{description}</p>}
        <div className="mt-4">
            {children}
        </div>
      </div>
    </div>
  );
};
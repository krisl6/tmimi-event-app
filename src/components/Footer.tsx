import React from 'react';
import { DollarSign } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <DollarSign size={24} className="text-primary" />
            <span className="text-xl font-bold">Tmimi</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 Tmimi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

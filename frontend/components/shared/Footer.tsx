import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 text-center text-sm text-gray-500 dark:text-gray-400 mt-auto">
      <p>&copy; {currentYear} Ricoh Workshop Portal. All rights reserved.</p>
    </footer>
  );
};

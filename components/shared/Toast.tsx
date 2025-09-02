

import React, { useEffect } from 'react';
import { Icon } from './Icon';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const baseClasses = 'fixed top-4 right-4 left-4 sm:left-auto sm:w-full sm:max-w-sm p-4 rounded-lg shadow-lg flex items-center space-x-3 z-50';
  
  const typeClasses = {
    success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    error: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    info: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  };

  const iconMap: Record<ToastType, React.ReactNode> = {
      success: <Icon name="success" className="h-6 w-6 text-green-500" />,
      error: <Icon name="error" className="h-6 w-6 text-red-500" />,
      info: <Icon name="info" className="h-6 w-6 text-blue-500" />,
  }

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <div>{iconMap[type]}</div>
      <div className="flex-1 font-medium">{message}</div>
      <button onClick={onClose} className="p-1 rounded-md hover:bg-white/20">
        <Icon name="error" className="h-5 w-5" />
      </button>
    </div>
  );
};
import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => {
    const id = useId();
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <div className="mt-1">
          <input
            id={id}
            ref={ref}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            {...props}
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
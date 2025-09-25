// src/components/shared/Button.tsx

import React from 'react'
import { Icon, IconName } from './Icon'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'view' | 'collected'
  size?: 'sm' | 'base'
  isLoading?: boolean
  icon?: IconName
  iconPosition?: 'left' | 'right'
  className?: string
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'base',
  isLoading = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center border border-transparent font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'

  const variantClasses: Record<ButtonProps['variant'], string> = {
    primary:
      'text-white bg-brand-secondary hover:bg-brand-primary focus:ring-brand-secondary',
    secondary:
      'text-brand-primary bg-transparent border border-brand-primary hover:bg-brand-light focus:ring-brand-primary dark:text-brand-tertiary dark:border-brand-tertiary dark:hover:bg-brand-tertiary/20',
    danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500',
    view: 'text-indigo-800 bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-100',
    collected:
      'text-green-800 bg-green-100 hover:bg-green-200 focus:ring-green-100',
  }

  const sizeClasses: Record<ButtonProps['size'], string> = {
    base: 'px-4 py-2 text-sm',
    sm: 'px-3 py-1.5 text-xs',
  }

  const spinner = (
    <svg
      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )

  const iconSizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  const iconNode = icon && <Icon name={icon} className={iconSizeClass} />

  return (
    <button
      {...props}
      disabled={isLoading || disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        className || ''
      }`}
    >
      {isLoading && spinner}

      {icon && iconPosition === 'left' && !isLoading && (
        <span className={children ? 'mr-2' : ''}>{iconNode}</span>
      )}

      {children}

      {icon && iconPosition === 'right' && !isLoading && (
        <span className={children ? 'ml-2' : ''}>{iconNode}</span>
      )}
    </button>
  )
}

export default Button
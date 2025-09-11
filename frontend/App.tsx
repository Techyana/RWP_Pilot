// src/App.tsx

import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { Login } from './components/auth/Login'
import { Registration } from './components/auth/Registration'
import SetPasswordModal from './components/auth/SetPasswordModal'
import { EngineerDashboard } from './components/dashboard/EngineerDashboard'
import { AdminDashboard } from './components/dashboard/AdminDashboard'
import { Role } from './types'
import { Logo } from './components/shared/Logo'

// a simple SVG background for the auth pages
const AuthIllustration: React.FC = () => (
  <svg viewBox="0 0 400 200" className="w-full h-auto" aria-hidden="true">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="rgba(211,29,63,0.1)" />
        <stop offset="100%" stopColor="rgba(211,29,63,0.3)" />
      </linearGradient>
      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgb(211,29,63)" />
        <stop offset="100%" stopColor="rgb(178,24,53)" />
      </linearGradient>
    </defs>
    <rect
      x="0" y="50" width="300" height="150" rx="15"
      fill="url(#grad1)"
    />
    <rect
      x="80" y="0" width="320" height="180" rx="15"
      fill="white"
      className="dark:fill-gray-800"
      stroke="rgba(128,128,128,0.1)"
      strokeWidth="2"
    />
    <circle cx="120" cy="40" r="10" fill="url(#grad2)" />
    <rect
      x="150" y="35" width="150" height="10" rx="5"
      fill="gray"
      className="dark:fill-gray-600 opacity-50"
    />
    <rect
      x="120" y="60" width="220" height="8" rx="4"
      fill="gray"
      className="dark:fill-gray-500 opacity-20"
    />
    <rect
      x="120" y="80" width="180" height="8" rx="4"
      fill="gray"
      className="dark:fill-gray-500 opacity-20"
    />
    <rect
      x="120" y="100" width="220" height="8" rx="4"
      fill="gray"
      className="dark:fill-gray-500 opacity-20"
    />
    <path
      d="M220 120 L340 120 L340 160 L220 160 Z"
      fill="url(#grad2)"
      rx="5"
    />
    <text
      x="280"
      y="145"
      textAnchor="middle"
      fill="white"
      fontSize="18"
      fontWeight="bold"
    >
      OK
    </text>
  </svg>
)

const AuthFlow: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 relative overflow-hidden">
      {/* HEADER */}
      <div className="absolute top-8 text-center z-10">
        <Logo className="h-12 w-auto mx-auto" />
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mt-2">
          Ricoh Workshop Portal
        </h1>
      </div>

      {/* ILLUSTRATION */}
      <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 opacity-30 dark:opacity-20">
        <AuthIllustration />
      </div>

      {/* LOGIN / REGISTER */}
      {isLogin ? (
        <Login onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <Registration onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </div>
  )
}

interface AppContentProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const AppContent: React.FC<AppContentProps> = ({ theme, toggleTheme }) => {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated || !user) {
    return <AuthFlow />
  }

  const dashboardProps = { theme, toggleTheme }

  switch (user.role) {
    case Role.ADMIN:
    case Role.SUPERVISOR:
      return <AdminDashboard {...dashboardProps} />

    case Role.ENGINEER:
    default:
      return <EngineerDashboard {...dashboardProps} />
  }
}

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () =>
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))

  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent theme={theme} toggleTheme={toggleTheme} />
        {/* needs AuthContext for mustChangePassword */}
        <SetPasswordModal />
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
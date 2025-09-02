// src/App.tsx

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Login } from './components/auth/Login';
import { Registration } from './components/auth/Registration';
import { EngineerDashboard } from './components/dashboard/EngineerDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { Role } from './types';
import { Logo } from './components/shared/Logo';
import SetPasswordModal from './components/auth/SetPasswordModal';

// simple SVG background/icon for the login/register views
const AuthIllustration = () => (
  <svg viewBox="0 0 400 200" className="w-full h-auto" aria-hidden="true">
    {/* … your gradients and shapes … */}
  </svg>
);

const AuthFlow: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 relative overflow-hidden">

      {/* Header */}
      <div className="absolute top-8 text-center z-10">
        <Logo className="h-12 w-auto mx-auto" />
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mt-2">
          Ricoh Workshop Portal
        </h1>
      </div>

      {/* Background Illustration */}
      <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 opacity-30 dark:opacity-20">
        <AuthIllustration />
      </div>

      {/* Switch between Login & Registration */}
      {isLoginView ? (
        <Login onSwitchToRegister={() => setIsLoginView(false)} />
      ) : (
        <Registration onSwitchToLogin={() => setIsLoginView(true)} />
      )}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <AuthFlow />;
  }

  const commonProps = {}; // e.g. theme toggle, if you need it here

  // dashboard based on role
  switch (user.role) {
    case Role.ADMIN:
    case Role.SUPERVISOR:
      return <AdminDashboard {...commonProps} />;
    case Role.ENGINEER:
    default:
      return <EngineerDashboard {...commonProps} />;
  }
};

const App: React.FC = () => {
  // optional theme logic…
  const [theme, setTheme] = useState<'light'|'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
        {/* Modal must live inside AuthProvider so it sees user.mustChangePassword */}
        <SetPasswordModal />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
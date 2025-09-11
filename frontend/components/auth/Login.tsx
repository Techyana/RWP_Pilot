// src/components/auth/Login.tsx
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { userApi, MinimalUser } from '../../services/api/userApi';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Toast, ToastType } from '../shared/Toast';
import { HttpError } from '../../services/http';
import { setShowPasswordModal } from './SetPasswordModal';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

interface LoginProps {
  onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async ({ email, password }) => {
    setIsLoading(true);
    setToast(null);
    try {
      // Backend sets cookie, returns minimal user
      const { user } = await userApi.login(email, password); // user: MinimalUser
      login(user);
      if (user.mustChangePassword) {
        setShowPasswordModal(true);
      }
      setToast({ message: 'Login successful! Redirecting...', type: 'success' });
    } catch (err: unknown) {
      if (err instanceof HttpError) {
        if (err.status === 401) {
          setToast({ message: 'Invalid email or password.', type: 'error' });
        } else if (err.status === 403) {
          setToast({
            message: 'Access denied. Not pre-approved or not activated.',
            type: 'error',
          });
        } else if (err.status === 429) {
          setToast({
            message: 'Too many attempts. Please try again later.',
            type: 'error',
          });
        } else {
          setToast({ message: err.message || 'Login failed.', type: 'error' });
        }
      } else {
        setToast({ message: 'An unexpected error occurred.', type: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sign In</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Welcome back to the workshop portal.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
          error={errors.password?.message}
        />
        <div>
          <Button type="submit" className="w-full" isLoading={isLoading} icon="login">
            Sign In
          </Button>
        </div>
      </form>
      <p className="text-sm text-center text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <button
          onClick={onSwitchToRegister}
          className="font-medium text-brand-primary hover:text-brand-secondary"
        >
          Register here
        </button>
      </p>
    </div>
  );
};
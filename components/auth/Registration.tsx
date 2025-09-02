import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../services/api';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Toast, ToastType } from '../shared/Toast';

const registrationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  surname: z.string().min(1, 'Surname is required'),
  email: z.string().email('Invalid email address'),
  rzaNumber: z.string().min(1, 'RZA Number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegistrationFormInputs = z.infer<typeof registrationSchema>;

interface RegistrationProps {
  onSwitchToLogin: () => void;
}

export const Registration: React.FC<RegistrationProps> = ({ onSwitchToLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormInputs>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit: SubmitHandler<RegistrationFormInputs> = async (data) => {
    setIsLoading(true);
    setToast(null);
    try {
      await api.register(data);
      setToast({ message: 'Registration successful! Please log in.', type: 'success' });
      setTimeout(() => onSwitchToLogin(), 2000);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        setToast({ message: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          You must be on the pre-approved list to register.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="First Name" type="text" {...register('name')} error={errors.name?.message} />
        <Input label="Surname" type="text" {...register('surname')} error={errors.surname?.message} />
        <Input label="Email Address" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="RZA Number" type="text" {...register('rzaNumber')} error={errors.rzaNumber?.message} />
        <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
        <Input
          label="Confirm Password"
          type="password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />
        <div>
          <Button type="submit" className="w-full" isLoading={isLoading} icon="register">
            Register
          </Button>
        </div>
      </form>
      <p className="text-sm text-center text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="font-medium text-brand-primary hover:text-brand-secondary">
          Sign in here
        </button>
      </p>
    </div>
  );
};
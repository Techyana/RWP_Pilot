import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../services/api';
import { User, Role } from '../../types';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Toast, ToastType } from '../shared/Toast';

const arrivalSchema = z.object({
  shipmentNumber: z.string().min(1, 'Shipment number is required'),
  partNumber: z.string().min(1, 'Part number is required'),
  engineerId: z.string().min(1, 'Please select an engineer'),
});

type ArrivalFormInputs = z.infer<typeof arrivalSchema>;

interface UploadArrivalsModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const UploadArrivalsModal: React.FC<UploadArrivalsModalProps> = ({ onSuccess, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [engineers, setEngineers] = useState<User[]>([]);

  useEffect(() => {
    const fetchEngineers = async () => {
      const users = await api.getUsers();
      setEngineers(users.filter(u => u.role === Role.ENGINEER));
    };
    fetchEngineers();
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<ArrivalFormInputs>({
    resolver: zodResolver(arrivalSchema),
  });

  const onSubmit: SubmitHandler<ArrivalFormInputs> = async (data) => {
    setIsLoading(true);
    setToast(null);
    try {
      await api.logPartArrival(data);
      setToast({ message: 'Part arrival logged and notification sent!', type: 'success' });
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to log arrival.';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Shipment Number" {...register('shipmentNumber')} error={errors.shipmentNumber?.message} placeholder="e.g. E257616" />
        <Input label="Part Number of Requested Part" {...register('partNumber')} error={errors.partNumber?.message} placeholder="e.g. D0BQ-5601" />
        <div>
            <label htmlFor="engineerId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Assign to Engineer
            </label>
            <select
                id="engineerId"
                {...register('engineerId')}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.engineerId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
            >
                <option value="">Select an engineer...</option>
                {engineers.map(e => (
                    <option key={e.id} value={e.id}>{e.name} {e.surname}</option>
                ))}
            </select>
             {errors.engineerId && <p className="mt-2 text-sm text-red-600">{errors.engineerId.message}</p>}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
            This will find the first part with 'Requested' status matching the Part Number and assign it.
        </p>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isLoading} icon="upload">Log Arrival</Button>
        </div>
      </form>
    </>
  );
};

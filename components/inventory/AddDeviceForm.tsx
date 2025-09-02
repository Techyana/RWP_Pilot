import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../services/api';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Toast, ToastType } from '../shared/Toast';

const deviceSchema = z.object({
  model: z.string().min(1, 'Device model is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
});

type DeviceFormInputs = z.infer<typeof deviceSchema>;

interface AddDeviceFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const AddDeviceForm: React.FC<AddDeviceFormProps> = ({ onSuccess, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<DeviceFormInputs>({
    resolver: zodResolver(deviceSchema),
  });

  const onSubmit: SubmitHandler<DeviceFormInputs> = async (data) => {
    setIsLoading(true);
    setToast(null);
    try {
      await api.addDevice(data);
      setToast({ message: 'Device added successfully!', type: 'success' });
      onSuccess();
    } catch (error) {
      setToast({ message: 'Failed to add device.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Device Model" {...register('model')} error={errors.model?.message} />
        <Input label="Serial Number" {...register('serialNumber')} error={errors.serialNumber?.message} />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>Add Device</Button>
        </div>
      </form>
    </>
  );
};
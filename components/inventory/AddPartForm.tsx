import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../services/api';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Toast, ToastType } from '../shared/Toast';

const partSchema = z.object({
  name: z.string().min(1, 'Part name is required'),
  partNumber: z.string().min(1, 'Part number is required'),
  forDeviceModels: z.string().min(1, 'Compatible models are required'),
  quantity: z.coerce.number({ invalid_type_error: 'Quantity must be a number' }).min(1, 'Quantity must be at least 1'),
});

type PartFormInputs = z.infer<typeof partSchema>;

interface AddPartFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const AddPartForm: React.FC<AddPartFormProps> = ({ onSuccess, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<PartFormInputs>({
    resolver: zodResolver(partSchema),
  });

  const onSubmit: SubmitHandler<PartFormInputs> = async (data) => {
    setIsLoading(true);
    setToast(null);
    try {
      const partPromises = [];
      for (let i = 0; i < data.quantity; i++) {
        partPromises.push(api.addPart({
          name: data.name,
          partNumber: data.partNumber,
          forDeviceModels: data.forDeviceModels.split(',').map(s => s.trim()),
        }));
      }
      await Promise.all(partPromises);
      
      setToast({ message: 'Part(s) added successfully!', type: 'success' });
      onSuccess();
    } catch (error) {
      setToast({ message: 'Failed to add parts.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Part Name" {...register('name')} error={errors.name?.message} />
        <Input label="Part Number" {...register('partNumber')} error={errors.partNumber?.message} />
        <Input label="Compatible Models (comma-separated)" {...register('forDeviceModels')} error={errors.forDeviceModels?.message} placeholder="e.g. Model A, Model B" />
        <Input label="Quantity" type="number" {...register('quantity')} error={errors.quantity?.message} />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>Add Parts</Button>
        </div>
      </form>
    </>
  );
};
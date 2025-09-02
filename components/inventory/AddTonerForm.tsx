import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../services/api';
import { TonerColor } from '../../types';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Toast, ToastType } from '../shared/Toast';

const tonerSchema = z.object({
    model: z.string().min(1, 'Model name is required'),
    edpCode: z.string().min(1, 'EDP Code is required'),
    color: z.nativeEnum(TonerColor),
    yield: z.coerce.number({invalid_type_error: 'Yield must be a number.'}).min(1, 'Yield is required'),
    stock: z.coerce.number({invalid_type_error: 'Stock must be a number.'}).min(0, 'Stock cannot be negative'),
    forDeviceModels: z.string().min(1, 'Compatible models are required'),
});

type TonerFormInputs = z.infer<typeof tonerSchema>;

interface AddTonerFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const AddTonerForm: React.FC<AddTonerFormProps> = ({ onSuccess, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<TonerFormInputs>({
    resolver: zodResolver(tonerSchema),
  });

  const onSubmit: SubmitHandler<TonerFormInputs> = async (data) => {
    setIsLoading(true);
    setToast(null);
    try {
      await api.addToner({ ...data, forDeviceModels: data.forDeviceModels.split(',').map(s => s.trim()) });
      setToast({ message: 'Toner added successfully!', type: 'success' });
      onSuccess();
    } catch (error) {
      setToast({ message: 'Failed to add toner.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <Input label="Model Name" {...register('model')} error={errors.model?.message} />
               <Input label="EDP Code" {...register('edpCode')} error={errors.edpCode?.message} />
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
                  <select {...register('color')} className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      {Object.values(TonerColor).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
               <Input label="Page Yield" type="number" {...register('yield')} error={errors.yield?.message} />
               <Input label="Initial Stock" type="number" {...register('stock')} error={errors.stock?.message} />
               <Input label="Compatible Models (comma-separated)" {...register('forDeviceModels')} error={errors.forDeviceModels?.message} className="sm:col-span-2" placeholder="e.g. Model A, Model B" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit" isLoading={isLoading}>Save Toner</Button>
          </div>
      </form>
    </>
  );
};
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { tonerApi } from '../../services/api/tonerApi';
import { TonerColor } from '../../types';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Toast, ToastType } from '../shared/Toast';

const tonerSchema = z.object({
  edpCode: z.string().min(1, 'EDP Code is required'),
  model: z.string().min(1, 'Device Model is required'),
  color: z.nativeEnum(TonerColor),
  forDeviceModels: z.string().min(1, 'Compatible models are required'),
  yield: z.coerce.number({ error: 'Yield must be a number.' }).min(1, 'Yield must be positive').optional(),
  quantity: z.coerce.number({ error: 'Quantity must be a number.' }).min(1, 'Quantity is required'),
  from: z.string().min(1, 'Location or Client Name is required'),
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
      await tonerApi.addToner({
        edpCode: data.edpCode,
        model: data.model,
        color: data.color,
        forDeviceModels: data.forDeviceModels.split(',').map(s => s.trim()),
        yield: data.yield,
        stock: data.quantity,
        from: data.from,
      });
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
          <Input label="EDP Code" {...register('edpCode')} error={errors.edpCode?.message} />
          <Input label="Device Model" {...register('model')} error={errors.model?.message} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
            <select
              {...register('color')}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {Object.values(TonerColor).map(c => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Black for mono devices, all 4 colors for color copiers.
            </p>
          </div>
          <Input
            label="Compatible Models (comma-separated)"
            {...register('forDeviceModels')}
            error={errors.forDeviceModels?.message}
            placeholder="e.g. MP 2014, IM C3000, SP 230DNw"
          />
          <Input
            label="Page Yield (optional)"
            type="number"
            {...register('yield')}
            error={errors.yield?.message}
          />
          <Input
            label="Quantity"
            type="number"
            {...register('quantity')}
            error={errors.quantity?.message}
          />
          <Input
            label="From (Location or Client Name)"
            {...register('from')}
            error={errors.from?.message}
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>Save Toner</Button>
        </div>
      </form>
    </>
  );
};
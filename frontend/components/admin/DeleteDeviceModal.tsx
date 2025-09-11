import React, { useState } from 'react';
import { Device } from '../../types';
import { api } from '../../services/api';
import { Button } from '../shared/Button';
import { Toast, ToastType } from '../shared/Toast';

interface DeleteDeviceModalProps {
  device: Device | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteDeviceModal: React.FC<DeleteDeviceModalProps> = ({ device, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  if (!device) return null;

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Reason for removal is required.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await api.deleteDevice(device.id, reason);
      setToast({ message: 'Device removed successfully!', type: 'success' });
      onSuccess();
    } catch (err) {
      setToast({ message: 'Failed to remove device.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to mark this device as removed? This action cannot be undone. 
            Please provide a reason below.
        </p>
        <div>
            <label htmlFor="removalReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Reason for Removal
            </label>
            <textarea
                id="removalReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="e.g., Fully stripped and scrapped."
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="button" variant="danger" isLoading={isLoading} onClick={handleSubmit}>
            Confirm Removal
          </Button>
        </div>
      </div>
    </>
  );
};
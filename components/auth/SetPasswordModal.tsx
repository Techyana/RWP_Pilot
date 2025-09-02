// src/components/auth/SetPasswordModal.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

let externalSetShowPasswordModal: (show: boolean) => void = () => {};

export const setShowPasswordModal = (show: boolean) => {
  externalSetShowPasswordModal(show);
};

const SetPasswordModal: React.FC = () => {
  const { user, updatePassword } = useAuth();
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // bind external setter once
  useEffect(() => {
    externalSetShowPasswordModal = setShow;
    return () => {
      externalSetShowPasswordModal = () => {};
    };
  }, []);

  // pop the modal if backend demands it
  useEffect(() => {
    setShow(!!user?.mustChangePassword);
  }, [user]);

  // lock scroll when open
  useEffect(() => {
    document.body.style.overflow = show ? 'hidden' : '';
  }, [show]);

  if (!show || !user) return null;

  const isStrongPassword = (pw: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(pw);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || !passwordConfirm) {
      setError('Please fill in both fields.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!isStrongPassword(password)) {
      setError(
        'Password must be at least 8 characters, include uppercase, lowercase, number, and special character.'
      );
      return;
    }

    try {
      setLoading(true);
      await updatePassword(password, passwordConfirm);
      // on success, updatePassword() already clears mustChangePassword,
      // so we just close and reset locally:
      setShow(false);
      setPassword('');
      setPasswordConfirm('');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to update password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
          Set Your New Password
        </h2>
        <p className="text-sm mb-4 text-gray-600 dark:text-gray-300">
          Please set a new password before continuing.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoFocus
            className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            disabled={loading}
            className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetPasswordModal;
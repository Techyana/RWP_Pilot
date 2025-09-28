import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Toner, TonerColor, User } from '../../types';
import { tonerApi } from '../../services/api/tonerApi';
import { DashboardCard } from '../dashboard/shared/DashboardCard';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { Toast, ToastType } from '../shared/Toast';
import { Modal } from '../shared/Modal';
import { AddTonerForm } from './AddTonerForm';

interface TonerInventoryProps {
  isAdmin: boolean;
  user?: User;
}

const ColorBadge: React.FC<{ color: TonerColor }> = ({ color }) => {
  const colorClasses = {
    [TonerColor.BLACK]: 'bg-gray-800 text-white',
    [TonerColor.CYAN]: 'bg-cyan-500 text-white',
    [TonerColor.MAGENTA]: 'bg-pink-500 text-white',
    [TonerColor.YELLOW]: 'bg-yellow-400 text-black',
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClasses[color]}`}>
      {color}
    </span>
  );
};

export const TonerInventory: React.FC<TonerInventoryProps> = ({ isAdmin, user }) => {
  const [toners, setToners] = useState<Toner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [view, setView] = useState<'available' | 'claims' | 'collections'>('available');
  const [claimTxs, setClaimTxs] = useState<any[]>([]);
  const [collectionTxs, setCollectionTxs] = useState<any[]>([]);

  // Ensure modal opens when button is clicked
  const handleOpenAddModal = () => setShowAddModal(true);
  // Fetch all toners and transactions from backend
  const fetchTonersAndTxs = async () => {
    setIsLoading(true);
    try {
      const [tonerData, claimTxData, collectionTxData] = await Promise.all([
        tonerApi.getToners(),
        tonerApi.getRecentTransactions(12),
        tonerApi.getRecentCollections(12),
      ]);
      setToners(tonerData);
      setClaimTxs(claimTxData);
      setCollectionTxs(collectionTxData);
    } catch (error) {
      setToast({ message: 'Failed to load toners.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTonersAndTxs();
    // eslint-disable-next-line
  }, [view]);

  // Filtered items for current view using transaction endpoints
  const filteredToners = useMemo(() => {
    let items: Toner[] = [];
    if (view === 'available') {
      // Show all toners with stock > 0 and not claimed/collected
      items = toners.filter(t => t.stock > 0 && !t.claimedByName && !t.collectedAt);
    } else if (view === 'claims') {
      // Use claim transactions for claims view
      if (isAdmin) {
        items = claimTxs
          .filter(tx => tx.type === 'CLAIM')
          .map(tx => ({
            ...tx.toner,
            claimedByName: tx.user?.name,
            claimedAt: tx.createdAt,
          }));
      } else if (user) {
        items = claimTxs
          .filter(tx => tx.type === 'CLAIM' && tx.user?.name === user.name)
          .map(tx => ({
            ...tx.toner,
            claimedByName: tx.user?.name,
            claimedAt: tx.createdAt,
          }));
      }
    } else if (view === 'collections') {
      // Use collection transactions for collections view
      if (isAdmin) {
        items = collectionTxs
          .filter(tx => tx.type === 'COLLECT')
          .map(tx => ({
            ...tx.toner,
            collectedByName: tx.user?.name,
            collectedAt: tx.createdAt,
          }));
      } else if (user) {
        items = collectionTxs
          .filter(tx => tx.type === 'COLLECT' && tx.user?.name === user.name)
          .map(tx => ({
            ...tx.toner,
            collectedByName: tx.user?.name,
            collectedAt: tx.createdAt,
          }));
      }
    }
    if (!search) return items;
    return items.filter(
      t =>
        t.model.toLowerCase().includes(search.toLowerCase()) ||
        t.edpCode.toLowerCase().includes(search.toLowerCase())
    );
  }, [toners, claimTxs, collectionTxs, view, search, isAdmin, user]);

  const handleTonerAdded = () => {
    fetchTonersAndTxs();
    setShowAddModal(false);
  };

  // Placeholder actions for claim/collect
  const handleClaim = async (toner: Toner) => {
    setToast({ message: `Claiming ${toner.model}…`, type: 'info' });
    try {
      await tonerApi.claimToner(toner.id, user!, '', '');
      setToast({ message: 'Claim successful!', type: 'success' });
      fetchTonersAndTxs();
    } catch (error) {
      setToast({ message: 'Claim failed!', type: 'error' });
    }
  };

  const handleConfirmCollection = async (toner: Toner) => {
    setToast({ message: `Confirming collection for ${toner.model}…`, type: 'info' });
    try {
      await tonerApi.collectToner(toner.id, user!);
      setToast({ message: 'Collection confirmed!', type: 'success' });
      fetchTonersAndTxs();
    } catch (error) {
      setToast({ message: 'Collection failed!', type: 'error' });
    }
  };

  // Render actions for InventoryList (align with part inventory)
  const renderTonerActions = useCallback(
    (toner: Toner) => {
      if (isAdmin) return null;
      if (view === 'available') {
        return (
          <div className="flex justify-end w-full">
            <Button onClick={() => handleClaim(toner)} size="sm" icon="claim">Claim</Button>
          </div>
        );
      }
      if (view === 'collections') {
        if (toner.claimedByName === user?.name && toner.claimedAt && !toner.collectedAt) {
          return (
            <Button onClick={() => handleConfirmCollection(toner)} size="sm" icon="check" variant="primary">Confirm Collection</Button>
          );
        } else if (toner.collectedAt && toner.collectedByName === user?.name) {
          return (
            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
              COLLECTED
            </span>
          );
        }
      }
      return null;
    },
    [view, isAdmin, user]
  );

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {isAdmin && (
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Toner">
          <AddTonerForm onSuccess={handleTonerAdded} onClose={() => setShowAddModal(false)} />
        </Modal>
      )}

      <DashboardCard
        title="Toner Inventory"
        icon="toner"
        headerContent={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={view === 'available' ? 'primary' : 'secondary'}
              icon="view"
              onClick={() => setView('available')}
              aria-label="Available Toners"
            />
            <Button
              size="sm"
              variant={view === 'claims' ? 'primary' : 'secondary'}
              icon="clipboard"
              onClick={() => setView('claims')}
              aria-label="My Toner Claims"
            />
            <Button
              size="sm"
              variant={view === 'collections' ? 'primary' : 'secondary'}
              icon="collected"
              onClick={() => setView('collections')}
              aria-label="Toner Collections"
            />
            {isAdmin && (
              <Button onClick={handleOpenAddModal} size="sm" icon="add">
                Add Toner
              </Button>
            )}
          </div>
        }
      >
        <div className="mt-4">
          <Input
            label="Search by model or EDP Code"
            type="search"
            placeholder="e.g., 841817"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {isLoading ? (
          <p className="text-center py-4 text-gray-500 dark:text-gray-400">Loading...</p>
        ) : (
          <ul className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-2">
            {filteredToners.length > 0 ? (
              filteredToners.map(toner => (
                <li
                  key={toner.id}
                  className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center"
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{toner.model}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">EDP Code: {toner.edpCode}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Yield: {toner.yield?.toLocaleString?.() ?? ''}</p>
                    {toner.claimedByName && (
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Claimed by: <span className="font-medium">{toner.claimedByName}</span>
                        {toner.claimedAt && (
                          <span className="ml-2 text-gray-500">at {new Date(toner.claimedAt).toLocaleString()}</span>
                        )}
                      </p>
                    )}
                    {toner.collectedAt && (
                      <span className="font-medium text-green-700">
                        Collected{toner.collectedAt && ` at ${new Date(toner.collectedAt).toLocaleString()}`}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900 dark:text-white">{toner.stock}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">in stock</p>
                    <ColorBadge color={toner.color} />
                  </div>
                  <div className="mt-2 sm:mt-0 sm:ml-4">{renderTonerActions(toner)}</div>
                </li>
              ))
            ) : (
              <p className="text-center py-4 text-gray-500 dark:text-gray-400">No toners found.</p>
            )}
          </ul>
        )}
      </DashboardCard>
    </>
  );
};
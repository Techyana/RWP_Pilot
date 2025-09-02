import React, { useState, useEffect, useMemo } from 'react';
import { Toner, TonerColor } from '../../types';
import { api } from '../../services/api';
import { DashboardCard } from '../dashboard/shared/DashboardCard';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { Toast, ToastType } from '../shared/Toast';
import { Modal } from '../shared/Modal';
import { AddTonerForm } from './AddTonerForm';

interface TonerInventoryProps {
    isAdmin: boolean;
}

const ColorBadge: React.FC<{ color: TonerColor }> = ({ color }) => {
    const colorClasses = {
        [TonerColor.BLACK]: 'bg-gray-800 text-white',
        [TonerColor.CYAN]: 'bg-cyan-500 text-white',
        [TonerColor.MAGENTA]: 'bg-pink-500 text-white',
        [TonerColor.YELLOW]: 'bg-yellow-400 text-black',
    };
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClasses[color]}`}>{color}</span>
}

export const TonerInventory: React.FC<TonerInventoryProps> = ({ isAdmin }) => {
    const [toners, setToners] = useState<Toner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const fetchToners = async () => {
        setIsLoading(true);
        try {
            const data = await api.getToners();
            setToners(data);
        } catch (error) {
            setToast({ message: 'Failed to load toners.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchToners();
    }, []);

    const filteredToners = useMemo(() => {
        if (!search) return toners;
        return toners.filter(t => t.edpCode.toLowerCase().includes(search.toLowerCase()));
    }, [toners, search]);

    const handleTonerAdded = () => {
        fetchToners();
        setShowAddModal(false);
    }

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
                    isAdmin && (
                        <Button onClick={() => setShowAddModal(true)} size="sm" icon="add">Add Toner</Button>
                    )
                }
            >
                <div className="mt-4">
                    <Input 
                        label="Search by EDP Code"
                        type="search"
                        placeholder="e.g., 841817"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {isLoading ? <p className="text-center py-4 text-gray-500 dark:text-gray-400">Loading...</p> : (
                    <ul className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-2">
                        {filteredToners.length > 0 ? filteredToners.map(toner => (
                             <li key={toner.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{toner.model}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">EDP: {toner.edpCode}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Yield: {toner.yield.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-gray-900 dark:text-white">{toner.stock}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">in stock</p>
                                    <ColorBadge color={toner.color} />
                                </div>
                            </li>
                        )) : <p className="text-center py-4 text-gray-500 dark:text-gray-400">No toners found.</p>}
                    </ul>
                )}
            </DashboardCard>
        </>
    );
};
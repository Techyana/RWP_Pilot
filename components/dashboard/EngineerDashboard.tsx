import React, { useEffect, useMemo, useState } from 'react';
import { Part, Device, PartStatus, DeviceStatus } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DashboardHeader } from './shared/DashboardHeader';
import { DashboardCard } from './shared/DashboardCard';
import { InventoryList } from '../inventory/InventoryList';
import { Button } from '../shared/Button';
import { Toast, ToastType } from '../shared/Toast';
import { Input } from '../shared/Input';
import { TonerInventory } from '../inventory/TonerInventory';
import { Footer } from '../shared/Footer';
import { ExternalLinkTile } from './shared/ExternalLinkTile';
import { Modal } from '../shared/Modal';
import { DeviceInfoModal } from '../inventory/DeviceInfoModal';

interface EngineerDashboardProps {
    theme: string;
    toggleTheme: () => void;
}

export const EngineerDashboard: React.FC<EngineerDashboardProps> = ({ theme, toggleTheme }) => {
    const { user } = useAuth();
    const [parts, setParts] = useState<Part[]>([]);
    const [devices, setDevices] = useState<Device[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [partSearch, setPartSearch] = useState('');
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [partsData, devicesData] = await Promise.all([
                    api.getParts(),
                    api.getDevices(),
                ]);
                setParts(partsData);
                setDevices(devicesData);
            } catch (error) {
                setToast({ message: 'Failed to load inventory data.', type: 'error' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredParts = useMemo(() => {
        if (!partSearch) return parts;
        return parts.filter(p => 
            p.name.toLowerCase().includes(partSearch.toLowerCase()) ||
            p.partNumber.toLowerCase().includes(partSearch.toLowerCase())
        );
    }, [parts, partSearch]);

    const handleClaimPart = async (part: Part) => {
        if (!user) return;
        setToast({ message: `Claiming ${part.name}...`, type: 'info' });
        try {
            await api.claimPart({
                partId: part.id,
                clientName: 'Demo Client',
                activityId: `ACT-${Date.now()}`,
                targetDeviceModel: 'Ricoh Aficio MP C4504',
                targetDeviceSerial: 'SN-G756M400789',
            }, user);
            
            setToast({ message: 'Part claimed successfully! An email has been sent.', type: 'success' });
            const updatedParts = await api.getParts();
            setParts(updatedParts);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to claim part.';
            setToast({ message: errorMessage, type: 'error' });
        }
    };
    
    const handleRequestPart = (part: Part) => {
        setToast({ message: `Request for ${part.name} sent to other branches.`, type: 'info' });
    }

    const renderPartActions = (part: Part) => {
        if (part.status === PartStatus.AVAILABLE) {
            return <Button onClick={() => handleClaimPart(part)} size="sm" icon="claim">Claim</Button>;
        }
        if (part.status === PartStatus.REQUESTED) {
             return <Button onClick={() => handleRequestPart(part)} size="sm" variant="secondary" disabled>Requested</Button>;
        }
        return null;
    };
    
    const openInfoModal = (device: Device) => {
        setSelectedDevice(device);
        setIsInfoModalOpen(true);
    }

    const renderDeviceActions = (device: Device) => (
        <Button onClick={() => openInfoModal(device)} size="sm" variant="secondary" icon="info-circle">Info</Button>
    );

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <DashboardHeader theme={theme} toggleTheme={toggleTheme} />
            <main className="flex-grow p-4 md:p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
                    <ExternalLinkTile title="OTM" href="https://engineerscloud.risenet.eu/onthemove/" icon="external-link" />
                    <ExternalLinkTile title="Octopus" href="https://ricohsupportportal.sharepoint.com/sites/octopus" icon="external-link" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <DashboardCard title="Parts Inventory" icon="parts" className="lg:col-span-2">
                        <div className="mb-4">
                            <Input 
                                label="Search by Part Name or Number" 
                                type="search"
                                placeholder="e.g., Fuser Unit or D149-4015"
                                value={partSearch}
                                onChange={e => setPartSearch(e.target.value)}
                            />
                        </div>
                        {isLoading ? (
                            <p className="text-gray-500 dark:text-gray-400">Loading parts...</p>
                        ) : (
                            <InventoryList items={filteredParts} renderActions={renderPartActions} />
                        )}
                    </DashboardCard>
                    <TonerInventory isAdmin={false} />
                    <DashboardCard title="Copiers for Disposal" icon="devices">
                        {isLoading ? (
                            <p className="text-gray-500 dark:text-gray-400">Loading devices...</p>
                        ) : (
                            <InventoryList items={devices} renderActions={renderDeviceActions} />
                        )}
                    </DashboardCard>
                    <DashboardCard title="Submit Query" icon="comment" className="lg:col-span-3">
                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                           <textarea placeholder="Type your query or comment here..." className="w-full flex-grow p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-brand-primary focus:border-brand-primary"></textarea>
                           <div className="self-end sm:self-center">
                                <Button icon="send">Submit</Button>
                           </div>
                        </div>
                    </DashboardCard>
                </div>
            </main>

            <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title={`Device Info: ${selectedDevice?.model}`}>
                <DeviceInfoModal device={selectedDevice} />
            </Modal>

            <Footer />
        </div>
    );
};
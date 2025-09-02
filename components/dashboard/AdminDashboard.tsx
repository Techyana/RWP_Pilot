import React, { useEffect, useMemo, useState } from 'react';
import { Part, Device, Role, DeviceStatus } from '../../types';
import { api } from '../../services/api';
import { DashboardHeader } from './shared/DashboardHeader';
import { DashboardCard } from './shared/DashboardCard';
import { InventoryList } from '../inventory/InventoryList';
import { Button } from '../shared/Button';
import { Toast, ToastType } from '../shared/Toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Input } from '../shared/Input';
import { TonerInventory } from '../inventory/TonerInventory';
import { Footer } from '../shared/Footer';
import { Modal } from '../shared/Modal';
import { AddPartForm } from '../inventory/AddPartForm';
import { AddDeviceForm } from '../inventory/AddDeviceForm';
import { ExternalLinkTile } from './shared/ExternalLinkTile';
import { UploadArrivalsModal } from '../admin/UploadArrivalsModal';
import { DeviceInfoModal } from '../inventory/DeviceInfoModal';
import { DeleteDeviceModal } from '../admin/DeleteDeviceModal';

const dummyReportData = [
  { name: 'Week 1', parts_claimed: 4, requests: 2 },
  { name: 'Week 2', parts_claimed: 7, requests: 1 },
  { name: 'Week 3', parts_claimed: 5, requests: 3 },
  { name: 'Week 4', parts_claimed: 9, requests: 4 },
];

interface AdminDashboardProps {
    theme: string;
    toggleTheme: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ theme, toggleTheme }) => {
    const [parts, setParts] = useState<Part[]>([]);
    const [devices, setDevices] = useState<Device[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [partSearch, setPartSearch] = useState('');
    const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);
    const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);


    const fetchData = async () => {
        setIsLoading(true);
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

    useEffect(() => {
        fetchData();
    }, []);

     const filteredParts = useMemo(() => {
        if (!partSearch) return parts;
        return parts.filter(p => 
            p.name.toLowerCase().includes(partSearch.toLowerCase()) ||
            p.partNumber.toLowerCase().includes(partSearch.toLowerCase())
        );
    }, [parts, partSearch]);
    
    const handleSuccess = () => {
        fetchData();
        setIsAddPartModalOpen(false);
        setIsAddDeviceModalOpen(false);
        setIsUploadModalOpen(false);
        setIsDeleteModalOpen(false);
    };

    const openInfoModal = (device: Device) => {
        setSelectedDevice(device);
        setIsInfoModalOpen(true);
    };

    const openDeleteModal = (device: Device) => {
        setSelectedDevice(device);
        setIsDeleteModalOpen(true);
    };
    
    const renderDeviceActions = (device: Device) => (
        <div className="flex items-center space-x-2">
            <Button onClick={() => openInfoModal(device)} size="sm" variant="secondary" icon="info-circle" aria-label="Device Info" />
            <Button 
                onClick={() => openDeleteModal(device)} 
                size="sm" 
                variant="danger" 
                icon="trash" 
                disabled={device.status === DeviceStatus.REMOVED}
                aria-label="Delete Device" 
            />
        </div>
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
                    <DashboardCard title="Manage Parts" icon="parts" className="lg:col-span-3 xl:col-span-2">
                         <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between">
                             <div className="flex-grow">
                                <Input 
                                    label="Search by Part Name or Number" 
                                    type="search"
                                    placeholder="e.g., Fuser Unit or D149-4015"
                                    value={partSearch}
                                    onChange={e => setPartSearch(e.target.value)}
                                />
                             </div>
                            <div className="self-end sm:self-center">
                                <Button onClick={() => setIsAddPartModalOpen(true)} icon="add">Add New Part</Button>
                            </div>
                        </div>
                        {isLoading ? <p>Loading...</p> : <InventoryList items={filteredParts} />}
                    </DashboardCard>

                    <TonerInventory isAdmin={true} />
                    
                    <DashboardCard title="Weekly Usage Report" icon="reports" className="lg:col-span-3 xl:col-span-2">
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dummyReportData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
                                    <XAxis dataKey="name" stroke="#9ca3af"/>
                                    <YAxis stroke="#9ca3af"/>
                                    <Tooltip
                                        contentStyle={{ 
                                            backgroundColor: '#374151',
                                            border: '1px solid #4b5563',
                                            borderRadius: '0.5rem'
                                        }}
                                        labelStyle={{ color: '#ffffff' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="parts_claimed" fill="#84cc16" name="Parts Claimed" />
                                    <Bar dataKey="requests" fill="#6b7280" name="New Requests" />
                                 </BarChart>
                            </ResponsiveContainer>
                        </div>
                         <div className="mt-4 flex justify-end space-x-2">
                            <Button variant="secondary" icon="usage">Export Weekly</Button>
                            <Button variant="secondary" icon="usage">Export Monthly</Button>
                        </div>
                    </DashboardCard>

                     <div className="lg:col-span-3 xl:col-span-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-6">
                        <DashboardCard title="Manage Disposal Copiers" icon="devices">
                            <div className="mb-4 flex justify-end">
                                <Button onClick={() => setIsAddDeviceModalOpen(true)} icon="add">Add New Device</Button>
                            </div>
                            {isLoading ? <p>Loading...</p> : <InventoryList items={devices} renderActions={renderDeviceActions} />}
                        </DashboardCard>
                        <DashboardCard title="Log Part Arrival" icon="upload">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Log a new shipment and notify an engineer.
                            </p>
                            <Button onClick={() => setIsUploadModalOpen(true)} icon="upload">Log Arrival</Button>
                        </DashboardCard>
                    </div>
                </div>
            </main>
            
            <Modal isOpen={isAddPartModalOpen} onClose={() => setIsAddPartModalOpen(false)} title="Add New Part(s)">
                <AddPartForm 
                    onSuccess={handleSuccess}
                    onClose={() => setIsAddPartModalOpen(false)} 
                />
            </Modal>
            
            <Modal isOpen={isAddDeviceModalOpen} onClose={() => setIsAddDeviceModalOpen(false)} title="Add New Disposal Copier">
                <AddDeviceForm
                    onSuccess={handleSuccess}
                    onClose={() => setIsAddDeviceModalOpen(false)}
                />
            </Modal>

            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Log Part Arrival">
                <UploadArrivalsModal
                    onSuccess={handleSuccess}
                    onClose={() => setIsUploadModalOpen(false)}
                />
            </Modal>
            
            <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title={`Device Info: ${selectedDevice?.model}`}>
                <DeviceInfoModal device={selectedDevice} />
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={`Remove Device: ${selectedDevice?.model}`}>
                <DeleteDeviceModal 
                    device={selectedDevice} 
                    onSuccess={handleSuccess}
                    onClose={() => setIsDeleteModalOpen(false)}
                />
            </Modal>

            <Footer />
        </div>
    );
};
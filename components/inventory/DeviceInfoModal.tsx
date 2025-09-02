import React from 'react';
import { Device, DeviceCondition } from '../../types';
import dayjs from 'dayjs';

interface DeviceInfoModalProps {
  device: Device | null;
}

const ConditionBadge: React.FC<{ condition: DeviceCondition }> = ({ condition }) => {
  const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full inline-block';
  const styles = {
    [DeviceCondition.GOOD]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    [DeviceCondition.FAIR]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    [DeviceCondition.POOR]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return <span className={`${baseClasses} ${styles[condition]}`}>{condition}</span>;
};

const InfoRow: React.FC<{ label: string, children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{label}</h4>
        <div className="text-base text-gray-900 dark:text-white mt-1">{children}</div>
    </div>
);


export const DeviceInfoModal: React.FC<DeviceInfoModalProps> = ({ device }) => {
  if (!device) return null;

  return (
    <div className="space-y-6 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow label="Customer">{device.customerName}</InfoRow>
            <InfoRow label="Serial Number">{device.serialNumber}</InfoRow>
            <InfoRow label="Condition"><ConditionBadge condition={device.condition} /></InfoRow>
            <InfoRow label="Status">{device.status}</InfoRow>
        </div>
        
        <InfoRow label="Comments">
            <p className="italic bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">{device.comments}</p>
        </InfoRow>

        <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Stripped Parts Log</h4>
            {device.strippedParts.length > 0 ? (
                <ul className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md divide-y dark:divide-gray-700">
                    {device.strippedParts.map((part, index) => (
                        <li key={`${part.partId}-${index}`} className="p-2 flex justify-between items-center">
                            <span>{part.partName}</span>
                            <span className="text-xs text-gray-500">{dayjs(part.strippedAt).format('YYYY-MM-DD HH:mm')}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">No parts have been stripped from this device.</p>
            )}
        </div>
    </div>
  );
};
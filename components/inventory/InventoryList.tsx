import React from 'react';
import { Part, Device, PartStatus, DeviceStatus } from '../../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

type Item = Part | Device;

interface InventoryListProps<T extends Item> {
  items: T[];
  renderActions?: (item: T) => React.ReactNode;
}

const getStatusBadge = (status: PartStatus | DeviceStatus) => {
  const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';
  switch (status) {
    case PartStatus.AVAILABLE:
      return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
    case PartStatus.USED:
      return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
    case PartStatus.REQUESTED:
      return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
    case PartStatus.PENDING_COLLECTION:
      return `${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200`;
    case DeviceStatus.APPROVED_FOR_DISPOSAL:
        return `${baseClasses} bg-brand-light text-brand-primary dark:bg-brand-primary/20 dark:text-brand-tertiary`;
    case DeviceStatus.REMOVED:
         return `${baseClasses} bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
  }
};


export const InventoryList = <T extends Item,>({ items, renderActions }: InventoryListProps<T>) => {
  if (items.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 text-center py-4">No items to display.</p>;
  }

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {items.map((item) => {
        const isPart = 'partNumber' in item;
        const isPending = isPart && item.status === PartStatus.PENDING_COLLECTION;
        const isUsed = isPart && item.status === PartStatus.USED && item.claimedAt;
        const isRemoved = 'serialNumber' in item && item.status === DeviceStatus.REMOVED;

        return (
          <li 
            key={item.id} 
            className={`p-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 transition-opacity ${isRemoved ? 'opacity-50' : ''}`}
          >
            <div className="flex-1">
              <p className={`font-semibold text-gray-900 dark:text-white ${isRemoved ? 'line-through' : ''}`}>
                {'name' in item ? item.name : item.model}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {'partNumber' in item ? item.partNumber : item.serialNumber}
              </p>
              {isUsed && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Claimed by {item.claimedBy} {dayjs(item.claimedAt).fromNow()}
                </p>
              )}
              {isPending && item.claimedBy && (
                 <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Awaiting collection by {item.claimedBy}
                </p>
              )}
              {isRemoved && 'removalReason' in item && (
                  <p className="text-xs text-red-400 dark:text-red-500 mt-1">
                      Reason: {item.removalReason}
                  </p>
              )}
            </div>
            <div className="flex items-center space-x-4 w-full md:w-auto">
               <span className={getStatusBadge(item.status)}>{item.status}</span>
               {renderActions && <div className="flex-shrink-0">{renderActions(item)}</div>}
            </div>
          </li>
        )
      })}
    </ul>
  );
};
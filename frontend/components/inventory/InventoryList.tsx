import React from 'react';
import type { Part, Device, Toner } from '../../types';
import { PartStatus, DeviceStatus } from '../../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

type Item = Part | Device | Toner;

interface InventoryListProps<T extends Item> {
  items: T[];
  renderActions?: (item: T) => React.ReactNode;
  renderMeta?: (item: T) => React.ReactNode;
  ariaLabel?: string;
}

function isToner(item: any): item is Toner {
  return (
    typeof item === 'object' &&
    'edpCode' in item &&
    'stock' in item &&
    'color' in item &&
    'model' in item
  );
}

const getStatusBadge = (status: PartStatus | DeviceStatus): string => {
  const base = 'px-2 py-1 text-xs font-semibold rounded-full';
  switch (status) {
    case PartStatus.AVAILABLE:
      return `${base} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
    case PartStatus.UNAVAILABLE:
      return `${base} bg-red-100 text-yellow-800 dark:bg-yellow-900 dark:text-red-200`;
    case PartStatus.CLAIMED:
      return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
    case PartStatus.PENDING_COLLECTION:
      return `${base} bg-yellow-100 text-red-800 dark:bg-red-900 dark:text-yellow-200`;
    case PartStatus.COLLECTED:
      return `${base} bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200`;
    case DeviceStatus.APPROVED_FOR_DISPOSAL:
      return `${base} bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200`;
    case DeviceStatus.REMOVED:
    default:
      return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
  }
};

function formatTimestamp(isoString?: string | Date) {
  if (!isoString) return '';
  try {
    return dayjs(isoString).format('MMM D, YYYY h:mm A');
  } catch {
    return '';
  }
}

const colorClasses = (color?: string) =>
  color === 'black'
    ? 'bg-gray-800 text-white'
    : color === 'cyan'
    ? 'bg-cyan-500 text-white'
    : color === 'magenta'
    ? 'bg-pink-500 text-white'
    : color === 'yellow'
    ? 'bg-yellow-400 text-black'
    : 'bg-gray-300 text-black';

export const InventoryList = <T extends Item>({
  items,
  renderActions,
  renderMeta,
  ariaLabel = 'Inventory list',
}: InventoryListProps<T>) => {
  if (!items || items.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
        No items to display.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700" aria-label={ariaLabel} role="list">
      {items.map((item) => {
        const isPart = 'partNumber' in item;
        const status = item.status as PartStatus | DeviceStatus;

        if (isToner(item)) {
          return (
            <li
              key={item.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-md flex items-start justify-between gap-4"
            >
              {/* Left: Model + metadata (flexes, truncates) */}
              <div className="min-w-0 flex-1 pr-4">
                <div className="text-sm text-gray-500">Toner Cartridge</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {item.model}
                </div>

                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <div className="truncate">
                    <span className="font-medium text-gray-700 dark:text-gray-200">EDP</span>
                    <span className="ml-2">{item.edpCode}</span>
                  </div>
                  {item.yield && (
                    <div className="truncate">
                      <span className="font-medium text-gray-700 dark:text-gray-200">Yield</span>
                      <span className="ml-2">{item.yield.toLocaleString?.() ?? item.yield}</span>
                    </div>
                  )}
                  {item.forDeviceModels && item.forDeviceModels.length > 0 && (
                    <div className="truncate">
                      <span className="font-medium text-gray-700 dark:text-gray-200">Fits</span>
                      <span className="ml-2">{item.forDeviceModels.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Mobile-only meta below left block */}
                <div className="mt-3 text-xs text-gray-600 dark:text-gray-300 sm:hidden">
                  {item.claimedByName && <div>Claimed by: <span className="font-medium">{item.claimedByName}</span></div>}
                  {item.claimedAt && <div>Claimed at: <span className="font-medium">{formatTimestamp(item.claimedAt)}</span></div>}
                </div>
              </div>

              {/* Right: grouped chip, stock, and actions
                  - On small screens: stack vertically (col)
                  - On sm+ screens: lay out horizontally (row)
                  - flex-shrink-0 prevents wrapping under left block
              */}
              <div className="flex-shrink-0 flex flex-col sm:flex-row items-center sm:items-center gap-3">
                <div className="flex flex-col items-center">
                  <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${colorClasses(item.color)}`}>
                    <span className="text-sm font-semibold">{item.color?.charAt(0).toUpperCase()}</span>
                  </span>
                  <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">Color</span>
                </div>

                                <div className="flex flex-col items-center sm:items-end">
                  <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{item.stock}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">in stock</span>
                </div>

                {/* actions (Claim button / other actions) */}
                <div className="flex flex-col items-center sm:items-end gap-2">
                  <div>{renderActions && renderActions(item)}</div>
                  {/* desktop meta under actions */}
                  <div className="hidden sm:block text-xs text-gray-600 dark:text-gray-300 text-right">
                    {item.claimedByName && <div>Claimed by: <span className="font-medium">{item.claimedByName}</span></div>}
                    {item.claimedAt && <div>Claimed at: <span className="font-medium">{formatTimestamp(item.claimedAt)}</span></div>}
                  </div>
                </div>
              </div>
            </li>
          );
        }

        // Parts and Devices
        return (
          <li
            key={item.id}
            className="p-4 bg-white dark:bg-gray-800 rounded-md flex items-start justify-between gap-4"
          >
            {/* Left: meta column (flex-1) */}
            <div className="min-w-0 flex-1 pr-4">
              {/* AVAILABLE badge above name when applicable */}
              {isPart && (item as Part).status === PartStatus.AVAILABLE && (
                <div className="mb-1">
                  <span className={getStatusBadge(PartStatus.AVAILABLE)}>AVAILABLE</span>
                </div>
              )}

              <div className="text-lg font-semibold text-gray-900 dark:text-white break-all">
                {isPart ? (item as Part).name : item.model}
              </div>

              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-1">
                {isPart && (
                  <>
                    <div className="truncate">Part #: <span className="font-medium">{(item as Part).partNumber}</span></div>
                    <div className="truncate">Available: <span className="font-medium">{(item as Part).quantity}</span></div>
                    <div className="truncate">Device Models: <span className="font-medium">{(item as Part).forDeviceModels?.join(', ')}</span></div>
                    {(item as Part).requestedByName && <div className="truncate">Requested by: <span className="font-medium">{(item as Part).requestedByName}</span></div>}
                    {(item as Part).requestedAtTimestamp && <div className="truncate">Requested at: <span className="font-medium">{formatTimestamp((item as Part).requestedAtTimestamp)}</span></div>}
                  </>
                )}
                {!isPart && !isToner(item) && <div className="truncate">Serial #: <span className="font-medium">{item.serialNumber}</span></div>}
                {renderMeta && renderMeta(item)}
              </div>

              {/* mobile meta */}
              <div className="mt-3 text-xs text-gray-600 dark:text-gray-300 sm:hidden">
                {isPart && (item as Part).claimedByName && <div>Claimed by: <span className="font-medium">{(item as Part).claimedByName}</span></div>}
                {isPart && (item as Part).claimedAt && <div>Claimed at: <span className="font-medium">{formatTimestamp((item as Part).claimedAt)}</span></div>}
                {isPart && (item as Part).collected && <div className="font-medium text-green-700">Collected</div>}
              </div>
            </div>

            {/* Right: status badge + actions aligned to the far right (claim icon sits here for parts) */}
            <div className="flex-shrink-0 flex flex-col items-end gap-3">
              <div className="flex items-center gap-3">
                {/* keep badge as visual on right too (for non-AVAILABLE statuses) */}
                {isPart && (item as Part).status !== PartStatus.AVAILABLE && (
                  <span className={getStatusBadge((item as Part).status)}>{String((item as Part).status).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                )}
                <div>{isPart && renderActions && renderActions(item)}</div>
              </div>

              <div className="hidden sm:block text-xs text-gray-600 dark:text-gray-300 text-right">
                {isPart && (item as Part).claimedByName && <div>Claimed by: <span className="font-medium">{(item as Part).claimedByName}</span></div>}
                {isPart && (item as Part).claimedAt && <div>Claimed at: <span className="font-medium">{formatTimestamp((item as Part).claimedAt)}</span></div>}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default InventoryList;


// src/components/inventory/InventoryList.tsx


import React from 'react'
import type { Part, Device } from '../../types'
import { PartStatus, DeviceStatus } from '../../types'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

type Item = Part | Device

interface InventoryListProps<T extends Item> {
  items: T[]
  renderActions?: (item: T) => React.ReactNode
  ariaLabel?: string 
}

const getStatusBadge = (status: PartStatus | DeviceStatus): string => {
  const base = 'px-2 py-1 text-xs font-semibold rounded-full'
  switch (status) {
    case PartStatus.AVAILABLE:
      return `${base} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`
    case PartStatus.UNAVAILABLE:
      return `${base} bg-red-100 text-yellow-800 dark:bg-yellow-900 dark:text-red-200`
    case PartStatus.CLAIMED:
      return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`
    case PartStatus.PENDING_COLLECTION:
      return `${base} bg-yellow-100 text-red-800 dark:bg-red-900 dark:text-yellow-200`
    case PartStatus.COLLECTED:
      return `${base} bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200`
    case DeviceStatus.APPROVED_FOR_DISPOSAL:
      return `${base} bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200`
    case DeviceStatus.REMOVED:
    default:
      return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`
  }
}

function formatTimestamp(isoString?: string | Date) {
  if (!isoString) return ''
  try {
    return dayjs(isoString).format('MMM D, YYYY h:mm A')
  } catch {
    return ''
  }
}

export const InventoryList = <T extends Item>({
  items,
  renderActions,
  ariaLabel = 'Inventory list',
}: InventoryListProps<T>) => {
  if (items.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
        No items to display.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700" aria-label={ariaLabel} role="list">
      {items.map((item) => {
        const isPart = 'partNumber' in item
        const status = item.status

        return (
          <li
            key={item.id}
            className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {/* Item label */}
                <span className="text-lg font-semibold text-gray-900 dark:text-white break-all">
                  {isPart ? item.name : item.model}
                </span>
                {/* Status badge */}
                <span className={getStatusBadge(status)}>
                  {String(status).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              </div>
              <div className="mt-1 flex flex-col sm:flex-row flex-wrap gap-y-1 gap-x-4 text-xs text-gray-600">
                {isPart && (
                  <span>Part #: <span className="font-medium">{item.partNumber}</span></span>
                )}
                {!isPart && (
                  <span>Serial #: <span className="font-medium">{item.serialNumber}</span></span>
                )}
                {isPart && typeof item.quantity === 'number' && (
                  <span>Qty: <span className="font-medium">{item.quantity}</span></span>
                )}
                {isPart && item.claimedByName && (
                  <span>Claimed by: <span className="font-medium">{item.claimedByName}</span></span>
                )}
                {isPart && item.claimedAt && (
                  <span>Claimed at: <span className="font-medium">{formatTimestamp(item.claimedAt)}</span></span>
                )}
                {isPart && item.requestedByName && (
                  <span>Requested by: <span className="font-medium">{item.requestedByName}</span></span>
                )}
                {isPart && item.requestedAtTimestamp && (
                  <span>Requested at: <span className="font-medium">{formatTimestamp(item.requestedAtTimestamp)}</span></span>
                )}
                {isPart && item.collected && (
                  <span className="font-medium text-green-700">Collected</span>
                )}
              </div>
            </div>
            {/* Actions Area */}
            {renderActions && (
              <div className="flex items-center gap-2 pt-2 md:pt-0">
                {renderActions(item)}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default InventoryList
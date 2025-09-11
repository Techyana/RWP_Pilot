// src/components/inventory/InventoryList.tsx

import React from 'react'
import type { Part, Device, User } from '../../types'
import { PartStatus, DeviceStatus } from '../../types'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

type Item = Part | Device

interface InventoryListProps<T extends Item> {
  items: T[]
  renderActions?: (item: T) => React.ReactNode
}

const getStatusBadge = (status: PartStatus | DeviceStatus): string => {
  const base = 'px-2 py-1 text-xs font-semibold rounded-full'
  switch (status) {
    case PartStatus.AVAILABLE:
      return `${base} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`
    case PartStatus.USED:
      return `${base} bg-red-100 text-yellow-800 dark:bg-yellow-900 dark:text-red-200`
    case PartStatus.REQUESTED:
      return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`
    case PartStatus.PENDING_COLLECTION:
      return `${base} bg-yellow-100 text-red-800 dark:bg-red-900 dark:text-yellow-200`
    case DeviceStatus.APPROVED_FOR_DISPOSAL:
      return `${base} bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200`
    case DeviceStatus.REMOVED:
    default:
      return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`
  }
}

export const InventoryList = <T extends Item,>({
  items,
  renderActions,
}: InventoryListProps<T>) => {
  if (items.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
        No items to display.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {items.map((item) => {
        const isPart = 'partNumber' in item
        const status = item.status

        return (
          <li
            key={item.id}
            className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0"
          >
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                {isPart ? item.name : item.model}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isPart ? item.partNumber : item.serialNumber}
              </p>

              {isPart && item.claimedAt && item.claimedBy && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Claimed by {item.claimedBy.name}{' '}
                  {dayjs(item.claimedAt).fromNow()}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-4 w-full md:w-auto">
              <span className={getStatusBadge(status)}>
                {status.charAt(0).toUpperCase() +
                  status.slice(1).toLowerCase().replace('_', ' ')}
              </span>

              {renderActions && (
                <div className="flex-shrink-0">
                  {renderActions(item)}
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
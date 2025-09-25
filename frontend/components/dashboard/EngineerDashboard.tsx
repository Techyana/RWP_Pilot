// src/components/dashboard/EngineerDashboard.tsx

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import type { Part, Device } from '../../types'
import { PartStatus } from '../../types'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { DashboardHeader } from './shared/DashboardHeader'
import { DashboardCard } from './shared/DashboardCard'
import { InventoryList } from '../inventory/InventoryList'
import { transactionsApi } from '../../services/api/transactionsApi'
import { FiInfo, FiClipboard, FiCheck, FiPlus, FiSearch } from 'react-icons/fi'
// Custom hook for polling
function useInterval(callback: () => void, delay: number) {
  const savedCallback = React.useRef(callback);
  useEffect(() => { savedCallback.current = callback }, [callback]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
import { Button } from '../shared/Button'
import { Toast, ToastType } from '../shared/Toast'
import { Input } from '../shared/Input'
import { TonerInventory } from '../inventory/TonerInventory'
import { ExternalLinkTile } from './shared/ExternalLinkTile'
import { Modal } from '../shared/Modal'
import { DeviceInfoModal } from '../inventory/DeviceInfoModal'
import { Footer } from '../shared/Footer'

dayjs.extend(relativeTime)

interface EngineerDashboardProps {
  theme: string
  toggleTheme: () => void
}

const TWELVE_HOURS = 12

export const EngineerDashboard: React.FC<EngineerDashboardProps> = ({
  theme,
  toggleTheme,
}) => {
  const { user } = useAuth()
  const [parts, setParts] = useState<Part[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [partSearch, setPartSearch] = useState('')
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  // View state: 'available', 'claims', 'collections'
  const [view, setView] = useState<'available' | 'claims' | 'collections'>('available')
  // Data for each view
  const [availableParts, setAvailableParts] = useState<Part[]>([])
  const [myClaims, setMyClaims] = useState<Part[]>([])
  const [collections, setCollections] = useState<Part[]>([])
  // Polling interval (ms)
  const POLL_INTERVAL = 15000

  // Fetch devices (static)
  const fetchDevices = async () => {
    try {
      const data = await api.device.getDevices()
      setDevices(data)
    } catch {
      setToast({ message: 'Failed to load devices.', type: 'error' })
    }
  }

  // Fetch parts for current view
  const fetchPartsForView = useCallback(async () => {
    setIsLoading(true)
    try {
      if (view === 'available') {
        const allParts = await api.part.getParts()
        setAvailableParts(allParts.filter(p => p.status === PartStatus.AVAILABLE && p.quantity > 0))
      } else if (view === 'claims') {
        // Show all parts claimed or requested by the logged-in engineer in the last 12 hours
        const txs = await transactionsApi.getRecentTransactions(TWELVE_HOURS)
        setMyClaims(
          txs
            .filter(tx => tx.user.id === user?.id)
            .map(tx => ({
              ...tx.part,
              claimedByName: tx.user.name,
              claimedAt: tx.part.claimedAt ?? tx.createdAt,
              requestedByName: tx.type === 'REQUEST' ? tx.user.name : undefined,
              requestedAtTimestamp: tx.type === 'REQUEST' ? tx.createdAt : undefined,
            }))
        )
      } else if (view === 'collections') {
        // Show all parts collected by the logged-in engineer in the last 12 hours
        const txs = await transactionsApi.getRecentCollections(TWELVE_HOURS)
        setCollections(
          txs
            .filter(tx => tx.user.id === user?.id)
            .map(tx => ({
              ...tx.part,
              collected: tx.type === 'COLLECT',
              claimedByName: tx.user.name,
              claimedAt: tx.part.claimedAt ?? tx.createdAt,
            }))
        )
      }
    } catch (err) {
      setToast({ message: 'Failed to load parts.', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }, [view, user])

  // Initial load and polling
  useEffect(() => { fetchDevices() }, [])
  useEffect(() => { fetchPartsForView() }, [fetchPartsForView])
  useInterval(fetchPartsForView, POLL_INTERVAL)


  // Actions for each view
  const handleClaim = async (part: Part) => {
    if (!user) return
    setToast({ message: `Claiming ${part.name}…`, type: 'info' })
    try {
      await api.part.claimPart({ partId: part.id }, user)
      setToast({ message: 'Claim successful!', type: 'success' })
      fetchPartsForView()
    } catch (err: any) {
      setToast({ message: err.message || 'Claim failed', type: 'error' })
    }
  }

  const handleRequest = async (part: Part) => {
    if (!user) return
    setToast({ message: `Requesting ${part.name}…`, type: 'info' })
    try {
      await api.part.requestPart({ partId: part.id }, user)
      setToast({ message: 'Request sent!', type: 'success' })
      fetchPartsForView()
    } catch (err: any) {
      setToast({ message: err.message || 'Request failed', type: 'error' })
    }
  }

  const handleConfirmCollection = async (part: Part) => {
    if (!user) return
    setToast({ message: `Confirming collection for ${part.name}…`, type: 'info' })
    try {
      await api.part.collectPart({ partId: part.id }, user)
      setToast({ message: 'Collection confirmed!', type: 'success' })
      fetchPartsForView()
    } catch (err: any) {
      setToast({ message: err.message || 'Collection failed', type: 'error' })
    }
  }

  // Render actions for InventoryList
  const renderPartActions = useCallback((part: Part) => {
    if (view === 'available') {
      return (
        <div className="flex gap-2">
          <Button onClick={() => handleClaim(part)} size="sm" icon="claim">Claim</Button>
          <Button onClick={() => handleRequest(part)} size="sm" variant="secondary">Request</Button>
        </div>
      )
    }
    if (view === 'collections') {
      return (
        <Button onClick={() => handleConfirmCollection(part)} size="sm" variant="primary">Confirm Collection</Button>
      )
    }
    return null
  }, [view])


  // Filtered items for current view
  const filteredParts = useMemo(() => {
    let items: Part[] = []
    if (view === 'available') items = availableParts
    else if (view === 'claims') items = myClaims
    else if (view === 'collections') items = collections
    if (!partSearch) return items
    const q = partSearch.toLowerCase()
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.partNumber.toLowerCase().includes(q)
    )
  }, [view, availableParts, myClaims, collections, partSearch])

  // device detail
  const openInfo = (device: Device) => {
    setSelectedDevice(device)
    setIsInfoModalOpen(true)
  }
  const renderDeviceActions = (device: Device) => (
    <Button onClick={() => openInfo(device)} size="sm" icon="info-circle">
      Info
    </Button>
  )


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <DashboardHeader theme={theme} toggleTheme={toggleTheme} />

      <main className="flex-grow p-4 md:p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <ExternalLinkTile title="OTM" href="https://…" icon="external-link" />
          <ExternalLinkTile title="Octopus" href="https://…" icon="external-link" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* PARTS INVENTORY */}
          <DashboardCard
  title="Parts Inventory"
  icon="parts"
  className="lg:col-span-3 xl:col-span-2"
  headerContent={
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={view === 'available' ? 'primary' : 'secondary'}
        icon="view"
        onClick={() => setView('available')}
        aria-label="Available Parts Queue"
      />
      <Button
        size="sm"
        variant={view === 'claims' ? 'primary' : 'secondary'}
        icon="clipboard"
        onClick={() => setView('claims')}
        aria-label="My Claims"
      />
      <Button
        size="sm"
        variant={view === 'collections' ? 'primary' : 'secondary'}
        icon="collected"
        onClick={() => setView('collections')}
        aria-label="Collections Queue"
      />
    </div>
  }
>
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
    <div className="relative w-full max-w-xs">
      <div className="flex items-center w-full border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 py-2 px-3">
        <FiSearch className="text-gray-400 mr-2" />
        <input
          type="search"
          aria-label="Search by name or part number"
          placeholder="Search by name or part number"
          value={partSearch}
          onChange={e => setPartSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
        />
      </div>
    </div>
  </div>

  {isLoading ? (
    <p className="mt-4 text-gray-500 dark:text-gray-400">Loading parts…</p>
  ) : (
    <InventoryList<Part>
      items={filteredParts}
      renderActions={renderPartActions}
    />
  )}
</DashboardCard>

          {/* TONER */}
          <TonerInventory isAdmin={false} />

          {/* DEVICES */}
          <DashboardCard title="Copiers for Disposal" icon="devices">
            {isLoading ? (
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading devices…</p>
            ) : (
              <InventoryList<Device> items={devices} renderActions={renderDeviceActions} />
            )}
          </DashboardCard>
        </div>
      </main>

      <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title={`Device Info: ${selectedDevice?.model}`}>
        <DeviceInfoModal device={selectedDevice} />
      </Modal>

      <Footer />
    </div>
  )
}

export default EngineerDashboard
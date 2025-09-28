// src/components/dashboard/AdminDashboard.tsx

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import type { Part, Device, PartTransaction } from '../../types'
import { PartStatus, DeviceStatus } from '../../types'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { DashboardHeader } from './shared/DashboardHeader'
import { DashboardCard } from './shared/DashboardCard'
import { InventoryList } from '../inventory/InventoryList'
import { Button } from '../shared/Button'
import { Toast, ToastType } from '../shared/Toast'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

import { AddTonerForm } from '../inventory/AddTonerForm'
import { Input } from '../shared/Input'
import { TonerInventory } from '../inventory/TonerInventory'
import { ExternalLinkTile } from './shared/ExternalLinkTile'
import { Footer } from '../shared/Footer'
import { Modal } from '../shared/Modal'
import { AddPartForm } from '../inventory/AddPartForm'
import { AddDeviceForm } from '../inventory/AddDeviceForm'
import { UploadArrivalsModal } from '../admin/UploadArrivalsModal'
import { DeviceInfoModal } from '../inventory/DeviceInfoModal'
import { DeleteDeviceModal } from '../admin/DeleteDeviceModal'
import { FiInfo, FiClipboard, FiCheck, FiPlus, FiSearch } from 'react-icons/fi'

dayjs.extend(relativeTime)

const TWELVE_HOURS = 12

const dummyReportData = [
  { name: 'Mon', parts_claimed: 12, requests: 5 },
  { name: 'Tue', parts_claimed: 9, requests: 3 },
  { name: 'Wed', parts_claimed: 14, requests: 6 },
  { name: 'Thu', parts_claimed: 7, requests: 2 },
  { name: 'Fri', parts_claimed: 11, requests: 4 },
  { name: 'Sat', parts_claimed: 3, requests: 1 },
  { name: 'Sun', parts_claimed: 5, requests: 2 },
]

type ViewMode = 'available' | 'allClaims' | 'collected'
type TonerViewMode = 'available' | 'claims' | 'collections'

export const AdminDashboard: React.FC<{
  theme: string
  toggleTheme: () => void
}> = ({ theme, toggleTheme }) => {
  const { user } = useAuth()
  const [parts, setParts] = useState<Part[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const [partSearch, setPartSearch] = useState('')
  const [tonerSearch, setTonerSearch] = useState('')
  const [view, setView] = useState<ViewMode>('available')

  const [claimsQueue, setClaimsQueue] = useState<Part[]>([])
  const [collectedQueue, setCollectedQueue] = useState<Part[]>([])

  const [toners, setToners] = useState<any[]>([])
  const [tonerView, setTonerView] = useState<TonerViewMode>('available')
  const [availableToners, setAvailableToners] = useState<any[]>([])
  const [claimedToners, setClaimedToners] = useState<any[]>([])
  const [collectedToners, setCollectedToners] = useState<any[]>([])
  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false)
  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false)
  const [isAddTonerModalOpen, setIsAddTonerModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)

  // Fetch base data (parts, devices, toners, toner transactions)
  const fetchBaseData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [p, d, t] = await Promise.all([
        api.part.getParts(),
        api.device.getDevices(),
        import('../../services/api/tonerApi').then(({ tonerApi }) => tonerApi.getToners())
      ])
      setParts(p)
      setDevices(d)
      setToners(t)
      // Toner transactions for claims/collections
      const { transactionsApi } = await import('../../services/api/transactionsApi')
      const tonerTxs = await transactionsApi.getRecentTonerTransactions(TWELVE_HOURS)
      const tonerCollectionsTx = await transactionsApi.getRecentTonerCollections(TWELVE_HOURS)
      setAvailableToners(t.filter((toner: any) => toner.stock > 0))
      setClaimedToners(
        tonerTxs
          .filter(tx => tx.toner)
          .map(tx => ({
            ...tx.toner,
            claimedByName: tx.user?.name,
            claimedAt: tx.createdAt,
            quantity: tx.quantityDelta,
          }))
      )
      setCollectedToners(
        tonerCollectionsTx
          .filter(tx => tx.toner)
          .map(tx => ({
            ...tx.toner,
            collected: true,
            collectedAt: tx.createdAt,
            claimedByName: tx.user?.name,
            claimedAt: tx.toner.claimedAt ?? tx.createdAt,
            quantity: tx.quantityDelta,
          }))
      )
    } catch {
      setToast({ message: 'Failed to load data.', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Only fetch inventory on initial mount and after relevant actions. No polling.
  useEffect(() => { fetchBaseData() }, [fetchBaseData])

  // Claims queue: show all claims and requests with engineer name and timestamp
  useEffect(() => {
    if (view !== 'allClaims') return
    import('../../services/api/transactionsApi').then(({ transactionsApi }) => {
      transactionsApi.getRecentPartTransactions(TWELVE_HOURS).then((txs) => {
        setClaimsQueue(
          txs.map((tx) => ({
            ...tx.part,
            claimedByName: tx.type === 'CLAIM' ? tx.user.name : undefined,
            claimedAt: tx.type === 'CLAIM' ? tx.createdAt : undefined,
            requestedByName: tx.type === 'REQUEST' ? tx.user.name : undefined,
            requestedAtTimestamp: tx.type === 'REQUEST' ? tx.createdAt : undefined,
          }))
        )
      })
    })
  }, [view])

  // Collected queue: show all collections with engineer name and timestamp
  useEffect(() => {
    if (view !== 'collected') return
    import('../../services/api/transactionsApi').then(({ transactionsApi }) => {
      transactionsApi.getRecentPartCollections(TWELVE_HOURS).then((txs) => {
        setCollectedQueue(
          txs.map((tx) => ({
            ...tx.part,
            collected: tx.type === 'COLLECT',
            claimedByName: tx.user.name,
            claimedAt: tx.createdAt,
          }))
        )
      })
    })
  }, [view])

  // Available queue: only parts with AVAILABLE status, and split quantity if some are claimed
  const availableParts = useMemo(() => {
    // For each part, if quantity > 1 and some are claimed, show available with updated quantity
    return parts
      .filter((p) => p.status === PartStatus.AVAILABLE && p.quantity > 0)
      .map((p) => ({ ...p }))
  }, [parts])

  // Search filter for all queues
  const filterParts = (items: Part[]) => {
    if (!partSearch) return items
    const q = partSearch.toLowerCase()
    return items.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.partNumber.toLowerCase().includes(q)
    )
  }

  // Device actions
  const openInfoModal = (device: Device) => { setSelectedDevice(device); setIsInfoModalOpen(true) }
  const openDeleteModal = (device: Device) => { setSelectedDevice(device); setIsDeleteModalOpen(true) }
  const renderDeviceActions = (device: Device) => (
    <div className="flex items-center space-x-2">
      <Button size="sm" variant="view" icon="info-circle" onClick={() => openInfoModal(device)} />
      <Button size="sm" variant="danger" icon="trash" disabled={device.status === DeviceStatus.REMOVED} onClick={() => openDeleteModal(device)} />
    </div>
  )

  const handleModalSuccess = () => {
    fetchBaseData()
    setIsAddPartModalOpen(false)
    setIsAddDeviceModalOpen(false)
    setIsAddTonerModalOpen(false)
    setIsUploadModalOpen(false)
    setIsInfoModalOpen(false)
    setIsDeleteModalOpen(false)
  }

  // Decide items for parts
  const itemsToShow =
    view === 'available'
      ? filterParts(availableParts)
      : view === 'allClaims'
      ? filterParts(claimsQueue)
      : filterParts(collectedQueue)

  // Toner inventory filtering by view
  const filteredToners = useMemo(() => {
    let items: any[] = [];
    if (tonerView === 'available') items = availableToners;
    else if (tonerView === 'claims') items = claimedToners;
    else if (tonerView === 'collections') items = collectedToners;
    if (tonerSearch) {
      const q = tonerSearch.toLowerCase();
      items = items.filter(
        (t: any) =>
          t.model?.toLowerCase().includes(q) ||
          t.edpCode?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [tonerView, availableToners, claimedToners, collectedToners, tonerSearch]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <DashboardHeader theme={theme} toggleTheme={toggleTheme} />

      <main className="flex-grow p-4 md:p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <ExternalLinkTile title="OTM" href="https://engineerscloud.risenet.eu/onthemove/" icon="external-link" />
          <ExternalLinkTile title="Octopus" href="https://ricohsupportportal.sharepoint.com/sites/octopus" icon="external-link" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <DashboardCard
            title="Manage Parts"
            icon="parts"
            className="lg:col-span-3 xl:col-span-2"
            headerContent={
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant={view === 'available' ? 'primary' : 'secondary'}
                  icon="view"
                  onClick={() => setView('available')}
                  aria-label="Available"
                />
                <Button
                  size="sm"
                  variant={view === 'allClaims' ? 'primary' : 'secondary'}
                  icon="clipboard"
                  onClick={() => setView('allClaims')}
                  aria-label="Claims Queue"
                />
                <Button
                  size="sm"
                  variant={view === 'collected' ? 'primary' : 'secondary'}
                  icon="collected"
                  onClick={() => setView('collected')}
                  aria-label="Collected"
                />
              </div>
            }
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
              <div className="relative w-full sm:max-w-xs px-4">
                <input
                  type="search"
                  value={partSearch}
                  onChange={e => setPartSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                  placeholder="Search by part number"
                  aria-label="Search by part number"
                />
                <span className="absolute left-7 top-2.5 text-gray-400 pointer-events-none">
                  <FiSearch size={18} />
                </span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                icon="add"
                onClick={() => setIsAddPartModalOpen(true)}
              >
                Add New Part
              </Button>
            </div>
            {isLoading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            ) : (
              <InventoryList
                items={itemsToShow}
                // Admin does not need check icon button in any view
                renderActions={undefined}
                renderMeta={item => {
                  if (view === 'collected' && item.collectedAt) {
                    return (
                      <span className="text-xs text-green-600 dark:text-green-400">
                        Collected At: {dayjs(item.collectedAt).format('D MMM YYYY HH:mm')}
                      </span>
                    )
                  }
                  return null
                }}
              />
            )}
          </DashboardCard>

          <DashboardCard
            title="Toner Inventory"
            icon="toner"
            className="lg:col-span-3 xl:col-span-2"
            headerContent={
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant={tonerView === 'available' ? 'primary' : 'secondary'}
                  icon="view"
                  onClick={() => setTonerView('available')}
                  aria-label="Available Toners"
                />
                <Button
                  size="sm"
                  variant={tonerView === 'claims' ? 'primary' : 'secondary'}
                  icon="clipboard"
                  onClick={() => setTonerView('claims')}
                  aria-label="Toner Claims"
                />
                <Button
                  size="sm"
                  variant={tonerView === 'collections' ? 'primary' : 'secondary'}
                  icon="collected"
                  onClick={() => setTonerView('collections')}
                  aria-label="Toner Collections"
                />
              </div>
            }
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
              <div className="relative w-full sm:max-w-xs px-4">
                <input
                  type="search"
                  value={tonerSearch}
                  onChange={e => setTonerSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                  placeholder="Search by toner model or EDP code"
                  aria-label="Search by toner model or EDP code"
                />
                <span className="absolute left-7 top-2.5 text-gray-400 pointer-events-none">
                  <FiSearch size={18} />
                </span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                icon="add"
                onClick={() => setIsAddTonerModalOpen(true)}
              >
                Add Toner
              </Button>
            </div>
            {isLoading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            ) : (
              <InventoryList
                items={filteredToners}
                renderActions={undefined}
                renderMeta={toner => {
                  if (tonerView === 'claims' || tonerView === 'collections') {
                    return (
                      <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                        {toner.claimedByName && (
                          <div>Claimed By: <span className="font-semibold">{toner.claimedByName}</span></div>
                        )}
                        {toner.claimedAt && (
                          <div>Claimed At: {dayjs(toner.claimedAt).format('D MMM YYYY HH:mm')}</div>
                        )}
                        {toner.serialNumber && (
                          <div>Serial #: <span className="font-mono">{toner.serialNumber}</span></div>
                        )}
                        {toner.clientName && (
                          <div>Client: <span className="font-semibold">{toner.clientName}</span></div>
                        )}
                        {toner.monoTotal && (
                          <div>Mono Meter: <span className="font-mono">{toner.monoTotal}</span></div>
                        )}
                        {toner.colorTotal && (
                          <div>Color Meter: <span className="font-mono">{toner.colorTotal}</span></div>
                        )}
                        {toner.collected && toner.collectedAt && (
                          <div className="text-green-600 dark:text-green-400">Collected At: {dayjs(toner.collectedAt).format('D MMM YYYY HH:mm')}</div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
            )}
          </DashboardCard>

          <div className="lg:col-span-3 xl:col-span-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-6">
            <DashboardCard
              title="Disposals"
              icon="devices"
              className="lg:col-span-3 xl:col-span-2"
              headerContent={
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    icon="view"
                    aria-label="Available Copiers"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    icon="clipboard"
                    aria-label="My Copier Claims"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    icon="collected"
                    aria-label="Copier Collections"
                  />
                </div>
              }
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
                <div className="relative w-full sm:max-w-xs px-4">
                  <input
                    type="search"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                    placeholder="Search by copier serial or model"
                    aria-label="Search by copier serial or model"
                  />
                  <span className="absolute left-7 top-2.5 text-gray-400 pointer-events-none">
                    <FiSearch size={18} />
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  icon="add"
                  onClick={() => setIsAddDeviceModalOpen(true)}
                >
                  Add New Device
                </Button>
              </div>
              {isLoading ? (
                <p className="text-gray-500 dark:text-gray-400">Loading...</p>
              ) : (
                <InventoryList items={devices} renderActions={renderDeviceActions} />
              )}
            </DashboardCard>

            <DashboardCard title="Parts Arrival" icon="upload">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Log a new shipment and notify an engineer.</p>
              <Button size="sm" variant="secondary" icon="upload" onClick={() => setIsUploadModalOpen(true)}>Log Arrival</Button>
            </DashboardCard>
          </div>

          <DashboardCard title="Usage Report" icon="reports" className="lg:col-span-3 xl:col-span-2">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dummyReportData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.3)" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#374151', border: '1px solid #4b5563', borderRadius: '0.5rem' }} labelStyle={{ color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="parts_claimed" fill="#cc8c16ff" name="Parts Claimed" />
                  <Bar dataKey="requests" fill="#6b7280" name="New Requests" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Button size="sm" variant="secondary" icon="usage">Export Weekly</Button>
              <Button size="sm" variant="secondary" icon="usage">Export Monthly</Button>
            </div>
          </DashboardCard>
        </div>
      </main>

      <Modal isOpen={isAddPartModalOpen} onClose={() => setIsAddPartModalOpen(false)} title="Add New Part(s)">
        <AddPartForm onSuccess={handleModalSuccess} onClose={() => setIsAddPartModalOpen(false)} />
      </Modal>

      <Modal isOpen={isAddTonerModalOpen} onClose={() => setIsAddTonerModalOpen(false)} title="Add New Toner">
        <AddTonerForm onSuccess={handleModalSuccess} onClose={() => setIsAddTonerModalOpen(false)} />
      </Modal>

      <Modal isOpen={isAddDeviceModalOpen} onClose={() => setIsAddDeviceModalOpen(false)} title="Add New Disposal Copier">
        <AddDeviceForm onSuccess={handleModalSuccess} onClose={() => setIsAddDeviceModalOpen(false)} />
      </Modal>

      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Log Part Arrival">
        <UploadArrivalsModal onSuccess={handleModalSuccess} onClose={() => setIsUploadModalOpen(false)} />
      </Modal>

      <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title={`Device Info: ${selectedDevice?.model}`}>
        <DeviceInfoModal device={selectedDevice!} />
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={`Remove Device: ${selectedDevice?.model}`}>
        <DeleteDeviceModal device={selectedDevice!} onSuccess={handleModalSuccess} onCancel={() => setIsDeleteModalOpen(false)} />
      </Modal>

      <Footer />
    </div>
  )
}

export default AdminDashboard
// src/components/dashboard/AdminDashboard.tsx

import React, { useEffect, useMemo, useState } from 'react'
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
  const [view, setView] = useState<ViewMode>('available')

  const [claimsQueue, setClaimsQueue] = useState<Part[]>([])
  const [collectedQueue, setCollectedQueue] = useState<Part[]>([])

  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false)
  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)

  // Fetch base data
  const fetchBaseData = async () => {
    setIsLoading(true)
    try {
      const [p, d] = await Promise.all([api.part.getParts(), api.device.getDevices()])
      setParts(p)
      setDevices(d)
    } catch {
      setToast({ message: 'Failed to load data.', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchBaseData() }, [])

  // Claims queue: show all claims and requests with engineer name and timestamp
  useEffect(() => {
    if (view !== 'allClaims') return
    import('../../services/api/transactionsApi').then(({ transactionsApi }) => {
      transactionsApi.getRecentTransactions(TWELVE_HOURS).then((txs) => {
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
      transactionsApi.getRecentCollections(TWELVE_HOURS).then((txs) => {
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
    setIsUploadModalOpen(false)
    setIsInfoModalOpen(false)
    setIsDeleteModalOpen(false)
  }

  // Decide items
  const itemsToShow =
    view === 'available'
      ? filterParts(availableParts)
      : view === 'allClaims'
      ? filterParts(claimsQueue)
      : filterParts(collectedQueue)

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
              <div className="flex items-center space-x-3">
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
            <div className="flex justify-between items-center mb-4 space-y-4 sm:space-y-0">
              <div className="relative w-full max-w-xs">
                <input
                  type="search"
                  value={partSearch}
                  onChange={e => setPartSearch(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                  placeholder="Search parts..."
                  aria-label="Search Parts"
                />
                <span className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">
                  <FiSearch size={18} />
                </span>
              </div>
            </div>
            <Button
                size="sm"
                variant="secondary"
                icon="add"
                onClick={() => setIsAddPartModalOpen(true)}
              >
                Add New Part
              </Button>

            {isLoading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            ) : (
              <InventoryList
                items={itemsToShow}
                renderActions={
                  view === 'allClaims' || view === 'collected'
                    ? item => (
                        <Button
                          size="sm"
                          variant="primary"
                          icon="check"
                          onClick={() => {
                            /* collection confirm logic here */
                          }}
                        />
                      )
                    : undefined
                }
              />
            )}
          </DashboardCard>



          <TonerInventory isAdmin />

          <DashboardCard title="Weekly Usage Report" icon="reports" className="lg:col-span-3 xl:col-span-2">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dummyReportData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.3)" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#374151', border: '1px solid #4b5563', borderRadius: '0.5rem' }} labelStyle={{ color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="parts_claimed" fill="#84cc16" name="Parts Claimed" />
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

        <div className="lg:col-span-3 xl:col-span-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-6">
          <DashboardCard title="Manage Disposal Copiers" icon="devices">
            <div className="mb-4 flex justify-end">
              <Button size="sm" variant="secondary" icon="add" onClick={() => setIsAddDeviceModalOpen(true)}>Add New Device</Button>
            </div>
            {isLoading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            ) : (
              <InventoryList items={devices} renderActions={renderDeviceActions} />
            )}
          </DashboardCard>

          <DashboardCard title="Log Part Arrival" icon="upload">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Log a new shipment and notify an engineer.</p>
            <Button size="sm" variant="secondary" icon="upload" onClick={() => setIsUploadModalOpen(true)}>Log Arrival</Button>
          </DashboardCard>
        </div>
      </main>

      <Modal isOpen={isAddPartModalOpen} onClose={() => setIsAddPartModalOpen(false)} title="Add New Part(s)">
        <AddPartForm onSuccess={handleModalSuccess} onClose={() => setIsAddPartModalOpen(false)} />
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
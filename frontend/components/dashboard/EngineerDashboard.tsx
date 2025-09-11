// src/components/dashboard/EngineerDashboard.tsx

import React, { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import type { Part, Device } from '../../types'
import { PartStatus } from '../../types'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { DashboardHeader } from './shared/DashboardHeader'
import { DashboardCard } from './shared/DashboardCard'
import { InventoryList } from '../inventory/InventoryList'
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
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(
    null
  )
  const [partSearch, setPartSearch] = useState('')
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)

  // fetch data
  const fetchParts = async () => {
    try {
      const data = await api.part.getParts()
      setParts(data)
    } catch {
      setToast({ message: 'Failed to load parts.', type: 'error' })
    }
  }

  const fetchDevices = async () => {
    try {
      const data = await api.device.getDevices()
      setDevices(data)
    } catch {
      setToast({ message: 'Failed to load devices.', type: 'error' })
    }
  }

  useEffect(() => {
    ;(async () => {
      await Promise.all([fetchParts(), fetchDevices()])
      setIsLoading(false)
    })()
  }, [])

  // handle part claim
  const handleClaim = async (part: Part) => {
    if (!user) return
    setToast({ message: `Claiming ${part.name}…`, type: 'info' })
    try {
      const updated = await api.part.claimPart({ partId: part.id }, user)
      setToast({ message: 'Claim successful!', type: 'success' })
      setParts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      )
    } catch (err: any) {
      setToast({
        message: err.message || 'Claim failed',
        type: 'error',
      })
    }
  }

  const handleRequest = async (part: Part) => {
    if (!user) return
    setToast({ message: `Requesting ${part.name}…`, type: 'info' })
    try {
      await api.part.requestPart({ partId: part.id }, user)
      setToast({ message: 'Request sent!', type: 'success' })
      fetchParts()
    } catch (err: any) {
      setToast({
        message: err.message || 'Request failed',
        type: 'error',
      })
    }
  }

  // render actions for parts
  const renderPartActions = (part: Part) => {
    const status = part.status.toUpperCase()
    const AVAILABLE = PartStatus.AVAILABLE.toUpperCase()
    const REQUESTED = PartStatus.REQUESTED.toUpperCase()

    if (status === AVAILABLE) {
      return (
        <div className="flex gap-2">
          <Button onClick={() => handleClaim(part)} size="sm" icon="claim">
            Claim
          </Button>
          <Button
            onClick={() => handleRequest(part)}
            size="sm"
            variant="secondary"
          >
            Request
          </Button>
        </div>
      )
    }

    if (status === REQUESTED) {
      return (
        <Button size="sm" variant="secondary" disabled>
          Requested
        </Button>
      )
    }

    return null
  }

  // filter parts by status, 12-hour window for others, always show mine
  const visibleParts = useMemo(() => {
    const now = dayjs()
    return parts.filter((p) => {
      if (p.status === PartStatus.AVAILABLE) return true

      if (p.status === PartStatus.PENDING_COLLECTION) {
        const ageHrs = now.diff(dayjs(p.claimedAt), 'hour')
        if (p.claimedBy?.id === user.id) return true
        return ageHrs < TWELVE_HOURS
      }

      return false
    })
  }, [parts, user])

  // apply search
  const filtered = useMemo(() => {
    if (!partSearch) return visibleParts
    const q = partSearch.toLowerCase()
    return visibleParts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.partNumber.toLowerCase().includes(q)
    )
  }, [visibleParts, partSearch])

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
          <ExternalLinkTile
            title="Octopus"
            href="https://…"
            icon="external-link"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PARTS INVENTORY */}
          <DashboardCard title="Parts Inventory" icon="parts" className="lg:col-span-2">
            <Input
              label="Search Parts"
              type="search"
              value={partSearch}
              onChange={(e) => setPartSearch(e.target.value)}
            />

            {isLoading ? (
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Loading parts…
              </p>
            ) : (
              <InventoryList items={filtered} renderActions={renderPartActions} />
            )}
          </DashboardCard>

          {/* TONER */}
          <TonerInventory isAdmin={false} />

          {/* DEVICES */}
          <DashboardCard title="Copiers for Disposal" icon="devices">
            {isLoading ? (
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Loading devices…
              </p>
            ) : (
              <InventoryList items={devices} renderActions={renderDeviceActions} />
            )}
          </DashboardCard>
        </div>
      </main>

      <Modal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title={`Device Info: ${selectedDevice?.model}`}
      >
        <DeviceInfoModal device={selectedDevice} />
      </Modal>

      <Footer />
    </div>
  )
}

export default EngineerDashboard
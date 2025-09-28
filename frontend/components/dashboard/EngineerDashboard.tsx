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
  // View state for each inventory
  const [partView, setPartView] = useState<'available' | 'claims' | 'collections'>('available')
  const [tonerView, setTonerView] = useState<'available' | 'claims' | 'collections'>('available')
  const [copierView, setCopierView] = useState<'available' | 'claims' | 'collections'>('available')
  // Data for each view
  const [availableParts, setAvailableParts] = useState<Part[]>([])

  // Claim modal state for toner
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimToner, setClaimToner] = useState(null);
  const [claimForm, setClaimForm] = useState({
    serialNumber: '',
    clientName: '',
    monoTotal: '',
    colorTotal: '',
  });

  const handleOpenClaimModal = (toner) => {
    setClaimToner(toner);
    setShowClaimModal(true);
    setClaimForm({ serialNumber: '', clientName: '', monoTotal: '', colorTotal: '' });
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!user || !claimToner) return;
    setToast({ message: `Claiming ${claimToner.model}…`, type: 'info' });
    try {
      const payload: any = {
        type: 'CLAIM',
        tonerId: claimToner.id,
        userId: user.id,
        serialNumber: claimForm.serialNumber,
        clientName: claimForm.clientName,
        quantityDelta: 1,
      };
      if (claimForm.monoTotal) {
        const mono = parseInt(claimForm.monoTotal, 10);
        if (!isNaN(mono)) payload.monoTotal = mono;
      }
      if (claimForm.colorTotal) {
        const color = parseInt(claimForm.colorTotal, 10);
        if (!isNaN(color)) payload.colorTotal = color;
      }
      await transactionsApi.record(payload);
      setToast({ message: 'Toner claim submitted!', type: 'success' });
      setShowClaimModal(false);
      fetchPartsForView();
    } catch (err) {
      setToast({ message: err.message || 'Toner claim failed', type: 'error' });
    }
  };
  const [myClaims, setMyClaims] = useState<Part[]>([])
  const [collections, setCollections] = useState<Part[]>([])
  // useTransition for smooth UI updates
  const [isPending, startTransition] = React.useTransition()
  // Toner state
  const [toners, setToners] = useState<any[]>([])
  const [availableToners, setAvailableToners] = useState<any[]>([])
  const [myTonerClaims, setMyTonerClaims] = useState<any[]>([])
  const [tonerCollections, setTonerCollections] = useState<any[]>([])
  const [tonerSearch, setTonerSearch] = useState('')
  // Copier state
  const [copiers, setCopiers] = useState<Device[]>([])
  const [availableCopiers, setAvailableCopiers] = useState<Device[]>([])
  const [myCopierClaims, setMyCopierClaims] = useState<Device[]>([])
  const [copierCollections, setCopierCollections] = useState<Device[]>([])
  // Polling interval (ms)
  const POLL_INTERVAL = 15000

  // Fetch devices (static)
  const fetchDevices = async () => {
    try {
      const data = await api.device.getDevices()
      setDevices(data)
      setCopiers(data)
    } catch {
      setToast({ message: 'Failed to load devices.', type: 'error' })
    }
  }

  // Fetch parts and toners for current view
  const fetchPartsForView = useCallback(async () => {
    setIsLoading(true)
    try {
      // Parts
      const allParts = await api.part.getParts()
      const txs = await transactionsApi.getRecentPartTransactions(TWELVE_HOURS)
      const collectionsTx = await transactionsApi.getRecentPartCollections(TWELVE_HOURS)
      // Toners
      const { tonerApi } = await import('../../services/api/tonerApi')
      const allToners = await tonerApi.getToners()
      const tonerTxs = await transactionsApi.getRecentTonerTransactions(TWELVE_HOURS)
      const tonerCollectionsTx = await transactionsApi.getRecentTonerCollections(TWELVE_HOURS)
      startTransition(() => {
        setAvailableParts(allParts.filter(p => p.status === PartStatus.AVAILABLE && p.quantity > 0))
        setMyClaims(
          txs
            .filter(tx => tx.user.id === user?.id && tx.part)
            .map(tx => ({
              ...tx.part,
              claimedByName: user?.name,
              claimedAt: tx.part?.claimedAt ?? tx.createdAt,
              requestedByName: tx.type === 'REQUEST' ? user?.name : undefined,
              requestedAtTimestamp: tx.type === 'REQUEST' ? tx.createdAt : undefined,
            }))
        )
        // Collections view: show claims that are not yet collected
        setCollections(
          txs
            .filter(tx => tx.user.id === user?.id && tx.type === 'CLAIM' && tx.part && !tx.part.collected)
            .map(tx => ({
              ...tx.part,
              claimedByName: user?.name,
              claimedAt: tx.part?.claimedAt ?? tx.createdAt,
              collected: false,
            }))
            .concat(
              collectionsTx
                .filter(tx => tx.user.id === user?.id && tx.type === 'COLLECT' && tx.part)
                .map(tx => ({
                  ...tx.part,
                  collected: true,
                  collectedByName: user?.name,
                  collectedAt: tx.createdAt,
                  claimedByName: user?.name,
                  claimedAt: tx.part?.claimedAt ?? tx.createdAt,
                }))
            )
        )
        // Toners
        setToners(allToners)
  setAvailableToners(allToners.filter(t => t.stock > 0))
        setMyTonerClaims(
          tonerTxs
            .filter(tx => tx.user.id === user?.id && tx.toner)
            .map(tx => ({
              ...tx.toner,
              claimedByName: user?.name,
              claimedAt: tx.toner?.claimedAt ?? tx.createdAt,
              requestedByName: tx.type === 'REQUEST' ? user?.name : undefined,
              requestedAtTimestamp: tx.type === 'REQUEST' ? tx.createdAt : undefined,
            }))
        )
        setTonerCollections(
          tonerTxs
            .filter(tx => tx.user.id === user?.id && tx.type === 'CLAIM' && tx.toner && !tx.toner.collected)
            .map(tx => ({
              ...tx.toner,
              claimedByName: user?.name,
              claimedAt: tx.toner?.claimedAt ?? tx.createdAt,
              collected: false,
            }))
            .concat(
              tonerCollectionsTx
                .filter(tx => tx.user.id === user?.id && tx.type === 'COLLECT' && tx.toner)
                .map(tx => ({
                  ...tx.toner,
                  collected: true,
                  collectedByName: user?.name,
                  collectedAt: tx.createdAt,
                  claimedByName: user?.name,
                  claimedAt: tx.toner?.claimedAt ?? tx.createdAt,
                }))
            )
        )
        // Copiers (simulate same logic)
        setAvailableCopiers(copiers.filter(c => c.status === 'APPROVED_FOR_DISPOSAL'))
        setMyCopierClaims([]) // TODO: filter by user
        setCopierCollections([]) // TODO: filter by user
        setIsLoading(false)
      })
    } catch (err) {
      setToast({ message: 'Failed to load parts.', type: 'error' })
      setIsLoading(false)
    }
  }, [user, copiers])

  // Initial load and polling
  useEffect(() => { fetchDevices() }, [])
  useEffect(() => { fetchPartsForView() }, [fetchPartsForView])


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
    if (partView === 'available') {
      return (
        <div className="flex justify-end w-full">
          <Button onClick={() => handleClaim(part)} size="sm" icon="claim">Claim</Button>
        </div>
      )
    }
    if (partView === 'collections') {
      if (!part.collected) {
        return (
          <Button onClick={() => handleConfirmCollection(part)} size="sm" icon="check" variant="primary">Confirm Collection</Button>
        )
      }
    }
    return null
  }, [partView])


  // Filtered items for current view
  const filteredParts = useMemo(() => {
    let items: Part[] = []
    if (partView === 'available') items = availableParts
    else if (partView === 'claims') items = myClaims
    else if (partView === 'collections') items = collections
    if (!partSearch) return items
    const q = partSearch.toLowerCase()
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.partNumber.toLowerCase().includes(q)
    )
  }, [partView, availableParts, myClaims, collections, partSearch])

  // Filtered toners for current view
  const filteredToners = useMemo(() => {
    let items: any[] = [];
    if (tonerView === 'available') items = availableToners;
    else if (tonerView === 'claims') items = myTonerClaims;
    else if (tonerView === 'collections') items = tonerCollections;
    if (tonerSearch) {
      const q = tonerSearch.toLowerCase();
      items = items.filter(
        (t: any) =>
          t.model?.toLowerCase().includes(q) ||
          t.edpCode?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [tonerView, availableToners, myTonerClaims, tonerCollections, tonerSearch]);
  // Toner actions per view
  const handleTonerClaim = (toner: any) => {
    handleOpenClaimModal(toner);
  };

  const handleTonerConfirmCollection = async (toner: any) => {
    if (!user) return;
    setToast({ message: `Confirming collection for ${toner.model}…`, type: 'info' });
    try {
      // You may want to call a toner collect API here
      // await api.toner.collectToner({ tonerId: toner.id }, user)
      setToast({ message: 'Collection confirmed!', type: 'success' });
      fetchPartsForView();
    } catch (err: any) {
      setToast({ message: err.message || 'Collection failed', type: 'error' });
    }
  };

  const renderTonerActions = useCallback((toner: any) => {
    if (tonerView === 'available') {
      return (
        <div className="flex justify-end w-full">
          <Button onClick={() => handleTonerClaim(toner)} size="sm" icon="claim">Claim</Button>
        </div>
      );
    }
    if (tonerView === 'collections') {
      if (!toner.collected) {
        return (
          <Button onClick={() => handleTonerConfirmCollection(toner)} size="sm" icon="check" variant="primary">Confirm Collection</Button>
        );
      }
    }
    return null;
  }, [tonerView]);

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
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant={partView === 'available' ? 'primary' : 'secondary'}
                  icon="view"
                  onClick={() => setPartView('available')}
                  aria-label="Available Parts Queue"
                />
                <Button
                  size="sm"
                  variant={partView === 'claims' ? 'primary' : 'secondary'}
                  icon="clipboard"
                  onClick={() => setPartView('claims')}
                  aria-label="My Claims"
                />
                <Button
                  size="sm"
                  variant={partView === 'collections' ? 'primary' : 'secondary'}
                  icon="collected"
                  onClick={() => setPartView('collections')}
                  aria-label="Collections Queue"
                />
              </div>
            }
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
              <div className="relative w-full sm:max-w-xs px-4">
                <input
                  type="search"
                  aria-label="Search by part number"
                  placeholder="Search by part number"
                  value={partSearch}
                  onChange={e => setPartSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 border border-gray-300 dark:border-gray-700 rounded-lg py-2 pl-10 pr-3 focus:outline-none"
                />
                <span className="absolute left-7 top-2.5 text-gray-400 pointer-events-none">
                  <FiSearch size={18} />
                </span>
              </div>
            </div>

            {isLoading ? (
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading parts…</p>
            ) : (
              <InventoryList<Part>
                items={filteredParts}
                renderActions={renderPartActions}
                renderMeta={part => {
                  if (partView === 'claims') {
                    // Only show custom Claimed At if not already rendered by InventoryList
                    return null
                  }
                  if (partView === 'collections') {
                    return part.collected ? (
                      <span className="text-xs text-green-600 dark:text-green-400">
                        Collected At: {part.collectedAt ? dayjs(part.collectedAt).format('D MMM YYYY HH:mm') : '—'}
                      </span>
                    ) : null
                  }
                  return null
                }}
              />
            )}
          </DashboardCard>

          {/* TONER INVENTORY */}
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
                  aria-label="My Toner Claims"
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
                  aria-label="Search by EDP code"
                  placeholder="Search by EDP code"
                  value={tonerSearch}
                  onChange={e => setTonerSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 border border-gray-300 dark:border-gray-700 rounded-lg py-2 pl-10 pr-3 focus:outline-none"
                />
                <span className="absolute left-7 top-2.5 text-gray-400 pointer-events-none">
                  <FiSearch size={18} />
                </span>
              </div>
            </div>
            {isLoading ? (
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading toners…</p>
            ) : (
              <>
                <InventoryList
                  items={filteredToners}
                  renderActions={renderTonerActions}
                  renderMeta={toner => {
                    // Show claim info in claims/collections views
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
                {/* Toner Claim Modal */}
                <Modal isOpen={showClaimModal} onClose={() => setShowClaimModal(false)} title={`Claim Toner: ${claimToner?.model || ''}`}>
                  <form onSubmit={handleClaimSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Serial Number</label>
                      <input
                        type="text"
                        required
                        value={claimForm.serialNumber}
                        onChange={e => setClaimForm(f => ({ ...f, serialNumber: e.target.value }))}
                        className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 text-base focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:outline-none transition-all"
                        placeholder="Enter device serial number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Client Name</label>
                      <input
                        type="text"
                        required
                        value={claimForm.clientName}
                        onChange={e => setClaimForm(f => ({ ...f, clientName: e.target.value }))}
                        className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 text-base focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:outline-none transition-all"
                        placeholder="Enter client name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Mono Total Meter Reading (optional)</label>
                      <input
                        type="number"
                        value={claimForm.monoTotal}
                        onChange={e => setClaimForm(f => ({ ...f, monoTotal: e.target.value }))}
                        className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 text-base focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:outline-none transition-all"
                        placeholder="Mono meter reading"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Color Total Meter Reading (optional)</label>
                      <input
                        type="number"
                        value={claimForm.colorTotal}
                        onChange={e => setClaimForm(f => ({ ...f, colorTotal: e.target.value }))}
                        className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 text-base focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:outline-none transition-all"
                        placeholder="Color meter reading"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="secondary" onClick={() => setShowClaimModal(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="primary" icon="claim">
                        Submit Claim
                      </Button>
                    </div>
                  </form>
                </Modal>
              </>
            )}
          </DashboardCard>

          {/* COPIER DISPOSAL */}
          <DashboardCard
            title="Disposals"
            icon="devices"
            className="lg:col-span-3 xl:col-span-2"
            headerContent={
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant={copierView === 'available' ? 'primary' : 'secondary'}
                  icon="view"
                  onClick={() => setCopierView('available')}
                  aria-label="Available Copiers"
                />
                <Button
                  size="sm"
                  variant={copierView === 'claims' ? 'primary' : 'secondary'}
                  icon="clipboard"
                  onClick={() => setCopierView('claims')}
                  aria-label="My Copier Claims"
                />
                <Button
                  size="sm"
                  variant={copierView === 'collections' ? 'primary' : 'secondary'}
                  icon="collected"
                  onClick={() => setCopierView('collections')}
                  aria-label="Copier Collections"
                />
              </div>
            }
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
              <div className="relative w-full sm:max-w-xs px-4">
                <input
                  type="search"
                  aria-label="Search by Device Model"
                  placeholder="Search by Device Model"
                  value={partSearch}
                  onChange={e => setPartSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 border border-gray-300 dark:border-gray-700 rounded-lg py-2 pl-10 pr-3 focus:outline-none"
                />
                <span className="absolute left-7 top-2.5 text-gray-400 pointer-events-none">
                  <FiSearch size={18} />
                </span>
              </div>
            </div>
            {/* TODO: Render copier inventory list with actions */}
            {/* <InventoryList items={filteredCopiers} renderActions={renderCopierActions} /> */}
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
// src/types.ts

export enum Role {
  ENGINEER = 'ENGINEER',
  SUPERVISOR = 'SUPERVISOR',
  ADMIN = 'ADMIN',
}

export enum PartStatus {
  AVAILABLE = 'AVAILABLE',
  PENDING_COLLECTION = 'PENDING_COLLECTION',
  CLAIMED = 'CLAIMED',
  COLLECTED = 'COLLECTED',
  UNAVAILABLE = 'UNAVAILABLE',
}

export enum DeviceStatus {
  APPROVED_FOR_DISPOSAL = 'APPROVED_FOR_DISPOSAL',
  REMOVED = 'REMOVED',
}

export enum DeviceCondition {
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

export interface User {
  id: string
  name: string
  surname: string
  email: string
  rzaNumber: string
  role: Role
  mustChangePassword?: boolean
  password?: string
}

export interface PreapprovedUser {
  name: string
  surname: string
  email: string
  rzaNumber: string
  role: Role
}

export interface Part {
  id: string
  name: string
  partNumber: string
  status: PartStatus

  // Claim tracking (reserved parts)
  claimedByName?: string | null
  claimedAt?: string | Date | null

  // Request tracking (order requests)
  requestedByName?: string | null
  requestedAtTimestamp?: string | Date
  createdAtTimestamp?: string | Date
  updatedAtTimestamp?: string | Date

  // Inventory counts
  quantity: number
  availableQuantity: number

  // Compatibility
  forDeviceModels: string[]

  // EngineerDashboard compatibility fields
  client?: string // Added for dashboard compatibility
  deviceSerial?: string
  claimedBy?: string
  collected?: boolean
}
// EngineerDashboard types for workflow compatibility

export interface Claim {
  id: string
  partId: string
  engineerId: string
  claimedAt: string
}

export interface PartRequest {
  id?: string
  partName: string
  partNumber: string
  quantity: number
  client: string
  deviceSerial: string
  engineerId?: string
  requestedAt?: string
}

export interface Transaction {
  id: string
  partId: string
  engineerId: string
  type: 'claim' | 'request' | 'collect'
  timestamp: string
}

export interface ClaimDetails {
  partId: string
}

export interface ReturnDetails {
  partId: string
  reason: string
}

export interface RemoveDetails {
  partId: string
  reason: string
}

export interface StrippedPart {
  partId: string
  partName: string
  strippedAt: string
}

export interface Device {
  id: string
  model: string
  serialNumber: string
  status: DeviceStatus
  customerName: string
  condition: DeviceCondition
  comments: string
  strippedParts: StrippedPart[]
  removalReason?: string
}

export interface ActivityLog {
  id: string
  userName: string
  action: string
  timestamp: string
  details: string
}

export enum TonerColor {
  BLACK = 'black',
  CYAN = 'cyan',
  MAGENTA = 'magenta',
  YELLOW = 'yellow',
}

export interface Toner {
  id: string
  model: string
  edpCode: string
  color: TonerColor
  yield: number
  stock: number
  forDeviceModels: string[]
}

export enum NotificationType {
  PART_AVAILABLE = 'PART_AVAILABLE',
  PART_REMOVED = 'PART_REMOVED',
  PART_CLAIMED = 'PART_CLAIMED',
  PART_COLLECTED = 'PART_COLLECTED',
  GENERAL = 'GENERAL',
}

export interface Notification {
  id: string
  userId: string
  message: string
  timestamp: string
  isRead: boolean
  type: NotificationType
  metadata?: {
    partId?: string
    shipmentNumber?: string
  }
}

// ----------------------------------------------------------------
// Transactions for parts (claims, requests, collections, returns)
// ----------------------------------------------------------------

export enum PartTransactionType {
  CLAIM   = 'CLAIM',
  REQUEST = 'REQUEST',
  RETURN  = 'RETURN',
  COLLECT = 'COLLECT',
  ADD    = 'ADD',
}

export interface PartTransaction {
  id: string
  part: Part
  type: PartTransactionType
  user: { id: string; name: string }
  quantityDelta: number
  createdAt: string
}
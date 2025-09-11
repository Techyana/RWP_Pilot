// src/types.ts

export enum Role {
  ENGINEER = 'ENGINEER',
  SUPERVISOR = 'SUPERVISOR',
  ADMIN = 'ADMIN',
}

export enum PartStatus {
  AVAILABLE = 'AVAILABLE',
  USED = 'USED',
  REQUESTED = 'REQUESTED',
  PENDING_COLLECTION = 'PENDING_COLLECTION',
}

export enum DeviceStatus {
  APPROVED_FOR_DISPOSAL = 'Approved for Disposal',
  REMOVED = 'Removed',
}

export enum DeviceCondition {
  GOOD = 'Good',
  FAIR = 'Fair',
  POOR = 'Poor',
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
  claimedBy?: User
  claimedAt?: string

  // Request tracking (order requests)
  requestedByUserId?: string
  requestedByUserEmail?: string
  requestedAtTimestamp?: string

  // Inventory counts
  quantity: number
  availableQuantity: number

  // Compatibility
  forDeviceModels: string[]
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
  BLACK = 'Black',
  CYAN = 'Cyan',
  MAGENTA = 'Magenta',
  YELLOW = 'Yellow',
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
  PART_ARRIVAL = 'PART_ARRIVAL',
  PART_AVAILABLE = 'PART_AVAILABLE',
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
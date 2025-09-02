export enum Role {
  ENGINEER = 'ENGINEER',
  SUPERVISOR = 'SUPERVISOR',
  ADMIN = 'ADMIN',
}

export enum PartStatus {
  AVAILABLE = 'Available',
  USED = 'Used',
  REQUESTED = 'Requested',
  PENDING_COLLECTION = 'Pending Collection',
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
  id: string;
  name: string;
  surname: string;
  email: string;
  rzaNumber: string;
  role: Role;
  mustChangePassword?: boolean;
  password?: string; // only in mock mode
}

export interface PreapprovedUser {
  name:string;
  surname: string;
  email: string;
  rzaNumber: string;
  role: Role;
}

export interface Part {
  id: string;
  name: string;
  partNumber: string;
  status: PartStatus;
  claimedBy?: string;
  claimedAt?: string;
  forDeviceModels: string[];
}

export interface StrippedPart {
    partId: string;
    partName: string;
    strippedAt: string;
}

export interface Device {
  id: string;
  model: string;
  serialNumber: string;
  status: DeviceStatus;
  customerName: string;
  condition: DeviceCondition;
  comments: string;
  strippedParts: StrippedPart[];
  removalReason?: string;
}

export interface ClaimDetails {
  partId: string;
  targetDeviceSerial: string;
  targetDeviceModel: string;
  clientName: string;
  activityId: string;
}

export interface ActivityLog {
  id: string;
  userName: string;
  action: string;
  timestamp: string;
  details: string;
}

export enum TonerColor {
  BLACK = 'Black',
  CYAN = 'Cyan',
  MAGENTA = 'Magenta',
  YELLOW = 'Yellow',
}

export interface Toner {
  id: string;
  model: string;
  edpCode: string;
  color: TonerColor;
  yield: number;
  stock: number;
  forDeviceModels: string[];
}

export enum NotificationType {
    PART_ARRIVAL = 'PART_ARRIVAL',
    PART_AVAILABLE = 'PART_AVAILABLE',
    GENERAL = 'GENERAL',
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    type: NotificationType;
    metadata?: {
        partId?: string;
        shipmentNumber?: string;
    };
}
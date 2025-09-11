import dayjs from 'dayjs';
import { User, Part, Device, Toner, TonerColor, Notification, Role, PartStatus, NotificationType, DeviceStatus, DeviceCondition } from '../types';

// --- MOCK DATA ---
export let users: User[] = [ 
  { id: 'user-1', name: 'Ralph', surname: 'Foentjies', email: 'ralph.foentjies@ricoh.co.za', rzaNumber: 'RZA11223', role: Role.SUPERVISOR },
  { id: 'user-2', name: 'Apiwe', surname: 'Hlobo', email: 'apiwe.hlobo@ricoh.co.za', rzaNumber: 'RZA44556', role: Role.ADMIN },
  { id: 'user-3', name: 'Zuko', surname: 'Tetyana', email: 'zuko.tetyana@ricoh.co.za', rzaNumber: 'RZA12345', role: Role.ENGINEER },
  { id: 'user-4', name: 'Leslie', surname: 'Smith', email: 'leslie.smith@ricoh.co.za', rzaNumber: 'RZA67890', role: Role.ENGINEER },
  { id: 'user-5', name: 'Muraad', surname: 'Jacobus', email: 'muraad.jacobus@ricoh.co.za', rzaNumber: 'RZA09876', role: Role.ENGINEER },
  { id: 'user-6', name: 'Lubabalo', surname: 'Sazona', email: 'lubabalo.sazona@ricoh.co.za', rzaNumber: 'RZA54321', role: Role.ENGINEER },
  { id: 'user-7', name: 'Masixole', surname: 'Mbembe', email: 'masixole.mbembe@ricoh.co.za', rzaNumber: 'RZA11234', role: Role.ENGINEER },
  { id: 'user-8', name: 'Grant', surname: 'Scheepers', email: 'grant.scheepers@ricoh.co.za', rzaNumber: 'RZA56789', role: Role.ENGINEER },
  { id: 'user-9', name: 'Wayne', surname: 'Haydricks', email: 'wayne.haydricks@ricoh.co.za', rzaNumber: 'RZA67890', role: Role.ENGINEER },
  { id: 'user-10', name: 'Garth', surname: 'Klein', email: 'garth.klein@ricoh.co.za', rzaNumber: 'RZA12345', role: Role.ENGINEER },
  { id: 'user-11', name: 'Siphenathi', surname: 'Matyesini', email: 'siphenathi.matyesini@ricoh.co.za', rzaNumber: 'RZA54321', role: Role.ENGINEER },
  { id: 'user-12', name: 'Whitney', surname: 'Sharnick', email: 'whitney.scharnick@ricoh.co.za', rzaNumber: 'RZA67890', role: Role.ENGINEER },
  { id: 'user-13', name: 'Faried', surname: 'Johnson', email: 'faried.johnson@ricoh.co.za', rzaNumber: 'RZA11223', role: Role.ENGINEER },
  { id: 'user-14', name: 'Riaan', surname: 'Marais', email: 'riaan.marais@ricoh.co.za', rzaNumber: 'RZA44556', role: Role.ENGINEER },
  { id: 'user-15', name: 'Leonardo', surname: 'Potter', email: 'leonardo.potter@ricoh.co.za', rzaNumber: 'RZA12345', role: Role.ADMIN },
  { id: 'user-16', name: 'Reza', surname: 'Arend', email: 'reza.arend@ricoh.co.za', rzaNumber: 'RZA67890', role: Role.ENGINEER },
  { id: 'user-17', name: 'Calvin', surname: 'Williams', email: 'calvin.williams@ricoh.co.za', rzaNumber: 'RZA09876', role: Role.ENGINEER },
  { id: 'user-18', name: 'Jaco', surname: 'Greeff', email: 'jaco.greeff@ricoh.co.za', rzaNumber: 'RZA12345', role: Role.SUPERVISOR }, 
];

export let parts: Part[] = [ 
  { id: 'part-1', name: 'Ricoh Fuser Unit', partNumber: 'D149-4015', status: PartStatus.AVAILABLE, forDeviceModels: ['Ricoh MP C3504', 'Ricoh MP C4504'] },
  { id: 'part-2', name: 'Photo Conductor Drum Unit - Black', partNumber: 'D188-2259', status: PartStatus.AVAILABLE, forDeviceModels: ['Ricoh MP C3504', 'Ricoh MP C4504'] },
  { id: 'part-3', name: 'Ricoh Transfer Belt', partNumber: 'D149-6480', status: PartStatus.USED, forDeviceModels: ['Ricoh MP C4504'], claimedBy: 'John Doe', claimedAt: dayjs().subtract(2, 'day').toISOString() },
  { id: 'part-4', name: 'Ricoh Controller Board', partNumber: 'D0BQ-5601', status: PartStatus.REQUESTED, forDeviceModels: ['Ricoh MP C6004'] },
  { id: 'part-5', name: 'Ricoh Waste Toner Bottle', partNumber: 'D149-6490', status: PartStatus.AVAILABLE, forDeviceModels: ['Ricoh MP C3504', 'Ricoh MP C4504', 'Ricoh MP C6004']},
  { id: 'part-6', name: 'Ricoh Laser Unit', partNumber: 'D149-3351', status: PartStatus.PENDING_COLLECTION, claimedBy: 'John Doe', forDeviceModels: ['Ricoh MP C3504', 'Ricoh MP C4504']},
  { id: 'part-7', name: 'Ricoh BCU Board', partNumber: 'D0BQ-1215', status: PartStatus.AVAILABLE, forDeviceModels: ['Ricoh MP C6004']}, 
];

export let devices: Device[] = [ 
{ 
    id: 'dev-1', 
    model: 'Ricoh Aficio MP C6004', 
    serialNumber: 'E967M100123', 
    status: DeviceStatus.APPROVED_FOR_DISPOSAL,
    customerName: 'Sanlam Head Office.',
    condition: DeviceCondition.FAIR,
    comments: 'Machine has some cosmetic damage on the left panel. ADF rollers need replacement.',
    strippedParts: [
        { partId: 'part-5', partName: 'Ricoh Waste Toner Bottle', strippedAt: dayjs().subtract(1, 'day').toISOString() },
    ]
  },
  { 
    id: 'dev-2', 
    model: 'Ricoh Aficio MP C3504', 
    serialNumber: 'E955M300456', 
    status: DeviceStatus.APPROVED_FOR_DISPOSAL,
    customerName: 'WBHO Waterfront',
    condition: DeviceCondition.GOOD,
    comments: 'No ADF and Yellow PCDU. controller board still intact.',
    strippedParts: [],
  },
  { 
    id: 'dev-3', 
    model: 'Ricoh Aficio MP C4504', 
    serialNumber: 'E958M800789', 
    status: DeviceStatus.REMOVED,
    customerName: 'Bex Express',
    condition: DeviceCondition.POOR,
    comments: 'Device was fully stripped of all usable components.',
    strippedParts: [
         { partId: 'part-3', partName: 'Ricoh Transfer Belt', strippedAt: dayjs().subtract(10, 'day').toISOString() },
         { partId: 'part-x', partName: 'Some Other Part', strippedAt: dayjs().subtract(9, 'day').toISOString() },
    ],
    removalReason: 'Fully stripped and scrapped.',
  },
 ];

export let toners: Toner[] = [ 
  { id: 'toner-1', model: 'Toner Cartridge Black', edpCode: '841817', color: TonerColor.BLACK, yield: 29500, stock: 15, forDeviceModels: ['Ricoh MP C3504', 'Ricoh MP C4504'] },
  { id: 'toner-2', model: 'Toner Cartridge Cyan', edpCode: '841820', color: TonerColor.CYAN, yield: 18000, stock: 8, forDeviceModels: ['Ricoh MP C3504', 'Ricoh MP C4504'] },
  { id: 'toner-3', model: 'Toner Cartridge Magenta', edpCode: '841819', color: TonerColor.MAGENTA, yield: 18000, stock: 5, forDeviceModels: ['Ricoh MP C3504', 'Ricoh MP C4504'] },
  { id: 'toner-4', model: 'Toner Cartridge Yellow', edpCode: '841818', color: TonerColor.YELLOW, yield: 18000, stock: 7, forDeviceModels: ['Ricoh MP C3504', 'Ricoh MP C4504'] },
  { id: 'toner-5', model: 'Toner Cartridge Black', edpCode: '842079', color: TonerColor.BLACK, yield: 33000, stock: 12, forDeviceModels: ['Ricoh MP C6004'] },
 ];

export let notifications: Notification[] = [ 
{
        id: 'notif-1',
        userId: 'user-1', // Ralph Foentjies
        message: 'Shipment E257616 has arrived with your part: Ricoh Laser Unit.',
        timestamp: dayjs().subtract(1, 'hour').toISOString(),
        isRead: false,
        type: NotificationType.PART_ARRIVAL,
        metadata: {
            partId: 'part-6',
            shipmentNumber: 'E257616',
        }
    },
    {
        id: 'notif-2',
        userId: 'user-1',
        message: 'Maintenance reminder for device SN-DEMO-123 is due tomorrow.',
        timestamp: dayjs().subtract(1, 'day').toISOString(),
        isRead: true,
        type: NotificationType.GENERAL,
    }
 ];

export const simulateDelay = <T,>(data: T): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), 500));
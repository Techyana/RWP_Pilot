import React from 'react';
import {
  LogIn,
  LogOut,
  UserPlus,
  Wrench,
  Cog,
  HardDrive,
  PlusCircle,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  BarChart2,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Send,
  Printer,
  FileText,
  Users,
  Search,
  Sun,
  Moon,
  Archive,
  X,
  Bell,
  Upload,
  ExternalLink,
  Trash2,
  Info,
} from 'lucide-react';

export type IconName =
  | 'login'
  | 'logout'
  | 'register'
  | 'parts'
  | 'settings'
  | 'devices'
  | 'add'
  | 'down'
  | 'right'
  | 'claim'
  | 'reports'
  | 'info'
  | 'success'
  | 'error'
  | 'comment'
  | 'send'
  | 'printer'
  | 'usage'
  | 'users'
  | 'search'
  | 'sun'
  | 'moon'
  | 'toner'
  | 'close'
  | 'bell'
  | 'upload'
  | 'external-link'
  | 'trash'
  | 'info-circle';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
}

const iconMap: Record<IconName, React.ElementType> = {
  login: LogIn,
  logout: LogOut,
  register: UserPlus,
  parts: Wrench,
  settings: Cog,
  devices: HardDrive,
  add: PlusCircle,
  down: ChevronDown,
  right: ChevronRight,
  claim: ClipboardList,
  reports: BarChart2,
  info: AlertCircle,
  success: CheckCircle,
  error: XCircle,
  comment: MessageSquare,
  send: Send,
  printer: Printer,
  usage: FileText,
  users: Users,
  search: Search,
  sun: Sun,
  moon: Moon,
  toner: Archive,
  close: X,
  bell: Bell,
  upload: Upload,
  'external-link': ExternalLink,
  trash: Trash2,
  'info-circle': Info,
};

export const Icon: React.FC<IconProps> = ({ name, className, ...props }) => {
  const LucideIcon = iconMap[name];
  if (!LucideIcon) return null;
  return <LucideIcon className={className} {...props} />;
};
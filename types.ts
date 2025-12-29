
export enum DocType {
  INCOMING = 'وارد',
  OUTGOING = 'صادر',
  INTERNAL = 'داخلي',
  ADMIN_ORDER = 'أمر إداري'
}

export enum DocStatus {
  NEW = 'جديد',
  IN_PROGRESS = 'قيد المتابعة',
  RESPONDED = 'مُجاب عليه',
  CLOSED = 'مغلق'
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string;
  parentDocId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'employee';
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  color?: string;
  deletedAt?: string | null;
  projectId?: string; // الربط مع المشروع
}

export interface Document {
  id: string;
  type: DocType;
  refNumber: string;
  date: string;
  sender: string;
  receiver: string;
  subject: string;
  department: string;
  projectId?: string;
  folderId?: string;
  tags: string[];
  notes: string;
  status: DocStatus;
  attachments: Attachment[];
  deletedAt?: string | null;
  isSleeve?: boolean;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  createdAt?: string;
}

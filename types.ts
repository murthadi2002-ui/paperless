
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
  department?: string;
  status?: 'active' | 'offline' | 'pending';
  permissions?: string[];
  joinedDate?: string;
  lastActive?: string;
}

export interface Department {
  id: string;
  name: string;
  employeeCount: number;
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  color?: string;
  deletedAt?: string | null;
  projectId?: string;
}

export interface WorkflowTask {
  id: string;
  issuerId: string; // The person who issued the direction
  assigneeIds: string[]; // The people assigned to the direction
  dueDate: string;
  instructions: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  createdAt: string;
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
  isPinned?: boolean;
  tasks: WorkflowTask[];
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  createdAt?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  timestamp: string;
  attachment?: Attachment;
  archivedDocId?: string;
  isVoice?: boolean;
  isRead?: boolean;
}

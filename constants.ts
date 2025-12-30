
import { DocType, DocStatus, Document, Project, User, Folder, Department, Message } from './types';

export const MOCK_PROJECTS: Project[] = [
  { id: 'p1', name: 'مشروع برج دبي', code: 'PRJ-DB-001', description: 'تطوير البنية التحتية لبرج دبي', createdAt: '2023-11-01' },
  { id: 'p2', name: 'مجمع سكني - الرياض', code: 'PRJ-RY-005', description: 'إنشاء 500 وحدة سكنية', createdAt: '2023-12-15' }
];

export const MOCK_DEPARTMENTS: Department[] = [
  { id: 'd1', name: 'الإدارة العامة', employeeCount: 1 },
  { id: 'd2', name: 'الهندسة المعمارية', employeeCount: 1 },
  { id: 'd3', name: 'الإدارة القانونية', employeeCount: 1 },
  { id: 'd4', name: 'الموارد البشرية', employeeCount: 1 },
  { id: 'd5', name: 'المحاسبة', employeeCount: 0 },
  { id: 'd6', name: 'إدارة المشاريع', employeeCount: 1 }
];

export const MOCK_FOLDERS: Folder[] = [
  { id: 'f1', name: 'أضبارة الرواتب والمستحقات', createdAt: '2023-01-01', color: 'bg-amber-500', projectId: 'p1' },
  { id: 'f2', name: 'المراسلات القانونية 2024', createdAt: '2024-02-15', color: 'bg-emerald-500', projectId: 'p2' },
  { id: 'f3', name: 'عقود المقاولين من الباطن', createdAt: '2023-05-10', color: 'bg-blue-500', projectId: 'p1' },
  { id: 'f4', name: 'المراسلات العامة', createdAt: '2024-01-10', color: 'bg-slate-500' }
];

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'd1',
    type: DocType.INCOMING,
    refNumber: 'OUT-2023-102',
    date: '2023-11-20',
    sender: 'وزارة الإسكان',
    receiver: 'القسم الهندسي',
    subject: 'طلب اعتماد مخططات المرحلة الثانية',
    department: 'الهندسة',
    projectId: 'p2',
    folderId: 'f2',
    tags: ['اعتماد', 'مخططات'],
    notes: 'مستعجل جداً ورسمي',
    status: DocStatus.NEW,
    attachments: [
      { id: 'a1', name: 'مخطط_الموقع.pdf', type: 'application/pdf', size: '2.4 MB', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { id: 'a2', name: 'صورة_الموقع_1.jpg', type: 'image/jpeg', size: '1.1 MB', url: 'https://picsum.photos/seed/doc1/1200/800' }
    ]
  },
  {
    id: 'd2',
    type: DocType.OUTGOING,
    refNumber: 'INC-2023-55',
    date: '2023-11-22',
    sender: 'المدير العام',
    receiver: 'أمانة العاصمة',
    subject: 'تقرير سير العمل الشهري',
    department: 'الإدارة',
    projectId: 'p1',
    folderId: 'f1',
    tags: ['تقرير', 'دوري'],
    notes: 'تم إرساله بالبريد المسجل',
    status: DocStatus.RESPONDED,
    attachments: [
      { id: 'a3', name: 'التقرير_الفني.pdf', type: 'application/pdf', size: '3.1 MB', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
    ]
  }
];

export const MOCK_EMPLOYEES: User[] = [
  {
    id: 'u2',
    name: 'سارة خالد',
    email: 'sara.k@paperless.com',
    avatar: 'https://i.pravatar.cc/150?u=sara',
    role: 'employee',
    department: 'الهندسة المعمارية',
    status: 'active',
    joinedDate: '2023-05-12',
    lastActive: 'الآن',
    permissions: ['إضافة كتاب', 'عرض الكتب فقط', 'تحميل ملفات']
  },
  {
    id: 'u3',
    name: 'محمد علي منصور',
    email: 'm.ali@paperless.com',
    avatar: 'https://i.pravatar.cc/150?u=mohammed',
    role: 'employee',
    department: 'الإدارة القانونية',
    status: 'offline',
    joinedDate: '2023-01-20',
    lastActive: 'منذ ساعتين',
    permissions: ['إضافة كتاب', 'تعديل كتاب', 'حذف كتاب', 'إدارة المستخدمين']
  },
  {
    id: 'u4',
    name: 'ليلى محمود الشامي',
    email: 'laila.m@paperless.com',
    avatar: 'https://i.pravatar.cc/150?u=laila',
    role: 'employee',
    department: 'الموارد البشرية',
    status: 'active',
    joinedDate: '2023-11-05',
    lastActive: 'منذ 5 دقائق',
    permissions: ['عرض تقارير', 'عرض الكتب فقط']
  },
  {
    id: 'u5',
    name: 'ياسين فؤاد',
    email: 'yasin.f@paperless.com',
    avatar: 'https://i.pravatar.cc/150?u=yasin',
    role: 'employee',
    department: 'الإدارة العامة',
    status: 'pending',
    joinedDate: '2024-03-01',
    lastActive: 'لم يسجل دخول بعد',
    permissions: ['إضافة كتاب', 'عرض الكتب فقط']
  },
  {
    id: 'u6',
    name: 'نورا حسن',
    email: 'nora.h@paperless.com',
    avatar: 'https://i.pravatar.cc/150?u=nora',
    role: 'employee',
    department: 'إدارة المشاريع',
    status: 'active',
    joinedDate: '2023-08-15',
    lastActive: 'الآن',
    permissions: ['إنشاء مشروع', 'عرض تقارير', 'إدارة المشاريع']
  }
];

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'أحمد محمد',
  email: 'admin@paperless.com',
  avatar: 'https://i.pravatar.cc/150?u=admin',
  role: 'admin',
  department: 'الإدارة العامة'
};

export const MOCK_MESSAGES: Message[] = [
  { id: 'm1', senderId: 'u2', receiverId: 'u1', text: 'أهلاً أحمد، هل اطلعت على مخططات برج دبي الأخيرة؟', timestamp: '10:30 ص', isRead: true },
  { id: 'm2', senderId: 'u1', receiverId: 'u2', text: 'نعم سارة، بانتظار موافقة الإدارة القانونية.', timestamp: '10:35 ص', isRead: true },
  { id: 'm3', senderId: 'u3', receiverId: 'u1', text: 'تمت مراجعة العقود، سأرسلها لك الآن من الأرشيف.', timestamp: '11:00 ص', isRead: false },
];

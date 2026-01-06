import { DocType, DocStatus, Document, Project, User, Folder, Department, Message, Position } from './types';

// تم إفراغ المصفوفات لتعتمد كلياً على البيانات المجلوبة من Firebase Firestore
export const MOCK_PROJECTS: Project[] = [];
export const MOCK_DEPARTMENTS: Department[] = [];
export const MOCK_FOLDERS: Folder[] = [];
export const MOCK_DOCUMENTS: Document[] = [];
export const MOCK_POSITIONS: Position[] = [];
export const MOCK_EMPLOYEES: User[] = [];
export const MOCK_MESSAGES: Message[] = [];

// سيتم تعيين المستخدم الحالي ديناميكياً من App.tsx بعد تسجيل الدخول
export const CURRENT_USER: any = null;

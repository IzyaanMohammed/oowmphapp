import type { Session, User } from './types';
import { addDays, set } from 'date-fns';

const today = new Date();

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    avatarId: 'user-1',
    role: 'teacher',
  },
  {
    id: 'user-2',
    name: 'John Smith',
    email: 'john.smith@example.com',
    avatarId: 'user-2',
    role: 'teacher',
  },
  {
    id: 'user-3',
    name: 'Emily White',
    email: 'emily.white@example.com',
    avatarId: 'user-3',
    role: 'unverified',
  },
  {
    id: 'user-4',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    avatarId: 'user-4',
    role: 'teacher',
  },
  {
    id: 'user-5',
    name: 'Admin User',
    email: 'admin@example.com',
    avatarId: 'user-5',
    role: 'admin',
  },
];

/** Predefined OOW bookers with their real email addresses */
export interface Booker {
  name: string;
  email: string;
}

export const DEFAULT_BOOKERS: Booker[] = [
  { name: 'Zenu Mathew',             email: 'zenu.m_oow@gemsedu.com' },
  { name: 'Vinita Mathews',          email: 'vinita.m_oow@gemsedu.com' },
  { name: 'Udaya Balakrishna',       email: 'udaya.b_oow@gemsedu.com' },
  { name: 'Shipra Gupta',            email: 'shipra.g_oow@gemsedu.com' },
  { name: 'Sheeba Vasanthakumari',   email: 'SHEEBA.V_oow@gemsedu.com' },
  { name: 'Saranya S.',              email: 'saranya.s_oow@gemsedu.com' },
  { name: 'Sangeetha Regunath',      email: 'sangeetha.r_oow@gemsedu.com' },
  { name: 'Robin Methai',            email: 'robin.m2_oow@gemsedu.com' },
  { name: 'Priya Shivakumar',        email: 'priya.s3_oow@gemsedu.com' },
  { name: 'Malti Iyer',              email: 'malti.i_oow@gemsedu.com' },
  { name: 'Mahmadul Haque',          email: 'mahmudul.h_oow@gemsedu.com' },
  { name: 'Lavina Chauhan',          email: 'lavina.c_oow@gemsedu.com' },
  { name: 'Herman Gomes',            email: 'herman.g_oow@gemsedu.com' },
  { name: 'Farha A.',                email: 'FARHA.A_oow@gemsedu.com' },
  { name: 'Betty Antony',            email: 'BETTY.A_oow@gemsedu.com' },
  { name: 'Anjuli Murthy',           email: 'anjuli.m1_oow@gemsedu.com' },
  { name: 'Anitha Nair',             email: 'ANITHA.N_oow@gemsedu.com' },
  { name: 'Aarti Kanal',             email: 'aarti.k_oow@gemsedu.com' },
];

/**
 * Look up a booker's real email by their name.
 * Falls back to a generated email if the name isn't in the predefined list.
 */
export function getEmailForBookerName(name: string): string {
  const match = DEFAULT_BOOKERS.find(
    b => b.name.toLowerCase() === name.trim().toLowerCase()
  );
  if (match) return match.email;

  // Fallback: generate a plausible email
  const sanitized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .join('.');
  if (sanitized) return `${sanitized}_oow@gemsedu.com`;
  return 'organizer_oow@gemsedu.com';
}

export const MOCK_SESSIONS: Session[] = [
  {
    id: 'session-1',
    programName: 'Mathematics 101',
    teacherId: 'user-1',
    teacherName: 'Jane Doe',
    date: set(today, { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 }),
    startTime: '09:00',
    endTime: '10:30',
    notes: 'Covering algebra basics.',
  },
  {
    id: 'session-2',
    programName: 'History of Art',
    teacherId: 'user-2',
    teacherName: 'John Smith',
    date: set(today, { hours: 11, minutes: 0, seconds: 0, milliseconds: 0 }),
    startTime: '11:00',
    endTime: '12:00',
    notes: 'Renaissance period discussion.',
  },
  {
    id: 'session-3',
    programName: 'Physics for Beginners',
    teacherId: 'user-4',
    teacherName: 'Michael Brown',
    date: set(today, { hours: 14, minutes: 0, seconds: 0, milliseconds: 0 }),
    startTime: '14:00',
    endTime: '15:30',
  },
  {
    id: 'session-4',
    programName: 'Advanced Chemistry',
    teacherId: 'user-1',
    teacherName: 'Jane Doe',
    date: addDays(set(today, { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 }), 2),
    startTime: '10:00',
    endTime: '11:30',
    notes: 'Lab session on molecular structures.',
  },
  {
    id: 'session-5',
    programName: 'Creative Writing Workshop',
    teacherId: 'user-2',
    teacherName: 'John Smith',
    date: addDays(set(today, { hours: 13, minutes: 0, seconds: 0, milliseconds: 0 }), 2),
    startTime: '13:00',
    endTime: '15:00',
  },
  {
    id: 'session-6',
    programName: 'Introduction to Programming',
    teacherId: 'user-4',
    teacherName: 'Michael Brown',
    date: addDays(set(today, { hours: 16, minutes: 0, seconds: 0, milliseconds: 0 }), 3),
    startTime: '16:00',
    endTime: '17:30',
    notes: 'Focus on Python fundamentals.',
  },
];

export function getMockEmailForTeacher(teacherName?: string, teacherId?: string): string {
  if (teacherId) {
    const userById = MOCK_USERS.find(u => u.id === teacherId);
    if (userById?.email) return userById.email;
  }
  if (teacherName) {
    // Try the predefined OOW bookers first
    const bookerEmail = getEmailForBookerName(teacherName);
    if (bookerEmail) return bookerEmail;

    const userByName = MOCK_USERS.find(u => u.name.toLowerCase() === teacherName.trim().toLowerCase());
    if (userByName?.email) return userByName.email;

    const sanitized = teacherName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .join('.');

    if (sanitized) return `${sanitized}_oow@gemsedu.com`;
  }
  return 'organizer_oow@gemsedu.com';
}

export function getSessionContactEmail(session: Session): string {
  if ((session as any).teacherEmail) return (session as any).teacherEmail;
  // Try predefined bookers list first
  const bookerEmail = getEmailForBookerName(session.teacherName);
  if (bookerEmail) return bookerEmail;
  return getMockEmailForTeacher(session.teacherName, session.teacherId);
}

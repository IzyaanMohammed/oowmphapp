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

export const MOCK_SESSIONS: Session[] = [
  {
    id: 'session-1',
    programName: 'Mathematics 101',
    teacherId: 'user-1',
    date: set(today, { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 }),
    startTime: '09:00',
    endTime: '10:30',
    notes: 'Covering algebra basics.',
  },
  {
    id: 'session-2',
    programName: 'History of Art',
    teacherId: 'user-2',
    date: set(today, { hours: 11, minutes: 0, seconds: 0, milliseconds: 0 }),
    startTime: '11:00',
    endTime: '12:00',
    notes: 'Renaissance period discussion.',
  },
  {
    id: 'session-3',
    programName: 'Physics for Beginners',
    teacherId: 'user-4',
    date: set(today, { hours: 14, minutes: 0, seconds: 0, milliseconds: 0 }),
    startTime: '14:00',
    endTime: '15:30',
  },
  {
    id: 'session-4',
    programName: 'Advanced Chemistry',
    teacherId: 'user-1',
    date: addDays(set(today, { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 }), 2),
    startTime: '10:00',
    endTime: '11:30',
    notes: 'Lab session on molecular structures.',
  },
  {
    id: 'session-5',
    programName: 'Creative Writing Workshop',
    teacherId: 'user-2',
    date: addDays(set(today, { hours: 13, minutes: 0, seconds: 0, milliseconds: 0 }), 2),
    startTime: '13:00',
    endTime: '15:00',
  },
  {
    id: 'session-6',
    programName: 'Introduction to Programming',
    teacherId: 'user-4',
    date: addDays(set(today, { hours: 16, minutes: 0, seconds: 0, milliseconds: 0 }), 3),
    startTime: '16:00',
    endTime: '17:30',
    notes: 'Focus on Python fundamentals.',
  },
];

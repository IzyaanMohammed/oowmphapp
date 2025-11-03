import type { PlaceHolderImages } from "./placeholder-images";

export type UserRole = 'admin' | 'teacher' | 'unverified';

export type User = {
  id: string;
  name: string;
  email: string;
  avatarId: (typeof PlaceHolderImages)[number]['id'];
  role: UserRole;
};

export type Session = {
  id: string;
  programName: string;
  teacherId: string;
  date: Date;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  notes?: string;
};

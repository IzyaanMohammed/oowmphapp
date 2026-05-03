export type User = {
  id: string;
  name: string;
  email: string;
  avatarId: string;
  role: 'teacher' | 'admin' | 'unverified';
};

export type Session = {
  id: string;
  programName: string;
  teacherId?: string; // This is now optional as we don't have a user system
  teacherName: string; // The name of the teacher for display
  date: Date;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  notes?: string;
  createdAt?: Date;
};

export type Announcement = {
  id: string;
  title: string;
  message: string;
  authorName: string;
  createdAt: Date;
  updatedAt?: Date;
};
export type Note = {
  id: string;
  content: string;
  color: string;
  createdAt: Date;
};

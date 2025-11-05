export type User = {
  id: string;
  name: string;
  email: string;
};

export type Session = {
  id: string;
  programName: string;
  teacherId: string; // The UID of the user who created/owns the session
  teacherName: string; // The name of the teacher for display
  date: Date;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  notes?: string;
};

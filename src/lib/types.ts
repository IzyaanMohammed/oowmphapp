// User type is no longer needed as we are not managing individual users.
// export type User = {
//   id: string;
//   email: string;
//   displayName: string;
// };

export type Session = {
  id: string;
  programName: string;
  teacherId?: string; // This is now optional as we don't have a user system
  teacherName: string; // The name of the teacher for display
  date: Date;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  notes?: string;
};

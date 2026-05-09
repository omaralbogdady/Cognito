export type TaskType = 'assignment' | 'exam';
export type NoteType = 'concept' | 'flashcard';
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'none';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  userId: string;
  title: string;
  type: TaskType;
  dueDate?: Date;
  status: 'pending' | 'completed';
  priority: TaskPriority;
  progress: number;
  description: string;
  createdAt: Date;
  calendarEventId?: string;
  recurrence?: RecurrenceType;
  parentId?: string; // To track instances of the same recurring task
}

export interface SubTask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface Note {
  id: string;
  taskId: string;
  content?: string; // For concepts
  question?: string; // For flashcards
  answer?: string; // For flashcards
  hint?: string; // For flashcards
  type: NoteType;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  calendarSyncEnabled?: boolean;
  aiEnabled?: boolean;
  hasCompletedOnboarding?: boolean;
  themeColor?: string;
}

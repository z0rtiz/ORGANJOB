export type Priority = 'low' | 'medium' | 'high';

export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived';

export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  color: string;
  notes?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  clientId?: string;
  name: string;
  description?: string;
  color: string;
  status: ProjectStatus;
  priority: Priority;
  budgetHours?: number;
  deadline?: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface TaskItem {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string;
  estimatedMinutes?: number;
  spentSeconds: number;
  checklist: ChecklistItem[];
  tags: string[];
  createdAt: string;
  completedAt?: string;
}

export interface TimeLog {
  id: string;
  taskId: string;
  projectId: string;
  durationSeconds: number;
  startedAt: string;
  endedAt: string;
  type: 'pomodoro' | 'manual';
  notes?: string;
}

export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

export interface PomodoroSettings {
  workDuration: number; // in minutes (default 25)
  shortBreakDuration: number; // in minutes (default 5)
  longBreakDuration: number; // in minutes (default 15)
  longBreakInterval: number; // cycles before long break (default 4)
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  soundVolume: number;
}

export interface AppData {
  clients: Client[];
  projects: Project[];
  tasks: TaskItem[];
  timeLogs: TimeLog[];
  pomodoroSettings: PomodoroSettings;
  theme: 'dark' | 'light' | 'system';
}

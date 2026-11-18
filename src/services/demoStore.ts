import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import type {
  CreateTaskInput,
  NotificationItem,
  RegisterStudentInput,
  Student,
  Task,
  TaskStatus,
  UpdateStudentProfileInput,
} from '@/types/database';

const DEMO_STORAGE_KEY = '@vcot_lms_demo_state_v1';

interface DemoAccount {
  password: string;
  student: Student;
  tasks: Task[];
  notifications: NotificationItem[];
}

interface DemoStoreData {
  activeEmail: string | null;
  accounts: Record<string, DemoAccount>;
}

const memoryFallback = new Map<string, string>();

async function readStorage(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return memoryFallback.get(key) ?? null;
  }
  return AsyncStorage.getItem(key);
}

async function writeStorage(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
    memoryFallback.set(key, value);
    return;
  }
  await AsyncStorage.setItem(key, value);
}

function addDaysIso(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
}

export function createStarterTasks(studentId: string): Task[] {
  return [
    {
      id: `task-${studentId}-1`,
      student_id: studentId,
      title: 'Database Normalization & ER Diagram Lab',
      description:
        'Design a clean Entity-Relationship diagram for a university library circulation module and normalize all tables through Third Normal Form (3NF). Submit your SQL schema file and brief design notes.',
      course_name: 'CS301 - Database Systems',
      due_date: addDaysIso(2),
      status: 'pending',
      created_at: addDaysIso(-3),
    },
    {
      id: `task-${studentId}-2`,
      student_id: studentId,
      title: 'REST API Input Validation & Auth Guard',
      description:
        'Implement request body validation, structured error responses, and session authentication checks for the student assignment endpoints. Verify all routes with automated unit tests.',
      course_name: 'CS340 - Software Engineering',
      due_date: addDaysIso(5),
      status: 'pending',
      created_at: addDaysIso(-2),
    },
    {
      id: `task-${studentId}-3`,
      student_id: studentId,
      title: 'Capstone Literature Review Summary',
      description:
        'Prepare a concise 2-page synthesis of five peer-reviewed papers related to your final year capstone project. Use standard IEEE citations and highlight open research gaps.',
      course_name: 'ENG210 - Technical Communication',
      due_date: addDaysIso(9),
      status: 'pending',
      created_at: addDaysIso(-1),
    },
    {
      id: `task-${studentId}-4`,
      student_id: studentId,
      title: 'Sorting & Graph Traversal Complexity Quiz',
      description:
        'Complete the asymptotic time and space complexity worksheet covering Merge Sort, Quick Sort, Breadth-First Search (BFS), and Dijkstra shortest path.',
      course_name: 'CS204 - Data Structures & Algorithms',
      due_date: addDaysIso(-2),
      status: 'completed',
      created_at: addDaysIso(-7),
    },
  ];
}

export function createStarterNotifications(studentId: string): NotificationItem[] {
  const now = new Date();
  const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const yesterday = addDaysIso(-1);

  return [
    {
      id: `notif-${studentId}-1`,
      student_id: studentId,
      title: 'Upcoming Assignment Deadline',
      message:
        'Database Normalization & ER Diagram Lab (CS301 - Database Systems) is due in 2 days.',
      is_read: false,
      created_at: tenMinAgo,
    },
    {
      id: `notif-${studentId}-2`,
      student_id: studentId,
      title: 'New Assignment Posted',
      message:
        'Capstone Literature Review Summary has been added to ENG210 - Technical Communication.',
      is_read: false,
      created_at: twoHoursAgo,
    },
    {
      id: `notif-${studentId}-3`,
      student_id: studentId,
      title: 'Welcome to VCOT Student LMS',
      message:
        'Track upcoming course deadlines on Home, filter tasks in My Tasks, and keep your student profile updated.',
      is_read: true,
      created_at: yesterday,
    },
  ];
}

function buildDefaultStore(): DemoStoreData {
  const demoStudentId = 'demo-student-001';
  const demoEmail = 'student@university.edu';
  const student: Student = {
    id: demoStudentId,
    auth_user_id: 'demo-auth-user-001',
    full_name: 'Aarav Sharma',
    student_id: 'STU-2026-104',
    email: demoEmail,
    department: 'Computer Science & Engineering',
    profile_image: null,
    created_at: addDaysIso(-30),
  };

  return {
    activeEmail: null,
    accounts: {
      [demoEmail]: {
        password: 'password123',
        student,
        tasks: createStarterTasks(demoStudentId),
        notifications: createStarterNotifications(demoStudentId),
      },
    },
  };
}

async function loadStore(): Promise<DemoStoreData> {
  try {
    const raw = await readStorage(DEMO_STORAGE_KEY);
    if (!raw) {
      const initial = buildDefaultStore();
      await writeStorage(DEMO_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw) as DemoStoreData;
  } catch {
    return buildDefaultStore();
  }
}

async function saveStore(data: DemoStoreData): Promise<void> {
  await writeStorage(DEMO_STORAGE_KEY, JSON.stringify(data));
}

export const demoStore = {
  async getActiveStudent(): Promise<Student | null> {
    const store = await loadStore();
    if (!store.activeEmail) return null;
    return store.accounts[store.activeEmail]?.student ?? null;
  },

  async signIn(email: string, password: string): Promise<Student> {
    const normalized = email.trim().toLowerCase();
    const store = await loadStore();
    const account = store.accounts[normalized];
    if (!account || account.password !== password) {
      throw new Error('Invalid email or password. Try student@university.edu / password123 or register an account.');
    }
    store.activeEmail = normalized;
    await saveStore(store);
    return account.student;
  },

  async register(input: RegisterStudentInput): Promise<Student> {
    const normalized = input.email.trim().toLowerCase();
    const store = await loadStore();
    if (store.accounts[normalized]) {
      throw new Error('An account with this email address already exists.');
    }

    const duplicateId = Object.values(store.accounts).some(
      (acc) => acc.student.student_id.toLowerCase() === input.studentId.trim().toLowerCase()
    );
    if (duplicateId) {
      throw new Error('This Student ID is already registered to another student.');
    }

    const id = `student-${Date.now()}`;
    const student: Student = {
      id,
      auth_user_id: `auth-${Date.now()}`,
      full_name: input.fullName.trim(),
      student_id: input.studentId.trim().toUpperCase(),
      email: normalized,
      department: input.department.trim(),
      profile_image: null,
      created_at: new Date().toISOString(),
    };

    store.accounts[normalized] = {
      password: input.password,
      student,
      tasks: createStarterTasks(id),
      notifications: createStarterNotifications(id),
    };
    store.activeEmail = normalized;
    await saveStore(store);
    return student;
  },

  async resetPassword(email: string): Promise<void> {
    const normalized = email.trim().toLowerCase();
    const store = await loadStore();
    if (!store.accounts[normalized]) {
      // Return silently for security consistency, matching standard auth providers
      return;
    }
  },

  async signOut(): Promise<void> {
    const store = await loadStore();
    store.activeEmail = null;
    await saveStore(store);
  },

  async updateProfile(updates: UpdateStudentProfileInput): Promise<Student> {
    const store = await loadStore();
    if (!store.activeEmail || !store.accounts[store.activeEmail]) {
      throw new Error('Not authenticated.');
    }
    const current = store.accounts[store.activeEmail].student;
    const updated: Student = {
      ...current,
      full_name: updates.full_name.trim(),
      student_id: updates.student_id.trim().toUpperCase(),
      department: updates.department.trim(),
      profile_image:
        updates.profile_image !== undefined ? updates.profile_image : current.profile_image,
    };
    store.accounts[store.activeEmail].student = updated;
    await saveStore(store);
    return updated;
  },

  async getTasks(): Promise<Task[]> {
    const store = await loadStore();
    if (!store.activeEmail || !store.accounts[store.activeEmail]) return [];
    return [...store.accounts[store.activeEmail].tasks].sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );
  },

  async getTaskById(taskId: string): Promise<Task | null> {
    const tasks = await this.getTasks();
    return tasks.find((t) => t.id === taskId) ?? null;
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    const store = await loadStore();
    if (!store.activeEmail || !store.accounts[store.activeEmail]) {
      throw new Error('Not authenticated.');
    }
    const account = store.accounts[store.activeEmail];
    const newTask: Task = {
      id: `task-${Date.now()}`,
      student_id: account.student.id,
      title: input.title.trim(),
      course_name: input.course_name.trim(),
      description: input.description.trim(),
      due_date: new Date(input.due_date).toISOString(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    account.tasks = [newTask, ...account.tasks];
    account.notifications = [
      {
        id: `notif-${Date.now()}`,
        student_id: account.student.id,
        title: 'Task Added',
        message: `"${newTask.title}" (${newTask.course_name}) has been added to your task list.`,
        is_read: false,
        created_at: new Date().toISOString(),
      },
      ...account.notifications,
    ];
    await saveStore(store);
    return newTask;
  },

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
    const store = await loadStore();
    if (!store.activeEmail || !store.accounts[store.activeEmail]) {
      throw new Error('Not authenticated.');
    }
    const account = store.accounts[store.activeEmail];
    const index = account.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) {
      throw new Error('Assignment not found.');
    }
    const updated: Task = {
      ...account.tasks[index],
      status,
    };
    account.tasks[index] = updated;

    if (status === 'completed') {
      account.notifications = [
        {
          id: `notif-${Date.now()}`,
          student_id: account.student.id,
          title: 'Assignment Completed',
          message: `Great work! You marked "${updated.title}" as completed.`,
          is_read: false,
          created_at: new Date().toISOString(),
        },
        ...account.notifications,
      ];
    }

    await saveStore(store);
    return updated;
  },

  async getNotifications(): Promise<NotificationItem[]> {
    const store = await loadStore();
    if (!store.activeEmail || !store.accounts[store.activeEmail]) return [];
    return [...store.accounts[store.activeEmail].notifications].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async markNotificationRead(id: string): Promise<void> {
    const store = await loadStore();
    if (!store.activeEmail || !store.accounts[store.activeEmail]) return;
    store.accounts[store.activeEmail].notifications = store.accounts[
      store.activeEmail
    ].notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    await saveStore(store);
  },

  async markAllNotificationsRead(): Promise<void> {
    const store = await loadStore();
    if (!store.activeEmail || !store.accounts[store.activeEmail]) return;
    store.accounts[store.activeEmail].notifications = store.accounts[
      store.activeEmail
    ].notifications.map((n) => ({ ...n, is_read: true }));
    await saveStore(store);
  },
};


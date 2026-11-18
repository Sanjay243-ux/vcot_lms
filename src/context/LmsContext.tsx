import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { authService, type SignUpResult } from '@/services/authService';
import { notificationService } from '@/services/notificationService';
import { ensureStudentProfile, studentService } from '@/services/studentService';
import { isSupabaseConfigured, supabase } from '@/services/supabase';
import { taskService } from '@/services/taskService';
import type {
  CreateTaskInput,
  DashboardSummary,
  NotificationItem,
  RegisterStudentInput,
  Student,
  Task,
  TaskStatus,
  UpdateStudentProfileInput,
} from '@/types/database';

interface LmsContextValue {
  student: Student | null;
  tasks: Task[];
  notifications: NotificationItem[];
  unreadCount: number;
  dashboard: DashboardSummary;
  isInitializing: boolean;
  isLoadingData: boolean;
  dataError: string | null;
  isDemoMode: boolean;

  signIn: (email: string, password: string) => Promise<void>;
  register: (input: RegisterStudentInput) => Promise<SignUpResult>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;

  refreshAll: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<Task>;
  setTaskStatus: (taskId: string, status: TaskStatus) => Promise<Task>;
  updateProfile: (
    updates: UpdateStudentProfileInput,
    newLocalAvatarUri?: string | null
  ) => Promise<Student>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const LmsContext = createContext<LmsContextValue | undefined>(undefined);

export function LmsProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const loadStudentWorkspace = useCallback(async (activeStudent: Student) => {
    setIsLoadingData(true);
    setDataError(null);
    try {
      const [loadedTasks, loadedNotifications] = await Promise.all([
        taskService.fetchTasks(activeStudent.id),
        notificationService.fetchNotifications(activeStudent.id),
      ]);
      setTasks(loadedTasks);
      setNotifications(loadedNotifications);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to load assignments right now.';
      setDataError(message);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        const current = await studentService.getCurrentStudent();
        if (!isMounted) return;
        setStudent(current);
        if (current) {
          await loadStudentWorkspace(current);
        }
      } catch {
        if (isMounted) {
          setStudent(null);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    }

    bootstrap();

    if (!isSupabaseConfigured) {
      return () => {
        isMounted = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        setStudent(null);
        setTasks([]);
        setNotifications([]);
        setDataError(null);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        try {
          const profile = await ensureStudentProfile(session.user);
          if (!isMounted) return;
          setStudent(profile);
          await loadStudentWorkspace(profile);
        } catch (err) {
          if (!isMounted) return;
          setDataError(
            err instanceof Error ? err.message : 'Could not load your student profile.'
          );
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadStudentWorkspace]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const loggedInStudent = await authService.signIn(email, password);
      setStudent(loggedInStudent);
      await loadStudentWorkspace(loggedInStudent);
    },
    [loadStudentWorkspace]
  );

  const register = useCallback(
    async (input: RegisterStudentInput): Promise<SignUpResult> => {
      const result = await authService.register(input);
      if (result.student && !result.needsEmailConfirmation) {
        setStudent(result.student);
        await loadStudentWorkspace(result.student);
      }
      return result;
    },
    [loadStudentWorkspace]
  );

  const resetPassword = useCallback(async (email: string) => {
    await authService.resetPassword(email);
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setStudent(null);
    setTasks([]);
    setNotifications([]);
    setDataError(null);
  }, []);

  const refreshAll = useCallback(async () => {
    if (!student) return;
    const freshProfile = await studentService.getCurrentStudent();
    const target = freshProfile ?? student;
    if (freshProfile) {
      setStudent(freshProfile);
    }
    await loadStudentWorkspace(target);
  }, [student, loadStudentWorkspace]);

  const createTask = useCallback(
    async (input: CreateTaskInput): Promise<Task> => {
      if (!student) {
        throw new Error('Please sign in first.');
      }
      const created = await taskService.createTask(student.id, input);
      setTasks((prev) =>
        [...prev, created].sort(
          (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        )
      );
      const updatedNotifications = await notificationService.fetchNotifications(student.id);
      setNotifications(updatedNotifications);
      return created;
    },
    [student]
  );

  const setTaskStatus = useCallback(
    async (taskId: string, status: TaskStatus): Promise<Task> => {
      if (!student) {
        throw new Error('Please sign in first.');
      }
      const existing = tasks.find((t) => t.id === taskId);
      const updated = await taskService.updateStatus(
        taskId,
        student.id,
        status,
        existing?.title
      );
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      const updatedNotifications = await notificationService.fetchNotifications(student.id);
      setNotifications(updatedNotifications);
      return updated;
    },
    [student, tasks]
  );

  const updateProfile = useCallback(
    async (
      updates: UpdateStudentProfileInput,
      newLocalAvatarUri?: string | null
    ): Promise<Student> => {
      if (!student) {
        throw new Error('Please sign in first.');
      }

      let finalAvatarUrl = updates.profile_image;
      if (newLocalAvatarUri) {
        finalAvatarUrl = await studentService.uploadAvatarIfPossible(
          student.auth_user_id,
          newLocalAvatarUri
        );
      }

      const updatedStudent = await studentService.updateProfile(student.id, {
        ...updates,
        profile_image: finalAvatarUrl,
      });
      setStudent(updatedStudent);
      return updatedStudent;
    },
    [student]
  );

  const markNotificationRead = useCallback(
    async (id: string) => {
      if (!student) return;
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
      );
      await notificationService.markAsRead(id, student.id);
    },
    [student]
  );

  const markAllNotificationsRead = useCallback(async () => {
    if (!student) return;
    setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    await notificationService.markAllAsRead(student.id);
  }, [student]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications]
  );

  const dashboard = useMemo<DashboardSummary>(() => {
    const totalAssignments = tasks.length;
    const pendingList = tasks.filter((t) => t.status === 'pending');
    const completedAssignments = tasks.filter((t) => t.status === 'completed').length;

    const upcomingDeadlines = [...pendingList]
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 3);

    const recentlyAdded = [...tasks]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3);

    return {
      totalAssignments,
      pendingAssignments: pendingList.length,
      completedAssignments,
      upcomingDeadlines,
      recentlyAdded,
    };
  }, [tasks]);

  const value = useMemo<LmsContextValue>(
    () => ({
      student,
      tasks,
      notifications,
      unreadCount,
      dashboard,
      isInitializing,
      isLoadingData,
      dataError,
      isDemoMode: !isSupabaseConfigured,
      signIn,
      register,
      resetPassword,
      signOut,
      refreshAll,
      createTask,
      setTaskStatus,
      updateProfile,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      student,
      tasks,
      notifications,
      unreadCount,
      dashboard,
      isInitializing,
      isLoadingData,
      dataError,
      signIn,
      register,
      resetPassword,
      signOut,
      refreshAll,
      createTask,
      setTaskStatus,
      updateProfile,
      markNotificationRead,
      markAllNotificationsRead,
    ]
  );

  return <LmsContext.Provider value={value}>{children}</LmsContext.Provider>;
}

export function useLmsContext(): LmsContextValue {
  const ctx = useContext(LmsContext);
  if (!ctx) {
    throw new Error('useLmsContext must be used inside LmsProvider.');
  }
  return ctx;
}


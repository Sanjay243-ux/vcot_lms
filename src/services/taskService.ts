import { demoStore } from '@/services/demoStore';
import { isSupabaseConfigured, supabase } from '@/services/supabase';
import type { CreateTaskInput, Task, TaskStatus } from '@/types/database';

export const taskService = {
  async fetchTasks(studentUuid: string): Promise<Task[]> {
    if (!isSupabaseConfigured) {
      return demoStore.getTasks();
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('student_id', studentUuid)
      .order('due_date', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as Task[];
  },

  async fetchTaskById(taskId: string, studentUuid: string): Promise<Task | null> {
    if (!isSupabaseConfigured) {
      return demoStore.getTaskById(taskId);
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('student_id', studentUuid)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return (data as Task | null) ?? null;
  },

  async createTask(studentUuid: string, input: CreateTaskInput): Promise<Task> {
    if (!isSupabaseConfigured) {
      return demoStore.createTask(input);
    }

    const dueIso = new Date(input.due_date.trim()).toISOString();

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        student_id: studentUuid,
        title: input.title.trim(),
        course_name: input.course_name.trim(),
        description: input.description.trim(),
        due_date: dueIso,
        status: 'pending',
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Unable to create task.');
    }

    // Create an accompanying notification cleanly
    await supabase.from('notifications').insert({
      student_id: studentUuid,
      title: 'New Task Added',
      message: `"${input.title.trim()}" (${input.course_name.trim()}) was added to My Tasks.`,
      is_read: false,
    });

    return data as Task;
  },

  async updateStatus(
    taskId: string,
    studentUuid: string,
    status: TaskStatus,
    taskTitle?: string
  ): Promise<Task> {
    if (!isSupabaseConfigured) {
      return demoStore.updateTaskStatus(taskId, status);
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId)
      .eq('student_id', studentUuid)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Unable to update assignment status.');
    }

    if (status === 'completed' && taskTitle) {
      await supabase.from('notifications').insert({
        student_id: studentUuid,
        title: 'Assignment Completed',
        message: `You marked "${taskTitle}" as completed.`,
        is_read: false,
      });
    }

    return data as Task;
  },
};


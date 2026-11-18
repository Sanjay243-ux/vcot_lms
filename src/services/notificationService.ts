import { demoStore } from '@/services/demoStore';
import { isSupabaseConfigured, supabase } from '@/services/supabase';
import type { NotificationItem } from '@/types/database';

export const notificationService = {
  async fetchNotifications(studentUuid: string): Promise<NotificationItem[]> {
    if (!isSupabaseConfigured) {
      return demoStore.getNotifications();
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('student_id', studentUuid)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as NotificationItem[];
  },

  async markAsRead(notificationId: string, studentUuid: string): Promise<void> {
    if (!isSupabaseConfigured) {
      await demoStore.markNotificationRead(notificationId);
      return;
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('student_id', studentUuid);

    if (error) {
      throw new Error(error.message);
    }
  },

  async markAllAsRead(studentUuid: string): Promise<void> {
    if (!isSupabaseConfigured) {
      await demoStore.markAllNotificationsRead();
      return;
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('student_id', studentUuid)
      .eq('is_read', false);

    if (error) {
      throw new Error(error.message);
    }
  },
};


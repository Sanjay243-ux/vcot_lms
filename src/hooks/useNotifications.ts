import { useLmsContext } from '@/context/LmsContext';

export function useNotifications() {
  const {
    notifications,
    unreadCount,
    isLoadingData,
    dataError,
    refreshAll,
    markNotificationRead,
    markAllNotificationsRead,
  } = useLmsContext();

  return {
    notifications,
    unreadCount,
    isLoadingData,
    dataError,
    refreshAll,
    markNotificationRead,
    markAllNotificationsRead,
  };
}


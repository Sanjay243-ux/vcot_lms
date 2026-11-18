import { Bell, CheckCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/common/EmptyState';
import { AlertBanner } from '@/components/common/ErrorBanner';
import { LoadingState } from '@/components/common/LoadingState';
import { HeaderIconButton, ScreenHeader } from '@/components/common/ScreenHeader';
import { SectionTitle, Text } from '@/components/ui/text';
import { AppColors } from '@/constants/colors';
import { useNotifications } from '@/hooks/useNotifications';
import { formatRelativeTime } from '@/utils/date';

export default function NotificationsScreen() {
  const {
    notifications,
    unreadCount,
    isLoadingData,
    dataError,
    refreshAll,
    markNotificationRead,
    markAllNotificationsRead,
  } = useNotifications();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAll();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader
        title="Notifications"
        rightSlot={
          unreadCount > 0 ? (
            <HeaderIconButton
              label="Mark all notifications as read"
              icon={<CheckCheck size={21} color="#FFFFFF" />}
              onPress={markAllNotificationsRead}
            />
          ) : undefined
        }
      />

      <ScrollView
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={AppColors.primary}
            colors={[AppColors.primary]}
          />
        }>
        <View className="mx-auto w-full max-w-2xl">
          {dataError ? (
            <View className="p-4">
              <AlertBanner
                message={dataError}
                variant="error"
                actionLabel="Retry"
                onAction={handleRefresh}
              />
            </View>
          ) : null}

          {isLoadingData && notifications.length === 0 ? (
            <LoadingState message="Loading notifications..." />
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={<Bell size={30} color={AppColors.primary} />}
              title="No activity alerts yet"
              description="Assignment reminders and completion updates will appear in this feed."
            />
          ) : (
            <>
              <SectionTitle
                title={
                  unreadCount > 0
                    ? `Recent activity (${unreadCount} unread)`
                    : 'Recent activity'
                }
                rightAction={
                  unreadCount > 0 ? (
                    <Pressable onPress={markAllNotificationsRead} hitSlop={8}>
                      <Text size="xs" tone="brand" weight="medium">
                        Mark all read
                      </Text>
                    </Pressable>
                  ) : undefined
                }
              />

              <View className="border-t border-b border-[#EDEBE9]">
                {notifications.map((item, idx) => {
                  const isUnread = !item.is_read;
                  const isLast = idx === notifications.length - 1;

                  return (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      onPress={() => {
                        if (isUnread) {
                          markNotificationRead(item.id);
                        }
                      }}
                      className={`active:bg-[#F3F2F1] ${
                        isUnread ? 'bg-[#FAFDFE]' : 'bg-white'
                      }`}>
                      <View className="flex-row items-start px-4 py-3.5">
                        <View
                          className={`mr-3.5 mt-0.5 h-10 w-10 items-center justify-center rounded-full ${
                            isUnread ? 'bg-[#EBF3FC]' : 'bg-[#F3F2F1]'
                          }`}>
                          <Bell
                            size={18}
                            color={
                              isUnread ? AppColors.primary : AppColors.textSecondary
                            }
                          />
                        </View>

                        <View className="flex-1">
                          <View className="flex-row items-center justify-between gap-2">
                            <View className="flex-1 flex-row items-center gap-2">
                              {isUnread ? (
                                <View className="h-2 w-2 rounded-full bg-[#0067B8]" />
                              ) : null}
                              <Text
                                size="md"
                                weight={isUnread ? 'semibold' : 'medium'}
                                numberOfLines={1}
                                className="flex-1">
                                {item.title}
                              </Text>
                            </View>
                            <Text size="xs" tone="muted">
                              {formatRelativeTime(item.created_at)}
                            </Text>
                          </View>

                          <Text size="sm" tone="secondary" className="mt-1 leading-5">
                            {item.message}
                          </Text>
                        </View>
                      </View>

                      {!isLast ? (
                        <View className="pl-[68px]">
                          <View className="h-[1px] bg-[#EDEBE9]" />
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

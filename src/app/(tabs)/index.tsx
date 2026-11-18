import { router } from 'expo-router';
import {
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  Plus,
  Search,
  ShieldCheck,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/common/EmptyState';
import { AlertBanner } from '@/components/common/ErrorBanner';
import { LoadingState } from '@/components/common/LoadingState';
import { HeaderIconButton, ScreenHeader } from '@/components/common/ScreenHeader';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { TaskCard } from '@/components/tasks/TaskCard';
import { StudentAvatar } from '@/components/ui/avatar';
import { Heading, SectionTitle, Text } from '@/components/ui/text';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';

export default function DashboardScreen() {
  const { student } = useAuth();
  const { dashboard, isLoadingData, dataError, refreshAll, createTask } = useTasks();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
      {/* Microsoft Authenticator Signature Solid Blue Header */}
      <ScreenHeader
        title="Student LMS"
        leftIcon={<ShieldCheck size={22} color="#FFFFFF" />}
        rightSlot={
          <>
            <HeaderIconButton
              label="Search assignments"
              icon={<Search size={20} color="#FFFFFF" />}
              onPress={() => router.push('/(tabs)/tasks')}
            />
            <HeaderIconButton
              label="Add assignment"
              icon={<Plus size={22} color="#FFFFFF" />}
              onPress={() => setIsAddModalOpen(true)}
            />
          </>
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
            <View className="px-4 pt-3">
              <AlertBanner
                message={dataError}
                variant="error"
                actionLabel="Retry"
                onAction={handleRefresh}
              />
            </View>
          ) : null}

          {/* Authenticator Primary Account Row (Welcome + Student Identity) */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open student profile"
            onPress={() => router.push('/(tabs)/profile')}
            className="flex-row items-center border-b border-[#EDEBE9] bg-white px-4 py-4 active:bg-[#F3F2F1]">
            <StudentAvatar
              fullName={student?.full_name ?? 'Student'}
              imageUrl={student?.profile_image}
              size={44}
            />
            <View className="ml-3.5 flex-1">
              <Text size="xs" tone="secondary">
                Welcome back · {student?.department ?? 'University Student'}
              </Text>
              <Heading size="md" className="mt-0.5">
                {student?.full_name ?? 'Student'}
              </Heading>
              <Text size="xs" tone="brand" weight="medium" className="mt-0.5">
                {student?.email ?? ''} · {student?.student_id ?? ''}
              </Text>
            </View>
            <ChevronRight size={18} color={AppColors.textMuted} />
          </Pressable>

          {/* Authenticator Code-Readout Style Summary Strip */}
          <View className="flex-row border-b border-[#EDEBE9] bg-white">
            <Pressable
              onPress={() => router.push('/(tabs)/tasks')}
              className="flex-1 border-r border-[#EDEBE9] px-4 py-4 active:bg-[#F3F2F1]">
              <Text size="xs" tone="secondary">
                Total tasks
              </Text>
              <Text className="mt-1 font-semibold text-[24px] tracking-tight text-[#0067B8]">
                {String(dashboard.totalAssignments).padStart(2, '0')}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/(tabs)/tasks')}
              className="flex-1 border-r border-[#EDEBE9] px-4 py-4 active:bg-[#F3F2F1]">
              <Text size="xs" tone="secondary">
                Pending
              </Text>
              <Text className="mt-1 font-semibold text-[24px] tracking-tight text-[#986F0B]">
                {String(dashboard.pendingAssignments).padStart(2, '0')}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/(tabs)/tasks')}
              className="flex-1 px-4 py-4 active:bg-[#F3F2F1]">
              <Text size="xs" tone="secondary">
                Completed
              </Text>
              <Text className="mt-1 font-semibold text-[24px] tracking-tight text-[#107C10]">
                {String(dashboard.completedAssignments).padStart(2, '0')}
              </Text>
            </Pressable>
          </View>

          {isLoadingData && dashboard.totalAssignments === 0 ? (
            <LoadingState message="Syncing your assignments..." />
          ) : (
            <>
              {/* Upcoming Deadlines Section (Fluent Blue Section Title) */}
              <SectionTitle
                title="Upcoming deadlines"
                rightAction={
                  <Pressable onPress={() => router.push('/(tabs)/tasks')} hitSlop={8}>
                    <Text size="xs" tone="brand" weight="medium">
                      View all
                    </Text>
                  </Pressable>
                }
              />

              <View className="border-t border-b border-[#EDEBE9]">
                {dashboard.upcomingDeadlines.length === 0 ? (
                  <EmptyState
                    icon={<ClipboardCheck size={30} color={AppColors.primary} />}
                    title="You're all caught up"
                    description="No pending assignment deadlines right now. Add a new task to keep track of coursework."
                    actionLabel="Add assignment"
                    onAction={() => setIsAddModalOpen(true)}
                    showAccentPlus
                  />
                ) : (
                  dashboard.upcomingDeadlines.map((task, idx) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      compact
                      isLast={idx === dashboard.upcomingDeadlines.length - 1}
                    />
                  ))
                )}
              </View>

              {/* Recently Added Assignments Section */}
              <SectionTitle
                title="Recently added"
                rightAction={
                  <Pressable onPress={() => router.push('/(tabs)/tasks')} hitSlop={8}>
                    <Text size="xs" tone="secondary">
                      Manage
                    </Text>
                  </Pressable>
                }
              />

              <View className="border-t border-b border-[#EDEBE9]">
                {dashboard.recentlyAdded.length === 0 ? (
                  <EmptyState
                    icon={<BookOpen size={30} color={AppColors.primary} />}
                    title="Let's add your first task!"
                    description="Tap the + button in the top right to track a course assignment."
                    actionLabel="Add task"
                    onAction={() => setIsAddModalOpen(true)}
                    showAccentPlus
                  />
                ) : (
                  dashboard.recentlyAdded.map((task, idx) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      compact
                      isLast={idx === dashboard.recentlyAdded.length - 1}
                    />
                  ))
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <CreateTaskModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (input) => {
          await createTask(input);
        }}
      />
    </View>
  );
}

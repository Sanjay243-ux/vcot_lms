import { router, useLocalSearchParams } from 'expo-router';
import {
  BookOpen,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  FileText,
  RotateCcw,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/common/EmptyState';
import { AlertBanner } from '@/components/common/ErrorBanner';
import { LoadingState } from '@/components/common/LoadingState';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { StatusBadge } from '@/components/tasks/StatusBadge';
import { Divider } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/modal/ConfirmDialog';
import { Heading, SectionTitle, Text } from '@/components/ui/text';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { taskService } from '@/services/taskService';
import type { Task } from '@/types/database';
import { formatFullDate, getDeadlineInfo } from '@/utils/date';

export default function AssignmentDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { student } = useAuth();
  const { getTaskById, setTaskStatus } = useTasks();

  const cachedTask = id ? getTaskById(id) : undefined;
  const [fetchedTask, setFetchedTask] = useState<Task | null>(null);
  const [isFetchingRemote, setIsFetchingRemote] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const task = cachedTask ?? fetchedTask;
  const isLoading = !task && isFetchingRemote;

  useEffect(() => {
    if (cachedTask || !id || !student) {
      return;
    }

    let active = true;
    const loadRemoteTask = async () => {
      setIsFetchingRemote(true);
      try {
        const loaded = await taskService.fetchTaskById(id, student.id);
        if (active) setFetchedTask(loaded);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Could not load assignment.');
        }
      } finally {
        if (active) setIsFetchingRemote(false);
      }
    };

    loadRemoteTask();

    return () => {
      active = false;
    };
  }, [id, cachedTask, student]);

  const handleToggleStatus = async () => {
    if (!task) return;
    setError(null);
    setFeedbackMessage(null);
    setIsUpdating(true);

    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';

    try {
      const updated = await setTaskStatus(task.id, nextStatus);
      setFetchedTask(updated);
      setIsConfirmModalOpen(false);
      setFeedbackMessage(
        nextStatus === 'completed'
          ? 'Assignment marked as completed.'
          : 'Assignment moved back to pending.'
      );
    } catch (err) {
      setIsConfirmModalOpen(false);
      setError(
        err instanceof Error ? err.message : 'Unable to update assignment status.'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const deadline = task ? getDeadlineInfo(task.due_date, task.status) : null;
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/tasks');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Assignment details" onBack={handleBack} />

      {isLoading ? (
        <LoadingState fullScreen message="Loading assignment details..." />
      ) : !task ? (
        <View className="mx-auto w-full max-w-2xl flex-1 justify-center">
          <EmptyState
            icon={<FileText size={30} color={AppColors.primary} />}
            title="Assignment not found"
            description="This assignment may have been removed or is unavailable."
            actionLabel="Back to My Tasks"
            onAction={() => router.replace('/(tabs)/tasks')}
          />
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerClassName="pb-10"
            showsVerticalScrollIndicator={false}>
            <View className="mx-auto w-full max-w-2xl">
              {error ? (
                <View className="px-4 pt-4">
                  <AlertBanner message={error} variant="error" />
                </View>
              ) : null}
              {feedbackMessage ? (
                <View className="px-4 pt-4">
                  <AlertBanner message={feedbackMessage} variant="success" />
                </View>
              ) : null}

              {/* Authenticator Account-Detail Hero Header */}
              <View className="border-b border-[#EDEBE9] px-4 py-5">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1 flex-row items-start gap-3.5">
                    <View
                      className={`mt-0.5 h-12 w-12 items-center justify-center rounded-full ${
                        task.status === 'completed' ? 'bg-[#DFF6DD]' : 'bg-[#EBF3FC]'
                      }`}>
                      {task.status === 'completed' ? (
                        <CheckCircle2 size={24} color={AppColors.success} />
                      ) : (
                        <BookOpen size={22} color={AppColors.primary} />
                      )}
                    </View>

                    <View className="flex-1">
                      <Text size="xs" tone="brand" weight="semibold">
                        {task.course_name}
                      </Text>
                      <Heading size="lg" className="mt-1">
                        {task.title}
                      </Heading>
                      <View className="mt-2.5">
                        <StatusBadge status={task.status} />
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Schedule Section */}
              <SectionTitle title="Schedule & status" />

              <View className="border-t border-b border-[#EDEBE9]">
                <View className="flex-row items-center px-4 py-3.5">
                  <View className="mr-3.5 h-9 w-9 items-center justify-center rounded-full bg-[#F3F2F1]">
                    <CalendarPlus size={18} color={AppColors.textSecondary} />
                  </View>
                  <View className="flex-1">
                    <Text size="xs" tone="secondary">
                      Assigned date
                    </Text>
                    <Text size="md" weight="medium" className="mt-0.5">
                      {formatFullDate(task.created_at)}
                    </Text>
                  </View>
                </View>

                <Divider inset />

                <View className="flex-row items-center px-4 py-3.5">
                  <View
                    className={`mr-3.5 h-9 w-9 items-center justify-center rounded-full ${
                      deadline?.urgency === 'overdue' ? 'bg-[#FDE7E9]' : 'bg-[#EBF3FC]'
                    }`}>
                    <Calendar
                      size={18}
                      color={
                        deadline?.urgency === 'overdue'
                          ? AppColors.error
                          : AppColors.primary
                      }
                    />
                  </View>
                  <View className="flex-1">
                    <Text size="xs" tone="secondary">
                      Due date
                    </Text>
                    <Text size="md" weight="semibold" className="mt-0.5">
                      {formatFullDate(task.due_date)}
                    </Text>
                    {deadline && task.status === 'pending' ? (
                      <Text
                        size="xs"
                        tone={deadline.urgency === 'overdue' ? 'error' : 'brand'}
                        weight="semibold"
                        className="mt-0.5">
                        {deadline.label}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>

              {/* Instructions Section */}
              <SectionTitle title="Assignment instructions" />

              <View className="border-t border-b border-[#EDEBE9] px-4 py-4">
                <Text size="md" tone="secondary" className="leading-6">
                  {task.description?.trim()
                    ? task.description
                    : 'No additional instructions were provided for this assignment.'}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Action Bar (Solid Microsoft Blue Button) */}
          <View className="border-t border-[#EDEBE9] bg-white px-4 py-3.5">
            <View className="mx-auto w-full max-w-2xl">
              {task.status === 'pending' ? (
                <Button
                  action="primary"
                  size="lg"
                  label="Mark as completed"
                  leftIcon={<CheckCircle2 size={18} color="#FFFFFF" />}
                  onPress={() => setIsConfirmModalOpen(true)}
                  fullWidth
                />
              ) : (
                <Button
                  action="secondary"
                  size="lg"
                  label="Move back to pending"
                  leftIcon={<RotateCcw size={17} color={AppColors.textPrimary} />}
                  onPress={() => setIsConfirmModalOpen(true)}
                  fullWidth
                />
              )}
            </View>
          </View>

          <ConfirmDialog
            visible={isConfirmModalOpen}
            title={
              task.status === 'pending'
                ? 'Mark as completed?'
                : 'Reopen assignment?'
            }
            description={
              task.status === 'pending'
                ? `Confirm that you have completed "${task.title}".`
                : `Move "${task.title}" back to your pending assignments list?`
            }
            confirmLabel={
              task.status === 'pending' ? 'Mark completed' : 'Move to pending'
            }
            confirmAction="primary"
            isLoading={isUpdating}
            icon={<CheckCircle2 size={20} color={AppColors.primary} />}
            onConfirm={handleToggleStatus}
            onCancel={() => setIsConfirmModalOpen(false)}
          />
        </>
      )}
    </View>
  );
}

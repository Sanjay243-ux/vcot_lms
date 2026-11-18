import { router } from 'expo-router';
import { BookOpen, CheckCircle2, ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { AppColors } from '@/constants/colors';
import type { Task } from '@/types/database';
import { formatShortDate, getDeadlineInfo } from '@/utils/date';

interface TaskCardProps {
  task: Task;
  compact?: boolean;
  isLast?: boolean;
}

export function TaskCard({ task, compact = false, isLast = false }: TaskCardProps) {
  const deadline = getDeadlineInfo(task.due_date, task.status);
  const isCompleted = task.status === 'completed';

  const statusLineTone = isCompleted
    ? 'success'
    : deadline.urgency === 'overdue'
      ? 'error'
      : 'brand';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open assignment ${task.title}`}
      onPress={() =>
        router.push({
          pathname: '/task/[id]',
          params: { id: task.id },
        })
      }
      className="bg-white active:bg-[#F3F2F1]">
      <View className="flex-row items-center px-4 py-3.5">
        {/* Left Microsoft Authenticator Circular Account/Course Badge */}
        <View
          className={`mr-3.5 h-10 w-10 items-center justify-center rounded-full ${
            isCompleted ? 'bg-[#DFF6DD]' : 'bg-[#F3F2F1]'
          }`}>
          {isCompleted ? (
            <CheckCircle2 size={20} color={AppColors.success} />
          ) : (
            <BookOpen size={19} color={AppColors.primary} />
          )}
        </View>

        {/* Center Account-style Details */}
        <View className="flex-1 pr-2">
          <Text size="xs" tone="secondary" numberOfLines={1}>
            {task.course_name}
          </Text>

          <Text
            size="md"
            weight="medium"
            numberOfLines={compact ? 1 : 2}
            className="mt-0.5 text-[#1B1A19]">
            {task.title}
          </Text>

          {/* Authenticator-style Blue Readout Line */}
          <View className="mt-1 flex-row items-center gap-2">
            <Text size="sm" tone={statusLineTone} weight="semibold">
              {isCompleted
                ? `Completed · ${formatShortDate(task.due_date)}`
                : `${formatShortDate(task.due_date)} · ${deadline.label}`}
            </Text>
          </View>
        </View>

        {/* Right Status & Chevron */}
        <View className="flex-row items-center gap-2">
          <View
            className={`rounded-[3px] px-2 py-0.5 ${
              isCompleted
                ? 'bg-[#DFF6DD]'
                : deadline.urgency === 'overdue'
                  ? 'bg-[#FDE7E9]'
                  : 'bg-[#EBF3FC]'
            }`}>
            <Text
              size="xs"
              weight="semibold"
              tone={
                isCompleted
                  ? 'success'
                  : deadline.urgency === 'overdue'
                    ? 'error'
                    : 'brand'
              }>
              {isCompleted ? 'Done' : 'Pending'}
            </Text>
          </View>
          <ChevronRight size={18} color={AppColors.textMuted} />
        </View>
      </View>

      {/* Inset Fluent Hairline Divider */}
      {!isLast ? (
        <View className="pl-[68px]">
          <View className="h-[1px] bg-[#EDEBE9]" />
        </View>
      ) : null}
    </Pressable>
  );
}

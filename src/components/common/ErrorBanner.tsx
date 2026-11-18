import { AlertCircle, CheckCircle2, Info } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { AppColors } from '@/constants/colors';

interface AlertBannerProps {
  message: string;
  variant?: 'error' | 'success' | 'info';
  actionLabel?: string;
  onAction?: () => void;
}

export function AlertBanner({
  message,
  variant = 'error',
  actionLabel,
  onAction,
}: AlertBannerProps) {
  const stylesByVariant = {
    error: {
      box: 'bg-[#FDE7E9] border-[#F1BBBC]',
      tone: 'error' as const,
      icon: <AlertCircle size={17} color={AppColors.error} />,
    },
    success: {
      box: 'bg-[#DFF6DD] border-[#9FD89F]',
      tone: 'success' as const,
      icon: <CheckCircle2 size={17} color={AppColors.success} />,
    },
    info: {
      box: 'bg-[#EBF3FC] border-[#CFE4FA]',
      tone: 'brand' as const,
      icon: <Info size={17} color={AppColors.primary} />,
    },
  }[variant];

  return (
    <View
      className={`flex-row items-center justify-between gap-2.5 rounded-[4px] border px-3.5 py-2.5 ${stylesByVariant.box}`}>
      <View>{stylesByVariant.icon}</View>
      <View className="flex-1">
        <Text size="sm" tone={stylesByVariant.tone}>
          {message}
        </Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text size="xs" tone={stylesByVariant.tone} weight="semibold" className="underline">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

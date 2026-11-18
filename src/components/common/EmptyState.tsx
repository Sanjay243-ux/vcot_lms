import { Plus } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Heading, Text } from '@/components/ui/text';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  showAccentPlus?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  showAccentPlus = false,
}: EmptyStateProps) {
  return (
    <View className="items-center justify-center px-6 py-12">
      <View className="relative mb-5 h-[76px] w-[76px] items-center justify-center rounded-full bg-[#EBF3FC]">
        {icon}
        {showAccentPlus ? (
          <View className="absolute -bottom-0.5 -right-0.5 h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#0067B8]">
            <Plus size={14} color="#FFFFFF" />
          </View>
        ) : null}
      </View>

      <Heading size="md" className="text-center">
        {title}
      </Heading>

      <Text
        size="sm"
        tone="secondary"
        className="mt-2 max-w-[280px] text-center leading-5">
        {description}
      </Text>

      {actionLabel && onAction ? (
        <View className="mt-6 w-full max-w-[260px]">
          <Button
            action="primary"
            size="md"
            label={actionLabel}
            onPress={onAction}
            fullWidth
          />
        </View>
      ) : null}
    </View>
  );
}

import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { AppColors } from '@/constants/colors';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({
  message = 'Loading...',
  fullScreen = false,
}: LoadingStateProps) {
  return (
    <View
      className={`items-center justify-center ${
        fullScreen ? 'flex-1 bg-white px-6' : 'py-12 px-4'
      }`}>
      <ActivityIndicator size="large" color={AppColors.primary} />
      <Text size="sm" tone="secondary" className="mt-3">
        {message}
      </Text>
    </View>
  );
}

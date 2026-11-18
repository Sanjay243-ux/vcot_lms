import React from 'react';
import { Modal, Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Heading, Text } from '@/components/ui/text';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmAction?: 'primary' | 'success' | 'danger';
  isLoading?: boolean;
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmAction = 'primary',
  isLoading = false,
  icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <Pressable
        onPress={isLoading ? undefined : onCancel}
        className="flex-1 items-center justify-center bg-black/45 px-6">
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-[6px] border border-[#EDEBE9] bg-white p-6">
          <View className="mb-2 flex-row items-center gap-2.5">
            {icon}
            <Heading size="md" className="flex-1">
              {title}
            </Heading>
          </View>

          <Text size="sm" tone="secondary" className="mb-6 leading-5">
            {description}
          </Text>

          <View className="flex-row justify-end gap-2.5">
            <Button
              action="secondary"
              size="md"
              label={cancelLabel}
              disabled={isLoading}
              onPress={onCancel}
            />
            <Button
              action={confirmAction}
              size="md"
              label={confirmLabel}
              isLoading={isLoading}
              onPress={onConfirm}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text as RNText,
  View,
} from 'react-native';

import { AlertBanner } from '@/components/common/ErrorBanner';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import type { CreateTaskInput } from '@/types/database';
import { validateTaskFields } from '@/utils/validation';

interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: CreateTaskInput) => Promise<void>;
}

function getDefaultDueDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export function CreateTaskModal({ visible, onClose, onSubmit }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [courseName, setCourseName] = useState('');
  const [dueDate, setDueDate] = useState(getDefaultDueDateString);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle('');
    setCourseName('');
    setDueDate(getDefaultDueDateString());
    setDescription('');
    setError(null);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setError(null);
    onClose();
  };

  const handleCreate = async () => {
    setError(null);
    const check = validateTaskFields({
      title,
      course_name: courseName,
      due_date: dueDate,
    });
    if (!check.valid) {
      setError(check.error ?? 'Please check your input fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        course_name: courseName,
        due_date: dueDate,
        description,
      });
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 items-center justify-center bg-black/45 px-5">
        <View className="max-h-[90%] w-full max-w-md overflow-hidden rounded-[6px] border border-[#EDEBE9] bg-white">
          {/* Microsoft Authenticator Blue Modal Header */}
          <View className="flex-row items-center justify-between bg-[#0067B8] px-5 py-3.5">
            <RNText className="font-semibold text-[17px] text-white">
              Add assignment
            </RNText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close dialog"
              onPress={handleClose}
              className="h-8 w-8 items-center justify-center rounded-full active:bg-white/20">
              <X size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="gap-4 p-5">
              <Text size="sm" tone="secondary">
                Enter your university course assignment details below.
              </Text>

              {error ? <AlertBanner message={error} variant="error" /> : null}

              <FormInput
                label="Assignment title"
                placeholder="e.g. Operating Systems Scheduling Lab"
                value={title}
                onChangeText={setTitle}
              />

              <FormInput
                label="Course name"
                placeholder="e.g. CS305 - Operating Systems"
                value={courseName}
                onChangeText={setCourseName}
              />

              <FormInput
                label="Due date (YYYY-MM-DD)"
                placeholder="2026-11-15"
                value={dueDate}
                onChangeText={setDueDate}
                helperText="Format: YYYY-MM-DD"
              />

              <FormInput
                label="Instructions (optional)"
                placeholder="Submission rubric, chapter notes, or link..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <View className="mt-2 flex-row justify-end gap-2.5">
                <Button
                  action="secondary"
                  label="Cancel"
                  disabled={isSubmitting}
                  onPress={handleClose}
                />
                <Button
                  action="primary"
                  label="Add task"
                  isLoading={isSubmitting}
                  onPress={handleCreate}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

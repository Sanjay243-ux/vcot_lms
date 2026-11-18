import { router } from 'expo-router';
import { KeyRound } from 'lucide-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { AlertBanner } from '@/components/common/ErrorBanner';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/input';
import { Heading, Text } from '@/components/ui/text';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = async () => {
    setFormError(null);
    const check = validateEmail(email);
    if (!check.valid) {
      setEmailError(check.error);
      return;
    }

    setEmailError(undefined);
    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setIsSent(true);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Could not send reset instructions.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader
        title="Recover account"
        onBack={() => router.back()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView
          contentContainerClassName="flex-grow px-6 py-8"
          keyboardShouldPersistTaps="handled">
          <View className="mx-auto w-full max-w-md">
            <View className="mb-6 items-center pt-4">
              <View className="mb-4 h-[72px] w-[72px] items-center justify-center rounded-full bg-[#EBF3FC]">
                <KeyRound size={30} color={AppColors.primary} />
              </View>
              <Heading size="xl" className="text-center">
                Reset your password
              </Heading>
              <Text
                size="sm"
                tone="secondary"
                className="mt-2 max-w-[300px] text-center leading-5">
                Enter your university student email address to receive a password reset link.
              </Text>
            </View>

            {formError ? (
              <View className="mb-4">
                <AlertBanner message={formError} variant="error" />
              </View>
            ) : null}

            {isSent ? (
              <View className="gap-5">
                <AlertBanner
                  variant="success"
                  message={`We sent password recovery instructions to ${email.trim()}.`}
                />
                <Button
                  action="primary"
                  size="lg"
                  label="Return to sign in"
                  onPress={() => router.replace('/(auth)/login')}
                  fullWidth
                />
              </View>
            ) : (
              <View className="gap-6">
                <FormInput
                  label="University email"
                  placeholder="student@university.edu"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError(undefined);
                  }}
                  error={emailError}
                />

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Button
                      action="secondary"
                      size="lg"
                      label="Cancel"
                      onPress={() => router.back()}
                      fullWidth
                    />
                  </View>
                  <View className="flex-1">
                    <Button
                      action="primary"
                      size="lg"
                      label="Next"
                      isLoading={isSubmitting}
                      onPress={handleReset}
                      fullWidth
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

import { Link, router } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { AlertBanner } from '@/components/common/ErrorBanner';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/input';
import { Heading, Text } from '@/components/ui/text';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail, validatePassword } from '@/utils/validation';

export default function LoginScreen() {
  const { signIn, isDemoMode } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setFormError(null);

    const emailCheck = validateEmail(email);
    const passwordCheck = validatePassword(password, 6);

    if (!emailCheck.valid || !passwordCheck.valid) {
      setFieldErrors({
        email: emailCheck.error,
        password: passwordCheck.error,
      });
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    try {
      await signIn(email, password);
      router.replace('/');
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Unable to sign in. Check your email and password.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('student@university.edu');
    setPassword('password123');
    setFieldErrors({});
    setFormError(null);
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader
        title="Student LMS"
        leftIcon={<ShieldCheck size={22} color="#FFFFFF" />}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView
          contentContainerClassName="flex-grow px-6 py-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="mx-auto w-full max-w-md">
            {/* Authenticator Circular Emblem + Organization Header */}
            <View className="mb-7 flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-[#EBF3FC]">
                <ShieldCheck size={22} color={AppColors.primary} />
              </View>
              <View>
                <Text size="md" weight="semibold" className="text-[#1B1A19]">
                  VCOT University
                </Text>
                <Text size="xs" tone="secondary">
                  Student Learning Portal
                </Text>
              </View>
            </View>

            <Heading size="2xl">Sign in</Heading>
            <Text size="sm" tone="secondary" className="mt-1 mb-6">
              Use your university student email and password to view assignments.
            </Text>

            {isDemoMode ? (
              <View className="mb-5">
                <AlertBanner
                  variant="info"
                  message="Preview mode active (configure .env for Supabase cloud sync)."
                  actionLabel="Autofill demo"
                  onAction={fillDemoCredentials}
                />
              </View>
            ) : null}

            {formError ? (
              <View className="mb-4">
                <AlertBanner message={formError} variant="error" />
              </View>
            ) : null}

            <View className="gap-4">
              <FormInput
                label="University email"
                placeholder="student@university.edu"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                error={fieldErrors.email}
              />

              <FormInput
                label="Password"
                placeholder="Enter password"
                isPassword
                autoCapitalize="none"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                error={fieldErrors.password}
              />
            </View>

            {/* Microsoft Sign-In Action Links */}
            <View className="mt-4 gap-2.5">
              <View className="flex-row items-center gap-1">
                <Text size="sm" tone="secondary">
                  No student account?
                </Text>
                <Link href="/(auth)/register" asChild>
                  <Pressable hitSlop={8}>
                    <Text size="sm" tone="brand" weight="medium">
                      Create one!
                    </Text>
                  </Pressable>
                </Link>
              </View>

              <Link href="/(auth)/forgot-password" asChild>
                <Pressable hitSlop={8} className="self-start">
                  <Text size="sm" tone="brand" weight="medium">
                    Forgot my password
                  </Text>
                </Pressable>
              </Link>
            </View>

            {/* Solid Microsoft Blue CTA Button */}
            <View className="mt-8">
              <Button
                action="primary"
                size="lg"
                label="Sign in"
                isLoading={isSubmitting}
                onPress={handleLogin}
                fullWidth
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

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
import {
  validateDepartment,
  validateEmail,
  validateFullName,
  validatePassword,
  validateStudentId,
} from '@/utils/validation';

export default function RegisterScreen() {
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    setFormError(null);

    const nameCheck = validateFullName(fullName);
    const idCheck = validateStudentId(studentId);
    const deptCheck = validateDepartment(department);
    const emailCheck = validateEmail(email);
    const passCheck = validatePassword(password, 6);
    const confirmError =
      password !== confirmPassword ? 'Passwords do not match.' : undefined;

    if (
      !nameCheck.valid ||
      !idCheck.valid ||
      !deptCheck.valid ||
      !emailCheck.valid ||
      !passCheck.valid ||
      confirmError
    ) {
      setErrors({
        fullName: nameCheck.error,
        studentId: idCheck.error,
        department: deptCheck.error,
        email: emailCheck.error,
        password: passCheck.error,
        confirmPassword: confirmError,
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const result = await register({
        fullName,
        studentId,
        department,
        email,
        password,
      });

      if (result.needsEmailConfirmation) {
        setConfirmationSent(true);
      } else {
        router.replace('/');
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Unable to register student account.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader
        title="Add student account"
        onBack={() => router.back()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView
          contentContainerClassName="flex-grow px-6 py-7"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="mx-auto w-full max-w-md">
            <View className="mb-5 flex-row items-center gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-[#EBF3FC]">
                <ShieldCheck size={20} color={AppColors.primary} />
              </View>
              <Text size="md" weight="semibold">
                VCOT University
              </Text>
            </View>

            <Heading size="2xl">Create account</Heading>
            <Text size="sm" tone="secondary" className="mt-1 mb-6">
              Register your university student ID to sync assignments and deadlines.
            </Text>

            {confirmationSent ? (
              <View className="gap-5">
                <AlertBanner
                  variant="success"
                  message="Account created. Please check your email inbox to verify your address, then sign in."
                />
                <Button
                  action="primary"
                  size="lg"
                  label="Back to sign in"
                  onPress={() => router.replace('/(auth)/login')}
                  fullWidth
                />
              </View>
            ) : (
              <View className="gap-4">
                {formError ? <AlertBanner message={formError} variant="error" /> : null}

                <FormInput
                  label="Full name"
                  placeholder="e.g. Priya Nair"
                  autoCapitalize="words"
                  value={fullName}
                  onChangeText={setFullName}
                  error={errors.fullName}
                />

                <FormInput
                  label="Student ID"
                  placeholder="e.g. STU-2026-205"
                  autoCapitalize="characters"
                  value={studentId}
                  onChangeText={setStudentId}
                  error={errors.studentId}
                />

                <FormInput
                  label="Department"
                  placeholder="e.g. Computer Science"
                  value={department}
                  onChangeText={setDepartment}
                  error={errors.department}
                />

                <FormInput
                  label="University email"
                  placeholder="priya.nair@university.edu"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                  error={errors.email}
                />

                <FormInput
                  label="Password"
                  placeholder="Minimum 6 characters"
                  isPassword
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                  error={errors.password}
                />

                <FormInput
                  label="Confirm password"
                  placeholder="Re-enter password"
                  isPassword
                  autoCapitalize="none"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  error={errors.confirmPassword}
                />

                <View className="mt-3">
                  <Button
                    action="primary"
                    size="lg"
                    label="Create account"
                    isLoading={isSubmitting}
                    onPress={handleRegister}
                    fullWidth
                  />
                </View>

                <View className="mt-3 flex-row items-center justify-center gap-1 pb-4">
                  <Text size="sm" tone="secondary">
                    Already registered?
                  </Text>
                  <Link href="/(auth)/login" asChild>
                    <Pressable hitSlop={8}>
                      <Text size="sm" tone="brand" weight="medium">
                        Sign in
                      </Text>
                    </Pressable>
                  </Link>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

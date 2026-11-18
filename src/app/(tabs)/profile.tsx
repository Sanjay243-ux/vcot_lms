import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import {
  Building2,
  Camera,
  ChevronRight,
  Hash,
  LogOut,
  Mail,
  Pencil,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';

import { AlertBanner } from '@/components/common/ErrorBanner';
import { HeaderIconButton, ScreenHeader } from '@/components/common/ScreenHeader';
import { StudentAvatar } from '@/components/ui/avatar';
import { Divider } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/modal/ConfirmDialog';
import { Heading, SectionTitle, Text } from '@/components/ui/text';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import {
  validateDepartment,
  validateFullName,
  validateStudentId,
} from '@/utils/validation';

export default function ProfileScreen() {
  const { student, isDemoMode, updateProfile, signOut } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(student?.full_name ?? '');
  const [studentId, setStudentId] = useState(student?.student_id ?? '');
  const [department, setDepartment] = useState(student?.department ?? '');
  const [selectedAvatarUri, setSelectedAvatarUri] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    studentId?: string;
    department?: string;
  }>({});
  const [banner, setBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isLogoutDialogVisible, setIsLogoutDialogVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const startEditing = () => {
    setBanner(null);
    setFieldErrors({});
    setFullName(student?.full_name ?? '');
    setStudentId(student?.student_id ?? '');
    setDepartment(student?.department ?? '');
    setSelectedAvatarUri(null);
    setIsEditing(true);
  };

  const handlePickImage = async () => {
    setBanner(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setBanner({
        type: 'error',
        message: 'Photo library permission is required to select a profile picture.',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      const pickedUri = result.assets[0].uri;
      setSelectedAvatarUri(pickedUri);
      if (!isEditing && student) {
        setIsSaving(true);
        try {
          await updateProfile(
            {
              full_name: student.full_name,
              student_id: student.student_id,
              department: student.department,
              profile_image: pickedUri,
            },
            pickedUri
          );
          setSelectedAvatarUri(null);
          setBanner({ type: 'success', message: 'Profile photo updated.' });
        } catch (err) {
          setBanner({
            type: 'error',
            message: err instanceof Error ? err.message : 'Could not update photo.',
          });
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  const handleSaveProfile = async () => {
    setBanner(null);

    const nameCheck = validateFullName(fullName);
    const idCheck = validateStudentId(studentId);
    const deptCheck = validateDepartment(department);

    if (!nameCheck.valid || !idCheck.valid || !deptCheck.valid) {
      setFieldErrors({
        fullName: nameCheck.error,
        studentId: idCheck.error,
        department: deptCheck.error,
      });
      return;
    }

    setFieldErrors({});
    setIsSaving(true);
    try {
      await updateProfile(
        {
          full_name: fullName,
          student_id: studentId,
          department,
          profile_image: selectedAvatarUri ?? student?.profile_image ?? null,
        },
        selectedAvatarUri
      );
      setIsEditing(false);
      setSelectedAvatarUri(null);
      setBanner({
        type: 'success',
        message: 'Student profile updated.',
      });
    } catch (err) {
      setBanner({
        type: 'error',
        message: err instanceof Error ? err.message : 'Unable to save profile changes.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      setIsLogoutDialogVisible(false);
      router.replace('/(auth)/login');
    } catch (err) {
      setIsLogoutDialogVisible(false);
      setBanner({
        type: 'error',
        message: err instanceof Error ? err.message : 'Unable to sign out.',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const previewAvatar = selectedAvatarUri ?? student?.profile_image ?? null;

  return (
    <View className="flex-1 bg-white">
      {/* Microsoft Authenticator Settings-Style Header */}
      <ScreenHeader
        title={isEditing ? 'Edit profile' : 'Profile'}
        onBack={
          isEditing
            ? () => {
                setIsEditing(false);
                setFieldErrors({});
                setSelectedAvatarUri(null);
              }
            : undefined
        }
        rightSlot={
          !isEditing ? (
            <HeaderIconButton
              label="Edit student profile"
              icon={<Pencil size={19} color="#FFFFFF" />}
              onPress={startEditing}
            />
          ) : undefined
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView
          contentContainerClassName="pb-12"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View className="mx-auto w-full max-w-2xl">
            {banner ? (
              <View className="px-4 pt-4">
                <AlertBanner
                  message={banner.message}
                  variant={banner.type === 'success' ? 'success' : 'error'}
                />
              </View>
            ) : null}

            {/* Top Identity Row (Microsoft Account Style) */}
            <View className="flex-row items-center border-b border-[#EDEBE9] px-4 py-5">
              <View className="relative">
                <StudentAvatar
                  fullName={student?.full_name ?? 'Student'}
                  imageUrl={previewAvatar}
                  size={68}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Change profile photo"
                  onPress={handlePickImage}
                  disabled={isSaving}
                  className="absolute -bottom-0.5 -right-0.5 h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#0067B8]">
                  <Camera size={13} color="#FFFFFF" />
                </Pressable>
              </View>

              <View className="ml-4 flex-1">
                <Heading size="lg">{student?.full_name ?? 'University Student'}</Heading>
                <Text size="sm" tone="secondary" className="mt-0.5">
                  {student?.email ?? ''}
                </Text>
                <Text size="xs" tone="brand" weight="semibold" className="mt-1">
                  Student ID: {student?.student_id ?? '-'}
                </Text>
              </View>
            </View>

            {isEditing ? (
              <View className="gap-4 px-5 py-5">
                <SectionTitle title="Update student details" className="px-0 pt-0" />

                <FormInput
                  label="Full name"
                  value={fullName}
                  onChangeText={setFullName}
                  error={fieldErrors.fullName}
                />

                <FormInput
                  label="Student ID"
                  value={studentId}
                  autoCapitalize="characters"
                  onChangeText={setStudentId}
                  error={fieldErrors.studentId}
                />

                <FormInput
                  label="Department"
                  value={department}
                  onChangeText={setDepartment}
                  error={fieldErrors.department}
                />

                <FormInput
                  label="University email"
                  value={student?.email ?? ''}
                  editable={false}
                  helperText="Primary login email cannot be changed here."
                />

                <View className="mt-3 flex-row justify-end gap-2.5">
                  <Button
                    action="secondary"
                    label="Cancel"
                    disabled={isSaving}
                    onPress={() => {
                      setIsEditing(false);
                      setFieldErrors({});
                      setSelectedAvatarUri(null);
                    }}
                  />
                  <Button
                    action="primary"
                    label="Save changes"
                    isLoading={isSaving}
                    onPress={handleSaveProfile}
                  />
                </View>
              </View>
            ) : (
              <>
                {/* Microsoft Authenticator Settings Section 1 */}
                <SectionTitle title="Student identity" />

                <View className="border-t border-b border-[#EDEBE9]">
                  <View className="flex-row items-center px-4 py-3.5">
                    <View className="mr-3.5 h-9 w-9 items-center justify-center rounded-full bg-[#F3F2F1]">
                      <UserIcon size={18} color={AppColors.textSecondary} />
                    </View>
                    <View className="flex-1">
                      <Text size="md" weight="medium">
                        Full name
                      </Text>
                      <Text size="sm" tone="secondary" className="mt-0.5">
                        {student?.full_name ?? '-'}
                      </Text>
                    </View>
                  </View>

                  <Divider inset />

                  <View className="flex-row items-center px-4 py-3.5">
                    <View className="mr-3.5 h-9 w-9 items-center justify-center rounded-full bg-[#F3F2F1]">
                      <Hash size={18} color={AppColors.textSecondary} />
                    </View>
                    <View className="flex-1">
                      <Text size="md" weight="medium">
                        Student ID
                      </Text>
                      <Text size="sm" tone="secondary" className="mt-0.5">
                        {student?.student_id ?? '-'}
                      </Text>
                    </View>
                  </View>

                  <Divider inset />

                  <View className="flex-row items-center px-4 py-3.5">
                    <View className="mr-3.5 h-9 w-9 items-center justify-center rounded-full bg-[#F3F2F1]">
                      <Building2 size={18} color={AppColors.textSecondary} />
                    </View>
                    <View className="flex-1">
                      <Text size="md" weight="medium">
                        Department
                      </Text>
                      <Text size="sm" tone="secondary" className="mt-0.5">
                        {student?.department ?? '-'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Microsoft Authenticator Settings Section 2 */}
                <SectionTitle title="University account" />

                <View className="border-t border-b border-[#EDEBE9]">
                  <View className="flex-row items-center px-4 py-3.5">
                    <View className="mr-3.5 h-9 w-9 items-center justify-center rounded-full bg-[#F3F2F1]">
                      <Mail size={18} color={AppColors.textSecondary} />
                    </View>
                    <View className="flex-1">
                      <Text size="md" weight="medium">
                        Email address
                      </Text>
                      <Text size="sm" tone="secondary" className="mt-0.5">
                        {student?.email ?? '-'}
                      </Text>
                    </View>
                  </View>

                  <Divider inset />

                  <View className="flex-row items-center px-4 py-3.5">
                    <View className="mr-3.5 h-9 w-9 items-center justify-center rounded-full bg-[#EBF3FC]">
                      <ShieldCheck size={18} color={AppColors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text size="md" weight="medium">
                        Account sync
                      </Text>
                      <Text size="sm" tone="secondary" className="mt-0.5">
                        {isDemoMode
                          ? 'Local preview session (configure .env for Supabase RLS sync)'
                          : 'Connected to Supabase with Row Level Security'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Microsoft Authenticator Settings Section 3 */}
                <SectionTitle title="Manage account" />

                <View className="border-t border-b border-[#EDEBE9]">
                  <Pressable
                    accessibilityRole="button"
                    onPress={startEditing}
                    className="flex-row items-center px-4 py-3.5 active:bg-[#F3F2F1]">
                    <View className="mr-3.5 h-9 w-9 items-center justify-center rounded-full bg-[#EBF3FC]">
                      <Pencil size={17} color={AppColors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text size="md" weight="medium" tone="brand">
                        Edit profile details
                      </Text>
                      <Text size="xs" tone="secondary" className="mt-0.5">
                        Update your name, student ID, department, or photo
                      </Text>
                    </View>
                    <ChevronRight size={18} color={AppColors.textMuted} />
                  </Pressable>

                  <Divider inset />

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setIsLogoutDialogVisible(true)}
                    className="flex-row items-center px-4 py-3.5 active:bg-[#FDE7E9]">
                    <View className="mr-3.5 h-9 w-9 items-center justify-center rounded-full bg-[#FDE7E9]">
                      <LogOut size={17} color={AppColors.error} />
                    </View>
                    <View className="flex-1">
                      <Text size="md" weight="medium" tone="error">
                        Sign out
                      </Text>
                      <Text size="xs" tone="secondary" className="mt-0.5">
                        Remove active session from this device
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={isLogoutDialogVisible}
        title="Sign out of Student LMS?"
        description="You will need to sign in with your university email and password to view assignments again."
        confirmLabel="Sign out"
        cancelLabel="Cancel"
        confirmAction="danger"
        isLoading={isLoggingOut}
        icon={<LogOut size={20} color={AppColors.error} />}
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsLogoutDialogVisible(false)}
      />
    </View>
  );
}

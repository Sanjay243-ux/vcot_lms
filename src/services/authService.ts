import * as Linking from 'expo-linking';

import { demoStore } from '@/services/demoStore';
import { ensureStudentProfile } from '@/services/studentService';
import { isSupabaseConfigured, supabase } from '@/services/supabase';
import type { RegisterStudentInput, Student } from '@/types/database';

export interface SignUpResult {
  student: Student | null;
  needsEmailConfirmation: boolean;
}

export const authService = {
  async signIn(email: string, password: string): Promise<Student> {
    if (!isSupabaseConfigured) {
      return demoStore.signIn(email, password);
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
    if (!data.user) {
      throw new Error('Unable to establish an authenticated student session.');
    }

    return ensureStudentProfile(data.user);
  },

  async register(input: RegisterStudentInput): Promise<SignUpResult> {
    if (!isSupabaseConfigured) {
      const student = await demoStore.register(input);
      return { student, needsEmailConfirmation: false };
    }

    const cleanEmail = input.email.trim().toLowerCase();
    const cleanStudentId = input.studentId.trim().toUpperCase();
    const cleanName = input.fullName.trim();
    const cleanDept = input.department.trim();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: input.password,
      options: {
        data: {
          full_name: cleanName,
          student_id: cleanStudentId,
          department: cleanDept,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Registration could not be completed. Please try again.');
    }

    // If Supabase email confirmation is enabled, session will be null until verified
    if (!data.session) {
      return { student: null, needsEmailConfirmation: true };
    }

    const student = await ensureStudentProfile(data.user, {
      full_name: cleanName,
      student_id: cleanStudentId,
      department: cleanDept,
    });

    return { student, needsEmailConfirmation: false };
  },

  async resetPassword(email: string): Promise<void> {
    if (!isSupabaseConfigured) {
      await demoStore.resetPassword(email);
      return;
    }

    const redirectTo = Linking.createURL('/(auth)/login');
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  async signOut(): Promise<void> {
    if (!isSupabaseConfigured) {
      await demoStore.signOut();
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },
};


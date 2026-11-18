import type { User } from '@supabase/supabase-js';

import {
  createStarterNotifications,
  createStarterTasks,
  demoStore,
} from '@/services/demoStore';
import { isSupabaseConfigured, supabase } from '@/services/supabase';
import type { Student, UpdateStudentProfileInput } from '@/types/database';

export async function ensureStudentProfile(
  authUser: User,
  overrides?: { full_name?: string; student_id?: string; department?: string }
): Promise<Student> {
  const { data: existing, error: fetchError } = await supabase
    .from('students')
    .select('*')
    .eq('auth_user_id', authUser.id)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (existing) {
    return existing as Student;
  }

  const meta = (authUser.user_metadata ?? {}) as Record<string, string | undefined>;
  const fallbackCode = `STU-${new Date().getFullYear()}-${authUser.id.replace(/-/g, '').slice(0, 5).toUpperCase()}`;

  const insertPayload = {
    auth_user_id: authUser.id,
    full_name:
      overrides?.full_name ||
      meta.full_name ||
      authUser.email?.split('@')[0] ||
      'University Student',
    student_id: (overrides?.student_id || meta.student_id || fallbackCode).toUpperCase(),
    email: authUser.email ?? 'student@university.edu',
    department: overrides?.department || meta.department || 'Computer Science',
    profile_image: null,
  };

  const { data: created, error: createError } = await supabase
    .from('students')
    .insert(insertPayload)
    .select('*')
    .single();

  if (createError || !created) {
    throw new Error(createError?.message ?? 'Could not initialize student profile.');
  }

  const student = created as Student;

  // Ensure starter tasks & notifications exist if DB trigger was not used
  const { count } = await supabase
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', student.id);

  if (!count || count === 0) {
    const starterTasks = createStarterTasks(student.id).map(
      ({ id: _id, ...rest }) => rest
    );
    const starterNotifications = createStarterNotifications(student.id).map(
      ({ id: _id, ...rest }) => rest
    );
    await supabase.from('tasks').insert(starterTasks);
    await supabase.from('notifications').insert(starterNotifications);
  }

  return student;
}

export const studentService = {
  async getCurrentStudent(): Promise<Student | null> {
    if (!isSupabaseConfigured) {
      return demoStore.getActiveStudent();
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return null;
    }

    return ensureStudentProfile(session.user);
  },

  async updateProfile(
    studentUuid: string,
    updates: UpdateStudentProfileInput
  ): Promise<Student> {
    if (!isSupabaseConfigured) {
      return demoStore.updateProfile(updates);
    }

    const payload: UpdateStudentProfileInput = {
      full_name: updates.full_name.trim(),
      student_id: updates.student_id.trim().toUpperCase(),
      department: updates.department.trim(),
    };

    if (updates.profile_image !== undefined) {
      payload.profile_image = updates.profile_image;
    }

    const { data, error } = await supabase
      .from('students')
      .update(payload)
      .eq('id', studentUuid)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to update student profile.');
    }

    return data as Student;
  },

  async uploadAvatarIfPossible(authUserId: string, localUri: string): Promise<string> {
    if (!isSupabaseConfigured) {
      return localUri;
    }

    try {
      const response = await fetch(localUri);
      const arrayBuffer = await response.arrayBuffer();
      const extension = localUri.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
      const filePath = `${authUserId}/avatar-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, {
          contentType: extension === 'png' ? 'image/png' : 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        // Gracefully fall back to local URI if storage bucket hasn't been created yet
        return localUri;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return data.publicUrl || localUri;
    } catch {
      return localUri;
    }
  },
};


import { useLmsContext } from '@/context/LmsContext';

export function useAuth() {
  const {
    student,
    isInitializing,
    isDemoMode,
    signIn,
    register,
    resetPassword,
    signOut,
    updateProfile,
  } = useLmsContext();

  return {
    student,
    isAuthenticated: Boolean(student),
    isInitializing,
    isDemoMode,
    signIn,
    register,
    resetPassword,
    signOut,
    updateProfile,
  };
}


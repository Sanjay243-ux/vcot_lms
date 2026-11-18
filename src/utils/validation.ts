export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const STUDENT_ID_REGEX = /^[A-Za-z0-9_-]{3,24}$/;

export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return { valid: false, error: 'Email address is required.' };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid university or personal email address.' };
  }
  return { valid: true };
}

export function validatePassword(password: string, minLength = 6): ValidationResult {
  if (!password) {
    return { valid: false, error: 'Password is required.' };
  }
  if (password.length < minLength) {
    return { valid: false, error: `Password must be at least ${minLength} characters long.` };
  }
  return { valid: true };
}

export function validateFullName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, error: 'Full name is required.' };
  }
  if (trimmed.length < 2) {
    return { valid: false, error: 'Full name must be at least 2 characters.' };
  }
  if (trimmed.length > 80) {
    return { valid: false, error: 'Full name must be under 80 characters.' };
  }
  return { valid: true };
}

export function validateStudentId(studentId: string): ValidationResult {
  const trimmed = studentId.trim();
  if (!trimmed) {
    return { valid: false, error: 'Student ID is required.' };
  }
  if (!STUDENT_ID_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: 'Student ID should be 3–24 characters using letters, numbers, or hyphens (e.g. STU-2026-104).',
    };
  }
  return { valid: true };
}

export function validateDepartment(department: string): ValidationResult {
  const trimmed = department.trim();
  if (!trimmed) {
    return { valid: false, error: 'Department is required.' };
  }
  if (trimmed.length < 2) {
    return { valid: false, error: 'Please enter a valid department name.' };
  }
  return { valid: true };
}

export function validateTaskFields(input: {
  title: string;
  course_name: string;
  due_date: string;
}): ValidationResult {
  if (!input.title.trim() || input.title.trim().length < 3) {
    return { valid: false, error: 'Assignment title must be at least 3 characters.' };
  }
  if (!input.course_name.trim() || input.course_name.trim().length < 2) {
    return { valid: false, error: 'Course name is required (e.g. CS301 - Database Systems).' };
  }
  const parsedDate = new Date(input.due_date.trim());
  if (Number.isNaN(parsedDate.getTime())) {
    return { valid: false, error: 'Please enter a valid due date in YYYY-MM-DD format.' };
  }
  return { valid: true };
}


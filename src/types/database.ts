export type TaskStatus = 'pending' | 'completed';

export type TaskFilter = 'all' | 'pending' | 'completed';

export type Student = {
  id: string;
  auth_user_id: string;
  full_name: string;
  student_id: string;
  email: string;
  department: string;
  profile_image: string | null;
  created_at: string;
};

export type Task = {
  id: string;
  student_id: string;
  title: string;
  description: string;
  course_name: string;
  due_date: string;
  status: TaskStatus;
  created_at: string;
};

export type NotificationItem = {
  id: string;
  student_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type DashboardSummary = {
  totalAssignments: number;
  pendingAssignments: number;
  completedAssignments: number;
  upcomingDeadlines: Task[];
  recentlyAdded: Task[];
};

export type RegisterStudentInput = {
  fullName: string;
  studentId: string;
  department: string;
  email: string;
  password: string;
};

export type UpdateStudentProfileInput = {
  full_name: string;
  student_id: string;
  department: string;
  profile_image?: string | null;
};

export type CreateTaskInput = {
  title: string;
  course_name: string;
  description: string;
  due_date: string;
};

export type Database = {
  public: {
    Tables: {
      students: {
        Row: Student;
        Insert: {
          id?: string;
          auth_user_id: string;
          full_name: string;
          student_id: string;
          email: string;
          department?: string;
          profile_image?: string | null;
          created_at?: string;
        };
        Update: {
          full_name?: string;
          student_id?: string;
          email?: string;
          department?: string;
          profile_image?: string | null;
        };
        Relationships: [];
      };
      tasks: {
        Row: Task;
        Insert: {
          id?: string;
          student_id: string;
          title: string;
          description?: string;
          course_name: string;
          due_date: string;
          status?: TaskStatus;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          course_name?: string;
          due_date?: string;
          status?: TaskStatus;
        };
        Relationships: [];
      };
      notifications: {
        Row: NotificationItem;
        Insert: {
          id?: string;
          student_id: string;
          title: string;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          message?: string;
          is_read?: boolean;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_student_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

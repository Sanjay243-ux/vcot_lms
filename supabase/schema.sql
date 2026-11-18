-- ============================================================================
-- VCOT Student LMS - Supabase Database Schema & Row Level Security (RLS)
-- ============================================================================
-- Run this script in your Supabase Dashboard -> SQL Editor.
-- It creates the `students`, `tasks`, and `notifications` tables, configures
-- strict Row Level Security (RLS) policies, sets up storage for profile avatars,
-- and automatically provisions a student profile + starter university tasks
-- upon registration.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Tables
-- ----------------------------------------------------------------------------

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) >= 2),
  student_id text not null unique check (char_length(trim(student_id)) >= 3),
  email text not null unique,
  department text not null default 'Computer Science',
  profile_image text,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  title text not null check (char_length(trim(title)) >= 2),
  description text not null default '',
  course_name text not null check (char_length(trim(course_name)) >= 2),
  due_date timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Indexes for fast dashboard & filter queries
create index if not exists idx_students_auth_user_id on public.students(auth_user_id);
create index if not exists idx_tasks_student_id on public.tasks(student_id);
create index if not exists idx_tasks_status_due_date on public.tasks(student_id, status, due_date);
create index if not exists idx_notifications_student_id on public.notifications(student_id, created_at desc);

-- ----------------------------------------------------------------------------
-- 2. Helper Function for RLS
-- ----------------------------------------------------------------------------

create or replace function public.current_student_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.students
  where auth_user_id = auth.uid()
  limit 1;
$$;

-- ----------------------------------------------------------------------------
-- 3. Row Level Security (RLS) Policies
-- ----------------------------------------------------------------------------

alter table public.students enable row level security;
alter table public.tasks enable row level security;
alter table public.notifications enable row level security;

-- Students policies: students can only read/insert/update their own profile
drop policy if exists "Students can view own profile" on public.students;
create policy "Students can view own profile"
  on public.students
  for select
  to authenticated
  using (auth_user_id = auth.uid());

drop policy if exists "Students can create own profile" on public.students;
create policy "Students can create own profile"
  on public.students
  for insert
  to authenticated
  with check (auth_user_id = auth.uid());

drop policy if exists "Students can update own profile" on public.students;
create policy "Students can update own profile"
  on public.students
  for update
  to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- Tasks policies: students can only access & manage their own assigned tasks
drop policy if exists "Students can view own tasks" on public.tasks;
create policy "Students can view own tasks"
  on public.tasks
  for select
  to authenticated
  using (student_id = public.current_student_id());

drop policy if exists "Students can insert own tasks" on public.tasks;
create policy "Students can insert own tasks"
  on public.tasks
  for insert
  to authenticated
  with check (student_id = public.current_student_id());

drop policy if exists "Students can update own tasks" on public.tasks;
create policy "Students can update own tasks"
  on public.tasks
  for update
  to authenticated
  using (student_id = public.current_student_id())
  with check (student_id = public.current_student_id());

drop policy if exists "Students can delete own tasks" on public.tasks;
create policy "Students can delete own tasks"
  on public.tasks
  for delete
  to authenticated
  using (student_id = public.current_student_id());

-- Notifications policies: students can only view & update their own notifications
drop policy if exists "Students can view own notifications" on public.notifications;
create policy "Students can view own notifications"
  on public.notifications
  for select
  to authenticated
  using (student_id = public.current_student_id());

drop policy if exists "Students can insert own notifications" on public.notifications;
create policy "Students can insert own notifications"
  on public.notifications
  for insert
  to authenticated
  with check (student_id = public.current_student_id());

drop policy if exists "Students can update own notifications" on public.notifications;
create policy "Students can update own notifications"
  on public.notifications
  for update
  to authenticated
  using (student_id = public.current_student_id())
  with check (student_id = public.current_student_id());

-- ----------------------------------------------------------------------------
-- 4. Auto-Provision Student Profile & Starter Assignments on Auth Signup
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_student_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_student_uuid uuid;
  generated_student_code text;
begin
  generated_student_code := coalesce(
    nullif(trim(new.raw_user_meta_data->>'student_id'), ''),
    'STU-' || to_char(now(), 'YYYY') || '-' || substr(replace(new.id::text, '-', ''), 1, 5)
  );

  insert into public.students (
    auth_user_id,
    full_name,
    student_id,
    email,
    department,
    profile_image
  )
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1)),
    upper(generated_student_code),
    new.email,
    coalesce(nullif(trim(new.raw_user_meta_data->>'department'), ''), 'Computer Science'),
    null
  )
  on conflict (auth_user_id) do update
    set email = excluded.email
  returning id into new_student_uuid;

  -- Seed starter university assignments for new students
  insert into public.tasks (student_id, title, description, course_name, due_date, status, created_at)
  values
    (
      new_student_uuid,
      'Database Normalization & ER Diagram Lab',
      'Design an Entity-Relationship diagram for a university library system and normalize all relational schemas up to Third Normal Form (3NF). Submit your SQL DDL script and written justification.',
      'CS301 - Database Systems',
      now() + interval '2 days',
      'pending',
      now() - interval '3 days'
    ),
    (
      new_student_uuid,
      'RESTful API Security & JWT Middleware',
      'Implement input validation, rate limiting, and row-level authorization policies for the student portal microservice. Include Postman test results for protected endpoints.',
      'CS340 - Software Engineering',
      now() + interval '5 days',
      'pending',
      now() - interval '2 days'
    ),
    (
      new_student_uuid,
      'Technical Research Abstract Draft',
      'Write a 400-word structured academic abstract summarizing your semester capstone topic, methodology, and expected outcomes using IEEE formatting guidelines.',
      'ENG210 - Academic Writing',
      now() + interval '8 days',
      'pending',
      now() - interval '1 day'
    ),
    (
      new_student_uuid,
      'Algorithm Complexity Analysis Worksheet',
      'Analyze asymptotic time and space complexity (Big-O, Big-Omega, Big-Theta) for recursive divide-and-conquer sorting algorithms including Merge Sort and Quick Sort.',
      'CS204 - Data Structures & Algorithms',
      now() - interval '2 days',
      'completed',
      now() - interval '7 days'
    );

  -- Seed starter notifications
  insert into public.notifications (student_id, title, message, is_read, created_at)
  values
    (
      new_student_uuid,
      'Welcome to VCOT Student Portal',
      'Your student account is ready. View upcoming course deadlines on your Home dashboard and track progress in My Tasks.',
      false,
      now() - interval '10 minutes'
    ),
    (
      new_student_uuid,
      'Upcoming Deadline Reminder',
      'Database Normalization & ER Diagram Lab (CS301) is due in 2 days. Remember to mark it completed once submitted.',
      false,
      now() - interval '5 minutes'
    );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_student_user();

-- ----------------------------------------------------------------------------
-- 5. Storage Bucket for Student Avatars (Optional)
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Public can view avatars" on storage.objects;
create policy "Public can view avatars"
  on storage.objects
  for select
  to public
  using (bucket_id = 'avatars');

drop policy if exists "Authenticated students can upload own avatar" on storage.objects;
create policy "Authenticated students can upload own avatar"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Authenticated students can update own avatar" on storage.objects;
create policy "Authenticated students can update own avatar"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


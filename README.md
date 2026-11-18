# VCOT Student LMS Mobile Application

A clean, modern, beginner-friendly university Student Learning Management System (LMS) mobile application built with **React Native**, **Expo Router**, **Gluestack UI**, **NativeWind (Tailwind CSS)**, **Lucide Icons**, **Google Fonts (Inter)**, and **Supabase**.

---

## Features

### 1. Authentication
- Student Registration (`Full Name`, `Student ID`, `Department`, `Email`, `Password`)
- Student Sign In with Email & Password
- Forgot Password email reset flow
- Secure session persistence & Logout confirmation dialog
- Interactive Preview Mode when `.env` is not yet configured

### 2. Home Dashboard
- Personalized student welcome header with avatar & department badge
- Summary cards for **Total Tasks**, **Pending**, and **Completed** assignments
- **Upcoming Deadlines** sorted by nearest due date
- **Recently Added** assignments with quick access to details

### 3. My Tasks
- View all assigned tasks in a clean card layout
- Filter by **All**, **Pending**, and **Completed** with live counts
- Instant search across assignment titles, course names, and descriptions
- **Add Task** dialog to create and track additional assignments

### 4. Assignment Details
- Course name, assignment title, status badge, assigned date, due date, and full instructions
- **Mark as Completed** button with confirmation dialog (and option to reopen if needed)

### 5. Notifications & Student Profile
- Unread badge counter on the **Notifications** tab + **Mark all read** support
- **Student Profile** displaying avatar photo picker (`expo-image-picker`), Full Name, Student ID, Email, and Department
- Inline **Edit Profile** form with input validation

---

## Project Structure

```text
vcot_lms/
├── supabase/
│   └── schema.sql                 # Tables, RLS policies, auth signup trigger & storage bucket
├── src/
│   ├── app/                       # Expo Router navigation & screens
│   │   ├── _layout.tsx            # Root layout (Fonts, GluestackUIProvider, Auth Guard)
│   │   ├── (auth)/                # Login, Register, Forgot Password screens
│   │   ├── (tabs)/                # Bottom Tabs: Home, My Tasks, Notifications, Profile
│   │   └── task/[id].tsx          # Assignment Details screen
│   ├── components/
│   │   ├── common/                # ScreenHeader, EmptyState, LoadingState, AlertBanner
│   │   ├── tasks/                 # TaskCard, StatusBadge, CreateTaskModal
│   │   └── ui/                    # Gluestack UI + NativeWind reusable primitives
│   ├── constants/                 # Color palette tokens
│   ├── context/                   # LmsContext state & Supabase auth listener
│   ├── hooks/                     # useAuth, useTasks, useNotifications
│   ├── services/                  # Supabase client & data services
│   ├── types/                     # Strict TypeScript interfaces & Database schema types
│   └── utils/                     # Input validation & date formatting helpers
├── .env.example                   # Environment variable template
├── tailwind.config.js             # NativeWind / Tailwind CSS configuration
└── package.json
```

---

## Quick Start

### 1. Install Dependencies

```bash
cd vcot_lms
npm install
```

### 2. Configure Supabase (Recommended)

1. Create a project in [Supabase](https://supabase.com).
2. Open **SQL Editor** in your Supabase Dashboard and run [`supabase/schema.sql`](./supabase/schema.sql).
   - Creates `students`, `tasks`, and `notifications` tables.
   - Enables **Row Level Security (RLS)** so students can only read/write their own records.
   - Adds an automatic signup trigger that creates the student profile and starter assignments upon registration.
3. Copy `.env.example` to `.env` and fill in your **Project URL** and **Anon Public Key** (never use a `service_role` key in the mobile app):

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

> **Note:** If `.env` is not configured yet, the app automatically runs in **Preview Mode** (`student@university.edu` / `password123`) so you can explore every screen immediately.

### 3. Start the App

```bash
npx expo start -c
```

Press `a` for Android, `i` for iOS Simulator, `w` for Web, or scan the QR code with Expo Go.

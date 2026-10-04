import React from 'react';
import RootLayout from '@/src/app/layout';
import { usePathname } from '@/src/lib/router';
import { useAuth } from '@/src/lib/auth/AuthContext';

// Page components
import LoginPage from '@/src/app/login/page';
import DashboardPage from '@/src/app/dashboard/page';
import StudentsPage from '@/src/app/students/page';
import NewStudentPage from '@/src/app/students/new/page';
import StudentDetailPage from '@/src/app/students/[id]/page';

import TeachersPage from '@/src/app/teachers/page';
import NewTeacherPage from '@/src/app/teachers/new/page';
import TeacherDetailPage from '@/src/app/teachers/[id]/page';

import ClassesPage from '@/src/app/classes/page';
import NewClassPage from '@/src/app/classes/new/page';
import ClassDetailPage from '@/src/app/classes/[id]/page';

import SubjectsPage from '@/src/app/subjects/page';
import NewSubjectPage from '@/src/app/subjects/new/page';
import SubjectDetailPage from '@/src/app/subjects/[id]/page';

import GradesPage from '@/src/app/grades/page';
import AttendancePage from '@/src/app/attendance/page';
import AttendanceHistoryPage from '@/src/app/attendance/history/page';

function AppContent() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  // If user navigated to /login, show login regardless
  if (pathname === '/login') {
    return <LoginPage />;
  }

  // Not authenticated? Show LoginPage
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Route matching based on pathname
  if (pathname === '/' || pathname === '/dashboard') {
    return <DashboardPage />;
  }

  // Student module routes
  if (pathname === '/students') {
    return <StudentsPage />;
  }
  if (pathname === '/students/new') {
    return <NewStudentPage />;
  }
  if (pathname.startsWith('/students/')) {
    const id = pathname.replace('/students/', '');
    return <StudentDetailPage params={{ id }} />;
  }

  // Teacher module routes
  if (pathname === '/teachers') {
    return <TeachersPage />;
  }
  if (pathname === '/teachers/new') {
    return <NewTeacherPage />;
  }
  if (pathname.startsWith('/teachers/')) {
    const id = pathname.replace('/teachers/', '');
    return <TeacherDetailPage params={{ id }} />;
  }

  // Class module routes
  if (pathname === '/classes') {
    return <ClassesPage />;
  }
  if (pathname === '/classes/new') {
    return <NewClassPage />;
  }
  if (pathname.startsWith('/classes/')) {
    const id = pathname.replace('/classes/', '');
    return <ClassDetailPage params={{ id }} />;
  }

  // Subject module routes
  if (pathname === '/subjects') {
    return <SubjectsPage />;
  }
  if (pathname === '/subjects/new') {
    return <NewSubjectPage />;
  }
  if (pathname.startsWith('/subjects/')) {
    const id = pathname.replace('/subjects/', '');
    return <SubjectDetailPage params={{ id }} />;
  }

  // Grade module routes
  if (pathname === '/grades') {
    return <GradesPage />;
  }

  // Attendance module routes
  if (pathname === '/attendance') {
    return <AttendancePage />;
  }
  if (pathname === '/attendance/history') {
    return <AttendanceHistoryPage />;
  }

  // Fallback to Dashboard
  return <DashboardPage />;
}

export default function App() {
  return (
    <RootLayout>
      <AppContent />
    </RootLayout>
  );
}

import { RoleGuard } from '@/components/auth/RoleGuard';
import StudentsPage from '@/modules/student/components/StudentsPage';

export default function Page() {
  return (
    <RoleGuard allowedRoles={['admin', 'teacher']}>
      <StudentsPage />
    </RoleGuard>
  );
}

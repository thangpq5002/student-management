import { RoleGuard } from '@/components/auth/RoleGuard';
import TeachersPage from '@/modules/teacher/components/TeachersPage';

export default function Page() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <TeachersPage />
    </RoleGuard>
  );
}

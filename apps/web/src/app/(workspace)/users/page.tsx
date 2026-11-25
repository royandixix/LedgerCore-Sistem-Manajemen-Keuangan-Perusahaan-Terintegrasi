import { Suspense } from 'react';
import { getUserWorkspace } from '../../../features/users/users.api';
import { UsersWorkspace } from '../../../features/users/users-workspace';

async function UsersContent() {
  const data = await getUserWorkspace();
  return <UsersWorkspace {...data} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4" aria-label="Memuat pengguna"><div className="h-24 rounded-2xl bg-slate-200"/><div className="h-56 rounded-2xl bg-slate-200"/></div>}>
      <UsersContent />
    </Suspense>
  );
}

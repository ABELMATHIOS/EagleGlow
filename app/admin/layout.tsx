import AdminSidebar from '@/src/components/admin/AdminSidebar';
import AdminLogoutButton from '@/src/components/admin/AdminLogoutButton';
import { getCurrentUser } from '@/src/lib/get-current-user';

export const metadata = {
  title: 'Admin Panel — EagleGlow',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Cinzel:wght@700&display=swap');

        .admin-shell {
          display: flex;
          min-height: 100vh;
          background: #0a0a0a;
          font-family: 'Inter', sans-serif;
        }
        .admin-main {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        .admin-topbar {
          height: 56px;
          background: #111111;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          position: sticky;
          top: 0;
          z-index: 30;
          flex-shrink: 0;
        }
        .admin-content {
          flex: 1;
          padding: 32px 28px;
          overflow-y: auto;
        }
        @media (max-width: 768px) {
          .admin-content { padding: 20px 16px; }
          .admin-topbar  { padding: 0 16px 0 64px; justify-content: flex-end; }
          .admin-topbar-title { display: none; }
          .admin-topbar-username { display: none !important; }
        }
      `}</style>

      <div className="admin-shell">
        <AdminSidebar />
        <div className="admin-main">
          {/* Top bar */}
          <div className="admin-topbar">
            <p className="admin-topbar-title" style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13, color: 'rgba(255,255,255,0.35)',
            }}>
              EagleGlow Admin Panel
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div className="admin-topbar-username" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#2ECC71', flexShrink: 0,
                }} />
                <span style={{
                  fontSize: 12, color: 'rgba(255,255,255,0.4)',
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {user?.name ?? 'Admin'} — {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
              </div>
              <AdminLogoutButton />
            </div>
          </div>

          {/* Page content */}
          <div className="admin-content">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
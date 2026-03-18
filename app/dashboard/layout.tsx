import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/actions/auth'
import { DashboardSidebar } from '@/components/dashboard-sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getProfile()

  if (!profile) {
    redirect('/auth/login')
  }

  if (profile.role === 'client') {
    redirect('/mis-pedidos')
  }

  return (
    <div className="min-h-screen">
      <DashboardSidebar profile={profile} />
      <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

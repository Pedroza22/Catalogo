import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/actions/auth'
import { DashboardWrapper } from '@/components/dashboard-wrapper'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getProfile()

  if (!profile) {
    redirect('/auth/login')
  }

  if (profile.role === 'cliente') {
    redirect('/')
  }

  return (
    <DashboardWrapper profile={profile}>
      {children}
    </DashboardWrapper>
  )
}

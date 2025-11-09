import prisma from '../../lib/prisma'
import { cookies } from 'next/headers'
import DashboardClient from '../../components/dashboard/DashboardClient'

function getMonthLabels(months = 6) {
  const labels: string[] = []
  const now = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    labels.push(d.toLocaleString('default', { month: 'short', year: 'numeric' }))
  }
  return labels
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`
}

export default async function Page() {
  const cookieStore = cookies()
  let adminSecretCookie: string | undefined
  /* eslint-disable @typescript-eslint/no-explicit-any */
  try {
    if (typeof (cookieStore as any)?.then === 'function') {
      const resolved = await (cookieStore as any)
      adminSecretCookie = resolved.get('admin-secret')?.value
    } else {
      adminSecretCookie = (cookieStore as any).get('admin-secret')?.value
    }
  } catch {
    adminSecretCookie = undefined
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const adminSecret = process.env.ADMIN_SECRET

  if (!adminSecret || adminSecretCookie !== adminSecret) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Dashboard (Privado)</h1>
        <p>Esta página é privada. Para visualizar, defina um cookie <code>admin-secret</code> com o valor da variável de ambiente <code>ADMIN_SECRET</code>.</p>
      </div>
    )
  }

  // Range de datas
  const months = 6
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)

  // query DB
  const activeMembers = await prisma.member.count({ where: { status: 'ativo' } })

  const referrals = await prisma.referral.findMany({ where: { createdAt: { gte: start } } })
  const thankYous = await prisma.thankYouRecord.findMany({ where: { createdAt: { gte: start } } })

  const labels = getMonthLabels(months)
  const monthsMapRef: Record<string, number> = {}
  const monthsMapThank: Record<string, number> = {}
  labels.forEach((_, idx) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1) + idx, 1)
    monthsMapRef[monthKey(d)] = 0
    monthsMapThank[monthKey(d)] = 0
  })

  referrals.forEach((r) => {
    const k = monthKey(new Date(r.createdAt))
    if (k in monthsMapRef) monthsMapRef[k]++
  })
  thankYous.forEach((t) => {
    const k = monthKey(new Date(t.createdAt))
    if (k in monthsMapThank) monthsMapThank[k]++
  })

  const referralsSeries = Object.keys(monthsMapRef).map((k) => monthsMapRef[k])
  const thankYousSeries = Object.keys(monthsMapThank).map((k) => monthsMapThank[k])

  const thisMonthKey = monthKey(new Date(now.getFullYear(), now.getMonth()))
  const referralsThisMonth = monthsMapRef[thisMonthKey] ?? 0
  const thankYousThisMonth = monthsMapThank[thisMonthKey] ?? 0

  return (
    <DashboardClient
      activeMembers={activeMembers}
      referralsThisMonth={referralsThisMonth}
      thankYousThisMonth={thankYousThisMonth}
      labels={labels}
      referralsSeries={referralsSeries}
      thankYousSeries={thankYousSeries}
    />
  )
}

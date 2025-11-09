import Link from 'next/link'

export default function Header() {
  return (
    <header style={{ padding: 12, borderBottom: '1px solid rgba(0,0,0,0.06)', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Link href="/apply" className="btn btn-ghost">Apply</Link>
        <Link href="/dashboard" className="btn btn-ghost">Dashboard</Link>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Link href="/" className="btn btn-primary">Admin Login</Link>
        <Link href="/admin/applications" className="btn btn-ghost">Intenções</Link>
      </div>
    </header>
  )
}

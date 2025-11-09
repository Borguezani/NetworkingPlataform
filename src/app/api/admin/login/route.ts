import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const key = body?.key
    const adminSecret = process.env.ADMIN_SECRET

    if (!adminSecret) {
      return NextResponse.json({ error: 'ADMIN_SECRET not configured' }, { status: 500 })
    }

    if (!key || key !== adminSecret) {
      return NextResponse.json({ ok: false, message: 'invalid key' }, { status: 401 })
    }

    // Set cookie for 1 day
    const maxAge = 60 * 60 * 24 * 1
    const cookie = `admin-secret=${encodeURIComponent(key)}; Path=/; Max-Age=${maxAge}; SameSite=Lax; HttpOnly`

    return NextResponse.json({ ok: true }, { status: 200, headers: { 'Set-Cookie': cookie } })
  } catch {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 })
  }
}

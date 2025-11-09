import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function GET(request: Request) {
  try {
    const adminSecret = process.env.ADMIN_SECRET
    const header = request.headers.get('x-admin-secret')
    if (!adminSecret || header !== adminSecret) return unauthorized()

    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const page = Number(url.searchParams.get('page') ?? '1')
    const perPage = Number(url.searchParams.get('per_page') ?? '20')

  const where: Record<string, unknown> = {}
    if (status) where.status = status

    const total = await prisma.application.count({ where })
    const data = await prisma.application.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    })

    return NextResponse.json({ data, meta: { page, per_page: perPage, total } })
  } catch (err: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _e = err
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

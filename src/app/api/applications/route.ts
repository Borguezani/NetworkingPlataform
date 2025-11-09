import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { applicationSchema } from '../../../lib/validators'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = applicationSchema.parse(body)

    const existing = await prisma.application.findFirst({ where: { email: parsed.email } })
    if (existing) {
      return NextResponse.json({ error: 'Já existe uma submissão com esse e-mail' }, { status: 409 })
    }

    const created = await prisma.application.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        company: parsed.company ?? null,
        motivation: parsed.motivation,
      }
    })

    return NextResponse.json({ id: created.id, status: created.status, submitted_at: created.submittedAt }, { status: 201 })
  } catch (err: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = err as any
    if (e?.issues) {
      return NextResponse.json({ error: e.issues }, { status: 400 })
    }
    return NextResponse.json({ error: (e?.message as string) ?? 'Erro interno' }, { status: 500 })
  }
}

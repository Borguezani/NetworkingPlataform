import { NextResponse } from 'next/server'
import prisma from '../../../../../../lib/prisma'
import { decisionSchema } from '../../../../../../lib/validators'
import { randomUUID } from 'crypto'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const adminSecret = process.env.ADMIN_SECRET
    const header = request.headers.get('x-admin-secret')
    if (!adminSecret || header !== adminSecret) return unauthorized()

    const id = params.id
    const body = await request.json()
    const parsed = decisionSchema.parse(body)

    const application = await prisma.application.findUnique({ where: { id } })
    if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

    if (parsed.decision === 'approve') {
      const token = randomUUID()
      //Expiração em 7 dias
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)

      const invite = await prisma.invite.create({
        data: {
          applicationId: application.id,
          token,
          expiresAt,
        }
      })

      await prisma.application.update({ where: { id }, data: { status: 'aprovado', processedAt: new Date(), processedBy: header ?? 'admin' } })

      const link = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/invitations/complete?token=${token}`
      return NextResponse.json({ id: application.id, status: 'aprovado', invite: { token: invite.token, expires_at: invite.expiresAt, link } })
    }

    // reject
    await prisma.application.update({ where: { id }, data: { status: 'rejeitado', processedAt: new Date(), processedBy: header ?? 'admin' } })
    return NextResponse.json({ id: application.id, status: 'rejeitado' })
  } catch (err: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = err as any
    if (e?.issues) return NextResponse.json({ error: e.issues }, { status: 400 })
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { inviteAcceptSchema } from '../../../../lib/validators'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = inviteAcceptSchema.parse(body)

    const now = new Date()
    const invite = await prisma.invite.findFirst({ where: { token: parsed.token } })
    if (!invite) return NextResponse.json({ error: 'Token inválido' }, { status: 400 })
    if (invite.used) return NextResponse.json({ error: 'Token já utilizado' }, { status: 400 })
    if (invite.expiresAt < now) return NextResponse.json({ error: 'Token expirado' }, { status: 400 })

    // Criar member
    const member = await prisma.member.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        status: 'ativo',
      }
    })

    // Criar profile opcional
    await prisma.profile.create({
      data: {
        memberId: member.id,
        bio: parsed.bio ?? null,
        phone: parsed.phone ?? null,
      }
    })

    await prisma.invite.update({ where: { id: invite.id }, data: { used: true } })

    return NextResponse.json({ id: member.id, email: member.email }, { status: 201 })
  } catch (err: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = err as any
    if (e?.issues) return NextResponse.json({ error: e.issues }, { status: 400 })
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

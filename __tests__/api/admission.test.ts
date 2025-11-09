/** @jest-environment node */
/// <reference types="jest" />

import prisma from '../../src/lib/prisma'
import { POST as createApplication } from '../../src/app/api/applications/route'
import { GET as listApplications } from '../../src/app/api/admin/applications/route'
import { POST as decisionHandler } from '../../src/app/api/admin/applications/[id]/decision/route'
import { POST as acceptInvite } from '../../src/app/api/invites/accept/route'

// As declarações de Jest já vêm via "@types/jest", então você pode remover as suas `declare const`.
// Mas, se quiser mantê-las para garantir compatibilidade, podemos tipá-las corretamente:

declare const beforeAll: (fn: () => unknown | Promise<unknown>) => void
declare const afterAll: (fn: () => unknown | Promise<unknown>) => void
declare const test: (name: string, fn: () => unknown | Promise<unknown>) => void
declare const expect: jest.Expect

beforeAll(async () => {
  process.env.ADMIN_SECRET = process.env.ADMIN_SECRET ?? 'testsecret'
})

afterAll(async () => {
  await prisma.$disconnect()
})

test('full admission flow: submit -> approve -> accept invite', async () => {
  // cleanup previous
  await prisma.invite.deleteMany().catch(() => {})
  await prisma.application.deleteMany().catch(() => {})
  await prisma.member.deleteMany().catch(() => {})

  // 1) submit application
  const payload = {
    name: 'Test User',
    email: 'test@example.com',
    company: 'ACME',
    motivation: 'Networking',
  }

  const req = new Request('http://localhost/api/applications', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })

  await createApplication(req)

  const app = await prisma.application.findFirst({
    where: { email: payload.email },
  })
  expect(app).toBeTruthy()
  if (!app) return

  // 2) approve via admin decision
  const adminSecret = process.env.ADMIN_SECRET ?? 'testsecret'
  const adminReq = new Request('http://localhost/api/admin/applications', {
    method: 'GET',
    headers: { 'x-admin-secret': adminSecret },
  })

  await listApplications(adminReq)

  const listed = await prisma.application.findUnique({
    where: { id: app.id },
  })
  expect(listed).toBeTruthy()

  // decision
  const decisionReq = new Request(
    `http://localhost/api/admin/applications/${app.id}/decision`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-admin-secret': adminSecret,
      },
      body: JSON.stringify({ decision: 'aprovado' }),
    }
  )

  await decisionHandler(decisionReq, {
    params: Promise.resolve({ id: app.id }),
  })

  const invite = await prisma.invite.findFirst({
    where: { applicationId: app.id },
  })
  expect(invite).toBeTruthy()
  if (!invite) return

  // 3) accept invite -> creates member
  const acceptReq = new Request('http://localhost/api/invites/accept', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      token: invite.token,
      name: 'Member Name',
      email: 'member@example.com',
      phone: '11999999999',
    }),
  })

  await acceptInvite(acceptReq)
  const member = await prisma.member.findUnique({
    where: { email: 'member@example.com' },
  })
  expect(member).toBeTruthy()
})

/** @jest-environment node */
/// <reference types="jest" />
// Provide Jest globals for environments where @types/jest isn't installed
declare const beforeAll: (fn: () => any) => void
declare const afterAll: (fn: () => any) => void
declare const test: (name: string, fn: () => any) => void
declare const expect: any
import prisma from '../../src/lib/prisma'
import { POST as createApplication } from '../../src/app/api/applications/route'
import { GET as listApplications } from '../../src/app/api/admin/applications/route'
import { POST as decisionHandler } from '../../src/app/api/admin/applications/[id]/decision/route'
import { POST as acceptInvite } from '../../src/app/api/invites/accept/route'

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
  const payload = { name: 'Test User', email: 'test@example.com', company: 'ACME', motivation: 'Networking' }
  const req = new Request('http://localhost/api/applications', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
  await createApplication(req)
  // verify created in DB
  const app = await prisma.application.findFirst({ where: { email: payload.email } })
  expect(app).toBeTruthy()
  if (!app) return

  // 2) approve via admin decision
  const adminSecret = process.env.ADMIN_SECRET ?? 'testsecret'
  const adminReq = new Request('http://localhost/api/admin/applications', { method: 'GET', headers: { 'x-admin-secret': adminSecret as string } })
  await listApplications(adminReq)
  // ensure our app present
  const listed = await prisma.application.findUnique({ where: { id: app.id } })
  expect(listed).toBeTruthy()

  // decision
  const decisionReq = new Request(`http://localhost/api/admin/applications/${app.id}/decision`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-admin-secret': adminSecret as string }, body: JSON.stringify({ decision: 'aprovado' }) })
  // params is awaited in handler
  await decisionHandler(decisionReq, { params: Promise.resolve({ id: app.id }) })

  // invite exists
  const invite = await prisma.invite.findFirst({ where: { applicationId: app.id } })
  expect(invite).toBeTruthy()
  if (!invite) return

  // 3) accept invite -> creates member
  const acceptReq = new Request('http://localhost/api/invites/accept', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: invite.token, name: 'Member Name', email: 'member@example.com', phone: '11999999999' }) })
  await acceptInvite(acceptReq)
  const member = await prisma.member.findUnique({ where: { email: 'member@example.com' } })
  expect(member).toBeTruthy()
})

"use client"
import NotFoundInfo from '@/app/_components/NotFoundInfo'
import { useState } from 'react'

type Application = {
  id: string
  name: string
  email: string
  company?: string
  motivation: string
  status: string
  submittedAt: string
}

export default function ApplicationsTable() {
  const [secret, setSecret] = useState<string>('')
  const [data, setData] = useState<Application[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setError(null)
    try {
      const res = await fetch('/api/admin/applications?status=pendente', {
        headers: secret ? { 'x-admin-secret': secret } : undefined,
      })
      if (res.status === 401) {
        setError('Não autorizado. Forneça o secret')
        return
      }
      const body = await res.json()
      setData(body.data || [])
    } catch (err: unknown) {
      void err
      setError('Erro ao carregar')
    }
  }

  async function decision(id: string, decision: 'aprovado' | 'rejeitado') {
    if (!secret) return setError('Admin secret requerido')
    try {
      const res = await fetch(`/api/admin/applications/${id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ decision }),
      })
      const body = await res.json()
      if (!res.ok) return setError(body?.error || 'Erro')
      await load()
      if (body?.invite?.link) alert('Invite: ' + body.invite.link)
    } catch (err: unknown) {
      void err
      setError('Erro na decisão')
    }
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="block">Admin secret</label>
        <input className="border p-2" value={secret} onChange={(e) => setSecret(e.target.value)} />
        <button className="ml-2 px-3 py-1 btn btn-primary" onClick={load}>Carregar</button>
      </div>

      {error && <div className="text-red-600 mb-2">{error}</div>}

      {!data || data.length <= 0 && (<NotFoundInfo type='info' message='Nenhuma intenção encontrada'/>)}

      {data && data.length > 0 && (
        <table className="table-auto w-full border">
          <thead>
            <tr>
              <th className="border p-2">Nome</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Motivação</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a) => (
              <tr key={a.id}>
                <td className="border p-2">{a.name}</td>
                <td className="border p-2">{a.email}</td>
                <td className="border p-2">{a.motivation}</td>
                <td className="border p-2">{a.status}</td>
                <td className="border p-2">
                  <button className="mr-2 px-2 py-1 bg-green-500 text-white btn" onClick={() => decision(a.id, 'aprovado')}>Aprovar</button>
                  <button className="px-2 py-1 bg-red-500 text-white btn" onClick={() => decision(a.id, 'rejeitado')}>Rejeitar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

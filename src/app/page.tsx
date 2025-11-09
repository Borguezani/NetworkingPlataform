"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Main from './_components/Main'
import FormContainer from './_components/FormContainer'

export default function Home() {
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
        credentials: 'same-origin',
      })

      if (res.ok) {
        router.push('/dashboard')
      } else {
        const data = await res.json()
        setError(data?.message || data?.error || 'Login failed')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Main>
      <h1>Admin Login (dev)</h1>
      <p>Insira a chave de administração para definir o cookie <code>admin-secret</code>.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, flexDirection: 'column', maxWidth: 420 }}>
        <FormContainer>
          <input className='border p-2' aria-label="admin-key" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Chave admin" />
          <button type="submit" disabled={loading} className='btn btn-primary ml-4'>
            {loading ? 'Entrando...' : 'Login'}
          </button>
          {error && <div style={{ color: 'red' }}>{error}</div>}
        </FormContainer>
      </form>
    </Main>
  )
}

"use client"
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { applicationSchema } from '../../../lib/validators'
import { z } from 'zod'
import SuccessForm from '@/app/_components/SuccessForm'

type FormData = {
    name: string
    email: string
    company?: string
    motivation: string
}

export default function ApplicationForm() {
    const { register, handleSubmit, reset } = useForm<FormData>()
    const [success, setSuccess] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    async function onSubmit(data: FormData) {
        try {
            applicationSchema.parse(data)

            const res = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (res.status === 201) {
                setSuccess(true)
                setError(null)
                reset()
                return
            }
            const body = await res.json()
            setError(body?.error || 'Erro ao enviar')
        } catch (err) {
            const e = err as z.ZodError
            if (e?.issues) setError(JSON.stringify(e.issues.map(issue => issue.message).join(', ')))
            else setError('Erro inesperado')
        }
    }

    if (success) {
        return <SuccessForm message="Enviado com sucesso!" />
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full sm:w-full md:w-100 lg:w-150 xl:w-200 2xl:w-250 max-w-none mx-auto p-6 space-y-6">
            <div>
                <label className="block font-medium">Nome</label>
                <input className="w-full border p-2" {...register('name')} />
            </div>
            <div>
                <label className="block font-medium">Email</label>
                <input className="w-full border p-2" {...register('email')} /></div>
            <div>
                <label className="block font-medium">Empresa</label>
                <input className="w-full border p-2" {...register('company')} />
            </div>
            <div>
                <label className="block font-medium">Por que você quer participar?</label>
                <textarea className="w-full border p-2" {...register('motivation')} />
            </div>
            <div className='flex justify-center'>
                <button className="btn btn-primary w-full sm:w-full md:w-100 lg:w-150 xl:w-200 2xl:w-250" type="submit">Enviar</button>
            </div>
            {status && <div className="mt-2">{status}</div>}
            {error && <div className="mt-2 text-red-600">{error}</div>}
        </form>
    )
}

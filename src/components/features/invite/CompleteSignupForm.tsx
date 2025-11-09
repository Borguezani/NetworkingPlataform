"use client"
import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useSearchParams } from 'next/navigation'
import { inviteAcceptSchema } from '../../../lib/validators'
import { z } from 'zod'
import { formatarTelefone } from '@/app/_components/_helpers/maks'
import { desformatarTelefone } from '@/app/_components/_helpers/unmask'
import FormContainer from '@/app/_components/FormContainer'
import SuccessForm from '@/app/_components/SuccessForm'

export default function CompleteSignupForm() {
    const params = useSearchParams()
    const tokenFromQuery = params?.get('token') ?? ''
    const { register, handleSubmit, control } = useForm<FormData>({ defaultValues: { token: tokenFromQuery } })
    const [success, setSuccess] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    async function onSubmit(data: FormData) {
        data.phone = desformatarTelefone(data.phone || '')
        try {
            inviteAcceptSchema.parse(data)
            const res = await fetch('/api/invites/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (res.status === 201) return setSuccess(true)
            const body = await res.json()
            setError(body?.error || 'Erro ao concluir cadastro')
        } catch (err) {
            const e = err as z.ZodError
            if (e?.issues) setError(JSON.stringify(e.issues.map(issue => issue.message).join(', ')))
            else setError('Erro inesperado')
        }
    }

    if (success) {
        return <SuccessForm message="Cadastro concluído com sucesso!" />
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <FormContainer>
                <input type="hidden" {...register('token')} />
                <div>
                    <label className="block">Nome</label>
                    <input className="w-full border p-2" {...register('name')} />
                </div>
                <div>
                    <label className="block">Email</label>
                    <input className="w-full border p-2" {...register('email')} />
                </div>
                <div>
                    <label htmlFor="phone" className="block">Telefone</label>
                    <Controller
                        control={control}
                        name="phone"
                        render={({ field }) => (
                            <input
                                id="phone"
                                className="w-full border p-2"
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(formatarTelefone(e.target.value))}
                                onBlur={field.onBlur}
                            />
                        )}
                    />
                </div>
                <div>
                    <label className="block">Bio</label>
                    <textarea className="w-full border p-2" {...register('bio')} />
                </div>
                <div className='flex justify-center'>
                    <button className="btn btn-primary" type="submit">Concluir Cadastro</button>
                </div>
                {error && <div className="mt-2 text-red-600">{error}</div>}
            </FormContainer>
        </form>
    )
}

type FormData = {
    token: string
    name: string
    email: string
    phone?: string
    bio?: string
}
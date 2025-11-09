import { z } from 'zod'

export const applicationSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.email('Email inválido'),
  company: z.string().optional().nullable(),
  motivation: z.string().min(5, 'Motivação deve ter ao menos 5 caracteres')
})

export const decisionSchema = z.object({
  decision: z.union([z.literal('aprovado'), z.literal('rejeitado')])
})

export const inviteAcceptSchema = z.object({
  token: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
})

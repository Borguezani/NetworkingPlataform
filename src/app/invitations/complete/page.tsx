import React from 'react'
import CompleteSignupForm from '@/components/features/invite/CompleteSignupForm'
import Main from '@/app/_components/Main'

export const metadata = {
  title: 'Completar Cadastro'
}

export default function CompleteInvitePage() {
  return (
    <Main>
      <h1 className="text-2xl font-bold mb-4">Completar Cadastro</h1>
      <CompleteSignupForm />
    </Main>
  )
}

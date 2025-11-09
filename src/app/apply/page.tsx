import ApplicationForm from '@/components/features/applications/ApplicationForm'
import Main from '../_components/Main'

export const metadata = {
    title: 'Candidatar-se'
}

export default function ApplyPage() {
    return (
        <Main>
            <h1 className="text-2xl font-bold">Formulário de Intenção</h1>
            <ApplicationForm />
        </Main>
    )
}

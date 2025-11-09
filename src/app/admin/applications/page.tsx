import React from 'react'
import ApplicationsTable from '@/components/features/admin/ApplicationsTable'
import Main from '@/app/_components/Main'

export const metadata = {
  title: 'Admin - Applications'
}

export default function AdminApplicationsPage() {
  return (
    <Main>
      <h1 className="text-2xl font-bold mb-4">Admin - Intenções</h1>
      <ApplicationsTable />
    </Main>
  )
}

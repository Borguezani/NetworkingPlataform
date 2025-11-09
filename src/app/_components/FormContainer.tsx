
export default function FormContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full sm:w-full md:w-100 lg:w-150 xl:w-200 2xl:w-250 max-w-none mx-auto p-6 space-y-6">{children}</div>
  )
}

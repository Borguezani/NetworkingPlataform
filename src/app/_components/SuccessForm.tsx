import { MdOutlineVerified } from "react-icons/md";

export default function SuccessForm({ message = "Operação realizada com sucesso!" }: SuccessFormProps) {
    return (
        <div className={`flex items-center p-4 rounded text-green-600 bg-green-100`}>
            <MdOutlineVerified />
            <span className="ml-2">{message}</span>
        </div>
    )
}

interface SuccessFormProps {
    message?: string
}
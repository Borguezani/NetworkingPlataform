import { useMemo } from "react";
import { FaCircleInfo } from "react-icons/fa6";

export default function NotFoundInfo({
    message = 'Página não encontrada.',
    type
}: NotFoundInfoProps) {

    const color = useMemo(() => {
        switch (type) {
            case 'info':
                return 'text-blue-600 bg-blue-100';
            case 'warning':
                return 'text-yellow-600 bg-yellow-100';
            case 'error':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-blue-600 bg-blue-100';
        }
    }, [type]);

    return (
        <div className={`flex items-center p-4 rounded ${color}`}>
            <FaCircleInfo />
            <span className="ml-2">{message}</span>
        </div>
    )
}

interface NotFoundInfoProps {
    message?: string
    type: 'info' | 'warning' | 'error'
}

export const formatarTelefone = (telefone: string) => {
    const numeros = telefone.replace(/\D/g, '');

    if (numeros.length === 11) {
        return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (numeros.length === 10) {
        return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    else if (numeros.length > 11) {
        return numeros.slice(0, 11).replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    else {
        return telefone;
    }
}
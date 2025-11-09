export const desformatarTelefone = (telefone: string) => {
    return telefone.replace(/\D/g, '');
}
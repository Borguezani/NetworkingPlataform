# Networking Platform

Um projeto de exemplo em Next.js (App Router) que implementa um fluxo de admissão de membros com backend em Prisma (SQLite por padrão), formulários React, e um painel de performance.

O objetivo deste repositório é demonstrar um fluxo completo: aplicação → decisão (admin) → convite → cadastro completo, além de componentes auxiliares (indicações, registros de obrigado, pagamentos fictícios) e um dashboard de performance.

---

## Estrutura rápida

- `src/app` — arquivos do Next.js (App Router): páginas, rotas de API e layout.
- `src/components` — componentes React (forms, tabelas, dashboard).
- `src/lib` — utilitários compartilhados (Prisma client, validadores zod).
- `prisma` — schema e migrations do Prisma.

---

## Comandos principais

Siga esta ordem para preparar e rodar o projeto localmente.


0) Clonar o projeto

```bash
git clone https://github.com/Borguezani/NetworkingPlataform.git
```

1) Instalar dependências

```bash
npm install
```

2) Criar arquivo de ambiente

Copie `.env.example` para `.env` e ajuste se necessário:

```bash
cp .env.example .env
```

3) Gerar Prisma Client e aplicar migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

4) (Opcional) Abrir Prisma Studio para inspecionar o DB

```bash
npm run prisma:studio
```

5) Rodar em desenvolvimento

```bash
npm run dev
```

6) Build e executar em produção

```bash
npm run build
npm start
```

7) Testes

```bash
npm test
# modo watch
npm run test:watch
```

8) Lint

```bash
npm run lint
```

---

## Variáveis de ambiente importantes

- `DATABASE_URL` — string de conexão do Prisma (ex.: `file:./dev.db` para SQLite)
- `ADMIN_SECRET` — secret simples usado pelo dashboard/admin (dev only)
- `NEXT_PUBLIC_APP_URL` — URL pública da aplicação (opcional)

Defina essas variáveis no `.env` antes de rodar migrations ou iniciar o app.

---

## Dashboard de Performance

Rota privada: `/dashboard`. A visualização usa `react-chartjs-2` para mostrar métricas:

- Número total de membros ativos
- Total de indicações feitas nos últimos 6 meses (série mensal)
- Total de "obrigados" registrados nos últimos 6 meses (série mensal)

No ambiente de desenvolvimento a página está protegida por um cookie `admin-secret` que deve conter o valor de `ADMIN_SECRET`.

---

## Observações e boas práticas

- No código usamos enums em português (ex.: `aprovado`, `pendente`) — mantenha o schema Prisma e o código sincronizados.
- Em produção, substitua a proteção por cookie simples por autenticação real (login/session) e não exponha `ADMIN_SECRET` no frontend.
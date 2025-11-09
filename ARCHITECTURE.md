# Arquitetura — Plataforma de Gestão para Grupos de Networking

> Documento de arquitetura para o teste técnico — Plataforma de Gestão para Grupos de Networking

Este documento descreve a visão arquitetural da solução, o modelo de dados proposto, organização dos componentes front-end em Next.js, a especificação dos principais endpoints da API e recomendações de implantação e testes.

## 1. Visão geral

Objetivo: substituir planilhas e controles manuais por uma plataforma que gerencie intenções de participação, membros, comunicações, presença em reuniões, indicações de negócios, relatórios e controle financeiro.

Decisões principais:
- Frontend: Next.js (React) — roteamento de páginas e API Routes (ou App Router + API Routes conforme conveniência).
- Backend: API embutida nas API Routes do Next.js (Node.js / Express-like handlers) — rápido para protótipo e fácil deploy.
- Banco de dados: SQLite (desenvolvimento local) com opção de migrar para PostgreSQL em produção. Uso recomendado com Prisma ORM para produtividade, tipagem e migrações.
- Testes: Jest + React Testing Library para frontend; Jest + Supertest para testes de API.

Motivação da escolha do banco de dados: SQLite é leve, simples de configurar (sem infraestrutura externa) e atende ao requisito de prova de conceito; permite migrar para PostgreSQL sem grandes alterações usando Prisma.

## 2. Diagrama de arquitetura

O diagrama abaixo mostra componentes principais e comunicações.

```mermaid
graph TD
	Browser[Frontend - Next.js (React)]
	subgraph NextApp
		Pages[Pages / Components]
		API[API Routes (Node.js handlers)]
	end
	Browser -->|HTTPS| NextApp
	API -->|ORM| DB[(SQLite / PostgreSQL via Prisma)]
	API -->|Email (simulado)| EmailService[(SMTP / Provider)]
	API -->|Storage| FileStorage[(Local / Cloud Blob)]
	Admin[Admin UI] -.-> Pages
	Monitoring[Logs / Metrics] --> API
	CI/CD --> NextApp

	classDef infra fill:#f9f,stroke:#333,stroke-width:1px
	class DB,EmailService,FileStorage,Monitoring infra
```

Observações:
- O frontend comunica-se com as API Routes via chamadas fetch/axios.
- Para o desafio, envio de e-mail pode ser apenas logado no console ou armazenado em uma tabela `outbox` para visualização.

## 3. Modelo de dados (visão relacional)

Escolhi um modelo relacional (SQLite/Postgres). Abaixo as tabelas principais com campos, tipos e relacionamentos.

Nota: usar Prisma facilita manter esse modelo; nomes em snake_case abaixo são sugestivos para tabelas SQL.

### Tabelas principais

1) members (membros)
- id: string (uuid) — PK
- name: string
- email: string (unique)
- company: string | null
- role: string | null
- status: enum('invited','active','inactive','rejected')
- created_at: datetime
- updated_at: datetime

2) applications (intenções / inscrições iniciais)
- id: string (uuid) — PK
- name: string
- email: string
- company: string | null
- motivation: text (por que quer participar)
- status: enum('pending','approved','rejected')
- submitted_at: datetime
- processed_by: string | null (admin id/email) 
- processed_at: datetime | null

3) invites (convites / tokens)
- id: string (uuid) — PK
- application_id: fk -> applications.id
- token: string (token único, ex: uuidv4) — usado para cadastro completo
- expires_at: datetime
- used: boolean
- created_at: datetime

4) profiles (dados completos de membro)
- id: string (uuid) — PK (fk -> members.id)
- member_id: fk -> members.id
- bio: text | null
- phone: string | null
- linkedin: string | null
- created_at, updated_at

5) meetings (reuniões/eventos)
- id: uuid
- title: string
- date: datetime
- location: string | null
- description: text
- organizer_id: fk -> members.id

6) checkins (presença)
- id: uuid
- meeting_id: fk -> meetings.id
- member_id: fk -> members.id
- status: enum('present','absent','late')
- checked_at: datetime

7) referrals (indicações) — para a opção A (opcional)
- id: uuid
- from_member_id: fk -> members.id
- to_member_id: fk -> members.id
- contact_name: string
- contact_company: string | null
- details: text
- status: enum('sent','in_negotiation','closed','lost')
- created_at, updated_at

8) thank_you_records ("obrigados")
- id: uuid
- given_by_member_id: fk -> members.id
- for_member_id: fk -> members.id
- referral_id: fk -> referrals.id | null
- note: text
- created_at

9) payments (mensalidades)
- id: uuid
- member_id: fk -> members.id
- period_start: date
- period_end: date
- amount: decimal
- status: enum('pending','paid','failed')
- invoice_ref: string | null
- created_at, updated_at

Índices e relacionamentos:
- applications.email deve ser indexado para evitar duplicatas.
- members.email unique.
- invites.token indexado e com TTL lógico (expires_at).

Justificativa relacional:
- Os relacionamentos são naturais (muitos-to-one, one-to-many), consultas para dashboards e relatórios se beneficiam de joins e agregações.

## 4. Estrutura de componentes Frontend (Next.js)

Sugestão de pastas e responsabilidades:

- `src/components/ui/` — botões, inputs, modais, formulários básicos (design system pequeno).
- `src/components/features/` — componentes compostos por recurso: `applications/`, `admin/`, `members/`, `referrals/`, `dashboard/`.
- `src/components/layouts/` — `PublicLayout`, `AdminLayout` (proteção por env var).
- `src/app/` ou `src/pages/` — páginas Next.js (conforme App Router ou Pages Router).
- `src/lib/api.ts` — helpers para chamadas para a API (fetch wrapper, tratamento de erros, auth token management se necessário).
- `src/lib/validators.ts` — validações de formulários (zod ou yup recomendados).
- `src/hooks/` — hooks reutilizáveis, ex: `useAuth`, `useToast`, `usePaginatedFetch`.

Estado global:
- A aplicação pode usar React Query (recommended) para cache e sincronização de dados (lista de aplicações, membros, referals). Caso prefira algo mais leve, Context API para autenticação/flags admin.

Componentização (exemplos):
- `components/features/applications/ApplicationForm` — formulário público de intenção.
- `components/features/admin/ApplicationsTable` — tabela para aprovar/recusar.
- `components/features/invite/CompleteSignupForm` — formulário de cadastro via token.

Estilo:
- Use CSS Modules ou Tailwind (já presente no projeto, pode seguir o que foi instalado).

## 5. Definição da API (endpoints principais)

Formato: REST JSON. Base path: `/api` (Next.js API Routes) ou `/api/v1` se preferir versionamento.

Principais endpoints (mínimos para o fluxo de admissão):

1) Submeter intenção (público)
- Endpoint: POST /api/applications
- Request body (application/json):

	{
		"name": "João Silva",
		"email": "joao@exemplo.com",
		"company": "ACME Ltda",
		"motivation": "Quero participar para gerar parcerias"
	}

- Response 201 Created:

	{
		"id": "uuid",
		"status": "pending",
		"submitted_at": "2025-11-09T..."
	}

- Errors: 400 Bad Request (validação), 409 Conflict (email já submetido)

2) Listar intenções (admin)
- Endpoint: GET /api/admin/applications
- Auth: proteção simples via header secreto (ex: x-admin-secret) ou checagem de ENV var no front-end (para o teste, pode ser acesso limitado por variável de ambiente no próprio Next.js que habilita a página).
- Query params: ?status=pending&page=1&per_page=20
- Response 200:

	{
		"data": [ { "id":"..", "name":"..", "email":"..", "motivation":"..", "status":"pending", "submitted_at":"..." } ],
		"meta": { "page":1, "per_page":20, "total": 42 }
	}

3) Aprovar / Recusar intenção (admin)
- Endpoint: POST /api/admin/applications/:id/decision
- Request body:

	{
		"decision": "aprovado"  // ou "rejeitado"
	}

- Behaviour: se `aprovado`, cria um `invite` com token único, armazena invite e marca application.status = 'aprovado'. Se `rejeitado`, application.status = 'rejeitado'.

- Response 200:

	{
		"id":"...",
		"status":"approved",
		"invite": { "token":"...", "expires_at":"...", "link":"/invitations/complete?token=..." }
	}

4) Completar cadastro via token (público — acesso com token)
- Endpoint: POST /api/invites/accept
- Request body:

	{
		"token": "uuid-token",
		"name": "João Silva",
		"email": "joao@exemplo.com",
		"password": "..." (opcional para futuro login),
		"phone": "...",
		"bio": ".."
	}

- Behaviour: valida token (not expired and not used), cria `member` e `profile`, marca invite.used = true.

- Response 201: member record

## 6. Contrato mínimo (inputs/outputs) — resumo

- POST /api/applications
	- input: name, email, company?, motivation
	- output: application id, status

- POST /api/admin/applications/:id/decision
	- input: decision (approve|reject)
	- output: updated application + invite (quando approve)

- POST /api/invites/accept
	- input: token + full signup fields
	- output: created member

## 7. Testes (estratégia)

- Frontend:
	- Unit tests para componentes UI (formulários, validações) com React Testing Library.
	- Teste de integração leve: renderizar `ApplicationForm`, simular submit e mockar fetch para `/api/applications`.

- Backend/API:
	- Testes unitários para funções de validação e geração de tokens.
	- Testes de integração com banco SQLite em memória (ou arquivo temporário) usando Jest + Supertest contra as API Routes (mockar env var ADMIN_SECRET para rotas admin).

- Cobertura mínima esperada para o desafio: testes para o fluxo de admissão (submissão da intenção, listagem admin, decisão approve que cria invite, uso do token para completar cadastro).

## 8. Variáveis de ambiente sugeridas

- ADMIN_SECRET=string (proteger rotas admin)
- DATABASE_URL=file:./dev.db (Prisma) ou postgres://...
- NEXT_PUBLIC_APP_URL=http://localhost:3000
- EMAIL_PROVIDER_DSN (opcional — para envio real)

## 9. Implantação e observabilidade

- Deploy simples: Vercel (Next.js) ou Netlify (se separar backend). Para banco SQLite em produção, migrar para Postgres (Heroku, Railway, Neon, Supabase).
- Logging: usar console + serviço externo em produção (Sentry para erros, Prometheus/Datadog para métricas em apps maiores).

---

Essas alterações são intencionais para facilitar desenvolvimento e validação local do fluxo. Em produção recomendo migrar a proteção do admin para um sistema de autenticação mais robusto (login + sessão / JWT / OAuth) em vez de usar um cookie com um segredo compartilhado.


# CLAUDE.md — Bolão Copa do Mundo 2026

## Visão geral do projeto

App web de bolão para a Copa do Mundo 2026. Usuários fazem login via Google (Gmail), registram palpites de placar para cada jogo, entram em grupos e competem num ranking interno. Os jogos são carregados dinamicamente via API externa com cache no banco.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS + React Router v6 |
| Backend | Node.js 20 + Express 5 + Prisma ORM |
| Banco | PostgreSQL (Neon — free tier) |
| Auth | Firebase Authentication (Google Sign-In) |
| API Jogos | api-football.com (free tier, 100 req/dia) |
| Deploy FE | Vercel |
| Deploy BE | Railway |

## Estrutura de pastas

```
bolao-copa/
├── CLAUDE.md
├── specs/                  # Specs SDD (spec-kit)
│   ├── 00-overview.md
│   ├── 01-auth.md
│   ├── 02-games.md
│   ├── 03-predictions.md
│   ├── 04-groups.md
│   ├── 05-ranking.md
│   └── 06-ui.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/      # chamadas à API backend
│   │   ├── contexts/      # AuthContext, GroupContext
│   │   └── utils/
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
└── backend/
    ├── src/
    │   ├── routes/
    │   ├── controllers/
    │   ├── services/
    │   ├── middlewares/
    │   └── lib/           # prisma client, firebase admin, axios
    ├── prisma/
    │   ├── schema.prisma
    │   └── migrations/
    └── package.json
```

## Convenções de código

- **Idioma do código**: inglês (variáveis, funções, comentários)
- **Idioma da UI**: português brasileiro
- **TypeScript**: obrigatório em todo o projeto (strict mode)
- **Estilo**: ESLint + Prettier, semicolons, aspas simples
- **Commits**: conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)

## Variáveis de ambiente

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql://...          # Neon connection string
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
API_FOOTBALL_KEY=...                   # api-football.com
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io
FRONTEND_URL=http://localhost:5173
PORT=3333
```

### Frontend (`frontend/.env`)
```
VITE_API_BASE_URL=http://localhost:3333
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

## Regras de negócio críticas

1. **Prazo de palpite**: o usuário só pode criar ou editar um palpite até 5 minutos antes do kickoff do jogo (`game.startsAt - 5min`). Após esse prazo, o palpite fica bloqueado.
2. **Sistema de pontuação padrão**:
   - Acerto exato do placar: **3 pontos**
   - Acerto do resultado (vitória/empate/derrota): **1 ponto**
   - Erro: **0 pontos**
3. **Cache de jogos**: a cada requisição de jogos, verificar se o cache tem menos de 1 hora. Se sim, retornar do banco. Se não, buscar na API externa e atualizar o banco.
4. **Grupos**: o criador é automaticamente admin. O código de convite é um UUID curto (6 chars, case-insensitive). Um usuário pode estar em múltiplos grupos.
5. **Ranking**: calculado on-the-fly por query SQL, não armazenado. Filtrado por grupo.

## Padrões de API REST (backend)

```
POST   /auth/verify              — verifica token Firebase, retorna/cria usuário
GET    /games                    — lista jogos (com cache)
GET    /games/:id                — jogo específico
POST   /predictions              — criar/atualizar palpite
GET    /predictions/me           — meus palpites
GET    /groups                   — meus grupos
POST   /groups                   — criar grupo
POST   /groups/join              — entrar por código
GET    /groups/:id               — detalhes do grupo
GET    /groups/:id/ranking       — ranking do grupo
DELETE /groups/:id/members/:uid  — remover membro (admin)
```

Todas as rotas (exceto `/auth/verify`) exigem header `Authorization: Bearer <firebase_id_token>`.

## Schema do banco (Prisma)

```prisma
model User {
  id          String   @id @default(cuid())
  firebaseUid String   @unique
  email       String   @unique
  name        String
  avatarUrl   String?
  createdAt   DateTime @default(now())

  predictions Prediction[]
  memberships GroupMember[]
}

model Game {
  id          String   @id @default(cuid())
  externalId  Int      @unique      // id da api-football
  homeTeam    String
  awayTeam    String
  homeFlag    String?               // url da bandeira
  awayFlag    String?
  startsAt    DateTime
  stage       String               // "Group Stage", "Round of 16", etc.
  groupLabel  String?              // "Group A", null se fase eliminatória
  homeScore   Int?                 // null até o resultado oficial
  awayScore   Int?
  status      String   @default("NS") // NS, LIVE, FT, etc. (api-football status)
  updatedAt   DateTime @updatedAt

  predictions Prediction[]
}

model Prediction {
  id            String   @id @default(cuid())
  userId        String
  gameId        String
  homeScore     Int
  awayScore     Int
  points        Int?     // null até o jogo terminar
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
  game Game @relation(fields: [gameId], references: [id])

  @@unique([userId, gameId])
}

model Group {
  id          String   @id @default(cuid())
  name        String
  inviteCode  String   @unique
  createdAt   DateTime @default(now())

  members GroupMember[]
}

model GroupMember {
  id       String   @id @default(cuid())
  groupId  String
  userId   String
  role     String   @default("member") // "admin" | "member"
  joinedAt DateTime @default(now())

  group Group @relation(fields: [groupId], references: [id])
  user  User  @relation(fields: [userId], references: [id])

  @@unique([groupId, userId])
}
```

## Fluxo de autenticação

1. Frontend usa Firebase SDK para login Google → obtém `idToken`
2. Frontend envia `POST /auth/verify` com `Authorization: Bearer <idToken>`
3. Backend verifica o token com Firebase Admin SDK
4. Backend cria ou retorna o `User` no banco (upsert por `firebaseUid`)
5. Frontend armazena o token no contexto e o reenvia em todas as requisições

## Dicas de desenvolvimento

- Para testar localmente sem gastar requisições da api-football, crie um fixture em `backend/src/lib/fixtures/games.json` com jogos mockados e uma env `USE_MOCK_API=true`
- O Neon tem um modo de "branching" — use uma branch para dev e outra para prod
- No Railway, configure `NODE_ENV=production` e `PORT` via dashboard
- No Vercel, configure `VITE_API_BASE_URL` apontando para a URL do Railway em produção

## O que NÃO fazer

- Não armazenar o Firebase private key no frontend
- Não calcular pontuação no frontend — sempre buscar do backend
- Não permitir edição de palpite após o kickoff (validar no backend, não só no frontend)
- Não fazer polling da api-football sem cache — o free tier é 100 req/dia

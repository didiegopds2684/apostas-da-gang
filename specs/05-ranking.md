# Spec 05 — Ranking

## Objetivo

Calcular e exibir o ranking de pontuação dos membros dentro de cada grupo, com breakdown por jogo.

## Dependências

- Autenticação (`req.user`)
- Tabelas `Prediction`, `GroupMember`, `User`, `Game`

## Sistema de pontuação

| Resultado | Pontos |
|---|---|
| Acerto exato do placar | 3 |
| Acerto do resultado (vitória/empate/derrota) | 1 |
| Erro | 0 |

A pontuação é calculada pela função `scoreGame()` do spec 02 e armazenada no campo `Prediction.points`.

## Comportamentos esperados

### Ranking do grupo

**Dado** que o usuário é membro do grupo  
**Quando** acessa `GET /groups/:id/ranking`  
**Então**:
- Retorna lista de membros ordenada por `totalPoints DESC`
- Em caso de empate, ordena por `exactScores DESC` (critério de desempate)
- Inclui posição, nome, avatar, total de pontos, acertos exatos, acertos de resultado
- Inclui destaque para o usuário autenticado (campo `isMe: true`)

### Ranking geral (todos os grupos do usuário)

**Dado** que o usuário está em múltiplos grupos  
**Quando** acessa `GET /ranking/me`  
**Então**:
- Retorna a pontuação do usuário em cada grupo

## Endpoints

### `GET /groups/:id/ranking`

**Response 200**:
```json
{
  "ranking": [
    {
      "position": 1,
      "userId": "clx...",
      "name": "João Silva",
      "avatarUrl": "https://...",
      "totalPoints": 18,
      "exactScores": 4,
      "correctResults": 6,
      "isMe": false
    },
    {
      "position": 2,
      "userId": "clx...",
      "name": "Maria Santos",
      "avatarUrl": "https://...",
      "totalPoints": 15,
      "exactScores": 3,
      "correctResults": 6,
      "isMe": true
    }
  ],
  "totalGamesScored": 10,
  "totalGames": 64
}
```

**Response 403**: usuário não é membro do grupo

## Query SQL (via Prisma raw ou aggregation)

```sql
SELECT
  u.id           AS "userId",
  u.name,
  u."avatarUrl",
  COALESCE(SUM(p.points), 0)            AS "totalPoints",
  COUNT(CASE WHEN p.points = 3 THEN 1 END) AS "exactScores",
  COUNT(CASE WHEN p.points = 1 THEN 1 END) AS "correctResults"
FROM "GroupMember" gm
JOIN "User" u ON u.id = gm."userId"
LEFT JOIN "Prediction" p ON p."userId" = u.id
LEFT JOIN "Game" g ON g.id = p."gameId" AND g.status = 'FT'
WHERE gm."groupId" = $1
GROUP BY u.id, u.name, u."avatarUrl"
ORDER BY "totalPoints" DESC, "exactScores" DESC
```

Adicionar posição via numeração em memória no backend após a query.

## Exibição no frontend

- Tabela ou lista com posição, avatar, nome, pontos
- Linha do usuário autenticado destacada com cor diferente
- Badge no topo para 1º, 2º, 3º lugar (ouro, prata, bronze)
- Contador de jogos pontuados: "X de 64 jogos pontuados"
- Atualização automática a cada 5 minutos (polling simples com `setInterval`)

## Testes a implementar

- [ ] Ranking retorna membros ordenados por pontos DESC
- [ ] Empate desempatado por `exactScores`
- [ ] Usuário não-membro recebe 403
- [ ] `isMe: true` para o usuário autenticado
- [ ] Membros sem palpites aparecem com 0 pontos
- [ ] `totalGamesScored` conta só jogos com status `FT` e predictions pontuadas

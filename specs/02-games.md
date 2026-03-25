# Spec 02 — Jogos (Games)

## Objetivo

Carregar os jogos da Copa do Mundo 2026 de forma dinâmica via api-football.com, cacheando os dados no banco para não exceder o limite do free tier (100 req/dia). Exibir os jogos organizados por fase e data.

## Dependências

- api-football.com (header `x-apisports-key`)
- Tabela `Game` no banco
- Env `API_FOOTBALL_KEY`, `USE_MOCK_API`

## ID da competição

Copa do Mundo 2026 na api-football: **`1`** (World Cup). Confirmar o ID correto ao iniciar o desenvolvimento, pois pode mudar. Season: **`2026`**.

## Estratégia de cache

```
GET /games solicitado
  ├── Existe jogo no banco atualizado há menos de 1h?
  │     └── SIM → retornar do banco (sem chamar API externa)
  └── NÃO → buscar na api-football → salvar/atualizar banco → retornar
```

Para jogos com status `FT` (finalizado), não re-buscar na API. Para jogos `NS` (não iniciado) ou `LIVE`, re-buscar se o cache tiver mais de 1h.

## Comportamentos esperados

### Listar jogos

**Dado** que o usuário está autenticado  
**Quando** acessa `GET /games`  
**Então**:
- Retorna todos os jogos da Copa 2026 ordenados por `startsAt` ASC
- Inclui `homeTeam`, `awayTeam`, `homeFlag`, `awayFlag`, `startsAt`, `stage`, `groupLabel`, `status`
- Inclui `homeScore` e `awayScore` se o jogo já terminou (status `FT`)
- Inclui o palpite do usuário autenticado para cada jogo (ou `null`)

### Detalhe do jogo

**Dado** que o usuário está autenticado  
**Quando** acessa `GET /games/:id`  
**Então**:
- Retorna o jogo completo
- Inclui o palpite do usuário autenticado

### Atualização de resultados

**Dado** que um jogo terminou  
**Quando** o cache expira e a API é consultada  
**Então**:
- `homeScore`, `awayScore` e `status = "FT"` são salvos no banco
- O serviço de pontuação é acionado para calcular `points` de cada `Prediction` desse jogo

## Endpoints

### `GET /games`

**Query params opcionais**:
- `stage=group|knockout` — filtrar por fase
- `date=2026-06-15` — filtrar por data

**Response 200**:
```json
{
  "games": [
    {
      "id": "clx...",
      "externalId": 123456,
      "homeTeam": "Brasil",
      "awayTeam": "Argentina",
      "homeFlag": "https://media.api-sports.io/flags/br.svg",
      "awayFlag": "https://media.api-sports.io/flags/ar.svg",
      "startsAt": "2026-06-15T18:00:00Z",
      "stage": "Group Stage",
      "groupLabel": "Group C",
      "status": "NS",
      "homeScore": null,
      "awayScore": null,
      "myPrediction": null
    }
  ]
}
```

### `GET /games/:id`

Mesma estrutura acima, objeto único.

## Mapeamento da api-football → modelo interno

```
fixture.id               → externalId
teams.home.name          → homeTeam
teams.away.name          → awayTeam
teams.home.logo          → homeFlag
teams.away.logo          → awayFlag
fixture.date             → startsAt
league.round             → stage
league.round (parse)     → groupLabel
fixture.status.short     → status
goals.home               → homeScore
goals.away               → awayScore
```

## Mock para desenvolvimento

Quando `USE_MOCK_API=true`, o serviço retorna dados de `src/lib/fixtures/games.json` em vez de chamar a API. O fixture deve conter ao menos:
- 10 jogos de fase de grupos (alguns finalizados, alguns não iniciados)
- 2 jogos de oitavas de final
- Jogos com placares variados para testar pontuação

## Serviço de pontuação (acionado após atualização)

```typescript
// Pseudocódigo
async function scoreGame(gameId: string) {
  const game = await findGame(gameId) // deve ter homeScore e awayScore
  const predictions = await findPredictionsByGame(gameId)

  for (const pred of predictions) {
    let points = 0

    const exactScore = pred.homeScore === game.homeScore && pred.awayScore === game.awayScore
    const correctResult = getResult(pred) === getResult(game)

    if (exactScore) points = 3
    else if (correctResult) points = 1

    await updatePrediction(pred.id, { points })
  }
}

function getResult(obj: { homeScore: number; awayScore: number }) {
  if (obj.homeScore > obj.awayScore) return 'home'
  if (obj.awayScore > obj.homeScore) return 'away'
  return 'draw'
}
```

## Testes a implementar

- [ ] Cache retorna do banco se atualizado há menos de 1h
- [ ] Cache busca da API se expirado
- [ ] Jogo com status `FT` não é re-buscado na API
- [ ] Mapeamento dos campos da api-football está correto
- [ ] Mock funciona com `USE_MOCK_API=true`
- [ ] `scoreGame()` calcula 3 pts para acerto exato
- [ ] `scoreGame()` calcula 1 pt para acerto de resultado
- [ ] `scoreGame()` calcula 0 pts para erro

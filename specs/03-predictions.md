# Spec 03 — Palpites (Predictions)

## Objetivo

Permitir que usuários registrem e editem palpites de placar para cada jogo da Copa, respeitando o prazo de 5 minutos antes do kickoff. Após o jogo terminar, os palpites são pontuados automaticamente.

## Dependências

- Autenticação (`req.user`)
- Tabela `Prediction` e `Game` no banco
- Serviço de pontuação (spec 02)

## Comportamentos esperados

### Criar palpite

**Dado** que o usuário está autenticado e o jogo não começou  
**Quando** envia `POST /predictions` com `gameId`, `homeScore`, `awayScore`  
**Então**:
- Valida que `startsAt - now > 5min`
- Cria o registro `Prediction` com `points = null`
- Retorna o palpite criado

### Editar palpite

**Dado** que o usuário já tem um palpite para o jogo e o jogo não começou  
**Quando** envia `POST /predictions` com os mesmos campos  
**Então**:
- Atualiza o palpite existente (upsert por `[userId, gameId]`)
- Retorna o palpite atualizado

### Tentar palpitar após prazo

**Dado** que faltam menos de 5 minutos para o kickoff (ou o jogo já começou)  
**Quando** envia `POST /predictions`  
**Então**:
- Retorna erro 400 com mensagem: `"Prazo para palpite encerrado"`
- Nenhum registro é criado ou alterado

### Listar meus palpites

**Dado** que o usuário está autenticado  
**Quando** acessa `GET /predictions/me`  
**Então**:
- Retorna todos os palpites do usuário
- Cada palpite inclui dados do jogo (`homeTeam`, `awayTeam`, `startsAt`, `status`)
- Inclui `points` (null se jogo não terminou, número se já pontuado)

## Endpoints

### `POST /predictions`

**Body**:
```json
{
  "gameId": "clx...",
  "homeScore": 2,
  "awayScore": 1
}
```

**Response 201** (criado) ou **200** (atualizado):
```json
{
  "prediction": {
    "id": "clx...",
    "gameId": "clx...",
    "homeScore": 2,
    "awayScore": 1,
    "points": null,
    "updatedAt": "2026-06-10T12:00:00Z"
  }
}
```

**Response 400**:
```json
{ "error": "Prazo para palpite encerrado" }
```

**Response 404**:
```json
{ "error": "Jogo não encontrado" }
```

### `GET /predictions/me`

**Response 200**:
```json
{
  "predictions": [
    {
      "id": "clx...",
      "homeScore": 2,
      "awayScore": 1,
      "points": 3,
      "game": {
        "id": "clx...",
        "homeTeam": "Brasil",
        "awayTeam": "Argentina",
        "homeFlag": "...",
        "awayFlag": "...",
        "startsAt": "2026-06-15T18:00:00Z",
        "status": "FT",
        "homeScore": 2,
        "awayScore": 1
      }
    }
  ]
}
```

## Validações

| Campo | Regra |
|---|---|
| `gameId` | obrigatório, deve existir no banco |
| `homeScore` | obrigatório, inteiro >= 0, <= 20 |
| `awayScore` | obrigatório, inteiro >= 0, <= 20 |
| Prazo | `game.startsAt - Date.now() > 5 * 60 * 1000` |

## Estado do palpite no frontend

O frontend deve exibir o estado do palpite de forma clara:

| Estado | Condição | Visual |
|---|---|---|
| Aberto | Jogo não iniciado, dentro do prazo | Input editável |
| Bloqueado | Menos de 5 min para kickoff ou jogo em andamento | Input desabilitado + ícone de cadeado |
| Aguardando | Jogo `LIVE` ou `FT` mas sem pontuação ainda | Badge "aguardando resultado" |
| Pontuado | `points` não é null | Badge com pts (verde se > 0, cinza se 0) |

## Testes a implementar

- [ ] Criar palpite válido retorna 201
- [ ] Segundo palpite no mesmo jogo atualiza (upsert)
- [ ] Palpite com `homeScore` negativo retorna 400
- [ ] Palpite após prazo retorna 400
- [ ] Palpite em jogo inexistente retorna 404
- [ ] `GET /predictions/me` retorna só palpites do usuário autenticado
- [ ] Pontuação correta após `scoreGame()` ser chamado

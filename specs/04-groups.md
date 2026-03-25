# Spec 04 — Grupos (Groups)

## Objetivo

Permitir que usuários criem grupos privados, convidem amigos via código e compartilhem um ranking entre os membros.

## Dependências

- Autenticação (`req.user`)
- Tabelas `Group`, `GroupMember`, `User` no banco

## Comportamentos esperados

### Criar grupo

**Dado** que o usuário está autenticado  
**Quando** envia `POST /groups` com um `name`  
**Então**:
- Cria o grupo com um `inviteCode` aleatório de 6 caracteres (letras maiúsculas + números, ex: `XK92AB`)
- Cria um `GroupMember` para o criador com `role = "admin"`
- Retorna o grupo criado com o código de convite

### Entrar em um grupo

**Dado** que o usuário está autenticado e tem um código válido  
**Quando** envia `POST /groups/join` com `inviteCode`  
**Então**:
- Valida que o grupo existe
- Valida que o usuário não é membro ainda
- Cria `GroupMember` com `role = "member"`
- Retorna o grupo

### Tentar entrar em grupo que já é membro

**Dado** que o usuário já é membro do grupo  
**Quando** envia `POST /groups/join`  
**Então**:
- Retorna 400 com mensagem: `"Você já é membro deste grupo"`

### Listar meus grupos

**Dado** que o usuário está autenticado  
**Quando** acessa `GET /groups`  
**Então**:
- Retorna todos os grupos dos quais o usuário é membro
- Inclui `name`, `inviteCode`, `role` do usuário, contagem de membros
- Ordenado por `joinedAt` DESC

### Detalhes do grupo

**Dado** que o usuário é membro do grupo  
**Quando** acessa `GET /groups/:id`  
**Então**:
- Retorna dados do grupo
- Retorna lista de membros com `name`, `avatarUrl`, `role`
- Retorna o `inviteCode` somente se o usuário for admin

### Remover membro

**Dado** que o usuário é admin do grupo  
**Quando** envia `DELETE /groups/:id/members/:userId`  
**Então**:
- Remove o `GroupMember`
- Não permite que o admin remova a si mesmo

### Sair do grupo

**Dado** que o usuário é membro (não admin)  
**Quando** envia `DELETE /groups/:id/members/me`  
**Então**:
- Remove o `GroupMember` do usuário autenticado

## Endpoints

### `POST /groups`

**Body**:
```json
{ "name": "Bolão da Firma" }
```

**Response 201**:
```json
{
  "group": {
    "id": "clx...",
    "name": "Bolão da Firma",
    "inviteCode": "XK92AB",
    "memberCount": 1,
    "myRole": "admin"
  }
}
```

### `POST /groups/join`

**Body**:
```json
{ "inviteCode": "XK92AB" }
```

**Response 200**:
```json
{
  "group": {
    "id": "clx...",
    "name": "Bolão da Firma",
    "memberCount": 5,
    "myRole": "member"
  }
}
```

### `GET /groups`

**Response 200**:
```json
{
  "groups": [
    {
      "id": "clx...",
      "name": "Bolão da Firma",
      "inviteCode": "XK92AB",
      "memberCount": 8,
      "myRole": "admin"
    }
  ]
}
```

### `GET /groups/:id`

**Response 200**:
```json
{
  "group": {
    "id": "clx...",
    "name": "Bolão da Firma",
    "inviteCode": "XK92AB",
    "members": [
      {
        "userId": "clx...",
        "name": "João Silva",
        "avatarUrl": "https://...",
        "role": "admin"
      }
    ]
  }
}
```

### `DELETE /groups/:id/members/:userId`

**Response 200**: `{ "success": true }`  
**Response 403**: usuário não é admin ou tentou remover a si mesmo

## Geração do código de convite

```typescript
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}
```

Em caso de colisão (código já existe), gerar novamente (retry até 5x).

## Validações

| Campo | Regra |
|---|---|
| `name` | obrigatório, 3–50 caracteres |
| `inviteCode` (join) | obrigatório, deve existir no banco (case-insensitive) |

## Testes a implementar

- [ ] Criar grupo gera código único de 6 chars
- [ ] Criador é automaticamente admin
- [ ] Entrar com código válido adiciona como member
- [ ] Entrar com código inválido retorna 404
- [ ] Entrar em grupo que já é membro retorna 400
- [ ] Admin pode remover outro membro
- [ ] Admin não pode remover a si mesmo
- [ ] Não-admin não pode remover membros
- [ ] `inviteCode` retornado no detalhe apenas para admin

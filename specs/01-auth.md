# Spec 01 — Autenticação

## Objetivo

Permitir que usuários se autentiquem exclusivamente via conta Google (Gmail), sem necessidade de cadastro manual. Na primeira entrada, o perfil é criado automaticamente no banco.

## Dependências

- Firebase Authentication (Google provider)
- Firebase Admin SDK no backend
- Tabela `User` no banco

## Comportamentos esperados

### Login

**Dado** que o usuário não está autenticado  
**Quando** ele clica em "Entrar com Google"  
**Então**:
- O popup/redirect do Google é exibido
- Após autenticação bem-sucedida, o Firebase retorna um `idToken`
- O frontend envia `POST /auth/verify` com o token
- O backend valida o token e faz upsert do usuário no banco
- O frontend armazena o estado de autenticação no `AuthContext`
- O usuário é redirecionado para `/dashboard`

### Primeiro acesso

**Dado** que é a primeira vez que o usuário faz login  
**Quando** o backend processa `/auth/verify`  
**Então**:
- Um novo registro `User` é criado com `firebaseUid`, `email`, `name`, `avatarUrl`
- O backend retorna o objeto `User` completo
- Nenhuma tela de "completar cadastro" é exibida

### Sessão persistente

**Dado** que o usuário já está autenticado  
**Quando** ele reabre o app  
**Então**:
- O Firebase SDK restaura a sessão automaticamente
- O frontend detecta o usuário logado via `onAuthStateChanged`
- Nenhum novo login é solicitado enquanto o token for válido

### Logout

**Dado** que o usuário está autenticado  
**Quando** ele clica em "Sair"  
**Então**:
- `firebase.auth().signOut()` é chamado
- O `AuthContext` é limpo
- O usuário é redirecionado para `/login`

### Rota protegida sem autenticação

**Dado** que o usuário não está autenticado  
**Quando** ele tenta acessar qualquer rota protegida  
**Então**:
- É redirecionado para `/login`
- Após login, é redirecionado de volta para a rota original

## Endpoints

### `POST /auth/verify`

**Headers**: `Authorization: Bearer <firebase_id_token>`

**Response 200**:
```json
{
  "user": {
    "id": "clx...",
    "email": "usuario@gmail.com",
    "name": "Nome do Usuário",
    "avatarUrl": "https://..."
  }
}
```

**Response 401**: token inválido ou expirado

## Middleware de autenticação (backend)

Todo endpoint protegido usa o middleware `authenticate`:
1. Extrai o Bearer token do header
2. Verifica com `firebaseAdmin.auth().verifyIdToken(token)`
3. Busca o `User` no banco pelo `firebaseUid`
4. Injeta `req.user` com o objeto `User`
5. Retorna 401 se qualquer etapa falhar

## Componentes frontend

- `AuthContext` — provê `user`, `loading`, `signIn()`, `signOut()`
- `ProtectedRoute` — wrapper que redireciona para `/login` se não autenticado
- `LoginPage` — página simples com botão "Entrar com Google"
- `useAuth()` — hook para consumir o contexto

## Tratamento de erros

| Situação | Comportamento |
|---|---|
| Token expirado | Firebase renova automaticamente; se falhar, redireciona para login |
| Popup bloqueado | Exibe mensagem pedindo para permitir popups |
| Conta Google sem email | Não deve ocorrer, mas logar o erro e exibir mensagem genérica |
| Erro de rede no `/auth/verify` | Exibir toast de erro, não criar sessão |

## Testes a implementar

- [ ] Login com Google abre popup e cria sessão
- [ ] Primeiro login cria `User` no banco
- [ ] Login subsequente faz upsert (não duplica)
- [ ] Rota protegida sem token retorna 401
- [ ] Token inválido retorna 401
- [ ] Middleware injeta `req.user` corretamente

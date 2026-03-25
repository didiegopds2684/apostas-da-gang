# Spec 00 — Visão Geral

## Objetivo

Construir um app web de bolão para a Copa do Mundo 2026 onde usuários possam:
- Fazer login com conta Google
- Ver os jogos da copa com dados em tempo real
- Registrar palpites de placar para cada jogo
- Criar e participar de grupos
- Acompanhar um ranking de pontuação dentro de cada grupo

## Usuários-alvo

Grupos de amigos, famílias ou colegas de trabalho que queiram competir num bolão informal durante a Copa 2026 (junho–julho de 2026).

## Jornada principal

```
Usuário abre o app
  → faz login com Google
  → vê lista de jogos da Copa
  → registra palpites antes do kickoff
  → cria ou entra em um grupo via código de convite
  → acompanha o ranking do grupo em tempo real
```

## Fora de escopo (v1)

- Pagamentos ou apostas com dinheiro real
- Notificações push
- App mobile nativo
- Placar ao vivo dentro do app (apenas resultado final para pontuação)
- Múltiplos idiomas

## Critérios de sucesso

- [ ] Usuário consegue fazer login e registrar palpites em menos de 2 minutos
- [ ] Palpite é bloqueado automaticamente 5 min antes do kickoff
- [ ] Ranking atualiza corretamente após o resultado oficial do jogo
- [ ] App funciona em mobile (layout responsivo)
- [ ] Hospedagem gratuita e estável durante o período da copa

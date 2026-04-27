# Status do Projeto: Eixo (MVP)

## 📋 Resumo
O **Eixo** é uma ferramenta de intervenção para regulação do sistema nervoso. Esta versão consolida o design moderno do AI Studio com uma infraestrutura de backend estável, suporte a assinaturas reais e mapeamento emocional técnico.

## 🚀 Funcionalidades Ativas
- **Autenticação Segura**: Login por e-mail/senha via JWT com expiração de 7 dias.
- **Assinaturas Mercado Pago**: Integração real para ativação do plano Eixo Pleno.
- **Webhook de Pagamento**: Atualização automática de status premium via eventos do Mercado Pago.
- **Mapeamento Emocional**: Estados centrais (`acelerado`, `sobrecarregado`, `travado`, `inseguro`, `sem conseguir desligar`).
- **Intervenções Guiadas**: Práticas de respiração, foco e relaxamento noturno.
- **Histórico Persistente**: Persistência SQLite para usuários registrados.

## 🛠️ Tecnologias
- **Backend**: Express + better-sqlite3 + jsonwebtoken.
- **Integração**: API Mercado Pago para pagamentos recorrentes.
- **Frontend**: React + Framer Motion para biofeedback visual.

## ⚠️ Próximos Passos
- [ ] Implementação de validação X-Signature nos Webhooks.
- [ ] Adição de mais intervenções de áudio e integração com Spotify.
- [ ] Preparação para build mobile nativo.

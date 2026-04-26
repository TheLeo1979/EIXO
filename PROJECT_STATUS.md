# Status do Projeto: Eixo (MVP)

## 📋 Resumo
O **Eixo** é uma ferramenta de intervenção emocional imediata. O projeto passou por uma reconciliação técnica entre a versão de desenvolvimento do GitHub e a versão estável do AI Studio.

## 🚀 Funcionalidades Ativas
- **Autenticação Segura**: Login por e-mail/senha via JWT com persistência em SQLite.
- **Acesso Visitante**: Permite explorar o app sem criar conta imediatamente.
- **Onboarding**: Fluxo inicial guiado para novos usuários.
- **Check-in Emocional**: Mapeamento de 6 estados centrais (Acelerado, Sobrecarregado, Travado, Inseguro, Desligar, Calmo).
- **Intervenções Inteligentes**: Recomendação de sessões (Respiração Quadrada, Foco, Grounding, Noturno) baseada no estado emocional.
- **Jornada (Progresso)**: Histórico completo de sessões com feedback emocional antes/depois.
- **Premium**: Suporte a assinaturas (Stub via Mercado Pago).

## 🛠️ Tecnologias
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion.
- **Backend**: Express + better-sqlite3 + jsonwebtoken.
- **Ícones**: Lucide React.
- **Persistência**: SQLite (Servidor) e LocalStorage (Visitante).

## 📅 Roadmap / Fase 2
- [ ] Implementação de Áudio real para sessões.
- [ ] Recuperação de Google OAuth (Quando houver estabilidade no ambiente).
- [ ] Sincronização automática do histórico Visitante -> Conta.
- [ ] Preparação para APK (Capacitor).

## ⚠️ Observações de Segurança
- `JWT_SECRET` é obrigatório para o funcionamento do servidor.
- O Login Social foi removido desta iteração para garantir estabilidade do fluxo de e-mail.

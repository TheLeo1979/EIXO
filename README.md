# Eixo — Recomposição Coerente

## 🔑 Configuração (AI Studio)
O applet exige as seguintes variáveis em **Settings > Secrets**:
- JWT_SECRET: Chave privada para assinatura de tokens (Obrigatória).
- MERCADO_PAGO_ACCESS_TOKEN: Token de acesso para assinaturas.
- APP_URL: URL base do applet para retorno de pagamentos e webhooks.

## 🧘 Proposta de Valor
O Eixo é uma ferramenta de intervenção para o sistema nervoso. Baseado em um check-in emocional rápido, o app recomenda técnicas de respiração ou foco para o seu estado imediato.

## 📍 Estado Técnico do MVP
- Autenticação: E-mail e senha com JWT (expiração de 7 dias).
- Assinaturas: Mercado Pago implementado em nível MVP (Criação de assinaturas e Webhook).
- Segurança: Webhook protegido com validação de autenticidade X-Signature.
- Jornada: Histórico persistido em SQLite para usuários logados.
- Visitante: Suporte a uso temporário via LocalStorage.

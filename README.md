# Eixo — Recomposição Coerente

## 🔑 Configuração
Para rodar o MVP básico, apenas a variável `JWT_SECRET` é obrigatória. As outras são integrações opcionais.

Variáveis em **Settings > Secrets**:
- `JWT_SECRET`: Chave privada para assinatura de tokens (Obrigatória).
- `APP_URL`: URL base do applet (Ex: https://...us-east1.run.app).
- `MERCADO_PAGO_ACCESS_TOKEN`: Opcional. Ativa pagamentos reais.
- `MERCADO_PAGO_WEBHOOK_SECRET`: Opcional. Ativa validação de segurança no webhook.
- `SPOTIFY_CLIENT_ID`: Opcional. Ativa busca real de músicas.
- `SPOTIFY_CLIENT_SECRET`: Opcional. Ativa busca real de músicas.

## 🧘 Proposta de Valor
O Eixo é uma ferramenta de intervenção para o sistema nervoso. Baseado em um check-in emocional rápido, o app recomenda técnicas de respiração ou foco para o seu estado imediato.

## 📍 Estado Técnico do MVP
- Autenticação: E-mail e senha com JWT (expiração de 7 dias).
- Assinaturas: Mercado Pago implementado como integração opcional (Webhooks seguros).
- Áudio: Intervenções de áudio controladas localmente em `/audio`.
- Jornada: Limite diário de 1 sessão para usuários gratuitos (vía backend ou local).
- Segurança: Webhook protegido com validação de autenticidade X-Signature.
- Visitante: Suporte a uso temporário via LocalStorage.

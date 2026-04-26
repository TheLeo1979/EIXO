# Eixo — Recomposição Coerente (MVP)

O **Eixo** é uma ferramenta de intervenção emocional imediata. Este MVP foca na estabilidade técnica e segurança da autenticação por e-mail.

## 🔐 Segurança e Configuração

Para que o aplicativo funcione, você **PRECISA** configurar o segredo do JWT.

### Variáveis Obrigatórias
| Variável | Descrição | Onde Configurar |
| :--- | :--- | :--- |
| `JWT_SECRET` | Chave privada para assinar tokens. | **Settings > Secrets** (AI Studio) |

### Variáveis Opcionais (Stub/Fundação)
As variáveis abaixo não são obrigatórias para o funcionamento básico:
- `MERCADO_PAGO_ACCESS_TOKEN`: Para pagamentos reais.
- `SPOTIFY_CLIENT_ID`: Para metadados oficiais de trilhas.
- `SPOTIFY_CLIENT_SECRET`: Para metadados oficiais de trilhas.

## 🚀 Como Testar
1. Acesse o menu **Settings > Secrets** no AI Studio.
2. Adicione `JWT_SECRET` com um valor aleatório.
3. Utilize o login por e-mail. **Sua conta será criada automaticamente no primeiro acesso.**

## 📍 Status do MVP Atual
- ✅ Login/Cadastro simplificado por e-mail e senha.
- ✅ Autenticação via JWT (Segurança reforçada).
- ✅ Persistência em SQLite (Usuários e Sessões).
- ✅ Intervenção de Respiração Quadrada.
- ✅ Histórico de sessões funcional.
- ⚠️ Google Login: **Suspenso nesta versão.**
- 💡 Mercado Pago/Spotify: Integrados como fundação opcional.

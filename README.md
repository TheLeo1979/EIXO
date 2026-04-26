# Eixo — Recomposição Coerente

O **Eixo** não é mais um app de meditação passiva. É uma ferramenta de intervenção tática para o sistema nervoso.

## 🧘 O que é o Eixo?
Projetado para quem vive sob alta carga mental, o Eixo oferece recomposição imediata através de técnicas de respiração, sons binaurais e práticas de ancoragem (grounding).

## 🔑 Configuração Inicial (Mandatório)
Para rodar o applet com segurança, você deve configurar o segredo do JWT.

1. Vá em **Settings > Secrets**.
2. Adicione `JWT_SECRET` com uma chave segura.
3. Reinicie o servidor se necessário.

## 🌟 Diferenciais deste MVP
- **Listen First**: O app pergunta como você está antes de sugerir qualquer coisa.
- **Immediate Action**: Intervenções curtas e eficazes (4-10 min).
- **Offline Ready**: Persistência local robusta para sua jornada.
- **Privacy Focused**: Você escolhe se quer criar conta ou usar como visitante.

## 🔧 Estrutura Técnica
- **Autenticação**: JWT (JSON Web Tokens).
- **Banco de Dados**: SQLite via `better-sqlite3`.
- **Animações**: `motion/react` para biofeedback visual.
- **Design**: Craftsmanship-focused Tailwind UI.


# GMAO Backend (Português) — Express + Prisma + JWT + Cron

## Variáveis de ambiente obrigatórias
- `DATABASE_URL` = URL do Postgres (Render → Internal Database URL)
- `JWT_SECRET` = uma string forte
- `CORS_ORIGIN` = URL do frontend (ex.: https://vfpm-frontend.onrender.com)
- `PORT` (opcional; o Render injeta)

## Scripts
- `npm run dev` → desenvolvimento
- `npm run build` → compila TS para `dist/`
- `npm start` → roda `dist/server.js`
- `npm run prisma:generate` → gera cliente Prisma
- `npm run db:push` → cria o schema no banco (sem migrations)
- `npm run seed` → cria admin `admin@vfpm.local / Admin@123`

## Primeiro deploy (Render)
1. **Build Command**
```
npm install && npm run prisma:generate && npm run build
```
2. **Start Command**
```
node dist/server.js
```
3. **Env Vars**
```
DATABASE_URL=postgres://...
JWT_SECRET=TroquePorUmSegredoForte
CORS_ORIGIN=https://SEU-FRONT.onrender.com
NPM_CONFIG_PRODUCTION=false
NODE_VERSION=20
```
4. **Depois do serviço ficar de pé**, abra **Shell** do Render e rode:
```
npm run db:push
npm run seed
```
Pronto — API responde e já tem admin criado.

## Rotas principais
- `POST /auth/register` (admin)
- `POST /auth/login`
- `GET/POST /ativos`
- `GET/POST /planos` + `POST /planos/:id/gerar-agora`
- `GET/POST /ordens` + `POST /ordens/:id/iniciar` + `POST /ordens/:id/finalizar` + `POST /ordens/:id/horas`
- `GET/POST /materiais` + `POST /materiais/baixa/:omId`
- `GET /relatorios/kpis`

## Preventivas automáticas
Um cron roda a cada hora e gera OM de planos ativos conforme `everyN` + `unit`.

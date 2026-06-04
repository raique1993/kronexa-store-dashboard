# Kronexa Store Dashboard

**Stack:** Next.js 14 + Supabase + Recharts + Tailwind  
**Deploy:** Vercel  

## Setup Rápido

### 1. Deploy no Vercel
Acesse `vercel.com/new` → Import `raique1993/kronexa-store-dashboard`

### 2. Variáveis de ambiente no Vercel
```
NEXT_PUBLIC_SUPABASE_URL=https://tcjynyfusqkqtdohnyzq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_gNJhc4WCS9MnnmDAL2T6Vg_AQ71_Vid
NEXT_PUBLIC_TENANT_ID=b2c3d4e5-0001-0000-0000-000000000001
```

### 3. Rodar local
```bash
npm install
npm run dev
```

## Estrutura
```
src/app/
  page.tsx          ← Dashboard principal (métricas, gráfico, pedidos)
  layout.tsx        ← Layout root
  globals.css       ← CSS Kronexa brand
```

## Tabelas usadas
- `ks_pedidos` — pedidos e receita
- `ks_clientes` — clientes novos
- `ks_produtos` — top produtos
- `ks_avaliacoes_nps` — NPS médio

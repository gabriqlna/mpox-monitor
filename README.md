# Mpox Monitor Brasil

Painel público em português para acompanhar dados agregados e notícias relacionadas à mpox no Brasil.

> O projeto inicia em modo demonstração. Em produção, `DATA_MODE=live` baixa o arquivo CSV oficial e público do e-SUS Sinan/Mpox, do Ministério da Saúde. Os números em `data/fixtures` são ilustrativos e não representam uma fonte epidemiológica real.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

Para iniciar no Termux em modo oficial e manter o processo mesmo ao minimizar o aplicativo:

```bash
npm run start:termux
npm run stop:termux
```

O comando usa `DATA_MODE=live` por padrão e baixa o arquivo oficial do Ministério da Saúde. Para testar sem internet usando as fixtures:

```bash
DATA_MODE=fixture npm run start:termux
```

O script grava o log em `.next/termux.log` e usa `termux-wake-lock` quando disponível. Para acompanhar o log:

```bash
tail -f .next/termux.log
```

Verificações do projeto:

```bash
npm run test
npm run lint
npm run build
npm run ingest
```

## Arquitetura

- `app/`: dashboard e Route Handlers da API.
- `components/mpox/`: interface do painel.
- `lib/`: tipos, agregações, validação e ingestão.
- `data/fixtures/`: dados de demonstração.
- `supabase/migrations/`: esquema inicial para persistência PostgreSQL.
- `.github/workflows/ingest.yml`: agendamento da coleta.

As notícias são exibidas como contexto e nunca alteram o total de casos confirmados. O produto deve usar apenas dados públicos agregados, sem nomes, endereços ou qualquer informação que identifique pacientes.

## Próximas etapas

1. O adapter oficial atual baixa `MPX_2026_OPENDATASUS.csv.zip` do Portal de Dados Abertos do SUS.
2. O parser considera `classi_fin=1` como caso confirmado, conforme o dicionário oficial, e agrega por UF/município.
3. No Supabase, abra SQL Editor e execute `supabase/migrations/0001_initial_schema.sql`.
4. Configure `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` localmente, no GitHub Actions e na Vercel. Nunca os coloque no Git.
5. Execute `DATA_MODE=live npm run ingest` para salvar os dados oficiais.
6. Importe `gabriqlna/mpox-monitor` na Vercel e configure `DATA_MODE=live`.

Nunca coloque `.env`, tokens ou chaves de banco no repositório.

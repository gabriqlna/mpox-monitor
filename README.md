# Mpox Monitor Brasil

Painel público em português para acompanhar dados agregados e notícias relacionadas à mpox no Brasil.

> O projeto inicia em modo demonstração. Os números em `data/fixtures` são ilustrativos e não representam uma fonte epidemiológica real.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

Para iniciar no Termux e manter o processo mesmo ao minimizar o aplicativo:

```bash
npm run start:termux
npm run stop:termux
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

1. Confirmar endpoints, periodicidade, licença e definições das fontes oficiais.
2. Implementar o adapter oficial real e a persistência PostgreSQL/Supabase.
3. Configurar secrets no GitHub Actions e variáveis server-side na Vercel.
4. Publicar o frontend pela integração GitHub + Vercel.

Nunca coloque `.env`, tokens ou chaves de banco no repositório.

"use client";

import { useMemo, useState } from "react";
import { Activity, ArrowUpRight, Bell, CalendarDays, CheckCircle2, ExternalLink, Info, MapPin, Newspaper, RefreshCw, ShieldCheck, TrendingUp } from "lucide-react";
import { fixtureNews, fixtureObservations, fixtureSources } from "@/lib/data";
import { latestCollection, stateSummaries, totalCases, uniqueStates } from "@/lib/aggregations";
import { formatDate, formatDateTime } from "@/lib/provenance";
import type { NewsItem } from "@/lib/types";

const stateNames: Record<string, string> = {
  SP: "São Paulo", RJ: "Rio de Janeiro", MG: "Minas Gerais", BA: "Bahia", PR: "Paraná", RS: "Rio Grande do Sul", PE: "Pernambuco", CE: "Ceará", GO: "Goiás",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article className="news-item">
      <div className="news-icon"><Newspaper size={17} /></div>
      <div className="news-copy">
        <div className="news-meta"><span className="unconfirmed">{item.verificationStatus === "official-context" ? "Contexto oficial" : "Não confirmado"}</span><span>{formatDate(item.publishedAt)}</span></div>
        <h3>{item.title}</h3>
        <p>{item.summary}</p>
        <a href={item.url} target="_blank" rel="noreferrer">Ler fonte original <ExternalLink size={13} /></a>
      </div>
    </article>
  );
}

export function Dashboard() {
  const [selectedState, setSelectedState] = useState("Todos");
  const [selectedLevel, setSelectedLevel] = useState<"state" | "municipality">("state");
  const [showAllNews, setShowAllNews] = useState(false);
  const observations = useMemo(() => fixtureObservations.filter((item) => item.level === selectedLevel && (selectedState === "Todos" || item.stateCode === selectedState)), [selectedLevel, selectedState]);
  const summaries = stateSummaries(fixtureObservations);
  const cases = totalCases(fixtureObservations);
  const collection = latestCollection(fixtureObservations);
  const visibleNews = showAllNews ? fixtureNews : fixtureNews.slice(0, 2);
  const maxValue = summaries[0]?.value ?? 1;
  const stateOptions = [...new Set(fixtureObservations.map((item) => item.stateCode))].sort();

  return (
    <main>
      <header className="topbar">
        <div className="brand"><div className="brand-mark"><Activity size={21} /></div><div><strong>mpox<span>monitor</span></strong><small>Brasil</small></div></div>
        <nav><a href="#painel">Painel</a><a href="#historico">Histórico</a><a href="#fontes">Fontes</a></nav>
        <div className="topbar-status"><span className="live-dot" /> Atualização automática</div>
      </header>

      <section className="hero" id="painel">
        <div className="hero-content">
          <div className="eyebrow"><span className="pulse" /> MONITORAMENTO EPIDEMIOLÓGICO</div>
          <h1>Mpox no Brasil,<br /><em>em um só lugar.</em></h1>
          <p>Acompanhe dados agregados, atualizações oficiais e notícias sobre mpox no país. Informação clara para decisões mais conscientes.</p>
          <div className="hero-actions"><a className="primary-button" href="#dados">Ver dados por estado <ArrowUpRight size={17} /></a><span className="updated"><RefreshCw size={14} /> Atualizado em {formatDateTime(collection)}</span></div>
        </div>
        <div className="hero-orbit" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit-core"><MapPin size={31} /></div><span className="orbit-label label-one">Dados abertos</span><span className="orbit-label label-two">Brasil</span></div>
      </section>

      <div className="demo-banner"><Info size={17} /><span><strong>Modo demonstração:</strong> os dados exibidos são ilustrativos. A conexão com fontes oficiais será ativada após a validação dos endpoints.</span><button type="button">Saiba mais</button></div>

      <section className="content-section" id="dados">
        <div className="section-heading"><div><span className="section-kicker">VISÃO GERAL</span><h2>O cenário agora</h2><p>Casos confirmados agregados por estado na última atualização disponível.</p></div><div className="date-control"><CalendarDays size={16} /><span>17 nov 2026</span></div></div>
        <div className="stats-grid">
          <div className="stat-card accent"><div className="stat-top"><span>Total de casos</span><div className="stat-icon"><Activity size={18} /></div></div><strong>{formatNumber(cases)}</strong><small><TrendingUp size={13} /> Dados agregados por estado</small></div>
          <div className="stat-card"><div className="stat-top"><span>Estados com registros</span><div className="stat-icon muted"><MapPin size={18} /></div></div><strong>{uniqueStates(fixtureObservations)}<small className="unit"> / 27</small></strong><small>Com dados disponíveis</small></div>
          <div className="stat-card"><div className="stat-top"><span>Última coleta</span><div className="stat-icon muted"><RefreshCw size={18} /></div></div><strong className="stat-date">20 nov</strong><small>às 10:00 · horário de Brasília</small></div>
          <div className="stat-card"><div className="stat-top"><span>Fontes ativas</span><div className="stat-icon green"><ShieldCheck size={18} /></div></div><strong>{fixtureSources.length}</strong><small><CheckCircle2 size={13} /> Operando normalmente</small></div>
        </div>

        <div className="toolbar"><div className="toolbar-title"><h2>Distribuição por localidade</h2><span>Dados oficiais agregados</span></div><div className="filters"><label>Visualização<select value={selectedLevel} onChange={(event) => setSelectedLevel(event.target.value as "state" | "municipality")}><option value="state">Por estado</option><option value="municipality">Por município</option></select></label><label>Estado<select value={selectedState} onChange={(event) => setSelectedState(event.target.value)}><option>Todos</option>{stateOptions.map((state) => <option key={state}>{state}</option>)}</select></label></div></div>

        <div className="data-layout"><div className="map-card"><div className="map-header"><div><h3>{selectedLevel === "state" ? "Intensidade por estado" : "Municípios monitorados"}</h3><span>Quanto mais escuro, maior o número de casos</span></div><span className="source-tag"><span className="source-dot" /> Oficial</span></div><div className="state-grid">{(selectedLevel === "state" ? summaries : observations.map((item) => ({ stateCode: item.stateCode, name: item.locationName, value: item.value }))).map((item) => <div className="state-tile" key={`${item.stateCode}-${item.name}`} style={{ ["--intensity" as string]: Math.max(0.18, item.value / maxValue) }}><span className="state-code">{item.stateCode}</span><strong>{formatNumber(item.value)}</strong><small>{item.name}</small></div>)}</div><div className="legend"><span>Menos casos</span><i className="legend-bar" /><span>Mais casos</span></div></div>
          <div className="ranking-card"><div className="card-title"><h3>Maiores registros</h3><span>Casos confirmados</span></div><div className="ranking-list">{summaries.slice(0, 6).map((item, index) => <div className="ranking-row" key={item.stateCode}><span className="rank">0{index + 1}</span><div className="rank-name"><strong>{item.name}</strong><div className="rank-track"><i style={{ width: `${(item.value / maxValue) * 100}%` }} /></div></div><b>{formatNumber(item.value)}</b></div>)}</div><button className="text-button" type="button" onClick={() => setSelectedLevel("state")}>Ver todos os estados <ArrowUpRight size={15} /></button></div></div>
      </section>

      <section className="content-section secondary-section" id="historico"><div className="section-heading"><div><span className="section-kicker">ACOMPANHAMENTO</span><h2>Atualizações recentes</h2><p>Fontes e notícias para acompanhar o contexto da mpox no país.</p></div><button className="outline-button" type="button"><Bell size={15} /> Receber atualizações</button></div><div className="updates-layout"><div className="news-card"><div className="card-title"><div><h3>Notícias monitoradas</h3><span>Informações coletadas de fontes públicas</span></div><span className="count-badge">{fixtureNews.length}</span></div>{visibleNews.map((item) => <NewsCard item={item} key={item.id} />)}<button className="text-button" type="button" onClick={() => setShowAllNews(!showAllNews)}>{showAllNews ? "Mostrar menos" : "Ver todas as notícias"} <ArrowUpRight size={15} /></button></div><div className="timeline-card" id="fontes"><div className="card-title"><div><h3>Saúde dos dados</h3><span>Status das fontes monitoradas</span></div><CheckCircle2 className="success-icon" size={20} /></div>{fixtureSources.map((source) => <div className="source-row" key={source.id}><div className="source-avatar">{source.kind === "official" ? <ShieldCheck size={16} /> : <Newspaper size={16} />}</div><div><strong>{source.name}</strong><span>Última coleta: {formatDateTime(source.lastSuccessAt)}</span></div><span className="status-ok">Ativa</span></div>)}<div className="data-note"><Info size={15} /><span>Notícias são exibidas como contexto e <strong>não alteram</strong> os números de casos confirmados.</span></div></div></div></section>

      <footer><div className="footer-brand"><div className="brand-mark"><Activity size={17} /></div><strong>mpox<span>monitor</span></strong></div><span>Dados públicos, informação responsável.</span><span>Última atualização: {formatDateTime(collection)}</span></footer>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Info,
  Layers,
  Map,
  MapPin,
  Newspaper,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";
import {
  latestCollection,
  regionalSummaries,
  stateSummaries,
  totalCases,
  uniqueMunicipalitiesCount,
  uniqueStates,
  STATE_TO_REGION,
} from "@/lib/aggregations";
import { formatDate, formatDateTime } from "@/lib/provenance";
import type { NewsItem, Observation, Source } from "@/lib/types";
import { BrazilMap } from "./BrazilMap";

const STATE_NAMES: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará",
  DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso",
  MS: "Mato Grosso do Sul", MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná",
  PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina",
  SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function NewsCard({ item }: { item: NewsItem }) {
  const isOfficial = item.verificationStatus === "official-context";
  return (
    <article className="news-item">
      <div className="news-icon"><Newspaper size={17} /></div>
      <div className="news-copy">
        <div className="news-meta">
          <span className={isOfficial ? "unconfirmed" : "unconfirmed"}>
            {isOfficial ? "Contexto oficial" : "Não confirmado"}
          </span>
          <span>{item.publisher}</span>
          <span>·</span>
          <span>{formatDate(item.publishedAt)}</span>
        </div>
        <h3>{item.title}</h3>
        <p>{item.summary}</p>
        <a href={item.url} target="_blank" rel="noreferrer">
          Ler notícia completa na fonte <ExternalLink size={13} />
        </a>
      </div>
    </article>
  );
}

export function Dashboard({
  observations,
  news,
  sources,
  mode,
}: {
  observations: Observation[];
  news: NewsItem[];
  sources: Source[];
  mode: "fixture" | "live";
}) {
  const [selectedState, setSelectedState] = useState("Todos");
  const [viewMode, setViewMode] = useState<"map" | "grid">("map");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllNews, setShowAllNews] = useState(false);

  const summaries = useMemo(() => stateSummaries(observations), [observations]);
  const regions = useMemo(() => regionalSummaries(observations), [observations]);
  const cases = useMemo(() => totalCases(observations), [observations]);
  const collection = useMemo(() => latestCollection(observations), [observations]);
  const affectedStatesCount = useMemo(() => uniqueStates(observations), [observations]);
  const municipalitiesCount = useMemo(() => uniqueMunicipalitiesCount(observations), [observations]);

  const stateValuesMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of summaries) {
      map[item.stateCode] = item.value;
    }
    return map;
  }, [summaries]);

  const maxValue = summaries[0]?.value ?? 1;

  // Municipalities list
  const allMunicipalities = useMemo(() => {
    return observations
      .filter((item) => item.level === "municipality")
      .map((item) => ({
        code: item.locationCode,
        name: item.locationName,
        stateCode: item.stateCode,
        cases: item.value,
        status: item.status,
      }))
      .sort((a, b) => b.cases - a.cases);
  }, [observations]);

  // Filtered municipalities by search and state
  const filteredMunicipalities = useMemo(() => {
    return allMunicipalities.filter((m) => {
      if (selectedState !== "Todos" && m.stateCode !== selectedState) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.stateCode.toLowerCase().includes(q) ||
        (STATE_NAMES[m.stateCode] && STATE_NAMES[m.stateCode].toLowerCase().includes(q))
      );
    });
  }, [allMunicipalities, selectedState, searchQuery]);

  // Selected state info
  const selectedStateInfo = useMemo(() => {
    if (selectedState === "Todos") return null;
    const item = summaries.find((s) => s.stateCode === selectedState);
    const stateCases = item?.value ?? 0;
    const share = cases > 0 ? (stateCases / cases) * 100 : 0;
    const stateCities = allMunicipalities.filter((m) => m.stateCode === selectedState);
    return {
      sigla: selectedState,
      name: STATE_NAMES[selectedState] ?? selectedState,
      region: STATE_TO_REGION[selectedState] ?? "Brasil",
      cases: stateCases,
      share: share.toFixed(1),
      citiesCount: stateCities.length,
    };
  }, [selectedState, summaries, cases, allMunicipalities]);

  const visibleNews = showAllNews ? news : news.slice(0, 4);
  const stateOptions = useMemo(() => [...new Set(observations.map((item) => item.stateCode))].sort(), [observations]);

  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Activity size={21} /></div>
          <div><strong>mpox<span>monitor</span></strong><small>Brasil</small></div>
        </div>
        <nav>
          <a href="#painel">Painel</a>
          <a href="#mapa-brasil">Mapa</a>
          <a href="#regioes">Regiões</a>
          <a href="#municipios">Municípios</a>
          <a href="#noticias">Notícias</a>
          <a href="#fontes">Fontes</a>
        </nav>
        <div className="topbar-status">
          <span className="live-dot" /> Atualização contínua
        </div>
      </header>

      <section className="hero" id="painel">
        <div className="hero-content">
          <div className="eyebrow"><span className="pulse" /> MONITORAMENTO EPIDEMIOLÓGICO EM TEMPO REAL</div>
          <h1>Mpox no Brasil,<br /><em>em um só lugar.</em></h1>
          <p>
            Painel público com dados oficiais agregados do Ministério da Saúde e monitoramento de notícias em tempo real.
            Transparência e vigilância acessível para todo o Brasil.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#mapa-brasil">
              Ver mapa interativo <ArrowUpRight size={17} />
            </a>
            <span className="updated">
              <RefreshCw size={14} /> Atualizado em {formatDateTime(collection)}
            </span>
          </div>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit-core"><MapPin size={31} /></div>
          <span className="orbit-label label-one">Dados abertos SUS</span>
          <span className="orbit-label label-two">Brasil</span>
        </div>
      </section>

      <div className={`demo-banner ${mode === "live" ? "live-banner" : ""}`}>
        <Info size={17} />
        <span>
          <strong>{mode === "live" ? "Fonte oficial do Ministério da Saúde conectada:" : "Modo demonstração:"}</strong>{" "}
          {mode === "live"
            ? "dados agregados do e-SUS Sinan/Mpox e notícias públicas em tempo real."
            : "os dados exibidos são ilustrativos. Conecte ao Supabase com DATA_MODE=live para dados oficiais."}
        </span>
        <button type="button" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}>
          Ver fontes
        </button>
      </div>

      <section className="content-section" id="mapa-brasil">
        <div className="section-heading">
          <div>
            <span className="section-kicker">INDICADORES EPIDEMIOLÓGICOS</span>
            <h2>Panorama Nacional de Mpox</h2>
            <p>Casos confirmados agregados por unidade da federação e municípios com vigilância ativa.</p>
          </div>
          <div className="date-control">
            <CalendarDays size={16} />
            <span>Última atualização: {formatDate(collection)}</span>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="stats-grid">
          <div className="stat-card accent">
            <div className="stat-top">
              <span>Total de casos</span>
              <div className="stat-icon"><Activity size={18} /></div>
            </div>
            <strong>{formatNumber(cases)}</strong>
            <small><TrendingUp size={13} /> Casos confirmados oficiais</small>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Estados com registros</span>
              <div className="stat-icon muted"><MapPin size={18} /></div>
            </div>
            <strong>{affectedStatesCount}<small className="unit"> / 27 UFs</small></strong>
            <small>Com dados no Ministério da Saúde</small>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Municípios monitorados</span>
              <div className="stat-icon muted"><Map size={18} /></div>
            </div>
            <strong>{formatNumber(municipalitiesCount || allMunicipalities.length)}</strong>
            <small>Cidades com registros no sistema</small>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Notícias monitoradas</span>
              <div className="stat-icon green"><Newspaper size={18} /></div>
            </div>
            <strong>{news.length}</strong>
            <small><CheckCircle2 size={13} /> Feeds públicos em tempo real</small>
          </div>
        </div>

        {/* Selected State Spotlight */}
        {selectedStateInfo && (
          <div className="state-spotlight">
            <div className="spotlight-info">
              <h3>
                {selectedStateInfo.name} ({selectedStateInfo.sigla})
                <span className="spotlight-badge">Filtro Ativo</span>
              </h3>
              <span className="spotlight-region">Região {selectedStateInfo.region}</span>
            </div>
            <div className="spotlight-stats">
              <div className="spotlight-stat">
                <span>Casos confirmados</span>
                <strong>{formatNumber(selectedStateInfo.cases)}</strong>
              </div>
              <div className="spotlight-stat">
                <span>% do Brasil</span>
                <strong>{selectedStateInfo.share}%</strong>
              </div>
              <div className="spotlight-stat">
                <span>Municípios com dados</span>
                <strong>{selectedStateInfo.citiesCount}</strong>
              </div>
              <button
                type="button"
                className="clear-selection-btn"
                onClick={() => setSelectedState("Todos")}
              >
                <X size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                Ver todo o Brasil
              </button>
            </div>
          </div>
        )}

        {/* Toolbar & View mode switcher */}
        <div className="toolbar">
          <div className="toolbar-title">
            <h2>Distribuição Geográfica de Casos</h2>
            <span>Clique em qualquer estado no mapa para detalhar</span>
          </div>
          <div className="filters">
            <div className="view-switch">
              <button
                type="button"
                className={viewMode === "map" ? "active" : ""}
                onClick={() => setViewMode("map")}
              >
                <Map size={14} /> Mapa do Brasil
              </button>
              <button
                type="button"
                className={viewMode === "grid" ? "active" : ""}
                onClick={() => setViewMode("grid")}
              >
                <Layers size={14} /> Grade de Estados
              </button>
            </div>

            <label>
              Estado
              <select
                value={selectedState}
                onChange={(event) => setSelectedState(event.target.value)}
              >
                <option value="Todos">Todos os estados</option>
                {stateOptions.map((st) => (
                  <option key={st} value={st}>
                    {STATE_NAMES[st] ? `${STATE_NAMES[st]} (${st})` : st}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Main Map + Ranking Layout */}
        <div className="data-layout">
          <div className="map-card">
            <div className="map-header">
              <div>
                <h3>{viewMode === "map" ? "Mapa Interativo do Brasil" : "Intensidade por Estado"}</h3>
                <span>
                  {viewMode === "map"
                    ? "Passe o cursor ou clique no estado para inspecionar"
                    : "Estados ordenados por número de casos"}
                </span>
              </div>
              <span className="source-tag"><span className="source-dot" /> e-SUS Sinan</span>
            </div>

            {viewMode === "map" ? (
              <BrazilMap
                stateValues={stateValuesMap}
                maxValue={maxValue}
                selectedState={selectedState}
                onSelectState={setSelectedState}
              />
            ) : (
              <div className="state-grid">
                {summaries.map((item) => (
                  <div
                    className={`state-tile ${selectedState === item.stateCode ? "selected" : ""}`}
                    key={item.stateCode}
                    style={{ ["--intensity" as string]: Math.max(0.18, item.value / maxValue) }}
                    onClick={() => setSelectedState(selectedState === item.stateCode ? "Todos" : item.stateCode)}
                  >
                    <span className="state-code">{item.stateCode}</span>
                    <strong>{formatNumber(item.value)}</strong>
                    <small>{item.name}</small>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ranking Card */}
          <div className="ranking-card">
            <div className="card-title">
              <h3>Ranking por Estado</h3>
              <span>Maiores concentrações de casos</span>
            </div>
            <div className="ranking-list">
              {summaries.slice(0, 8).map((item, index) => (
                <div
                  className="ranking-row"
                  key={item.stateCode}
                  style={{ cursor: "pointer", opacity: selectedState === "Todos" || selectedState === item.stateCode ? 1 : 0.4 }}
                  onClick={() => setSelectedState(selectedState === item.stateCode ? "Todos" : item.stateCode)}
                >
                  <span className="rank">0{index + 1}</span>
                  <div className="rank-name">
                    <strong>{item.name} ({item.stateCode})</strong>
                    <div className="rank-track">
                      <i style={{ width: `${(item.value / maxValue) * 100}%` }} />
                    </div>
                  </div>
                  <b>{formatNumber(item.value)}</b>
                </div>
              ))}
            </div>
            {selectedState !== "Todos" && (
              <button
                className="text-button"
                type="button"
                onClick={() => setSelectedState("Todos")}
              >
                Limpar seleção (ver todos) <ArrowUpRight size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Macrorregions Breakdown */}
        <div className="regional-section" id="regioes">
          <div className="section-heading">
            <div>
              <span className="section-kicker">DISTRIBUIÇÃO REGIONAL</span>
              <h2>Casos por Região do Brasil</h2>
              <p>Visão consolidada por macrorregiões geográficas do país.</p>
            </div>
          </div>
          <div className="regional-grid">
            {regions.map((reg) => (
              <div className="regional-card" key={reg.region}>
                <div className="regional-header">
                  <span>Região {reg.region}</span>
                  <span className="regional-share">{reg.percentage.toFixed(1)}%</span>
                </div>
                <strong className="regional-cases">{formatNumber(reg.cases)}</strong>
                <div className="regional-bar">
                  <div
                    className="regional-bar-fill"
                    style={{ width: `${Math.min(100, reg.percentage)}%` }}
                  />
                </div>
                <span className="regional-sub">
                  {reg.statesCount} {reg.statesCount === 1 ? "estado com casos" : "estados com casos"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Municipality Explorer */}
        <div className="explorer-card" id="municipios">
          <div className="explorer-header">
            <div>
              <span className="section-kicker">EXPLORADOR DE MUNICÍPIOS</span>
              <h3 style={{ margin: "4px 0 0", fontSize: "18px" }}>Municípios Monitorados</h3>
              <span style={{ fontSize: "11px", color: "#64748b" }}>
                {filteredMunicipalities.length} município(s) encontrado(s){selectedState !== "Todos" ? ` em ${STATE_NAMES[selectedState] || selectedState}` : ""}
              </span>
            </div>
            <div className="search-input-box">
              <Search className="search-icon" size={15} />
              <input
                type="text"
                placeholder="Buscar por município ou sigla (ex: Campinas, RJ)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="municipality-table-wrapper">
            <table className="municipality-table">
              <thead>
                <tr>
                  <th>Município</th>
                  <th>Estado (UF)</th>
                  <th>Região</th>
                  <th>Casos Confirmados</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMunicipalities.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "24px", color: "#94a3b8" }}>
                      Nenhum município encontrado para os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  filteredMunicipalities.slice(0, 15).map((m) => (
                    <tr key={`${m.stateCode}-${m.name}-${m.code}`}>
                      <td>
                        <strong>{m.name}</strong>
                      </td>
                      <td>
                        <span className="city-tag">{m.stateCode}</span> {STATE_NAMES[m.stateCode]}
                      </td>
                      <td>{STATE_TO_REGION[m.stateCode] ?? "-"}</td>
                      <td>
                        <b className="cases-badge">{formatNumber(m.cases)}</b>
                      </td>
                      <td>
                        <span style={{ color: "#16a34a", fontSize: "11px", fontWeight: "600" }}>
                          Oficial SUS
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* News & Context Section */}
      <section className="content-section secondary-section" id="noticias">
        <div className="section-heading">
          <div>
            <span className="section-kicker">ACOMPANHAMENTO EM TEMPO REAL</span>
            <h2>Notícias e Atualizações Públicas</h2>
            <p>Notícias coletadas automaticamente de veículos de imprensa para acompanhamento do cenário.</p>
          </div>
          <button className="outline-button" type="button">
            <Bell size={15} /> Alertas de Mpox
          </button>
        </div>

        <div className="updates-layout">
          <div className="news-card">
            <div className="card-title">
              <div>
                <h3>Notícias em Tempo Real</h3>
                <span>Coletadas automaticamente de feeds públicos</span>
              </div>
              <span className="count-badge">{news.length}</span>
            </div>

            {news.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "12px", margin: "20px 0" }}>
                Nenhuma notícia coletada ainda. As notícias são atualizadas a cada hora pelo coletor automático.
              </p>
            ) : (
              visibleNews.map((item) => <NewsCard item={item} key={item.id} />)
            )}

            {news.length > 4 && (
              <button
                className="text-button"
                type="button"
                onClick={() => setShowAllNews(!showAllNews)}
              >
                {showAllNews ? "Mostrar menos notícias" : `Ver todas as ${news.length} notícias`}{" "}
                <ArrowUpRight size={15} />
              </button>
            )}
          </div>

          {/* Sources and Data Provenance */}
          <div className="timeline-card" id="fontes">
            <div className="card-title">
              <div>
                <h3>Fontes e Confiabilidade</h3>
                <span>Origem dos dados do sistema</span>
              </div>
              <CheckCircle2 className="success-icon" size={20} />
            </div>

            {sources.map((source) => (
              <div className="source-row" key={source.id}>
                <div className="source-avatar">
                  {source.kind === "official" ? <ShieldCheck size={16} /> : <Newspaper size={16} />}
                </div>
                <div>
                  <strong>{source.name}</strong>
                  <span>Última coleta: {formatDateTime(source.lastSuccessAt)}</span>
                </div>
                <span className="status-ok">Operacional</span>
              </div>
            ))}

            <div className="data-note">
              <Info size={15} />
              <span>
                <strong>Aviso de integridade:</strong> As notícias jornalísticas são exibidas exclusivamente
                como contexto informativo e <strong>jamais alteram</strong> os números de casos confirmados,
                que derivam estritamente do Sinan/Ministério da Saúde.
              </span>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-brand">
          <div className="brand-mark"><Activity size={17} /></div>
          <strong>mpox<span>monitor</span></strong>
        </div>
        <span>Vigilância colaborativa e aberta · Brasil</span>
        <span>Última coleta: {formatDateTime(collection)}</span>
      </footer>
    </main>
  );
}

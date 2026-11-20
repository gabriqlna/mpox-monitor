import { createHash } from "node:crypto";
import type { NewsItem, Source } from "@/lib/types";

export const NEWS_SOURCE_ID = "news-rss";
export const NEWS_FEED_URL = "https://news.google.com/rss/search?q=mpox+brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419";

const OFFICIAL_PUBLISHERS = ["ministério da saúde", "governo", "fiocruz", "anvisa", "butantan", "ebc", "agência brasil"];

export function createNewsSource(lastSuccessAt: string): Source {
  return {
    id: NEWS_SOURCE_ID,
    name: "Monitoramento de Notícias · Feeds Públicos",
    kind: "news",
    status: "active",
    url: NEWS_FEED_URL,
    lastSuccessAt,
  };
}

export function parseRssXml(xml: string, limit = 20): NewsItem[] {
  const items: NewsItem[] = [];
  const now = new Date().toISOString();
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);

  for (const match of itemMatches) {
    if (items.length >= limit) break;
    const raw = match[1];
    const titleMatch = raw.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = raw.match(/<link>([\s\S]*?)<\/link>/);
    const pubDateMatch = raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const sourceMatch = raw.match(/<source[^>]*>([\s\S]*?)<\/source>/);

    if (!titleMatch || !linkMatch) continue;

    const fullTitle = titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim();
    const publisher = sourceMatch ? sourceMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : "Imprensa";
    const cleanTitle = fullTitle.replace(new RegExp(`\\s*-\\s*${publisher.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`), "").trim();
    const url = linkMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim();
    const pubDate = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : now;

    const isOfficial = OFFICIAL_PUBLISHERS.some((p) => publisher.toLowerCase().includes(p));
    const hash = createHash("sha256").update(url || cleanTitle).digest("hex").slice(0, 16);

    items.push({
      id: `news-${hash}`,
      title: cleanTitle,
      publisher,
      url,
      publishedAt: pubDate,
      collectedAt: now,
      summary: `Notícia pública reportada por ${publisher}. Monitorada para contexto epidemiológico e não altera a contagem oficial.`,
      verificationStatus: isOfficial ? "official-context" : "unconfirmed",
      sourceId: NEWS_SOURCE_ID,
    });
  }

  return items;
}

export async function fetchLiveNews(limit = 20): Promise<NewsItem[]> {
  try {
    const res = await fetch(NEWS_FEED_URL, {
      headers: { "User-Agent": "MpoxMonitorBrasil/1.0 (+https://mpox-monitor.vercel.app)" },
      next: { revalidate: 1800 },
    });
    if (!res.ok) {
      console.warn(`[news] Falha ao buscar RSS: status ${res.status}`);
      return [];
    }
    const xml = await res.text();
    return parseRssXml(xml, limit);
  } catch (err) {
    console.warn("[news] Erro ao coletar notícias:", err);
    return [];
  }
}

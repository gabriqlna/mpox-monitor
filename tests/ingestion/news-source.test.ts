import { describe, expect, it } from "vitest";
import { parseRssXml } from "@/lib/ingestion/news-source";

describe("coletor de notícias RSS", () => {
  it("extrai notícias e define status não confirmado ou contexto oficial", () => {
    const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <item>
          <title>Vacinação contra mpox é intensificada - Ministério da Saúde</title>
          <link>https://exemplo.gov.br/noticia-1</link>
          <pubDate>Thu, 19 Nov 2026 12:00:00 GMT</pubDate>
          <source url="https://exemplo.gov.br">Ministério da Saúde</source>
        </item>
        <item>
          <title>Casos suspeitos sob investigação no interior - Jornal Regional</title>
          <link>https://jornal.exemplo.com/noticia-2</link>
          <pubDate>Wed, 18 Nov 2026 10:00:00 GMT</pubDate>
          <source url="https://jornal.exemplo.com">Jornal Regional</source>
        </item>
      </channel>
    </rss>`;

    const items = parseRssXml(sampleXml);
    expect(items).toHaveLength(2);

    expect(items[0].title).toBe("Vacinação contra mpox é intensificada");
    expect(items[0].publisher).toBe("Ministério da Saúde");
    expect(items[0].verificationStatus).toBe("official-context");

    expect(items[1].title).toBe("Casos suspeitos sob investigação no interior");
    expect(items[1].publisher).toBe("Jornal Regional");
    expect(items[1].verificationStatus).toBe("unconfirmed");
  });
});

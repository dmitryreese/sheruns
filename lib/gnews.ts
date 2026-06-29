export interface GNewsArticle {
  title: string;
  description: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: { name: string; url: string };
}

export async function searchNews(query: string): Promise<GNewsArticle[]> {
  const params = new URLSearchParams({
    q: query,
    lang: 'en',
    max: '10',
    apikey: process.env.GNEWS_API_KEY!,
  });

  const res = await fetch(`https://gnews.io/api/v4/search?${params}`);

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GNews error ${res.status}: ${body}`);
  }

  const data = await res.json();
  if (!Array.isArray(data.articles)) {
    throw new Error(`Unexpected GNews response shape: ${JSON.stringify(data).slice(0, 200)}`);
  }
  return data.articles as GNewsArticle[];
}

import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface Analysis {
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  tags: string[];
}

export async function analyzeArticle(
  title: string,
  description: string
): Promise<Analysis> {
  const response = await client.chat.completions.create({
    model: 'gpt-4.1-nano',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are a news analyst. Respond with valid JSON only: ' +
          '{ "summary": "2-3 sentence summary", "sentiment": "positive" | "neutral" | "negative", ' +
          '"tags": ["tag1", "tag2", "tag3"] } ' +
          'Tags must be exactly 3 short topic labels (1-2 words, lowercase, e.g. "ai", "tech layoffs", "climate").',
      },
      {
        role: 'user',
        content: `Title: ${title}\nDescription: ${description}`,
      },
    ],
  });

  const raw = response.choices[0].message.content ?? '';
  let parsed: Analysis;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('OpenAI returned a non-JSON response');
  }

  if (
    typeof parsed.summary !== 'string' ||
    !['positive', 'neutral', 'negative'].includes(parsed.sentiment) ||
    !Array.isArray(parsed.tags) ||
    parsed.tags.length !== 3 ||
    parsed.tags.some((t) => typeof t !== 'string')
  ) {
    throw new Error('Unexpected response shape from OpenAI');
  }

  return parsed;
}

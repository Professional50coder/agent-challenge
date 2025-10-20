import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface GeocodingResponse {
  results: {
    latitude: number;
    longitude: number;
    name: string;
  }[];
}
interface WeatherResponse {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
    weather_code: number;
  };
}

export type WeatherToolResult = z.infer<typeof WeatherToolResultSchema>;

const WeatherToolResultSchema = z.object({
  temperature: z.number(),
  feelsLike: z.number(),
  humidity: z.number(),
  windSpeed: z.number(),
  windGust: z.number(),
  conditions: z.string(),
  location: z.string(),
});

export const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City name'),
  }),
  outputSchema: WeatherToolResultSchema,
  execute: async ({ context }) => {
    return await getWeather(context.location);
  },
});

const getWeather = async (location: string) => {
  const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
  const geocodingResponse = await fetch(geocodingUrl);
  const geocodingData = (await geocodingResponse.json()) as GeocodingResponse;

  if (!geocodingData.results?.[0]) {
    throw new Error(`Location '${location}' not found`);
  }

  const { latitude, longitude, name } = geocodingData.results[0];

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,weather_code`;

  const response = await fetch(weatherUrl);
  const data = (await response.json()) as WeatherResponse;

  return {
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    windGust: data.current.wind_gusts_10m,
    conditions: getWeatherCondition(data.current.weather_code),
    location: name,
  };
};

function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return conditions[code] || 'Unknown';
}

// ------------------ Crypto Compliance Tools (stubs) ------------------

const UpstashSearchResultSchema = z.object({
  id: z.string(),
  text: z.string(),
  metadata: z.record(z.string()).optional(),
});

export const ragLookupTool = createTool({
  id: 'rag-lookup',
  description: 'Retrieve relevant compliance documents/snippets from Upstash Vector for RAG',
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.object({ results: z.array(UpstashSearchResultSchema) }),
  execute: async ({ context }) => {
    const endpoint = process.env.UPSTASH_VECTOR_ENDPOINT;
    const token = process.env.UPSTASH_VECTOR_TOKEN;
    if (!endpoint || !token) {
      return { results: [] };
    }

    // Simple Upstash vector query payload (their API can vary). This is a stub implementation.
    const resp = await fetch(`${endpoint}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        index: process.env.UPSTASH_VECTOR_INDEX,
        query: context.query,
        topK: 5,
      }),
    });

    if (!resp.ok) return { results: [] };

    const data = await resp.json();
    // Normalize to expected schema
    const results = (data.results || []).map((r: any) => ({
      id: r.id || r._id || '',
      text: r.text || r.document || r.data || '',
      metadata: r.metadata || r.meta || {},
    }));

    return { results };
  },
});

export const generateContentTool = createTool({
  id: 'generate-content',
  description: 'Generate educational or platform-ready content about a compliance topic',
  inputSchema: z.object({
    prompt: z.string(),
    length: z.enum(['short', 'medium', 'long']).default('medium'),
    tone: z.string().optional(),
    platform: z.string().optional(),
  }),
  outputSchema: z.object({ content: z.string() }),
  execute: async ({ context }) => {
    // This should call your configured model provider. For now return a stub.
    const content = `Generated content for prompt: ${context.prompt} (length=${context.length}, platform=${context.platform || 'generic'})`;
    return { content };
  },
});

export const verifyFactsTool = createTool({
  id: 'verify-facts',
  description: 'Verify factual claims against compliance sources and return verification results',
  inputSchema: z.object({ claims: z.array(z.string()) }),
  outputSchema: z.object({ results: z.array(z.object({ claim: z.string(), verified: z.boolean(), evidence: z.string().optional() })) }),
  execute: async ({ context }) => {
    // Stubbed verification: in real world this would use RAG + cross-references
    const results = context.claims.map((c: string) => ({ claim: c, verified: false as boolean, evidence: '' }));
    return { results };
  },
});

export const formatForPlatformTool = createTool({
  id: 'format-platform',
  description: 'Format a piece of content for a target platform (X, LinkedIn, YouTube)',
  inputSchema: z.object({ content: z.string(), platform: z.enum(['x', 'linkedin', 'youtube', 'generic']).default('generic') }),
  outputSchema: z.object({ formatted: z.string() }),
  execute: async ({ context }) => {
    // Simple formatter stub
    const formatted = `Formatted for ${context.platform}: ${context.content}`;
    return { formatted };
  },
});

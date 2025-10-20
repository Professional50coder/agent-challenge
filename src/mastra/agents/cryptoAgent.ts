import { Agent } from "@mastra/core/agent";
import { z } from "zod";
import { createTool } from '@mastra/core/tools';
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { ragLookupTool, generateContentTool, verifyFactsTool, formatForPlatformTool } from "@/mastra/tools";
import { createOllama } from "ollama-ai-provider-v2";
import { openai } from "@ai-sdk/openai";

// Simple agent state: track monitored addresses and notes
export const CryptoAgentState = z.object({
  monitoredAddresses: z.array(z.string()).default([]),
  notes: z.array(z.string()).default([]),
});

// Example tool: add an address to watchlist
export const addAddressTool = createTool({
  id: 'add-address',
  description: 'Add an address to the crypto watchlist',
  inputSchema: z.object({ address: z.string() }),
  outputSchema: z.object({ success: z.boolean() }),
  execute: async ({ context }) => {
    // Persist to Memory if configured
    const address = context.address;
    try {
      if ((global as any).__CRYPTO_AGENT_STORE__) {
        const store = (global as any).__CRYPTO_AGENT_STORE__ as any;
        // naive append: get current list, push, and save
        const existing = (await store.get('monitoredAddresses')) || [];
        existing.push(address);
        await store.set('monitoredAddresses', existing);
      }
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  },
});

// Setup Memory store if CRYPTO_AGENT_DB_URL is provided (otherwise leave undefined)
let memory: any = undefined;
try {
  const dbUrl = process.env.CRYPTO_AGENT_DB_URL;
  if (dbUrl) {
    // Initialize LibSQLStore for Mastra Memory (the Memory class will use it via the storage API)
    const store = new LibSQLStore({ url: dbUrl });
    memory = new Memory({ storage: store, options: { workingMemory: { enabled: true, schema: CryptoAgentState } } });

    // Provide a naive in-memory shim API for simple tools (tools should use agent memory APIs in production)
    const naiveMap = new Map<string, any>();
    (global as any).__CRYPTO_AGENT_STORE__ = {
      get: async (k: string) => naiveMap.get(k) ?? null,
      set: async (k: string, v: any) => naiveMap.set(k, v),
    };
  }
} catch (e) {
  // ignore memory init errors for now
}

// Choose model provider (mirror the project's other agent pattern)
let model: any = undefined;
if ((process.env.MODEL_PROVIDER || 'ollama') === 'openai') {
  model = openai(process.env.OPENAI_API_KEY || '');
} else {
  const ollama = createOllama({ baseURL: process.env.OLLAMA_API_URL || process.env.NOS_OLLAMA_API_URL });
  model = ollama(process.env.MODEL_NAME_AT_ENDPOINT || process.env.MODEL_NAME_AT_ENDPOINT || 'qwen3:8b');
}

export const cryptoAgent = new Agent({
  name: "Crypto Agent",
  tools: {
    addAddress: addAddressTool,
    ragLookup: ragLookupTool,
    generateContent: generateContentTool,
    verifyFacts: verifyFactsTool,
    formatForPlatform: formatForPlatformTool,
  },
  instructions: "You help maintain a small crypto watchlist and assist content creators by retrieving, verifying, and formatting crypto compliance content.",
  description: "Crypto Compliance Content Agent: RAG + generation + verification + formatting tools.",
  memory,
  model,
});


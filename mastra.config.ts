import { Config } from '@mastra/core';
import { LibSQLStore } from '@mastra/libsql';

const config: Config = {
  server: {
    port: 3001,
    host: 'localhost',
  },
  storage: new LibSQLStore({
    url: process.env.DATABASE_URL || 'file:crypto_agent.db'
  }),
  // Agents will be loaded from src/mastra/agents directory
  agents: {},
  // Tools will be loaded from src/mastra/tools directory
  workflows: {},
  // Disable logging for now
  logger: false,
};

export default config;
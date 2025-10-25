import { hash, compare } from "bcryptjs"

// In production, store these securely in a database
const validApiKeys = new Set([process.env.COMPLIANCE_API_KEY || "demo-key-12345"])

export async function validateApiKey(apiKey: string | null): Promise<boolean> {
  if (!apiKey) return false
  return validApiKeys.has(apiKey)
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

export function generateApiKey(): string {
  return `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Get environment variable that works for both Deno and Cloudflare Workers
 */
export function getEnv(key: string, env?: any): string | undefined {
  // Try to access environment variables safely
  try {
    // Check if we're in Deno environment
    if (typeof (globalThis as any).Deno !== "undefined") {
      return (globalThis as any).Deno.env.get(key);
    }

    // Check if we're in Cloudflare Workers environment (vars are on globalThis)
    if ((globalThis as any).__CF_ENV__) {
      return (globalThis as any).__CF_ENV__[key];
    }

    // Fallback to process.env for Node.js compatibility
    if (typeof process !== "undefined" && process.env) {
      return process.env[key];
    }
  } catch (error) {
    console.warn(`Error accessing environment variable ${key}:`, error);
  }

  return undefined;
}

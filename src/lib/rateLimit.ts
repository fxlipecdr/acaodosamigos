/**
 * Rate Limiter simples em memória baseado em Janela Deslizante (Sliding Window).
 * Protege rotas sensíveis contra bots, ataques de negação de serviço e força bruta.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Limpa registros antigos a cada 5 minutos para evitar vazamento de memória
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
  if (timer.unref) {
    timer.unref();
  }
}

export interface RateLimitOptions {
  keyPrefix?: string;
  limit?: number;        // Máximo de requisições permitidas
  windowMs?: number;     // Janela de tempo em milissegundos (padrão: 60s)
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

export function checkRateLimit(
  request: Request,
  options: RateLimitOptions = {}
): RateLimitResult {
  const { keyPrefix = "rl", limit = 15, windowMs = 60 * 1000 } = options;

  // Extrai o IP do cliente através dos cabeçalhos comuns de proxies e CDNs (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded ? forwarded.split(",")[0].trim() : realIp || "127.0.0.1";

  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();

  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return {
    allowed: true,
    remaining: limit - current.count,
    resetInSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

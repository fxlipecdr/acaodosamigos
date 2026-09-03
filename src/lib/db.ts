import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

/**
 * Conexão com o banco.
 *
 * Em produção (Vercel) o banco é o Turso — libSQL acessado por rede, que
 * funciona em serverless justamente porque não depende do filesystem local.
 * O acesso é feito pelo driver adapter, não pela `url` do schema.prisma.
 *
 * Sem TURSO_DATABASE_URL, cai no arquivo SQLite local (DATABASE_URL), o que
 * mantém o desenvolvimento offline funcionando como antes.
 */
function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;

  if (tursoUrl) {
    const adapter = new PrismaLibSQL({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter });
  }

  return new PrismaClient();
}

export const db = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = db;
}

export default db;

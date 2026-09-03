/**
 * Aplica o schema do Prisma no banco remoto do Turso.
 *
 * Por que existe: `prisma db push` fala apenas com bancos que o próprio CLI
 * consegue abrir (arquivo SQLite local, Postgres, MySQL). Ele não fala libSQL,
 * então não alcança o Turso. Aqui o DDL é gerado pelo Prisma e enviado pelo
 * cliente libSQL, que é quem sabe conversar com o Turso.
 *
 * Uso:  npm run turso:push
 *
 * É idempotente: cada CREATE recebe IF NOT EXISTS, então rodar de novo em um
 * banco já criado não apaga nem duplica nada.
 */
import "dotenv/config";
import { createClient } from "@libsql/client";
import { execSync } from "node:child_process";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error(
    "✗ TURSO_DATABASE_URL não definida.\n" +
      "  Pegue os valores com:  turso db show <seu-banco> --url\n" +
      "                          turso db tokens create <seu-banco>\n" +
      "  e coloque em .env (veja .env.example)."
  );
  process.exit(1);
}

function generateDdl(): string {
  console.log("→ Gerando DDL a partir do prisma/schema.prisma...");
  // execSync (via shell) em vez de execFileSync: o Node 20+ recusa executar
  // npx.cmd diretamente no Windows, o que quebraria este script por lá.
  return execSync(
    "npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script",
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, DATABASE_URL: "file:./dev.db" },
    }
  );
}

/** Divide o script em comandos, ignorando comentários e linhas vazias. */
function splitStatements(ddl: string): string[] {
  return ddl
    .split(";")
    .map((s) =>
      s
        .split("\n")
        .filter((l) => !l.trim().startsWith("--"))
        .join("\n")
        .trim()
    )
    .filter(Boolean);
}

/** Torna cada CREATE re-executável, para o script poder rodar mais de uma vez. */
function makeIdempotent(stmt: string): string {
  return stmt
    .replace(/^CREATE TABLE (?!IF NOT EXISTS)/i, "CREATE TABLE IF NOT EXISTS ")
    .replace(/^CREATE INDEX (?!IF NOT EXISTS)/i, "CREATE INDEX IF NOT EXISTS ")
    .replace(
      /^CREATE UNIQUE INDEX (?!IF NOT EXISTS)/i,
      "CREATE UNIQUE INDEX IF NOT EXISTS "
    );
}

async function main() {
  const statements = splitStatements(generateDdl()).map(makeIdempotent);
  console.log(`→ ${statements.length} comandos a aplicar no Turso.`);

  const client = createClient({ url: url!, authToken });

  let applied = 0;
  for (const stmt of statements) {
    try {
      await client.execute(stmt);
      applied++;
    } catch (err: any) {
      const msg = String(err?.message || err);
      // Tabela/índice já existente não é erro: o script é re-executável.
      if (/already exists/i.test(msg)) continue;
      console.error("\n✗ Falhou em:\n" + stmt.slice(0, 200) + "\n  " + msg);
      process.exit(1);
    }
  }

  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  );

  console.log(`✓ ${applied} comandos aplicados.`);
  console.log(
    `✓ Tabelas no Turso (${tables.rows.length}): ` +
      tables.rows.map((r) => r.name).join(", ")
  );
  console.log("\nPróximo passo:  npm run db:seed");

  client.close();
}

main().catch((e) => {
  console.error("Erro:", e);
  process.exit(1);
});

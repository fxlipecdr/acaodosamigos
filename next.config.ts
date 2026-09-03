import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // O cliente libSQL carrega um módulo nativo por require dinâmico; se o
  // webpack tentar empacotá-lo, o build quebra em arquivos que não são código.
  // Aqui o Next deixa esses pacotes para o Node resolver em runtime.
  serverExternalPackages: [
    "@prisma/adapter-libsql",
    "@libsql/client",
    "libsql",
  ],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, KeyRound, ArrowRight, AlertCircle, RefreshCw, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      setLoading(true);
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Email ou senha incorretos.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error("Erro no login:", err);
      setErrorMessage("Erro de conexão ao efetuar login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-dark-900 flex items-center justify-center mx-auto shadow-glow-primary">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-heading font-black text-foreground uppercase tracking-tight">
            PAINEL ADMINISTRATIVO
          </h1>
          <p className="text-xs text-slate-400">
            Acesso restrito para gestão e apuração da Ação Entre Amigos
          </p>
        </div>

        {/* Login Card */}
        <div className="p-8 rounded-3xl bg-dark-850 border border-dark-700 shadow-2xl space-y-6">
          
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold uppercase flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                E-MAIL DO ADMINISTRADOR
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@acao.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                SENHA DE ACESSO
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-900 border border-dark-700 rounded-xl text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-dark-900 font-black text-xs uppercase tracking-wider shadow-glow-primary active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 pt-3"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AUTENTICANDO...</span>
                </>
              ) : (
                <>
                  <span>ACESSAR PAINEL</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          <div className="pt-2 border-t border-dark-750 text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-200 font-bold uppercase tracking-wider">
              VOLTAR PARA O SITE PÚBLICO
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

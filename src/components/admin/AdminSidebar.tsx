"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Ticket, 
  Store, 
  Users, 
  CreditCard, 
  Trophy, 
  Image as ImageIcon, 
  Settings, 
  QrCode, 
  ScrollText, 
  LogOut, 
  Menu, 
  X, 
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from "lucide-react";

export default function AdminSidebar({ adminName = "Administrador" }: { adminName?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // If on login page, don't show sidebar
  if (pathname === "/admin/login") {
    return null;
  }

  const navItems = [
    { href: "/admin", label: "DASHBOARD GERAL", icon: LayoutDashboard },
    { href: "/admin/venda-presencial", label: "VENDA PRESENCIAL (CAIXA)", icon: ShoppingBag, highlight: true },
    { href: "/admin/numeros", label: "GERENCIAR NÚMEROS", icon: Ticket },
    { href: "/admin/participantes", label: "PARTICIPANTES", icon: Users },
    { href: "/admin/parceiros", label: "PONTOS DE VENDA (PDVS)", icon: Store },
    { href: "/admin/pagamentos", label: "PAGAMENTOS PIX", icon: CreditCard },
    { href: "/admin/premio", label: "PRÊMIO & FOTOS", icon: ImageIcon },
    { href: "/admin/sorteio", label: "SORTEIO & APURAÇÃO", icon: Trophy },
    { href: "/admin/configuracoes", label: "CONFIGURAÇÕES GERAIS", icon: Settings },
    { href: "/admin/qrcode", label: "GERADOR DE QR CODES", icon: QrCode },
    { href: "/admin/auditoria", label: "LOGS DE AUDITORIA", icon: ScrollText },
  ];

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <>
      {/* Mobile Top bar */}
      <div className="lg:hidden bg-dark-900 border-b border-dark-750 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-500 text-dark-900 flex items-center justify-center font-black">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-heading font-black text-sm text-foreground uppercase tracking-tight">ADMINISTRAÇÃO</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-dark-800 border border-dark-700 text-slate-300"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-dark-900 border-r border-dark-750 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          
          {/* Logo Header */}
          <div className="p-6 border-b border-dark-750 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-500 text-dark-900 flex items-center justify-center font-black shadow-glow-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-black text-sm text-foreground leading-tight uppercase">
                  PAINEL DA AÇÃO
                </h2>
                <span className="text-[10px] text-primary-400 font-bold uppercase tracking-wider">
                  HONDA CG 160 • ADMIN
                </span>
              </div>
            </div>
          </div>

          {/* Nav Items List */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    isActive
                      ? "bg-primary-500 text-dark-900 shadow-glow-primary font-black"
                      : item.highlight
                      ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20"
                      : "text-slate-400 hover:text-foreground hover:bg-dark-800"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User & Actions Footer */}
          <div className="p-4 border-t border-dark-750 space-y-2">
            <Link
              href="/"
              target="_blank"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-foreground hover:bg-dark-800 font-bold uppercase tracking-wider transition-colors"
            >
              <span>VER SITE PÚBLICO</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 font-bold uppercase tracking-wider transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>SAIR DO SISTEMA</span>
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}

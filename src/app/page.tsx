import Link from "next/link";
import Image from "next/image";
import db from "@/lib/db";
import MotorcycleGallery from "@/components/MotorcycleGallery";
import TransparencyCard from "@/components/TransparencyCard";
import LotteryVisualizer from "@/components/LotteryVisualizer";
import { 
  Ticket, 
  MapPin, 
  FileText, 
  MessageCircle, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Gift, 
  CheckCircle2,
  Clock,
  PhoneCall,
  Store,
  ChevronRight
} from "lucide-react";

export const revalidate = 0; // Fresh live data on each request

export default async function HomePage() {
  // Fetch campaign settings, stats, and partners from DB
  const settings = await db.campaignSettings.findUnique({
    where: { id: "default" },
  });

  const [
    totalNumbers,
    totalSold,
    totalReserved,
    partnersSample
  ] = await Promise.all([
    db.raffleNumber.count(),
    db.raffleNumber.count({ where: { status: "PAID" } }),
    db.raffleNumber.count({ where: { status: "RESERVED" } }),
    db.partner.findMany({
      where: { isActive: true },
      take: 4,
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const totalAvailable = Math.max(0, totalNumbers - totalSold - totalReserved);
  
  // Format draw date
  const drawDateRaw = settings?.drawDate || "2026-11-15";
  const [year, month, day] = drawDateRaw.split("-");
  const formattedDrawDate = `${day}/${month}/${year}`;

  const prizeImages = settings?.prizeImagesJson ? JSON.parse(settings.prizeImagesJson) : [];

  return (
    <div className="space-y-16 sm:space-y-24 pb-12">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-10 overflow-hidden">
        {/* Background Radial Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Notice Badge if date changed */}
          {settings?.drawNotice && (
            <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-medium flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong>AVISO DA ORGANIZAÇÃO:</strong> {settings.drawNotice}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Badges */}
              <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  AÇÃO ENTRE AMIGOS OFICIAL
                </span>
                <span className="px-3 py-1 rounded-full bg-dark-800 border border-dark-700 text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary-400" />
                  SORTEIO PREVISTO: <strong className="text-foreground">{formattedDrawDate}</strong>
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-foreground tracking-tight leading-[1.1] uppercase">
                CONCORRA A ESTA <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-amber-300 to-primary-500">
                  HONDA CG 160 START
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                {settings?.subtitle || "Escolha seus números da sorte e participe. Apuração 100% transparente com base nos resultados da Loteria Federal!"}
              </p>

              {/* Price & Online Promo Highlight Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-dark-850 via-dark-850 to-dark-850 border border-primary-500/30 shadow-premium-card">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  
                  {/* Unit price */}
                  <div className="text-center sm:text-left sm:border-r sm:border-dark-700 sm:pr-4">
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">VALOR POR NÚMERO</span>
                    <div className="flex items-baseline justify-center sm:justify-start gap-1 mt-0.5">
                      <span className="text-sm font-bold text-slate-300">R$</span>
                      <span className="text-3xl sm:text-4xl font-black text-foreground">30</span>
                      <span className="text-xs text-slate-400">,00</span>
                    </div>
                  </div>

                  {/* Promo condition */}
                  <div className="text-center sm:text-left sm:pl-2">
                    <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full mb-1">
                      PROMOÇÃO ONLINE
                    </div>
                    <p className="text-xs text-slate-300">
                      Compre 2 por R$ 60 e leve o 3º por <strong className="text-emerald-400 font-bold">R$ 3</strong>!
                    </p>
                    <p className="text-sm font-black text-emerald-400 mt-0.5 uppercase tracking-wider">
                      3 NÚMEROS POR APENAS R$ 63,00
                    </p>
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  href="/numeros"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-dark-900 font-black text-xs uppercase tracking-wider shadow-glow-primary hover:shadow-xl active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  <span>ESCOLHER MEUS NÚMEROS</span>
                </Link>

                <Link
                  href="/pontos-de-venda"
                  className="w-full sm:w-auto px-6 py-4 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-200 border border-dark-700 font-bold text-xs uppercase tracking-wider hover:border-dark-600 transition-all text-center flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-primary-400" />
                  <span>PONTOS DE VENDA</span>
                </Link>

                <Link
                  href="/regras"
                  className="w-full sm:w-auto px-5 py-4 rounded-xl bg-transparent hover:bg-dark-800 text-slate-400 hover:text-foreground font-bold text-xs uppercase tracking-wider transition-colors text-center"
                >
                  VER REGRAS
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  APURAÇÃO LOTERIA FEDERAL
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  PAGAMENTO INSTANTÂNEO PIX
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  CONSULTA POR CPF
                </span>
              </div>

            </div>

            {/* Right Hero Image (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative w-full rounded-2xl overflow-hidden border border-dark-700 bg-dark-850 p-2 shadow-2xl group">
                <div className="relative h-[300px] sm:h-[380px] lg:h-[420px] w-full rounded-xl overflow-hidden bg-gradient-to-b from-dark-900 via-dark-850 to-dark-900 flex items-center justify-center p-2 sm:p-4">
                  <img
                    src={settings?.prizeCoverImage || "/images/moto/moto-hero.jpg"}
                    alt="Motocicleta Honda CG 160 Start"
                    className="max-h-full max-w-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  
                  {/* Overlay Tag */}
                  <div className="absolute top-3 left-3 bg-dark-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-primary-500/30 text-xs font-bold uppercase tracking-wider text-primary-400 shadow-md">
                    {settings?.prizeModel || "HONDA CG 160 START"}
                  </div>
                </div>

                {/* Mini bar below hero */}
                <div className="p-3 mt-1 flex items-center justify-between text-xs text-slate-300 uppercase tracking-wider">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold">CONDIÇÃO</span>
                    <strong className="text-emerald-400 font-bold">SEMI-NOVA IMPECÁVEL</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block font-bold">DOCUMENTAÇÃO</span>
                    <strong className="text-foreground font-bold">EM DIA / PRONTA PARA TRANSFERIR</strong>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. BANNER PROMOCIONAL / ARTE DA AÇÃO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-primary-500/40 shadow-2xl bg-dark-850 group">
          <div className="relative h-44 sm:h-56 lg:h-60 w-full overflow-hidden">
            <img
              src="/images/banner-rifa.jpg"
              alt="Ação Entre Amigos Bilhetes Premiados"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-950/95 via-dark-950/75 to-dark-950/40" />

            <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-center max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/40 text-primary-300 text-xs font-black uppercase tracking-wider w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                <span>BILHETES DA SORTE COM RESULTADO AUDITÁVEL</span>
              </div>
              
              <h3 className="text-xl sm:text-3xl font-heading font-black text-foreground uppercase tracking-tight">
                ESCOLHA SEUS NÚMEROS E PARTICIPE
              </h3>
              
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
                Garanta suas cotas online agora com desconto especial por pacote e confirmação instantânea no Pix.
              </p>

              <div className="pt-1">
                <Link
                  href="/numeros"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-dark-900 font-black text-xs uppercase tracking-wider shadow-glow-primary transition-all"
                >
                  <Ticket className="w-4 h-4" />
                  <span>GARANTIR COTAS ONLINE</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. COMO PARTICIPAR? (ONLINE VS PRESENCIAL) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">
            DUAS FORMAS DE CONCORRER
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-foreground mt-1 uppercase tracking-tight">
            COMO VOCÊ PREFERE PARTICIPAR?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Escolha entre a praticidade da compra online ou adquira presencialmente em nossos parceiros credenciados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Comprar pelo Site (Online) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-dark-850 via-dark-850 to-primary-950/20 border-2 border-primary-500/40 relative overflow-hidden shadow-premium-card flex flex-col justify-between">
            <div className="absolute top-0 right-0 bg-primary-500 text-dark-900 text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
              MAIS RÁPIDO & PROMOÇÃO
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
                <Ticket className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl font-heading font-black text-foreground uppercase tracking-tight">COMPRAR PELO SITE</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Escolha diretamente seus números disponíveis e realize o pagamento seguro via Pix.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-dark-900/90 border border-dark-750 space-y-1.5 text-xs">
                <p className="text-primary-400 font-bold uppercase tracking-wide">
                  NÚMEROS DISPONÍVEIS ONLINE: {settings?.onlineStart || 3000} A {settings?.onlineEnd || 3999}
                </p>
                <p className="text-slate-300 font-semibold uppercase">
                  PROMOÇÃO ATIVA: <strong className="text-emerald-400">3 NÚMEROS POR R$ 63,00</strong>
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/numeros"
                className="w-full py-3.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-dark-900 font-black text-xs uppercase tracking-wider text-center shadow-glow-primary flex items-center justify-center gap-2 transition-all"
              >
                <span>ESCOLHER NÚMEROS ONLINE</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Comprar Presencialmente (Pontos Físicos) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-dark-850 border border-dark-700 shadow-premium-card flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center text-slate-300">
                <Store className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl font-heading font-black text-foreground uppercase tracking-tight">COMPRAR PRESENCIALMENTE</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Encontre um dos nossos estabelecimentos parceiros credenciados e adquira seu bilhete na hora.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-750 space-y-1.5 text-xs">
                <p className="text-slate-300 font-bold uppercase tracking-wide">
                  NÚMEROS NOS PONTOS FÍSICOS: {settings?.presencialStart || 1000} A {settings?.presencialEnd || 2999}
                </p>
                <p className="text-slate-400 uppercase text-[11px] font-semibold">
                  ESTABELECIMENTOS COMERCIAIS PARCEIROS CADASTRADOS
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/pontos-de-venda"
                className="w-full py-3.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-foreground border border-dark-700 font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all"
              >
                <MapPin className="w-4 h-4 text-primary-400" />
                <span>VER PONTOS DE VENDA</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 4. COMO FUNCIONA (4 PASSOS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">
            PASSO A PASSO
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-foreground mt-1 uppercase tracking-tight">
            COMO FUNCIONA A AÇÃO?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-dark-850 border border-dark-750 space-y-3">
            <span className="w-8 h-8 rounded-xl bg-primary-500/20 text-primary-400 font-black text-sm flex items-center justify-center border border-primary-500/30">
              1
            </span>
            <h4 className="font-heading font-black text-foreground text-xs uppercase tracking-wider">ESCOLHA COMO PARTICIPAR</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compre online pelo site com Pix ou em um dos pontos de venda parceiros cadastrados.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-dark-850 border border-dark-750 space-y-3">
            <span className="w-8 h-8 rounded-xl bg-primary-500/20 text-primary-400 font-black text-sm flex items-center justify-center border border-primary-500/30">
              2
            </span>
            <h4 className="font-heading font-black text-foreground text-xs uppercase tracking-wider">GUARDE SEU NÚMERO</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seus bilhetes ficam registrados e vinculados com segurança ao seu CPF no nosso sistema.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-dark-850 border border-dark-750 space-y-3">
            <span className="w-8 h-8 rounded-xl bg-primary-500/20 text-primary-400 font-black text-sm flex items-center justify-center border border-primary-500/30">
              3
            </span>
            <h4 className="font-heading font-black text-foreground text-xs uppercase tracking-wider">ACOMPANHE A DATA</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              A data prevista para apuração é <strong>{formattedDrawDate}</strong>, condicionada à meta mínima de 1.000 números.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-dark-850 border border-dark-750 space-y-3">
            <span className="w-8 h-8 rounded-xl bg-primary-500/20 text-primary-400 font-black text-sm flex items-center justify-center border border-primary-500/30">
              4
            </span>
            <h4 className="font-heading font-black text-foreground text-xs uppercase tracking-wider">CONFIRA O RESULTADO</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              A apuração segue as regras públicas através dos 4 últimos dígitos dos prêmios da Loteria Federal.
            </p>
          </div>

        </div>
      </section>

      {/* 5. SOBRE O PRÊMIO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">
            PRÊMIO PRINCIPAL
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-foreground mt-1 uppercase tracking-tight">
            SOBRE A MOTOCICLETA DO PRÊMIO
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Conheça a motocicleta da ação que pode ser sua por apenas R$ 30.
          </p>
        </div>

        <MotorcycleGallery
          coverImage={settings?.prizeCoverImage || "/images/moto/moto-hero.jpg"}
          images={prizeImages}
          model={settings?.prizeModel || "Honda CG 160 Start"}
          year={settings?.prizeYear || "2023"}
          color={settings?.prizeColor || "Azul Metálico"}
          condition={settings?.prizeCondition || "Semi-nova em excelente estado de conservação, revisada, documentação em dia e pronta para transferência"}
          details={settings?.prizeDetails}
          videoUrl={settings?.prizeVideoUrl}
        />
      </section>

      {/* 6. TRANSPARÊNCIA EM TEMPO REAL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TransparencyCard
          totalNumbers={totalNumbers || 3000}
          totalSold={totalSold}
          totalAvailable={totalAvailable}
          totalReserved={totalReserved}
          minQuota={settings?.minQuota || 1000}
          drawDate={formattedDrawDate}
        />
      </section>

      {/* 7. COMO SERÁ DEFINIDO O GANHADOR (LOTERIA FEDERAL) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LotteryVisualizer />
      </section>

      {/* 8. PONTOS DE VENDA FÍSICOS (PREVIEW) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">
              COMPRE PERTO DE VOCÊ
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-foreground mt-1 uppercase tracking-tight">
              PONTOS DE VENDA PRESENCIAIS
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Confira os estabelecimentos parceiros credenciados onde também é possível adquirir números físicos da ação.
            </p>
          </div>

          <Link
            href="/pontos-de-venda"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-400 hover:text-primary-300 self-start sm:self-auto"
          >
            <span>VER TODOS OS PONTOS</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {partnersSample.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {partnersSample.map((partner) => (
              <div
                key={partner.id}
                className="p-4 rounded-xl bg-dark-850 border border-dark-750 flex flex-col justify-between space-y-3 hover:border-dark-600 transition-all"
              >
                <div>
                  <span className="inline-block px-2 py-0.5 rounded bg-dark-800 text-[10px] font-bold uppercase tracking-wider text-primary-400 mb-2">
                    BAIRRO {partner.neighborhood}
                  </span>
                  <h4 className="font-heading font-black text-foreground text-xs uppercase tracking-wide line-clamp-1">{partner.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {partner.address ? `${partner.address}, Nº ${partner.number}` : `Nº ${partner.number}`}
                  </p>
                  <p className="text-[11px] text-slate-500 uppercase">CEP: {partner.cep}</p>
                </div>

                {partner.googleMapsUrl && (
                  <a
                    href={partner.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-300 hover:text-primary-400 pt-2 border-t border-dark-800"
                  >
                    <MapPin className="w-3.5 h-3.5 text-primary-400" />
                    <span>VER NO MAPA</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-dark-850 border border-dark-750 text-center space-y-3">
            <Store className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="font-heading font-black text-foreground text-sm uppercase tracking-wider">
              CREDENCIAMENTO DE PONTOS FÍSICOS EM ANDAMENTO
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Você já pode escolher e garantir seus números diretamente pela nossa plataforma online com confirmação instantânea via Pix!
            </p>
            <div className="pt-2">
              <Link
                href="/numeros"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-dark-900 font-black text-xs uppercase tracking-wider shadow-glow-primary transition-all"
              >
                <Ticket className="w-4 h-4" />
                <span>COMPRAR NÚMEROS ONLINE</span>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 9. BOX RESUMIDO DAS REGRAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-2xl bg-dark-850 border border-dark-700 shadow-premium-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-dark-750">
            <div>
              <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">
                REGULAMENTO EM RESUMO
              </span>
              <h3 className="text-xl sm:text-2xl font-heading font-black text-foreground mt-1 uppercase tracking-tight">
                REGRAS PRINCIPAIS DA AÇÃO
              </h3>
            </div>

            <Link
              href="/regras"
              className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-foreground border border-dark-700 text-xs font-bold uppercase tracking-wider transition-all self-start sm:self-auto flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-primary-400" />
              <span>LER REGULAMENTO COMPLETO</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 text-xs text-slate-300">
            <div className="space-y-1">
              <strong className="text-foreground block uppercase font-bold tracking-wider">FAIXA DE NÚMEROS:</strong>
              <p className="text-slate-400">{settings?.startNumber || 1000} a {settings?.endNumber || 3999} (Total: 3.000)</p>
            </div>

            <div className="space-y-1">
              <strong className="text-foreground block uppercase font-bold tracking-wider">VENDA ONLINE:</strong>
              <p className="text-slate-400">{settings?.onlineStart || 3000} a {settings?.onlineEnd || 3999} no site</p>
            </div>

            <div className="space-y-1">
              <strong className="text-foreground block uppercase font-bold tracking-wider">VENDA PRESENCIAL:</strong>
              <p className="text-slate-400">{settings?.presencialStart || 1000} a {settings?.presencialEnd || 2999} nos parceiros</p>
            </div>

            <div className="space-y-1">
              <strong className="text-foreground block uppercase font-bold tracking-wider">DATA INICIAL:</strong>
              <p className="text-slate-400">{formattedDrawDate} (às 19:00)</p>
            </div>

            <div className="space-y-1">
              <strong className="text-foreground block uppercase font-bold tracking-wider">REFERÊNCIA DE SORTEIO:</strong>
              <p className="text-slate-400">Resultado Oficial da Loteria Federal</p>
            </div>

            <div className="space-y-1">
              <strong className="text-foreground block uppercase font-bold tracking-wider">MECÂNICA DE APURAÇÃO:</strong>
              <p className="text-slate-400">4 últimos algarismos do prêmio extraído</p>
            </div>

            <div className="space-y-1">
              <strong className="text-foreground block uppercase font-bold tracking-wider">ORDEM DE CONFERÊNCIA:</strong>
              <p className="text-slate-400">1º prêmio → 2º → 3º → 4º → 5º</p>
            </div>

            <div className="space-y-1">
              <strong className="text-foreground block uppercase font-bold tracking-wider">BÔNUS 4 PRIMEIROS PDVS:</strong>
              <p className="text-emerald-400 font-bold">R$ 500 ao vender 100 números</p>
            </div>

            <div className="space-y-1">
              <strong className="text-foreground block uppercase font-bold tracking-wider">SEM NÚMERO VENDIDO:</strong>
              <p className="text-slate-400">Nova apuração no concurso seguinte</p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. PRECISA DE AJUDA? / CONTATO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 rounded-2xl bg-gradient-to-br from-dark-850 via-dark-850 to-emerald-950/20 border border-emerald-500/30 text-center space-y-4 shadow-glow-emerald">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <MessageCircle className="w-6 h-6" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-heading font-black text-foreground uppercase tracking-tight">
            FICOU COM ALGUMA DÚVIDA?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Fale diretamente com o responsável pela ação. Estamos disponíveis no WhatsApp para tirar dúvidas sobre números, pagamentos ou apuração.
          </p>

          <div className="pt-2">
            <a
              href={`https://wa.me/${(settings?.whatsappNumber || "5548992178109").replace(/\D/g, "")}?text=${encodeURIComponent(settings?.whatsappMessage || "Olá! Vim pelo site da ação entre amigos e gostaria de tirar uma dúvida.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/30 active:scale-95 transition-all"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>FALAR PELO WHATSAPP: {settings?.whatsappNumber || "+55 48 99217-8109"}</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}

# 🏍️ AÇÃO DOS AMIGOS — SISTEMA WEB COMPLETO DE RIFAS E APURAÇÃO

Sistema web completo, profissional, responsivo (*mobile-first*) e pronto para produção para gestão e venda de **Ação dos Amigos / Rifa com apuração auditável pela Loteria Federal**.

---

## 📌 Visão Geral do Projeto

O sistema foi desenvolvido utilizando a stack moderna **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM** e **SQLite**. Ele contempla tanto a experiência pública do participante quanto um painel administrativo completo para o organizador.

---

## 🚀 Funcionalidades do Sistema

### 🌐 Área Pública (Participantes)
* **Landing Page de Alta Conversão:**
  * Apresentação da motocicleta (**Honda CG 160 Start 2023 - Semi-nova revisada**).
  * Galeria de fotos reais com navegação interativa e proporções otimizadas.
  * Card de transparência com barra de progresso da meta mínima de 1.000 bilhetes.
  * Simulador visual e explicativo da mecânica de apuração com base nos 4 últimos dígitos da Loteria Federal.
  * Resumo das regras e suporte direto via WhatsApp (`(48) 99217-8109`).
* **Seleção e Compra de Números Online (`/numeros`):**
  * Grade interativa de bilhetes online (Faixa: **3000 a 3999**).
  * Filtros por status (*Todos, Disponíveis, Reservados, Meus Números*).
  * Gerador de números da sorte aleatórios com 1 clique (1, 3, 5 ou 10 números).
  * Regra comercial com desconto automático:
    * **1 número:** R$ 30,00
    * **Combo Especial:** **3 números por R$ 63,00** (a cada 2 por R$ 60, o 3º sai por R$ 3).
* **Checkout com Pagamento Pix (`/checkout`):**
  * Geração instantânea de **QR Code Pix EMV oficial** e código **Pix Copia e Cola**.
  * Temporizador de reserva de 15 minutos com expiração automática de números não pagos.
  * Validação de CPF com conformidade LGPD.
* **Consulta de Bilhetes por CPF (`/meus-numeros`):**
  * Consulta protegida por código de verificação OTP enviado via WhatsApp / SMS simulado.
  * Exibição de comprovantes digitais, números comprados e status.
* **Guia de Estabelecimentos Parceiros / Pontos Físicos (`/pontos-de-venda`):**
  * Lista de estabelecimentos credenciados para venda presencial (Faixa: **1000 a 2999**).
  * Filtros por bairro, integração com Google Maps e botão de WhatsApp.
  * Destaque do **Bônus de R$ 500,00** para os 4 primeiros parceiros que venderem 100 números.
* **Regulamento Oficial da Ação (`/regras`):**
  * Todas as cláusulas, critérios de apuração, meta mínima e isenção de responsabilidade.
* **Resultado Oficial e Auditoria (`/resultado`):**
  * Consulta do bilhete contemplado, conferência do 1º ao 5º prêmio e termo de auditoria.

---

### 🔐 Área Administrativa (`/admin`)
* **Dashboard com Indicadores em Tempo Real (`/admin`):**
  * Total arrecadado, meta de vendas atingida, bilhetes pagos, reservados e disponíveis.
  * Gráfico de evolução de vendas e ranking dos pontos de venda físicos.
* **Gestão e Ações em Massa de Números (`/admin/numeros`):**
  * Tabela com busca por número, participante ou status.
  * Liberação manual, cancelamento de reservas e marcação como pago.
* **PDV / Venda Presencial Balcão (`/admin/venda-presencial`):**
  * Registro rápido de vendas realizadas nos estabelecimentos físicos com emissão de comprovante.
* **Gestão de Parceiros Credenciados (`/admin/parceiros`):**
  * Cadastro de estabelecimentos com comissão personalizada.
  * **Barra de progresso da meta dos 100 números para bonificação de R$ 500,00**.
* **Gestão de Participantes (`/admin/participantes`):**
  * Diretório de compradores com histórico de bilhetes e anonimização LGPD.
* **Apuração e Sorteio (`/admin/sorteio`):**
  * Módulo de apuração oficial onde o administrador insere os 5 prêmios da Loteria Federal e o sistema identifica o ganhador de forma auditável e sequencial (1º ao 5º prêmio).
* **Gerador de Cartaz Promocional com QR Code (`/admin/qrcode`):**
  * Flyer pronto para impressão em alta resolução para colar nos pontos de venda físicos.
* **Configurações Gerais (`/admin/configuracoes`):**
  * Parâmetros do sorteio, meta mínima, valores, dados de contato e gateways Pix.

---

## 📐 Regras Comerciais e de Apuração

1. **Total de Números:** 3.000 bilhetes (Faixa de **1000 a 3999**).
   * **Venda Presencial:** Números **1000 a 2999** (2.000 cotas).
   * **Venda Online:** Números **3000 a 3999** (1.000 cotas).
2. **Preço e Promoção:**
   * Unitário: **R$ 30,00**
   * Combo Online: **3 bilhetes por R$ 63,00** (ex: 6 por R$ 126,00, 9 por R$ 189,00).
3. **Incentivo para Parceiros (PDVs):**
   * Os **4 primeiros estabelecimentos que venderem 100 números** ganham uma **bonificação extra de R$ 500,00** cada um.
4. **Mecânica de Sorteio pela Loteria Federal:**
   * Apuração baseada nos **4 últimos dígitos** de cada prêmio extraído.
   * Ordem de conferência: 1º prêmio ➔ 2º prêmio ➔ 3º prêmio ➔ 4º prêmio ➔ 5º prêmio.
   * Caso nenhum número sorteado tenha sido vendido, o prêmio fica pendente para o concurso seguinte da Loteria Federal.
   * Meta mínima: 1.000 números vendidos para realização do sorteio.

---

## 🛠️ Tecnologias Utilizadas

* **Framework:** Next.js 15.5.25 (App Router)
* **Linguagem:** TypeScript
* **Estilização:** Tailwind CSS + Lucide Icons
* **Banco de Dados:** SQLite (via Prisma ORM 5.22)
* **Autenticação:** JWT com cookies seguros HttpOnly
* **Geração de QR Code Pix:** Biblioteca padrão EMV / BR Code oficial

---

## 💻 Como Rodar o Projeto Localmente

```bash
# 1. Instalar as dependências
npm install

# 2. Executar migrações do banco de dados e seed inicial
npx prisma db push
npx prisma db seed

# 3. Iniciar o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

* **Acesso do Administrador:** `http://localhost:3000/admin/login`
* **Usuário Padrão:** `admin`
* **Senha Padrão:** `admin123`

---

## 🧪 Testes Automatizados

O sistema conta com suíte de testes ponta a ponta:
```bash
npx tsx test/e2e-tests.ts
```
* **17 testes aprovados:** Cobrem cálculos de pacotes promocionais, validação de CPF, anonimização LGPD, geração de payload Pix EMV e apuração sequencial da Loteria Federal.

---

## 📄 Licença
Projeto desenvolvido para a **Ação dos Amigos da Motocicleta Honda CG 160 Start**. Todos os direitos reservados © 2026.

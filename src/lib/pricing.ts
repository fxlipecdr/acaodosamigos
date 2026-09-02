/**
 * Cálculo seguro de preços e promoções no servidor
 */

export interface PricingResult {
  quantity: number;
  unitPrice: number;
  originalTotal: number;
  discountAmount: number;
  finalTotal: number;
  bundlesCount: number;
  remainderCount: number;
  appliedPromoText: string | null;
}

export function calculateOrderPrice(
  quantity: number,
  unitPrice: number = 30.0,
  bundleSize: number = 3,
  bundlePrice: number = 63.0
): PricingResult {
  if (quantity <= 0) {
    return {
      quantity: 0,
      unitPrice,
      originalTotal: 0,
      discountAmount: 0,
      finalTotal: 0,
      bundlesCount: 0,
      remainderCount: 0,
      appliedPromoText: null,
    };
  }

  const originalTotal = quantity * unitPrice;
  const bundlesCount = Math.floor(quantity / bundleSize);
  const remainderCount = quantity % bundleSize;

  // Cada bundle de 3 custa bundlePrice (ex: 63,00 em vez de 90,00)
  const finalTotal = bundlesCount * bundlePrice + remainderCount * unitPrice;
  const discountAmount = Math.max(0, originalTotal - finalTotal);

  let appliedPromoText: string | null = null;
  if (bundlesCount > 0) {
    appliedPromoText = `Promoção aplicada: ${bundlesCount}x lote(s) de 3 números por R$ ${bundlePrice.toFixed(2)}`;
  }

  return {
    quantity,
    unitPrice,
    originalTotal,
    discountAmount,
    finalTotal,
    bundlesCount,
    remainderCount,
    appliedPromoText,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

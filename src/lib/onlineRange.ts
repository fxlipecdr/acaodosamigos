import db from "@/lib/db";

/**
 * Faixa de números que pode ser comprada pelo site.
 *
 * A venda é dividida: os números presenciais são vendidos em dinheiro nos
 * estabelecimentos parceiros e os online, aqui. Sem esta checagem no servidor,
 * um bilhete já vendido no balcão poderia ser reservado e pago pelo site,
 * produzindo dois donos para o mesmo número — a grade da tela esconde esses
 * números, mas esconder não é impedir: a API aceita qualquer coisa que chegue.
 */
export interface OnlineRange {
  start: number;
  end: number;
}

export async function getOnlineRange(): Promise<OnlineRange> {
  try {
    const settings = await db.campaignSettings.findUnique({
      where: { id: "default" },
    });
    return {
      start: settings?.onlineStart ?? 3000,
      end: settings?.onlineEnd ?? 3999,
    };
  } catch {
    // Sem banco, mantém a faixa padrão da campanha em vez de liberar tudo.
    return { start: 3000, end: 3999 };
  }
}

/**
 * Valida uma lista de números recebida do cliente.
 * Retorna uma mensagem de erro pronta para o usuário, ou null se estiver tudo certo.
 */
export function validateOnlineNumbers(
  numbers: unknown,
  range: OnlineRange
): string | null {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    return "Nenhum número selecionado.";
  }

  const invalidType = numbers.filter(
    (n) => typeof n !== "number" || !Number.isInteger(n)
  );
  if (invalidType.length > 0) {
    return "Lista de números inválida.";
  }

  const outOfRange = (numbers as number[]).filter(
    (n) => n < range.start || n > range.end
  );
  if (outOfRange.length > 0) {
    return `Pelo site só é possível comprar os números de ${range.start} a ${range.end}. Fora da faixa: ${outOfRange
      .slice(0, 10)
      .join(", ")}${outOfRange.length > 10 ? "..." : ""}. Os demais são vendidos apenas nos pontos de venda parceiros.`;
  }

  const unique = new Set(numbers as number[]);
  if (unique.size !== numbers.length) {
    return "Há números repetidos na seleção.";
  }

  return null;
}

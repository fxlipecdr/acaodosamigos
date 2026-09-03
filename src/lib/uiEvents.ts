/**
 * Canal leve entre a página de números e a barra de navegação inferior:
 * quando o carrinho flutuante aparece, a BottomNav sai do caminho para não
 * empilhar duas barras fixas na base da tela do celular.
 */
export const CART_VISIBILITY_EVENT = "acao:cart-visibility";

export function setCartBarVisible(visible: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<boolean>(CART_VISIBILITY_EVENT, { detail: visible })
  );
}

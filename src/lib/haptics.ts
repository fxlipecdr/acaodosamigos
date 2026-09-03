/**
 * Feedback tátil leve para ações de toque (Android / navegadores com Vibration API).
 * Em iOS a API não existe — as chamadas viram no-op silencioso.
 */
type Pattern = "select" | "success" | "error" | "warning";

const PATTERNS: Record<Pattern, number | number[]> = {
  select: 10,
  success: [12, 40, 18],
  error: [30, 60, 30],
  warning: 24,
};

export function haptic(pattern: Pattern = "select") {
  if (typeof window === "undefined") return;
  if (!("vibrate" in navigator)) return;
  // Respeita quem desativou animações/movimento no sistema
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    /* ignora navegadores que bloqueiam vibração sem gesto do usuário */
  }
}

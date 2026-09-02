/**
 * Validação rigorosa e formatação de CPF brasileiro
 */

export function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

export function formatCPF(cpf: string): string {
  const cleaned = cleanCPF(cpf);
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function maskCPF(cpf: string): string {
  const cleaned = cleanCPF(cpf);
  if (cleaned.length !== 11) return "***.***.***-**";
  return `***.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-**`;
}

export function maskName(fullName: string): string {
  if (!fullName) return "Participante";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0].toUpperCase();
  return `${first} ${lastInitial}.`;
}

export function validateCPF(cpf: string): boolean {
  const cleaned = cleanCPF(cpf);

  if (cleaned.length !== 11) return false;

  // Rejeita sequências conhecidas inválidas (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  let sum = 0;
  let remainder: number;

  // Primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleaned.substring(i - 1, i), 10) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(9, 10), 10)) return false;

  // Segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleaned.substring(i - 1, i), 10) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(10, 11), 10)) return false;

  return true;
}

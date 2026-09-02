import QRCode from "qrcode";

/**
 * Utilitário de Geração e Abstração de Pagamentos Pix
 */

// Gera CRC16 CCITT para payload Pix padrão Banco Central
function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function formatField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

export function generatePixPayload({
  key = "48992178109",
  name = "ACAO ENTRE AMIGOS MOTO",
  city = "TUBARAO",
  amount,
  txid = "LDPG001",
  description = "Acao Entre Amigos Moto",
}: {
  key?: string;
  name?: string;
  city?: string;
  amount: number;
  txid?: string;
  description?: string;
}): string {
  // Limpar campos
  const cleanKey = key.replace(/[^a-zA-Z0-9]/g, "");
  const cleanName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").substring(0, 25);
  const cleanCity = city.normalize("NFD").replace(/[\u0300-\u036f]/g, "").substring(0, 15);
  const formattedAmount = amount.toFixed(2);
  const cleanTxid = txid.replace(/[^a-zA-Z0-9]/g, "").substring(0, 25) || "***";

  // Montar subcampos Merchant Account Information (ID 26)
  const gui = formatField("00", "br.gov.bcb.pix");
  const pixKey = formatField("01", cleanKey);
  const desc = description ? formatField("02", description.substring(0, 50)) : "";
  const merchantAccountInfo = formatField("26", `${gui}${pixKey}${desc}`);

  // Subcampos de Informações Adicionais (ID 62)
  const txidField = formatField("05", cleanTxid);
  const additionalDataField = formatField("62", txidField);

  let payload =
    formatField("00", "01") + // Payload Format Indicator
    formatField("01", "12") + // Point of Initiation Method (12 = Dinâmico/Único)
    merchantAccountInfo +
    formatField("52", "0000") + // Merchant Category Code
    formatField("53", "986") + // Transaction Currency (986 = BRL)
    formatField("54", formattedAmount) + // Transaction Amount
    formatField("58", "BR") + // Country Code
    formatField("59", cleanName) + // Merchant Name
    formatField("60", cleanCity) + // Merchant City
    additionalDataField +
    "6304"; // CRC16 Tag

  const crc = crc16(payload);
  return payload + crc;
}

export async function generateQrCodeDataUrl(payload: string): Promise<string> {
  try {
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 320,
      color: {
        dark: "#090D16",
        light: "#FFFFFF",
      },
    });
  } catch (err) {
    console.error("Erro ao gerar QR Code Pix:", err);
    return "";
  }
}

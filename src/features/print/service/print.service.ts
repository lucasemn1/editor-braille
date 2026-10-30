import { ESP32_CONFIG } from "../../../config/esp32.config";
import type { PrintPayload } from "../model/print.model";

/**
 * Serviço de comunicação com o ESP32.
 *
 * Em produção, o front é servido pelo próprio ESP32, então as
 * requisições são relativas (sem CORS). Em desenvolvimento,
 * configure VITE_ESP32_URL no .env.local com o IP do dispositivo.
 */

export class PrintServiceError extends Error {
  readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "PrintServiceError";
    this.statusCode = statusCode;
  }
}

/**
 * Envia o payload de impressão ao ESP32 via HTTP POST.
 * O ESP32 responderá com 200 OK assim que enfileirar o job de impressão.
 */
export async function sendPrintJob(payload: PrintPayload): Promise<void> {
  const url = `${ESP32_CONFIG.BASE_URL}${ESP32_CONFIG.ENDPOINTS.PRINT}`;

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    ESP32_CONFIG.REQUEST_TIMEOUT_MS,
  );

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new PrintServiceError(
        `ESP32 retornou erro: ${response.statusText}`,
        response.status,
      );
    }
  } catch (error) {
    if (error instanceof PrintServiceError) throw error;

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new PrintServiceError(
        `Tempo limite de ${ESP32_CONFIG.REQUEST_TIMEOUT_MS / 1000}s excedido. Verifique a conexão com o ESP32.`,
      );
    }

    throw new PrintServiceError(
      "Não foi possível conectar ao ESP32. Verifique a rede.",
    );
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Consulta o status da impressora no ESP32.
 * Útil para verificar se está pronta antes de enviar um job.
 */
export async function fetchPrinterStatus(): Promise<{
  ready: boolean;
  message: string;
}> {
  const url = `${ESP32_CONFIG.BASE_URL}${ESP32_CONFIG.ENDPOINTS.STATUS}`;

  const response = await fetch(url, { method: "GET" });
  if (!response.ok) {
    throw new PrintServiceError(
      "Falha ao consultar status da impressora.",
      response.status,
    );
  }

  return response.json();
}

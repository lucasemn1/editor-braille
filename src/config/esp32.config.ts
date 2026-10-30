/**
 * Configurações de integração com o ESP32.
 *
 * Em produção: o front é hospedado no próprio ESP32, então BASE_URL
 * fica vazio e as chamadas são relativas ao mesmo origin.
 *
 * Em desenvolvimento: defina VITE_ESP32_URL no arquivo .env.local
 * apontando para o IP do dispositivo, ex: http://192.168.1.100
 */
export const ESP32_CONFIG = {
  BASE_URL: (import.meta.env.VITE_ESP32_URL as string | undefined) ?? '',

  ENDPOINTS: {
    /** Recebe o payload JSON com text, braille_unicode e dot_matrix */
    PRINT: '/api/print',
    /** Retorna { ready: boolean, message: string } */
    STATUS: '/api/status',
  },

  /** Timeout máximo de espera pela resposta do ESP32 */
  REQUEST_TIMEOUT_MS: 10_000,
} as const;

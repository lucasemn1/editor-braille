import type { BrailleToken } from '../../../shared/utils/braille-converter';

/**
 * Model da feature Print.
 * Define o contrato do payload enviado ao ESP32 e o estado da operação.
 */

// ---------------------------------------------------------------------------
// Payload enviado ao ESP32
// ---------------------------------------------------------------------------

export interface DotMatrixCell {
  /** Posição sequencial da célula na página (1-based) */
  cell: number;
  /** Padrão dos 6 pontos da célula */
  dots: boolean[];
  /** Caractere de origem (para log no ESP32) */
  source: string;
}

export interface PrintPayload {
  /** Texto original digitado pelo usuário */
  text: string;
  /** Representação Unicode Braille (U+2800..U+283F) */
  braille_unicode: string;
  /** Matriz de células com dot patterns para acionamento mecânico */
  dot_matrix: DotMatrixCell[];
  /** Formato da página */
  page_format: 'A4';
  /** ISO 8601 */
  timestamp: string;
  /** Total de células */
  total_cells: number;
}

// ---------------------------------------------------------------------------
// Estado da operação de impressão
// ---------------------------------------------------------------------------

export type PrintStatus = 'idle' | 'sending' | 'success' | 'error';

export interface PrintState {
  status: PrintStatus;
  errorMessage: string | null;
  lastPrintedAt: Date | null;
}

export const PRINT_INITIAL_STATE: PrintState = {
  status: 'idle',
  errorMessage: null,
  lastPrintedAt: null,
};

// ---------------------------------------------------------------------------
// Factory do payload
// ---------------------------------------------------------------------------

export function buildPrintPayload(
  text: string,
  tokens: BrailleToken[],
  brailleUnicode: string,
): PrintPayload {
  const dot_matrix: DotMatrixCell[] = tokens
    .filter((t) => t.type !== 'newline')
    .map((t, idx) => ({
      cell: idx + 1,
      dots: [...t.dots],
      source: t.source,
    }));

  return {
    text,
    braille_unicode: brailleUnicode,
    dot_matrix,
    page_format: 'A4',
    timestamp: new Date().toISOString(),
    total_cells: dot_matrix.length,
  };
}

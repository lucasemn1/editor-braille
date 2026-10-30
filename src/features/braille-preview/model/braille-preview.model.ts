import type { BrailleToken } from "../../../shared/utils/braille-converter";

/**
 * Model da feature BraillePreview.
 * Representa o estado da visualização Braille gerada a partir do texto do editor.
 */

export interface BraillePreviewState {
  /** Todos os tokens Braille do documento (usado pelo payload de impressão) */
  tokens: BrailleToken[];
  /** Tokens agrupados por linha de texto */
  lines: BrailleToken[][];
  /**
   * Linhas Braille agrupadas em páginas A4.
   * braillePages[p][l] = linha l da página p.
   * Respeita o limite de MAX_BRAILLE_LINES_PER_PAGE por página (padrão CBB: 25).
   */
  braillePages: BrailleToken[][][];
  /** Quantidade total de células Braille (indicadores + chars) */
  cellCount: number;
}

export const BRAILLE_PREVIEW_INITIAL_STATE: BraillePreviewState = {
  tokens: [],
  lines: [[]],
  braillePages: [[[]]],
  cellCount: 0,
};

/** Agrupa tokens em linhas a partir dos tokens do tipo 'newline' */
export function groupTokensByLine(tokens: BrailleToken[]): BrailleToken[][] {
  const lines: BrailleToken[][] = [];
  let current: BrailleToken[] = [];

  for (const token of tokens) {
    if (token.type === "newline") {
      lines.push(current);
      current = [];
    } else {
      current.push(token);
    }
  }

  lines.push(current);
  return lines;
}

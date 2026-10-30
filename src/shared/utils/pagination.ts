/**
 * Utilitários de paginação para o editor e para o preview Braille.
 *
 * Referências dimensionais:
 *   - Página A4: 210mm × 297mm
 *   - Margens internas do A4Sheet: 20mm em todos os lados
 *   - Área de conteúdo: 210mm × 257mm  (257mm = 297mm − 2×20mm)
 *   - 257mm a 96 dpi: 257 × (96/25.4) ≈ 971 px
 */

import type { BrailleToken } from './braille-converter';

// ---------------------------------------------------------------------------
// Constantes públicas
// ---------------------------------------------------------------------------

const A4_CONTENT_HEIGHT_PX = 257 * (96 / 25.4); // ≈ 971 px

/**
 * Linhas de texto por página A4.
 * font-size: 15px, line-height: 1.8  →  altura por linha = 27 px
 * floor(971 / 27) = 35
 */
export const MAX_TEXT_LINES_PER_PAGE = Math.floor(A4_CONTENT_HEIGHT_PX / 27); // 35

/**
 * Linhas Braille por página A4.
 * Altura de célula (3 fileiras × 6 px + 2 gaps × 3 px = 24 px)
 * + espaçamento entre linhas (12 px) = 36 px por linha.
 * O CBB recomenda 25 linhas — usamos esse valor como teto seguro.
 */
export const MAX_BRAILLE_LINES_PER_PAGE = 25;

// ---------------------------------------------------------------------------
// Helpers genéricos
// ---------------------------------------------------------------------------

/** Divide um array em sub-arrays de tamanho `size`. Nunca retorna array vazio. */
export function chunk<T>(arr: T[], size: number): T[][] {
  if (arr.length === 0) return [[]];
  const pages: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    pages.push(arr.slice(i, i + size));
  }
  return pages;
}

// ---------------------------------------------------------------------------
// Paginação de texto (editor)
// ---------------------------------------------------------------------------

/**
 * Divide um texto em páginas de no máximo `maxLines` linhas cada.
 * Toda quebra de linha original é preservada; a divisão é feita
 * exclusivamente pelo número de '\n'.
 */
export function paginateText(
  text: string,
  maxLines = MAX_TEXT_LINES_PER_PAGE,
): string[] {
  const lines = text.split('\n');
  return chunk(lines, maxLines).map((pageLines) => pageLines.join('\n'));
}

/**
 * Reconstrói o texto completo a partir do array de páginas.
 * É o inverso exato de paginateText:
 *   reconstructText(paginateText(t)) === t  (para qualquer t)
 */
export function reconstructText(pages: string[]): string {
  return pages.join('\n');
}

/**
 * Atualiza o conteúdo de uma página específica no texto completo
 * e devolve o novo texto completo — pronto para ser re-paginado.
 *
 * A página `pageIndex` ocupa as linhas [pageIndex*maxLines .. (pageIndex+1)*maxLines-1]
 * do texto original. O novo conteúdo pode ter mais ou menos linhas (overflow/underflow);
 * a re-paginação posterior redistribui automaticamente.
 */
export function updatePageText(
  fullText: string,
  pageIndex: number,
  newPageText: string,
  maxLines = MAX_TEXT_LINES_PER_PAGE,
): string {
  const allLines = fullText.split('\n');
  const newPageLines = newPageText.split('\n');

  const startLine = pageIndex * maxLines;
  // A última página pode ter menos de maxLines linhas
  const currentPageSize = Math.min(maxLines, Math.max(0, allLines.length - startLine));
  const endLine = startLine + currentPageSize;

  const updatedLines = [
    ...allLines.slice(0, startLine),
    ...newPageLines,
    ...allLines.slice(endLine),
  ];

  return updatedLines.join('\n');
}

// ---------------------------------------------------------------------------
// Paginação Braille (preview)
// ---------------------------------------------------------------------------

/**
 * Agrupa as linhas Braille em páginas de no máximo `maxLines` linhas cada.
 * Retorna um array de páginas, onde cada página é um array de linhas Braille.
 */
export function paginateBrailleLines(
  lines: BrailleToken[][],
  maxLines = MAX_BRAILLE_LINES_PER_PAGE,
): BrailleToken[][][] {
  return chunk(lines, maxLines);
}

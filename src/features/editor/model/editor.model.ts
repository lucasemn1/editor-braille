/**
 * Model da feature Editor.
 * Define os tipos de estado e contratos de dados dessa camada.
 */

import { paginateText } from "../../../shared/utils/pagination";

export interface EditorState {
  /** Conteúdo textual completo do documento */
  text: string;
  /** Conteúdo de cada página A4 (derivado de `text` pela paginação) */
  pages: string[];
  /** Contagem de caracteres (excluindo espaços) */
  charCount: number;
  /** Contagem de palavras */
  wordCount: number;
  /** Contagem de linhas */
  lineCount: number;
  /** Número de páginas A4 necessárias */
  pageCount: number;
}

export const EDITOR_INITIAL_STATE: EditorState = {
  text: "",
  pages: [""],
  charCount: 0,
  wordCount: 0,
  lineCount: 1,
  pageCount: 1,
};

/** Calcula estatísticas a partir do texto completo e do array de páginas */
export function computeEditorStats(
  text: string,
  pages: string[],
): Omit<EditorState, "text" | "pages"> {
  const trimmed = text.trim();
  return {
    charCount: text.replace(/\s/g, "").length,
    wordCount: trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length,
    lineCount: text === "" ? 1 : text.split("\n").length,
    pageCount: pages.length,
  };
}

/** Constrói um EditorState completo a partir de um texto bruto */
export function buildEditorState(text: string): EditorState {
  const pages = paginateText(text);
  return { text, pages, ...computeEditorStats(text, pages) };
}

import { useMemo } from "react";
import { textToBrailleTokens } from "../../../shared/utils/braille-converter";
import { useDebounce } from "../../../shared/hooks/useDebounce";
import { paginateBrailleLines } from "../../../shared/utils/pagination";
import {
  groupTokensByLine,
  type BraillePreviewState,
  BRAILLE_PREVIEW_INITIAL_STATE,
} from "../model/braille-preview.model";

/**
 * ViewModel da feature BraillePreview (MVVM).
 *
 * Recebe o texto bruto do editor, aplica debounce para evitar
 * reconversões a cada keystroke, converte para tokens Braille
 * e pagina as linhas respeitando o limite do CBB (25 linhas/página A4).
 */
export function useBraillePreviewViewModel(
  rawText: string,
): BraillePreviewState {
  const debouncedText = useDebounce(rawText, 150);

  const state = useMemo<BraillePreviewState>(() => {
    if (debouncedText.trim() === "") return BRAILLE_PREVIEW_INITIAL_STATE;

    const tokens = textToBrailleTokens(debouncedText);
    const lines = groupTokensByLine(tokens);
    const braillePages = paginateBrailleLines(lines);
    const cellCount = tokens.filter(
      (t) => t.type === "char" || t.type === "indicator",
    ).length;

    return { tokens, lines, braillePages, cellCount };
  }, [debouncedText]);

  return state;
}

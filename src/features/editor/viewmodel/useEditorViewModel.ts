import { useCallback, useState } from "react";
import {
  buildEditorState,
  EDITOR_INITIAL_STATE,
  type EditorState,
} from "../model/editor.model";
import { updatePageText, paginateText } from "../../../shared/utils/pagination";

/**
 * ViewModel da feature Editor (MVVM).
 *
 * Mantém `fullText` como única fonte de verdade.
 * Cada alteração em qualquer página:
 *   1. Reconstrói o fullText substituindo o trecho da página editada.
 *   2. Re-pagina o fullText — overflow vai para a próxima página,
 *      underflow puxa conteúdo de volta.
 *   3. Atualiza as estatísticas (chars, palavras, linhas, páginas).
 */
export function useEditorViewModel() {
  const [state, setState] = useState<EditorState>(EDITOR_INITIAL_STATE);

  const handlePageChange = useCallback(
    (pageIndex: number, newPageText: string) => {
      setState((prev) => {
        const fullText = updatePageText(prev.text, pageIndex, newPageText);
        return buildEditorState(fullText);
      });
    },
    [],
  );

  const handleClear = useCallback(() => {
    setState(EDITOR_INITIAL_STATE);
  }, []);

  return {
    state,
    handlePageChange,
    handleClear,
  } as const;
}

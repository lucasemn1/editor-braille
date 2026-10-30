import { useEffect, useRef } from 'react';
import { A4Sheet } from '../../../shared/components/A4Sheet';
import type { EditorState } from '../model/editor.model';

interface EditorViewProps {
  state: EditorState;
  onPageChange: (pageIndex: number, text: string) => void;
  onClear: () => void;
}

/**
 * Separador visual entre páginas A4.
 * Exibe o número da próxima página para orientar o usuário.
 */
function PageBreak({ nextPage, totalPages }: { nextPage: number; totalPages: number }) {
  return (
    <div
      className="flex items-center gap-3 w-[210mm] select-none"
      aria-label={`Início da página ${nextPage} de ${totalPages}`}
    >
      <div className="flex-1 border-t border-dashed border-slate-300" />
      <span className="text-[10px] font-medium text-slate-400 tracking-wide whitespace-nowrap px-1">
        página {nextPage} / {totalPages}
      </span>
      <div className="flex-1 border-t border-dashed border-slate-300" />
    </div>
  );
}

/**
 * View da feature Editor.
 *
 * Renderiza uma folha A4 por página de texto.
 * Cada textarea ocupa exatamente a área de conteúdo da página (257mm).
 * Quando o conteúdo de uma página ultrapassa MAX_TEXT_LINES_PER_PAGE,
 * o ViewModel redistribui o overflow para a página seguinte.
 *
 * Gerenciamento de foco automático:
 *   - Nova página criada → foco vai para ela (cursor no início).
 *   - Página removida   → foco volta para a última página restante.
 */
export function EditorView({ state, onPageChange, onClear }: EditorViewProps) {
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const prevPageCountRef = useRef(state.pages.length);

  // Gerencia foco quando o número de páginas muda
  useEffect(() => {
    const prev = prevPageCountRef.current;
    const curr = state.pages.length;

    if (curr !== prev) {
      const targetIdx = curr > prev
        ? curr - 1       // nova página: foca a última
        : curr - 1;      // página removida: foca a nova última
      const ta = textareaRefs.current[targetIdx];
      if (ta) {
        ta.focus();
        // Nova página: cursor no início; página removida: cursor no fim
        const pos = curr > prev ? 0 : ta.value.length;
        ta.setSelectionRange(pos, pos);
      }
    }

    prevPageCountRef.current = curr;
  }, [state.pages.length]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* ── Cabeçalho da coluna ── */}
      <div className="flex items-center justify-between w-[210mm]">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">
          Editor
        </span>
        <button
          onClick={onClear}
          disabled={state.text.length === 0}
          className="text-xs text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Limpar todo o texto"
        >
          Limpar
        </button>
      </div>

      {/* ── Páginas ── */}
      {state.pages.map((pageText, pageIndex) => (
        <div key={pageIndex} className="flex flex-col items-center gap-4">
          {/* Separador de quebra de página (exceto antes da 1ª) */}
          {pageIndex > 0 && (
            <PageBreak nextPage={pageIndex + 1} totalPages={state.pageCount} />
          )}

          {/* Folha A4 */}
          <A4Sheet label={`Página ${pageIndex + 1} do editor`}>
            <textarea
              ref={(el) => { textareaRefs.current[pageIndex] = el; }}
              className="editor-textarea"
              value={pageText}
              onChange={(e) => onPageChange(pageIndex, e.target.value)}
              placeholder={
                pageIndex === 0
                  ? 'Digite o texto aqui. O conteúdo será convertido para Braille em tempo real na visualização ao lado.'
                  : undefined
              }
              spellCheck
              lang="pt-BR"
              aria-label={`Página ${pageIndex + 1} do editor`}
            />
          </A4Sheet>
        </div>
      ))}

      {/* ── Barra de estatísticas ── */}
      <div className="flex gap-5 text-xs text-slate-400 w-[210mm] px-1">
        <span>
          <span className="font-medium text-slate-600">{state.charCount}</span> caracteres
        </span>
        <span>
          <span className="font-medium text-slate-600">{state.wordCount}</span> palavras
        </span>
        <span>
          <span className="font-medium text-slate-600">{state.lineCount}</span> linhas
        </span>
        <span className="ml-auto">
          <span className="font-medium text-slate-600">{state.pageCount}</span>{' '}
          {state.pageCount === 1 ? 'página' : 'páginas'}
        </span>
      </div>
    </div>
  );
}

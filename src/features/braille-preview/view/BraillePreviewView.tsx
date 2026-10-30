import { A4Sheet } from '../../../shared/components/A4Sheet';
import { BrailleCell } from '../../../shared/components/BrailleCell';
import type { BraillePreviewState } from '../model/braille-preview.model';
import type { BrailleToken } from '../../../shared/utils/braille-converter';
import { MAX_BRAILLE_LINES_PER_PAGE } from '../../../shared/utils/pagination';

interface BraillePreviewViewProps {
  state: BraillePreviewState;
}

/** Rótulo legível para o tooltip de cada token */
function tokenLabel(token: BrailleToken): string {
  if (token.type === 'indicator') {
    return token.source === '#' ? 'Indicador numérico' : 'Indicador de maiúscula';
  }
  if (token.type === 'space') return 'Espaço';
  return `"${token.source}"`;
}

/**
 * Separador visual entre páginas Braille.
 */
function PageBreak({
  nextPage,
  totalPages,
}: {
  nextPage: number;
  totalPages: number;
}) {
  return (
    <div
      className="flex items-center gap-3 w-[210mm] select-none"
      aria-label={`Início da página Braille ${nextPage} de ${totalPages}`}
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
 * Renderiza uma única página A4 de conteúdo Braille.
 */
function BraillePage({
  lines,
  pageIndex,
  totalPages,
}: {
  lines: BrailleToken[][];
  pageIndex: number;
  totalPages: number;
}) {
  return (
    <div
      className="flex flex-col gap-y-[12px]"
      aria-label={`Página Braille ${pageIndex + 1} de ${totalPages}`}
      role="img"
    >
      {lines.map((lineTokens, lineIdx) => (
        <div
          key={lineIdx}
          className="flex flex-wrap gap-y-[10px] min-h-[24px]"
          aria-label={`Linha Braille ${lineIdx + 1}`}
        >
          {lineTokens.map((token, tokenIdx) => {
            if (token.type === 'space') {
              return (
                <span key={tokenIdx} className="braille-space" aria-hidden="true" />
              );
            }
            return (
              <BrailleCell
                key={tokenIdx}
                dots={token.dots}
                title={tokenLabel(token)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * View da feature BraillePreview.
 *
 * Renderiza uma folha A4 por página Braille.
 * A paginação respeita o limite de MAX_BRAILLE_LINES_PER_PAGE (padrão CBB: 25 linhas).
 */
export function BraillePreviewView({ state }: BraillePreviewViewProps) {
  const isEmpty = state.tokens.length === 0;
  const totalPages = state.braillePages.length;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* ── Cabeçalho da coluna ── */}
      <div className="flex items-center justify-between w-[210mm]">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">
          Visualização Braille
        </span>
        <span className="text-xs text-slate-400">
          {state.cellCount > 0 && (
            <>
              <span className="font-medium text-slate-600">{state.cellCount}</span>{' '}
              células
            </>
          )}
        </span>
      </div>

      {/* ── Conteúdo vazio ── */}
      {isEmpty ? (
        <A4Sheet label="Visualização Braille">
          <p className="text-slate-300 text-sm select-none leading-relaxed">
            A representação em Braille aparecerá aqui conforme você digita no
            editor ao lado.
          </p>
        </A4Sheet>
      ) : (
        /* ── Páginas Braille ── */
        state.braillePages.map((pageLines, pageIndex) => (
          <div key={pageIndex} className="flex flex-col items-center gap-4">
            {/* Separador de quebra de página (exceto antes da 1ª) */}
            {pageIndex > 0 && (
              <PageBreak nextPage={pageIndex + 1} totalPages={totalPages} />
            )}

            <A4Sheet label={`Página Braille ${pageIndex + 1}`}>
              <BraillePage
                lines={pageLines}
                pageIndex={pageIndex}
                totalPages={totalPages}
              />

              {/* Indicador de linhas usadas / disponíveis na página */}
              <div className="mt-6 flex items-center gap-2" aria-hidden="true">
                <div className="flex-1 flex gap-[2px]">
                  {Array.from({ length: MAX_BRAILLE_LINES_PER_PAGE }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-[3px] flex-1 rounded-full transition-colors ${
                        i < pageLines.length ? 'bg-slate-800' : 'bg-slate-100'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 tabular-nums whitespace-nowrap pl-2">
                  {pageLines.length}/{MAX_BRAILLE_LINES_PER_PAGE}
                </span>
              </div>
            </A4Sheet>
          </div>
        ))
      )}

      {/* ── Legenda ── */}
      {!isEmpty && (
        <div className="flex items-center gap-4 text-xs text-slate-400 w-[210mm] px-1">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-800" />
            Ponto levantado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-200" />
            Ponto rebaixado
          </span>
          <span className="ml-auto">CBB / ABNT NBR 9050</span>
        </div>
      )}
    </div>
  );
}

import { EditorView } from "./features/editor/view/EditorView";
import { useEditorViewModel } from "./features/editor/viewmodel/useEditorViewModel";
import { BraillePreviewView } from "./features/braille-preview/view/BraillePreviewView";
import { useBraillePreviewViewModel } from "./features/braille-preview/viewmodel/useBraillePreviewViewModel";
import { usePrintViewModel } from "./features/print/viewmodel/usePrintViewModel";

/**
 * Fator de escala aplicado às folhas A4 para exibição em tela.
 * 210mm ≈ 794px a 96 dpi; com zoom 0.75 cada coluna ocupa ~596px,
 * permitindo que as duas folhas + gap + padding caibam em telas ≥ 1280px.
 * Altere aqui para ajustar o zoom globalmente.
 */
const A4_ZOOM = 0.75;

/**
 * Raiz da aplicação.
 * Compõe os ViewModels e distribui estado/handlers para as Views.
 * Segue o padrão MVVM: App atua como coordenador, sem lógica de negócio própria.
 */
export default function App() {
  const editor = useEditorViewModel();
  const braillePreview = useBraillePreviewViewModel(editor.state.text);
  const print = usePrintViewModel();

  const canPrint =
    editor.state.text.trim().length > 0 && print.state.status !== "sending";

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo / título */}
          <div className="flex items-center gap-3">
            <div className="flex gap-[3px] items-center" aria-hidden="true">
              {/* Mini ícone Braille decorativo */}
              {[true, false, true, false, true, true].map((raised, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full ${raised ? "bg-slate-800" : "bg-slate-300"}`}
                />
              ))}
            </div>
            <h1 className="text-base font-semibold text-slate-800 tracking-tight">
              Editor Braille
            </h1>
            <span className="hidden sm:inline text-xs text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">
              CBB / ABNT NBR 9050
            </span>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-3">
            {/* Feedback de impressão */}
            {print.state.status === "success" && (
              <span className="text-xs text-emerald-600 font-medium animate-pulse">
                Enviado para impressão!
              </span>
            )}
            {print.state.status === "error" && (
              <div className="flex items-center gap-2">
                <span
                  className="text-xs text-red-500 max-w-[240px] truncate"
                  title={print.state.errorMessage ?? ""}
                >
                  {print.state.errorMessage}
                </span>
                <button
                  onClick={print.handleDismiss}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Botão de impressão */}
            <button
              onClick={() =>
                print.handlePrint(editor.state.text, braillePreview.tokens)
              }
              disabled={!canPrint}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                transition-all duration-150
                ${
                  canPrint
                    ? "bg-slate-800 text-white hover:bg-slate-700 active:scale-95 shadow-sm"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }
              `}
              title={
                canPrint
                  ? "Enviar para impressão no ESP32"
                  : "Digite algum texto para habilitar a impressão"
              }
            >
              {print.state.status === "sending" ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando…
                </>
              ) : (
                <>
                  <PrintIcon />
                  Imprimir em Braille
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Workspace ── */}
      <main className="flex-1 overflow-auto scrollable">
        <div className="px-10 py-10">
          <div className="flex gap-10 justify-center items-start">
            {/* Coluna esquerda — Editor (escalonada para caber na tela) */}
            <div style={{ zoom: A4_ZOOM }}>
              <EditorView
                state={editor.state}
                onPageChange={editor.handlePageChange}
                onClear={editor.handleClear}
              />
            </div>

            {/* Divisor */}
            <div className="w-px bg-slate-200 self-stretch mt-7 shrink-0" />

            {/* Coluna direita — Preview Braille (mesma escala) */}
            <div style={{ zoom: A4_ZOOM }}>
              <BraillePreviewView state={braillePreview} />
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white py-3 px-6 text-center text-xs text-slate-400">
        Converte texto em Braille no front-end · Envia dot matrix ao ESP32 para
        impressão mecânica
      </footer>
    </div>
  );
}

function PrintIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

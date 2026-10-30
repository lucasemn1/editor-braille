import { useCallback, useState } from 'react';
import { buildPrintPayload, PRINT_INITIAL_STATE, type PrintState } from '../model/print.model';
import { sendPrintJob, PrintServiceError } from '../service/print.service';
import { tokensToUnicodeBraille } from '../../../shared/utils/braille-converter';
import type { BrailleToken } from '../../../shared/utils/braille-converter';

/**
 * ViewModel da feature Print (MVVM).
 * Orquestra a montagem do payload, a chamada ao serviço e o feedback de estado.
 */
export function usePrintViewModel() {
  const [state, setState] = useState<PrintState>(PRINT_INITIAL_STATE);

  const handlePrint = useCallback(
    async (text: string, tokens: BrailleToken[]) => {
      if (!text.trim() || tokens.length === 0) return;

      setState({ status: 'sending', errorMessage: null, lastPrintedAt: null });

      try {
        const brailleUnicode = tokensToUnicodeBraille(tokens);
        const payload = buildPrintPayload(text, tokens, brailleUnicode);

        await sendPrintJob(payload);

        setState({
          status: 'success',
          errorMessage: null,
          lastPrintedAt: new Date(),
        });
      } catch (error) {
        const message =
          error instanceof PrintServiceError
            ? error.message
            : 'Erro inesperado ao enviar para impressão.';

        setState({ status: 'error', errorMessage: message, lastPrintedAt: null });
      }
    },
    [],
  );

  const handleDismiss = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'idle', errorMessage: null }));
  }, []);

  return {
    state,
    handlePrint,
    handleDismiss,
  } as const;
}

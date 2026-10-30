import type { DotPattern } from "../utils/braille-converter";

interface BrailleCellProps {
  dots: DotPattern;
  title?: string;
}

/**
 * Renderiza uma célula Braille como grade visual 2×3 de pontos.
 *
 * Layout dos pontos (numeração padrão):
 *   [0]=dot1  [3]=dot4   →  col0 col1
 *   [1]=dot2  [4]=dot5      col0 col1
 *   [2]=dot3  [5]=dot6      col0 col1
 */
export function BrailleCell({ dots, title }: BrailleCellProps) {
  // Ordem de renderização na grid CSS (row-major, left-to-right):
  // posição 0 → dot1 (col0,row0), posição 1 → dot4 (col1,row0)
  // posição 2 → dot2 (col0,row1), posição 3 → dot5 (col1,row1)
  // posição 4 → dot3 (col0,row2), posição 5 → dot6 (col1,row2)
  const renderOrder: Array<{ dotIndex: number; label: number }> = [
    { dotIndex: 0, label: 1 },
    { dotIndex: 3, label: 4 },
    { dotIndex: 1, label: 2 },
    { dotIndex: 4, label: 5 },
    { dotIndex: 2, label: 3 },
    { dotIndex: 5, label: 6 },
  ];

  return (
    <span
      className="braille-cell bg-red-500"
      title={title}
      aria-label={`Célula Braille: ${title ?? ""}`}
    >
      {renderOrder.map(({ dotIndex, label }) => (
        <span
          key={label}
          className={`braille-dot ${
            dots[dotIndex] ? "braille-dot--raised" : "braille-dot--flat"
          }`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

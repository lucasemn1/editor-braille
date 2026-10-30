import type { ReactNode } from 'react';

interface A4SheetProps {
  children: ReactNode;
  className?: string;
  label?: string;
}

/**
 * Container visual no formato A4 (210mm × 297mm) com margens internas de 20mm (2cm).
 * Funciona como base tanto para o editor quanto para o preview Braille.
 */
export function A4Sheet({ children, className = '', label }: A4SheetProps) {
  return (
    <div
      role="region"
      aria-label={label}
      className={`a4-sheet ${className}`}
    >
      {children}
    </div>
  );
}

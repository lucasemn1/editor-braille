/**
 * Conversor de texto para Braille — Código Braille Brasileiro (CBB/MEC 2018)
 * Referência normativa: ABNT NBR 9050 e "Grafia Braille para a Língua Portuguesa"
 *
 * Numeração padrão dos pontos:
 *   1  4
 *   2  5
 *   3  6
 *
 * Representação interna: tupla booleana de 6 posições
 *   dots[0]=ponto1, dots[1]=ponto2, ..., dots[5]=ponto6
 */

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------

export type DotPattern = [boolean, boolean, boolean, boolean, boolean, boolean];

export type BrailleTokenType = 'char' | 'indicator' | 'space' | 'newline';

export interface BrailleToken {
  dots: DotPattern;
  /** Caractere de origem (para tooltip e debug) */
  source: string;
  type: BrailleTokenType;
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

const EMPTY: DotPattern = [false, false, false, false, false, false];

/** Cria DotPattern a partir de lista de pontos ativos (1-6) */
function d(...active: number[]): DotPattern {
  const dots: DotPattern = [false, false, false, false, false, false];
  for (const n of active) dots[n - 1] = true;
  return dots;
}

function isUpperCase(char: string): boolean {
  return char === char.toUpperCase() && char !== char.toLowerCase();
}

// ---------------------------------------------------------------------------
// Indicadores (CBB §2.3 e §3.1)
// ---------------------------------------------------------------------------

/** Indicador de maiúscula: ponto 6 */
const CAPITAL_INDICATOR: DotPattern = d(6);

/** Indicador numérico: pontos 3,4,5,6 */
const NUMBER_INDICATOR: DotPattern = d(3, 4, 5, 6);

// ---------------------------------------------------------------------------
// Letras minúsculas — alfabeto básico (CBB §2.1)
// ---------------------------------------------------------------------------

const LETTER_MAP: Readonly<Record<string, DotPattern>> = {
  a: d(1),          // ⠁
  b: d(1, 2),       // ⠃
  c: d(1, 4),       // ⠉
  d: d(1, 4, 5),    // ⠙
  e: d(1, 5),       // ⠑
  f: d(1, 2, 4),    // ⠋
  g: d(1, 2, 4, 5), // ⠛
  h: d(1, 2, 5),    // ⠓
  i: d(2, 4),       // ⠊
  j: d(2, 4, 5),    // ⠚
  k: d(1, 3),       // ⠅
  l: d(1, 2, 3),    // ⠇
  m: d(1, 3, 4),    // ⠍
  n: d(1, 3, 4, 5), // ⠝
  o: d(1, 3, 5),    // ⠕
  p: d(1, 2, 3, 4), // ⠏
  q: d(1, 2, 3, 4, 5), // ⠟
  r: d(1, 2, 3, 5), // ⠗
  s: d(2, 3, 4),    // ⠎
  t: d(2, 3, 4, 5), // ⠞
  u: d(1, 3, 6),    // ⠥
  v: d(1, 2, 3, 6), // ⠧
  w: d(2, 4, 5, 6), // ⠺
  x: d(1, 3, 4, 6), // ⠭
  y: d(1, 3, 4, 5, 6), // ⠽
  z: d(1, 3, 5, 6), // ⠵

  // Vogais acentuadas do Português (CBB §2.2)
  // Offsets Unicode verificados: U+2800 + bitmask (dot_n = bit n-1)
  á: d(1, 2, 3, 5, 6),    // ⠷  U+2837
  â: d(1, 6),              // ⠡  U+2821
  ã: d(3, 4, 5),           // ⠜  U+281C
  à: d(1, 2, 6),           // ⠣  U+2823
  é: d(1, 2, 3, 4, 5, 6), // ⠿  U+283F
  ê: d(2, 6),              // ⠢  U+2822
  í: d(3, 4),              // ⠌  U+280C
  ó: d(3, 4, 6),           // ⠬  U+282C
  ô: d(1, 4, 5, 6),       // ⠹  U+2839
  õ: d(2, 4, 6),           // ⠪  U+282A
  ú: d(2, 3, 4, 5, 6),    // ⠾  U+283E
  ü: d(1, 2, 5, 6),       // ⠳  U+2833
  ç: d(1, 2, 3, 4, 6),    // ⠯  U+282F
};

// ---------------------------------------------------------------------------
// Dígitos (CBB §3.1) — precedidos pelo indicador numérico
// Compartilham padrão de pontos com letras a–j
// ---------------------------------------------------------------------------

const DIGIT_MAP: Readonly<Record<string, DotPattern>> = {
  '1': d(1),
  '2': d(1, 2),
  '3': d(1, 4),
  '4': d(1, 4, 5),
  '5': d(1, 5),
  '6': d(1, 2, 4),
  '7': d(1, 2, 4, 5),
  '8': d(1, 2, 5),
  '9': d(2, 4),
  '0': d(2, 4, 5),
};

// ---------------------------------------------------------------------------
// Pontuação (CBB §4)
// ---------------------------------------------------------------------------

const PUNCTUATION_MAP: Readonly<Record<string, DotPattern>> = {
  '.': d(2, 5, 6),       // ⠲ ponto final
  ',': d(2),             // ⠂ vírgula
  ';': d(2, 3),          // ⠆ ponto e vírgula
  ':': d(2, 5),          // ⠒ dois-pontos
  '!': d(2, 3, 5),       // ⠖ exclamação
  '?': d(2, 3, 6),       // ⠦ interrogação
  '-': d(3, 6),          // ⠤ hífen
  '–': d(3, 6),          // ⠤ travessão curto (equivalente ao hífen no CBB)
  '—': d(3, 6),          // ⠤ travessão longo
  "'": d(3),                  // ⠄ apóstrofo
  '\u201C': d(2, 3, 6),    // ⠦ aspas tipograficas de abertura
  '\u201D': d(3, 5, 6),    // ⠴ aspas tipograficas de fechamento
  '"': d(2, 3, 6),           // ⠦ aspas retas
  '(': d(2, 3, 6),       // ⠦ parêntese de abertura
  ')': d(3, 5, 6),       // ⠴ parêntese de fechamento
  '/': d(3, 4),          // ⠌ barra
  '*': d(3, 5),          // ⠔ asterisco
};

// ---------------------------------------------------------------------------
// Conversor principal
// ---------------------------------------------------------------------------

/**
 * Converte uma string de texto em array de BrailleTokens,
 * aplicando as regras do Código Braille Brasileiro (CBB).
 */
export function textToBrailleTokens(text: string): BrailleToken[] {
  const tokens: BrailleToken[] = [];
  let inNumberMode = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    // Quebra de linha
    if (char === '\n') {
      tokens.push({ dots: EMPTY, source: '\n', type: 'newline' });
      inNumberMode = false;
      i++;
      continue;
    }

    // Espaço / tabulação — encerra modo numérico
    if (char === ' ' || char === '\t') {
      tokens.push({ dots: EMPTY, source: ' ', type: 'space' });
      inNumberMode = false;
      i++;
      continue;
    }

    // Dígito
    if (char in DIGIT_MAP) {
      if (!inNumberMode) {
        tokens.push({ dots: NUMBER_INDICATOR, source: '#', type: 'indicator' });
        inNumberMode = true;
      }
      tokens.push({ dots: DIGIT_MAP[char], source: char, type: 'char' });
      i++;
      continue;
    }

    inNumberMode = false;

    // Letra (minúscula ou maiúscula com acentos)
    const lower = char.toLowerCase();
    if (lower in LETTER_MAP) {
      if (isUpperCase(char)) {
        tokens.push({ dots: CAPITAL_INDICATOR, source: '^', type: 'indicator' });
      }
      tokens.push({ dots: LETTER_MAP[lower], source: char, type: 'char' });
      i++;
      continue;
    }

    // Pontuação
    if (char in PUNCTUATION_MAP) {
      tokens.push({ dots: PUNCTUATION_MAP[char], source: char, type: 'char' });
      i++;
      continue;
    }

    // Caractere não mapeado: ignora silenciosamente
    i++;
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Utilitários para serialização (payload ao ESP32)
// ---------------------------------------------------------------------------

/** Converte DotPattern em string de pontos ativos, ex: "1,2,5" */
export function dotPatternToString(dots: DotPattern): string {
  return dots
    .map((active, idx) => (active ? idx + 1 : null))
    .filter(Boolean)
    .join(',');
}

/** Converte BrailleToken em caractere Unicode Braille (U+2800..U+283F) */
export function tokenToUnicode(token: BrailleToken): string {
  if (token.type === 'newline') return '\n';
  if (token.type === 'space') return '\u2800';
  let offset = 0;
  for (let i = 0; i < 6; i++) {
    if (token.dots[i]) offset |= 1 << i;
  }
  return String.fromCodePoint(0x2800 + offset);
}

/** Converte array de tokens para string Unicode Braille completa */
export function tokensToUnicodeBraille(tokens: BrailleToken[]): string {
  return tokens.map(tokenToUnicode).join('');
}

/** Serializa tokens para o formato dot_matrix enviado ao ESP32 */
export function tokensToDotMatrix(
  tokens: BrailleToken[],
): Array<{ cell: number; dots: boolean[]; source: string }> {
  return tokens
    .filter((t) => t.type !== 'newline')
    .map((t, idx) => ({
      cell: idx + 1,
      dots: [...t.dots],
      source: t.source,
    }));
}

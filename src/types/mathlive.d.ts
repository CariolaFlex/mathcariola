/**
 * Declaraciones TypeScript para el Custom Element <math-field> de MathLive.
 * Registra el elemento en el namespace JSX para que React lo reconozca.
 *
 * MathLive 0.109.1 — React 19 con soporte nativo de Custom Elements.
 */

// Interfaz mínima del elemento DOM (sin importar el módulo browser)
export interface MathfieldHTMLElement extends HTMLElement {
  /** LaTeX string actual del campo */
  value: string
  /** Cuando es true, el campo no es editable */
  readOnly: boolean
  /** Política del teclado virtual */
  mathVirtualKeyboardPolicy: 'auto' | 'manual' | 'sandboxed'
  /**
   * Convierte la expresión a otros formatos.
   * @param format 'latex' | 'mathml' | 'spoken' | 'ascii-math' | 'math-json'
   */
  getValue(format?: string): string
  /** Inserta texto/LaTeX en la posición actual del cursor */
  insert(text: string, options?: { insertionMode?: string }): void
}

// Extensión del namespace global JSX para React
declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'math-field': React.DetailedHTMLProps<
          React.HTMLAttributes<MathfieldHTMLElement> & {
            /** Valor LaTeX inicial (uncontrolled) */
            'default-value'?: string
            /** Modo por defecto: 'math' | 'text' */
            'default-mode'?: 'math' | 'text' | 'inline-math'
            /** Solo lectura */
            'read-only'?: boolean
            /** Texto placeholder (no estándar de MathLive, informativo) */
            placeholder?: string
            /** Estilo de letra: 'auto' | 'tex' | 'iso' | 'french' | 'upright' */
            'letter-shape-style'?: string
            /** Política del teclado virtual */
            'math-virtual-keyboard-policy'?: 'auto' | 'manual' | 'sandboxed'
          },
          MathfieldHTMLElement
        >
      }
    }
  }
}

/**
 * exportShare — PNG export and URL sharing utilities.
 *
 * PNG export:
 *   Uses canvas.toDataURL('image/png') on the Mafs SVG element.
 *   Mafs renders as SVG — we serialize it to a canvas via the HTML
 *   Image API, then call toDataURL to get a downloadable PNG.
 *
 * URL sharing:
 *   Encodes the function expression(s) into URL search params.
 *   The consumer page reads ?fn= on mount and pre-fills the input.
 */

// ---------------------------------------------------------------------------
// PNG Export
// ---------------------------------------------------------------------------

/**
 * Export a specific DOM element (typically the Mafs SVG container) as PNG.
 * Uses the html-to-image approach: serialize SVG → Image → Canvas → PNG.
 *
 * @param containerSelector - CSS selector for the element to capture.
 *   Default: the first Mafs SVG element.
 * @param filename - Downloaded filename (without .png extension).
 */
export async function exportCanvasToPNG(
  containerSelector: string = '.mafs-canvas svg, svg[class*="mafs"]',
  filename: string = 'grafica-mathcariola'
): Promise<void> {
  const svgEl = document.querySelector<SVGSVGElement>(containerSelector)
  if (!svgEl) {
    throw new Error('No se encontró el elemento SVG para exportar.')
  }

  const svgData = new XMLSerializer().serializeToString(svgEl)
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  const svgUrl = URL.createObjectURL(svgBlob)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const rect = svgEl.getBoundingClientRect()
        canvas.width = Math.max(rect.width, 800)
        canvas.height = Math.max(rect.height, 600)

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto 2D del canvas.'))
          return
        }

        // White background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // Trigger download
        const pngUrl = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = pngUrl
        link.download = `${filename}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        URL.revokeObjectURL(svgUrl)
        resolve()
      } catch (err) {
        URL.revokeObjectURL(svgUrl)
        reject(err)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(svgUrl)
      reject(new Error('Error al cargar el SVG como imagen.'))
    }
    img.src = svgUrl
  })
}

// ---------------------------------------------------------------------------
// URL Sharing
// ---------------------------------------------------------------------------

/**
 * Build a shareable URL encoding one or more function expressions.
 *
 * Format: https://mathcariola.edu/funciones?fn=<encoded>&tab=graficar
 *
 * @param expressions - Array of LaTeX function expressions
 * @param tab - Active tab to restore (default: 'graficar')
 */
export function buildShareURL(
  expressions: string[],
  tab = 'graficar'
): string {
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  const params = new URLSearchParams()
  params.set('tab', tab)
  // Each function as a separate 'fn' param (supports multiple)
  expressions.forEach((expr) => params.append('fn', expr))
  return `${base}/funciones?${params.toString()}`
}

/**
 * Copy the shareable URL to the clipboard.
 * Returns the URL string for display in the UI.
 */
export async function copyShareURL(
  expressions: string[],
  tab = 'graficar'
): Promise<string> {
  const url = buildShareURL(expressions, tab)
  await navigator.clipboard.writeText(url)
  return url
}

/**
 * Read function expressions from URL search params on page load.
 * Returns [] if no ?fn= param is present.
 */
export function readExpressionsFromURL(): string[] {
  if (typeof window === 'undefined') return []
  const params = new URLSearchParams(window.location.search)
  return params.getAll('fn').filter(Boolean)
}

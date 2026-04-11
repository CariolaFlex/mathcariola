# 06_modulo_contenido_matematico.md
# MathCariola — Especificación Matemática Certificada
> **Documento:** Definición de contenido matemático de la plataforma  
> **Rol:** Matemático y pedagogo especializado en matemáticas de ingeniería  
> **Fuentes base:** Stewart (Precálculo + Cálculo 9ª Ed.), Grossman (Álgebra Lineal 8ª Ed.), Simmons (Ecuaciones Diferenciales), Walpole (Estadística y Probabilidad 9ª Ed.)  
> **Versión:** 1.0 — Abril 2026

---

## MATERIA 1: PRECÁLCULO Y FUNCIONES
**Fuente principal:** Stewart — *Precálculo: Matemáticas para el Cálculo*, 7ª Ed., Cengage  
**Alternativa:** OpenStax Precalculus 2e (CC BY 4.0)

---

### A) TEMAS Y SUBTEMAS COMPLETOS

#### 1. Fundamentos de números reales
- Conjuntos numéricos: ℕ, ℤ, ℚ, ℝ
- Valor absoluto: definición, propiedades, ecuaciones e inecuaciones
- Intervalos: abiertos, cerrados, semiabiertos, infinitos
- Distancia en la recta real

#### 2. Funciones: definición y conceptos fundamentales
- Definición formal de función: dominio, codominio, recorrido (imagen)
- Notación f(x), evaluación, funciones definidas implícitamente
- Representaciones: analítica, tabular, gráfica, verbal
- Dominio natural de una función
- Dominio y recorrido desde la gráfica

#### 3. Propiedades globales de funciones
- Función inyectiva (uno a uno): prueba de la recta horizontal
- Función sobreyectiva (suryectiva)
- Función biyectiva
- Función par e impar: algebraica y gráficamente
- Función monótona creciente y decreciente
- Función acotada superior e inferiormente
- Máximos y mínimos locales y globales

#### 4. Transformaciones de funciones
- Traslaciones verticales y horizontales: f(x) ± c, f(x ± c)
- Reflexiones: -f(x), f(-x)
- Escalados: cf(x), f(cx)
- Combinaciones de transformaciones (orden importa)

#### 5. Álgebra de funciones
- Suma, diferencia, producto, cociente de funciones
- Dominio de operaciones algebraicas
- Composición de funciones: (f∘g)(x) = f(g(x))
- Dominio de la composición
- Descomposición de funciones compuestas

#### 6. Función inversa
- Condición de existencia: biyectividad
- Obtención analítica de f⁻¹(x)
- Propiedad: f(f⁻¹(x)) = x y f⁻¹(f(x)) = x
- Gráfica de la inversa: reflexión respecto a y = x
- Restricción de dominio para crear inversa

#### 7. Funciones a trozos (definidas por partes)
- Definición y notación
- Evaluación en puntos
- Graficación correcta (puntos abiertos/cerrados)
- Dominio y recorrido de funciones a trozos
- Continuidad en los puntos de quiebre

#### 8. Valor absoluto como función a trozos
- |x| = x si x ≥ 0; -x si x < 0
- Gráfica de |f(x)|
- Ecuaciones con valor absoluto: |f(x)| = k, |f(x)| = |g(x)|
- Inecuaciones: |f(x)| < k, |f(x)| > k
- Transformaciones de |x|

#### 9. Funciones algebraicas
- Funciones lineales: pendiente, interceptos, formas
- Funciones cuadráticas: forma estándar y vértice, discriminante
- Funciones polinomiales: grado, coeficientes, comportamiento extremo
- Funciones racionales: dominio, asíntotas verticales y horizontales, huecos
- Funciones con radicales: dominio, graficación

#### 10. Asíntotas
- Asíntota vertical: lím x→a f(x) = ±∞
- Asíntota horizontal: lím x→±∞ f(x) = L
- Asíntota oblicua: división polinomial cuando grado numerador = grado denominador + 1
- Comportamiento en el infinito

#### 11. Funciones trascendentes elementales
- Funciones exponenciales: aˣ, eˣ, propiedades, gráfica
- Funciones logarítmicas: logₐ(x), ln(x), propiedades, gráfica
- Relación inversa exponencial-logarítmica
- Ecuaciones exponenciales y logarítmicas
- Funciones trigonométricas: sen, cos, tan, csc, sec, cot — dominio, período, amplitud, fase
- Funciones trigonométricas inversas: arcsen, arccos, arctan — dominio y recorrido restringidos
- Identidades trigonométricas fundamentales

#### 12. Sistemas de ecuaciones (repaso)
- Sistemas 2×2 lineales y no lineales
- Métodos: sustitución, eliminación, gráfico

---

### B) TIPOS DE PROBLEMAS

| Tipo | Ejemplo Input | Output Esperado |
|------|--------------|-----------------|
| Hallar dominio | `dom f(x) = √(x² - 4) / (x - 3)` | `[-2, 3) ∪ (3, 2] ... x ∈ (-∞,-2]∪[2,3)∪(3,∞)` con justificación |
| Hallar recorrido | `rec f(x) = x² - 4x + 1` | Completar cuadrado → vértice → `Rec = [-3, ∞)` |
| Composición | `(f∘g)(x), f(x)=x²+1, g(x)=2x-3` | `f(g(x)) = (2x-3)² + 1 = 4x²-12x+10`, Dom = ℝ |
| Función inversa | `f(x) = (2x+1)/(x-3)` | Despejar x, intercambiar → `f⁻¹(x) = (3x+1)/(x-2)` |
| Valor absoluto ecuación | `|2x - 3| = 7` | Dos casos → x = 5 o x = -2 |
| Valor absoluto inecuación | `|x + 1| < 4` | `-5 < x < 3`, intervalo `(-5, 3)` |
| Asíntotas función racional | `f(x) = (2x² + 1)/(x² - 9)` | AV: x=3, x=-3; AH: y=2 |
| Función a trozos evaluación | `f(x) = {x² si x<0; 2x+1 si x≥0}, f(-3), f(0), f(2)` | `f(-3)=9; f(0)=1; f(2)=5` |
| Inyectividad | `¿Es f(x) = x² inyectiva?` | No, prueba recta horizontal: f(2)=f(-2)=4 |
| Transformaciones | `Describir y = -2f(x+3) - 1` | Traslación izq. 3, reflexión en x, escalar ×2, traslación abajo 1 |

---

### C) REGLAS Y FÓRMULAS CLAVE

DOMINIO:
√u: u ≥ 0
1/u: u ≠ 0
logₐ(u): u > 0
Combinación: intersección de condiciones
FUNCIONES RACIONALES — ASÍNTOTAS:
AV: ceros del denominador (no cancelados)
AH: grado num < grado den → y=0
grado num = grado den → y = coef_líder_num / coef_líder_den
grado num > grado den en 1 → asíntota oblicua (división larga)
INVERSA: y = f(x) → x = f(y) → despejar y → f⁻¹(x)
COMPOSICIÓN DOM(f∘g) = {x ∈ Dom(g) : g(x) ∈ Dom(f)}
VALOR ABSOLUTO:
|f(x)| = k ↔ f(x) = k o f(x) = -k (k > 0)
|f(x)| < k ↔ -k < f(x) < k
|f(x)| > k ↔ f(x) < -k o f(x) > k
TRANSFORMACIONES (orden de aplicación):
Escalar horizontal: f(cx)
Trasladar horizontal: f(x+h)
Escalar vertical: a·f(x)
Trasladar vertical: f(x)+k
Reflexiones: signos negativos
text

---

### D) PROPIEDADES A IDENTIFICAR AUTOMÁTICAMENTE

Al analizar una expresión, el CAS debe detectar:

- **Tipo de función:** polinomial, racional, radical, exponencial, logarítmica, trigonométrica, a trozos, compuesta
- **Restricciones de dominio:** radicales con índice par, denominadores, logaritmos
- **Paridad:** si f(-x) = f(x) → par; f(-x) = -f(x) → impar
- **Asíntotas presentes:** verticals, horizontales, oblicuas
- **Inyectividad:** monotonía estricta implica inyectividad
- **Puntos de discontinuidad en funciones a trozos**
- **Si la función tiene inversa** (biyectividad)
- **Período en funciones trigonométricas**

---

### E) CASOS ESPECIALES Y ERRORES COMUNES

| Error Común | Descripción | Corrección Pedagógica |
|-------------|-------------|----------------------|
| Dom(f∘g) = Dom(f) ∩ Dom(g) | El estudiante intersecta dominios en lugar de aplicar la condición correcta | Mostrar que Dom(f∘g) requiere g(x) ∈ Dom(f) |
| Olvidar restricciones en inversas | f(x)=x² tiene inversa "√x" sin aclarar dominio restringido | Siempre indicar que la inversa requiere dominio restringido a [0,∞) |
| Confundir f⁻¹(x) con 1/f(x) | Error notacional muy frecuente | Explicar que f⁻¹ no es potencia sino función inversa |
| Valor absoluto: caso único | Resolver |x+2| = 5 con un solo caso | Obligar siempre a plantear dos casos |
| Asíntota con hueco | f(x) = (x²-4)/(x-2): el factor (x-2) cancela, NO es AV sino hueco | Verificar si el factor del denominador cancela con numerador |
| Confundir dominio con recorrido | "El dominio de ln(x) es ℝ" | Dom = (0,∞), Rec = ℝ |
| Orden de composición | (f∘g) ≠ (g∘f) en general | Siempre evaluar de adentro hacia afuera |

---

### F) FUENTE BIBLIOGRÁFICA

| Tema | Libro | Capítulo / Sección |
|------|-------|-------------------|
| Funciones: definición, dominio, recorrido | Stewart Precálculo 7ª Ed. | Cap. 2, Sección 2.1 |
| Gráficas y transformaciones | Stewart Precálculo 7ª Ed. | Cap. 2, Secciones 2.2–2.6 |
| Funciones a trozos y valor absoluto | Stewart Precálculo 7ª Ed. | Cap. 2, Sección 2.1 y 2.2 |
| Composición e inversa | Stewart Precálculo 7ª Ed. | Cap. 2, Secciones 2.7–2.8 |
| Polinomios y funciones racionales | Stewart Precálculo 7ª Ed. | Cap. 3, Secciones 3.1–3.7 |
| Exponenciales y logarítmicas | Stewart Precálculo 7ª Ed. | Cap. 4, Secciones 4.1–4.5 |
| Trigonometría | Stewart Precálculo 7ª Ed. | Cap. 5–6 |

---
---

## MATERIA 2: CÁLCULO 1 — LÍMITES Y DERIVADAS
**Fuente principal:** Stewart — *Cálculo: Trascendentes Tempranas*, 9ª Ed., Cengage (Caps. 1–4)

---

### A) TEMAS Y SUBTEMAS COMPLETOS

#### 1. Límites: introducción intuitiva y numérica
- Noción informal de límite: lím x→a f(x) = L
- Tablas de valores: aproximación por izquierda y derecha
- Límites por gráfica
- Cuando el límite no existe

#### 2. Límites laterales
- Límite por la izquierda: lím x→a⁻ f(x)
- Límite por la derecha: lím x→a⁺ f(x)
- Condición de existencia: lím x→a f(x) existe ↔ límites laterales iguales

#### 3. Límites: definición formal épsilon-delta
- Definición ε-δ de límite
- Verificación formal de límites simples
- Unicidad del límite

#### 4. Leyes de límites
- Suma, diferencia, producto, cociente, potencia, raíz
- Límite de una constante y de la identidad
- Límite de polinomios y funciones racionales (por sustitución directa)

#### 5. Técnicas para calcular límites
- Sustitución directa (cuando f es continua en a)
- Factorización y cancelación
- Racionalización (conjugado)
- Límites de funciones a trozos (por laterales)
- Teorema del emparedado (Sandwich)

#### 6. Indeterminaciones
- Forma 0/0: factorización, racionalización, L'Hôpital
- Forma ∞/∞: dividir por término dominante, L'Hôpital
- Formas 0·∞, ∞-∞, 1^∞, 0⁰, ∞⁰: transformaciones algebraicas
- Límites trigonométricos especiales: lím(senx/x)=1, lím((1-cosx)/x)=0

#### 7. Límites al infinito
- lím x→±∞ f(x): comportamiento asintótico
- Polinomios y funciones racionales en el infinito
- Funciones con radicales en el infinito (racionalización)
- Asíntotas horizontales como límites al infinito

#### 8. Límites infinitos
- lím x→a f(x) = ±∞
- Asíntotas verticales
- Comportamiento unilateral en asíntotas verticales

#### 9. Continuidad
- Definición formal de continuidad en un punto: f(a) definida, límite existe, f(a) = lím
- Continuidad lateral
- Clasificación de discontinuidades: removible, salto, infinita
- Continuidad en un intervalo
- Funciones continuas elementales (polinomios, exponenciales, etc.)
- Composición de funciones continuas
- Teorema del Valor Intermedio (TVI)
- Aplicación del TVI: existencia de raíces

#### 10. Derivada: definición
- Tasa de cambio instantánea
- Pendiente de la recta tangente
- Definición: f'(x) = lím h→0 [f(x+h)-f(x)]/h
- Derivada en un punto específico
- Notaciones: f'(x), dy/dx, Df, ẏ
- Derivabilidad implica continuidad (y su recíproco no)

#### 11. Reglas de derivación
- Regla de la constante: (c)' = 0
- Regla de la potencia: (xⁿ)' = nxⁿ⁻¹
- Suma y diferencia
- Producto: (fg)' = f'g + fg'
- Cociente: (f/g)' = (f'g - fg')/g²
- Cadena: (f(g(x)))' = f'(g(x))·g'(x)
- Derivadas de funciones trigonométricas: sen, cos, tan, csc, sec, cot
- Derivadas de funciones exponenciales: eˣ, aˣ
- Derivadas de funciones logarítmicas: ln(x), logₐ(x)
- Derivadas de funciones trigonométricas inversas: arcsen, arccos, arctan

#### 12. Derivada implícita
- Diferenciación implícita: d/dx aplicado a ambos lados
- Despejar dy/dx
- Pendiente de la tangente en curvas implícitas
- Derivadas de orden superior de curvas implícitas

#### 13. Derivadas de orden superior
- Segunda derivada f''(x): concavidad
- Tercera derivada y notación
- Interpretación física: aceleración

#### 14. Aplicaciones de la derivada — Análisis de funciones
- Máximos y mínimos locales: criterio de la primera derivada
- Criterio de la segunda derivada para extremos locales
- Valores extremos absolutos en intervalos cerrados (Teorema de Valor Extremo)
- Teorema de Rolle
- Teorema del Valor Medio (TVM)
- Función creciente/decreciente: prueba de la primera derivada
- Concavidad y puntos de inflexión: prueba de la segunda derivada
- Bosquejo completo de curvas

#### 15. Optimización
- Planteamiento del problema de optimización
- Función objetivo y restricción
- Encontrar máximo/mínimo absoluto
- Problemas de área, volumen, distancia, costo

#### 16. Regla de L'Hôpital
- Formas indeterminadas 0/0 y ∞/∞
- Aplicaciones repetidas
- Transformación de formas 0·∞, ∞-∞, 1^∞

#### 17. Tasas de cambio relacionadas
- Diferenciación implícita respecto al tiempo
- Variables relacionadas: posición, velocidad, área, volumen

---

### B) TIPOS DE PROBLEMAS

| Tipo | Ejemplo Input | Output Esperado |
|------|--------------|-----------------|
| Límite por sustitución | `lím x→3 (x² + 2x - 1)` | `9 + 6 - 1 = 14` |
| Límite con indeterminación 0/0 | `lím x→2 (x²-4)/(x-2)` | Factorizar → `lím x→2 (x+2) = 4` |
| Límite trigonométrico | `lím x→0 sen(3x)/x` | Reescribir como `3·sen(3x)/(3x) → 3·1 = 3` |
| Límite al infinito | `lím x→∞ (3x²-1)/(2x²+5)` | Dividir por x² → `3/2` |
| L'Hôpital | `lím x→0 (eˣ - 1)/x` | Aplicar L'H → `eˣ/1|₀ = 1` |
| Continuidad en punto | `¿Es f(x) = {x²-1 si x≠1; 3 si x=1} continua en x=1?` | lím = 0 ≠ f(1) = 3 → Discontinuidad removible |
| Derivada por definición | `f(x) = x² - 3x, hallar f'(x)` | Aplicar límite → `f'(x) = 2x - 3` |
| Derivada con regla cadena | `d/dx [sen(x³ + 1)]` | `cos(x³+1)·3x²` |
| Derivada implícita | `x² + y² = 25, hallar dy/dx` | `2x + 2y·dy/dx = 0 → dy/dx = -x/y` |
| Optimización | `Área máxima rectángulo con perímetro 20m` | L + W = 10, A = LW, máximo en L=W=5, A=25m² |
| Tasa relacionada | `Radio esfera crece a 2cm/s, ¿tasa de cambio del volumen cuando r=3?` | `dV/dt = 4πr²·dr/dt = 4π(9)(2) = 72π cm³/s` |

---

### C) REGLAS Y FÓRMULAS CLAVE

LÍMITES ESPECIALES:
lím x→0 sen(x)/x = 1
lím x→0 (1-cos(x))/x = 0
lím x→0 (eˣ-1)/x = 1
lím x→0 (aˣ-1)/x = ln(a)
lím x→∞ (1+1/x)ˣ = e
lím x→∞ xⁿ/eˣ = 0 (toda potencia cede ante exponencial)
lím x→0⁺ x·ln(x) = 0
DERIVADAS FUNDAMENTALES:
(xⁿ)' = nxⁿ⁻¹
(eˣ)' = eˣ
(aˣ)' = aˣ·ln(a)
(ln|x|)' = 1/x
(logₐx)' = 1/(x·ln a)
(senx)' = cosx (cscx)' = -cscx·cotx
(cosx)' = -senx (secx)' = secx·tanx
(tanx)' = sec²x (cotx)' = -csc²x
(arcsenx)' = 1/√(1-x²)
(arcccosx)' = -1/√(1-x²)
(arctanx)' = 1/(1+x²)
REGLAS:
(f±g)' = f'±g'
(cf)' = cf'
(fg)' = f'g + fg'
(f/g)' = (f'g - fg')/g²
(f(g(x)))' = f'(g(x))·g'(x) ← CADENA
CRITERIOS:
Extremo local: f'(a)=0 o no existe + cambio de signo
Máximo 2ª derivada: f'(a)=0 y f''(a)<0
Mínimo 2ª derivada: f'(a)=0 y f''(a)>0
Inflexión: f''(a)=0 + cambio de concavidad
text

---

### D) PROPIEDADES A IDENTIFICAR AUTOMÁTICAMENTE

- **Tipo de indeterminación** al sustituir en límite: 0/0, ∞/∞, 0·∞, ∞-∞, 1^∞, 0⁰, ∞⁰
- **Técnica de límite apropiada:** sustitución directa, factorización, racionalización, L'Hôpital, sandwich
- **Tipo de discontinuidad:** removible, salto, infinita
- **Regla de derivación a aplicar:** cadena, producto, cociente, reglas básicas
- **Funciones compuestas anidadas** para cadena múltiple
- **Puntos críticos** donde f'=0 o f' no existe
- **Signos de f' y f''** para análisis completo de comportamiento

---

### E) CASOS ESPECIALES Y ERRORES COMUNES

| Error | Descripción | Corrección |
|-------|-------------|------------|
| Cancelar sin verificar | (x²-4)/(x-2) → "simplificamos y ya" sin plantear límite | Siempre indicar que la cancelación es válida solo en el contexto del límite |
| L'Hôpital en no-indeterminación | Aplicar L'Hôpital a lím x→2 (x+1)/(x-3) = 3/(-1) | L'Hôpital solo aplica en formas 0/0 o ∞/∞ |
| Regla cadena omitida | d/dx[sen(x²)] = cos(x²) | Falta multiplicar por 2x |
| Derivar cociente como cociente de derivadas | (f/g)' = f'/g' | Es (f'g - fg')/g² |
| Confundir derivabilidad y continuidad | "Si es derivable, es continua y viceversa" | La reciprocidad no vale: |x| es continua en 0 pero no derivable |
| Error en derivada implícita | Olvidar dy/dx al derivar y | Cada vez que se deriva y respecto a x aparece dy/dx |
| Optimización: olvidar verificar máximo/mínimo | Hallar punto crítico sin confirmar que es extremo absoluto | Evaluar en extremos del intervalo y en punto crítico |

---

### F) FUENTE BIBLIOGRÁFICA

| Tema | Libro | Capítulo / Sección |
|------|-------|-------------------|
| Límites intuitivos y laterales | Stewart Cálculo 9ª Ed. | Cap. 2, Secciones 2.1–2.3 |
| Definición ε-δ | Stewart Cálculo 9ª Ed. | Cap. 2, Sección 2.4 |
| Indeterminaciones y técnicas | Stewart Cálculo 9ª Ed. | Cap. 2, Sección 2.3 |
| Límites al infinito | Stewart Cálculo 9ª Ed. | Cap. 2, Sección 2.6 |
| Continuidad | Stewart Cálculo 9ª Ed. | Cap. 2, Sección 2.5 |
| Derivada: definición | Stewart Cálculo 9ª Ed. | Cap. 3, Sección 3.1–3.2 |
| Reglas de derivación | Stewart Cálculo 9ª Ed. | Cap. 3, Secciones 3.3–3.6 |
| Derivada implícita | Stewart Cálculo 9ª Ed. | Cap. 3, Sección 3.5 |
| Aplicaciones de derivada | Stewart Cálculo 9ª Ed. | Cap. 4, Secciones 4.1–4.7 |
| L'Hôpital | Stewart Cálculo 9ª Ed. | Cap. 4, Sección 4.4 |
| Optimización | Stewart Cálculo 9ª Ed. | Cap. 4, Sección 4.7 |

---
---

## MATERIA 3: CÁLCULO 1 — INTEGRALES
**Fuente principal:** Stewart — *Cálculo: Trascendentes Tempranas*, 9ª Ed., Cengage (Caps. 5–8)

---

### A) TEMAS Y SUBTEMAS COMPLETOS

#### 1. Integral indefinida (antiderivada)
- Definición: F'(x) = f(x) → ∫f(x)dx = F(x) + C
- Tabla de integrales básicas
- Propiedad de linealidad
- Verificación de antiderivadas

#### 2. Sumas de Riemann e Integral Definida
- Partición de un intervalo
- Sumas izquierda, derecha y de punto medio
- Definición formal: ∫ₐᵇ f(x)dx = lím Σf(xᵢ*)Δx
- Interpretación geométrica: área neta bajo la curva
- Propiedades de la integral definida

#### 3. Teorema Fundamental del Cálculo (TFC)
- TFC Parte 1: d/dx[∫ₐˣ f(t)dt] = f(x)
- TFC Parte 2: ∫ₐᵇ f(x)dx = F(b) - F(a)
- Relación diferenciación-integración

#### 4. Técnicas de integración

**4.1 Sustitución (regla de la cadena inversa)**
- Sustitución u = g(x)
- Ajuste de diferenciales: du = g'(x)dx
- Cambio de límites en integral definida

**4.2 Integración por partes**
- Fórmula: ∫u dv = uv - ∫v du
- Criterio LIATE para elegir u
- Integración por partes repetida
- Caso cíclico (cuando la integral reaparece)

**4.3 Integrales trigonométricas**
- ∫senⁿx cosᵐx dx: estrategias según paridades de n, m
- ∫tanⁿx secᵐx dx
- Identidades trigonométricas auxiliares: sen²x = (1-cos2x)/2, etc.

**4.4 Sustitución trigonométrica**
- √(a²-x²) → x = a·sen θ
- √(a²+x²) → x = a·tan θ
- √(x²-a²) → x = a·sec θ
- Triángulos auxiliares

**4.5 Fracciones parciales**
- Factorización del denominador
- Casos: factores lineales distintos, lineales repetidos, cuadráticos irreducibles
- Descomposición y determinación de coeficientes
- Integración por fracciones parciales

**4.6 Integrales impropias**
- Tipo I: límite(s) de integración infinito(s)
- Tipo II: integrando con discontinuidad en [a,b]
- Convergencia y divergencia
- Test de comparación

#### 5. Área entre curvas
- Área = ∫ₐᵇ [f(x) - g(x)] dx (cuando f ≥ g)
- Área entre curvas que se cruzan: partir el intervalo
- Integración respecto a y

#### 6. Aplicaciones de la integral definida

**6.1 Volúmenes de sólidos de revolución**
- Método del disco: V = π∫[f(x)]² dx
- Método de la arandela (washer): V = π∫([f(x)]² - [g(x)]²) dx
- Método de las capas cilíndricas (shell): V = 2π∫x·f(x) dx

**6.2 Longitud de arco**
- L = ∫√(1 + [f'(x)]²) dx

**6.3 Área de superficie de revolución**
- S = 2π∫f(x)√(1 + [f'(x)]²) dx

**6.4 Trabajo**
- W = ∫F(x) dx

**6.5 Valor promedio de una función**
- f_prom = (1/(b-a))·∫ₐᵇ f(x) dx

---

### B) TIPOS DE PROBLEMAS

| Tipo | Ejemplo Input | Output Esperado |
|------|--------------|-----------------|
| Integral básica | `∫(3x² - 2x + 5)dx` | `x³ - x² + 5x + C` con cada paso |
| Sustitución | `∫2x·cos(x²)dx` | `u=x², du=2xdx → ∫cos(u)du = sen(u)+C = sen(x²)+C` |
| Por partes | `∫x·eˣdx` | `u=x, dv=eˣdx → xeˣ - ∫eˣdx = xeˣ - eˣ + C` |
| TFC cálculo numérico | `∫₀² (x³-x)dx` | `[x⁴/4 - x²/2]₀² = 4-2-0 = 2` |
| Integral impropia | `∫₁^∞ 1/x²dx` | `lím t→∞ [-1/x]₁ᵗ = 0-(-1) = 1` (converge) |
| Área entre curvas | `Área entre y=x² e y=x en [0,1]` | `∫₀¹(x-x²)dx = [x²/2-x³/3]₀¹ = 1/2-1/3 = 1/6` |
| Fracciones parciales | `∫(2x+1)/(x²-x-2)dx` | Factorizar, descomponer, integrar logarítmico |
| Volumen disco | `Volumen al rotar y=√x, [0,4] alrededor eje x` | `π∫₀⁴ x dx = π[x²/2]₀⁴ = 8π` |
| Sustitución trig | `∫√(4-x²)dx` | `x=2senθ → 2∫cos²θ dθ → ...` |

---

### C) REGLAS Y FÓRMULAS CLAVE

INTEGRALES BÁSICAS:
∫xⁿdx = xⁿ⁺¹/(n+1) + C (n ≠ -1)
∫1/x dx = ln|x| + C
∫eˣdx = eˣ + C
∫aˣdx = aˣ/ln(a) + C
∫senx dx = -cosx + C
∫cosx dx = senx + C
∫sec²x dx = tanx + C
∫csc²x dx = -cotx + C
∫secx·tanx dx = secx + C
∫cscx·cotx dx = -cscx + C
∫1/(1+x²)dx = arctanx + C
∫1/√(1-x²)dx = arcsenx + C
POR PARTES: ∫u dv = uv - ∫v du
LIATE: Logarítmica > Inversa trig > Algebraica > Trigonométrica > Exponencial
SUSTITUCIÓN TRIG:
√(a²-x²): x = a·senθ, dx = a·cosθdθ
√(a²+x²): x = a·tanθ, dx = a·sec²θdθ
√(x²-a²): x = a·secθ, dx = a·secθ·tanθdθ
TFC: ∫ₐᵇ f(x)dx = F(b) - F(a)
ÁREA: A = ∫ₐᵇ |f(x)-g(x)| dx
DISCO: V = π∫ₐᵇ [f(x)]² dx
ARANDELA: V = π∫ₐᵇ ([f(x)]²-[g(x)]²) dx
CAPAS: V = 2π∫ₐᵇ x·f(x) dx
ARCO: L = ∫ₐᵇ √(1+[f'(x)]²) dx
text

---

### D) PROPIEDADES A IDENTIFICAR AUTOMÁTICAMENTE

- **Técnica de integración adecuada** según la forma del integrando
- **Presencia de forma u·u'** para sustitución directa
- **Potencias de funciones trigonométricas** para técnica correspondiente
- **Radicales de la forma √(a²±x²)** para sustitución trigonométrica
- **Denominadores factorizables** para fracciones parciales
- **Integral impropia:** límite infinito o discontinuidad en el integrando
- **Función de la forma f(g(x))·g'(x)** para sustitución

---

### E) CASOS ESPECIALES Y ERRORES COMUNES

| Error | Descripción | Corrección |
|-------|-------------|------------|
| Olvidar +C en indefinida | `∫2x dx = x²` | Siempre escribir `+ C` |
| Error en cambio de límites en sustitución | No transformar a=f(a_original), b=f(b_original) | Cambiar límites o devolver sustitución |
| LIATE invertido | Tomar u = eˣ cuando hay término algebraico | Recordar que algebraica tiene mayor prioridad que exponencial |
| Caso cíclico de partes | `∫eˣsenx dx` termina siendo la misma integral → resolver como ecuación | Enseñar a mover al otro lado y despejar |
| Signo en sustitución trig | Olvidar que √(cos²θ) = |cosθ| | Especificar en qué cuadrante está θ |
| Convergencia de impropia | Integrar ∫₋₁¹ 1/x dx = 0 "por simetría" | El integrando tiene discontinuidad en x=0 → diverge |
| Fracciones parciales con cuadrático | (Ax+B)/(x²+1) usar solo A/(x²+1) | Cuadráticos irreducibles requieren Ax+B en numerador |

---

### F) FUENTE BIBLIOGRÁFICA

| Tema | Libro | Capítulo / Sección |
|------|-------|-------------------|
| Integral indefinida y antiderivadas | Stewart Cálculo 9ª Ed. | Cap. 4, Sección 4.9 |
| Sumas de Riemann e integral definida | Stewart Cálculo 9ª Ed. | Cap. 5, Secciones 5.1–5.2 |
| Teorema Fundamental del Cálculo | Stewart Cálculo 9ª Ed. | Cap. 5, Sección 5.3 |
| Sustitución | Stewart Cálculo 9ª Ed. | Cap. 5, Sección 5.5 |
| Integración por partes | Stewart Cálculo 9ª Ed. | Cap. 7, Sección 7.1 |
| Integrales trigonométricas | Stewart Cálculo 9ª Ed. | Cap. 7, Sección 7.2 |
| Sustitución trigonométrica | Stewart Cálculo 9ª Ed. | Cap. 7, Sección 7.3 |
| Fracciones parciales | Stewart Cálculo 9ª Ed. | Cap. 7, Sección 7.4 |
| Integrales impropias | Stewart Cálculo 9ª Ed. | Cap. 7, Sección 7.8 |
| Área entre curvas | Stewart Cálculo 9ª Ed. | Cap. 6, Sección 6.1 |
| Volúmenes | Stewart Cálculo 9ª Ed. | Cap. 6, Secciones 6.2–6.3 |
| Longitud de arco | Stewart Cálculo 9ª Ed. | Cap. 8, Sección 8.1 |

---
---

## MATERIA 4: CÁLCULO 2 Y 3 — MULTIVARIABLE
**Fuente principal:** Stewart — *Cálculo: Trascendentes Tempranas*, 9ª Ed., Cengage (Caps. 11–16)

---

### A) TEMAS Y SUBTEMAS COMPLETOS

#### 1. Sucesiones y series infinitas (Cap. 11)
- Sucesiones: definición, límite, monotonía, acotamiento
- Convergencia y divergencia de sucesiones
- Series: definición, sumas parciales
- Criterios de convergencia:
  - Prueba de la divergencia (término general)
  - Series geométricas: convergencia y suma S = a/(1-r)
  - Series telescópicas
  - Prueba de la integral
  - Prueba de comparación directa y por límite
  - Prueba de la razón (D'Alembert)
  - Prueba de la raíz (Cauchy)
  - Series alternantes (criterio de Leibniz), convergencia absoluta y condicional
- Series de potencias: radio e intervalo de convergencia
- Representación de funciones como series de potencias
- Series de Taylor y Maclaurin
- Series de Maclaurin importantes: eˣ, senx, cosx, ln(1+x), 1/(1-x)
- Aproximación mediante polinomios de Taylor, error de truncamiento

#### 2. Geometría en el espacio (Cap. 12)
- Vectores en ℝ³: componentes, magnitud, vector unitario
- Producto punto (escalar): definición, ángulo entre vectores, proyección
- Producto cruz (vectorial): definición, magnitud, propiedades, aplicaciones
- Rectas en el espacio: ecuación vectorial, paramétrica, simétrica
- Planos en el espacio: ecuación normal, distancia punto-plano
- Superficies cuádricas: esfera, elipsoide, paraboloide, hiperboloide, cono

#### 3. Funciones vectoriales y curvas en el espacio (Cap. 13)
- Curvas en el espacio: r(t) = ⟨f(t), g(t), h(t)⟩
- Límites y continuidad de funciones vectoriales
- Derivada de función vectorial: r'(t) = ⟨f'(t), g'(t), h'(t)⟩
- Vector tangente, vector unitario tangente
- Longitud de arco de una curva en el espacio
- Curvatura: κ = |r'×r''|/|r'|³
- Vectores normal principal y binormal (TNB)
- Movimiento en el espacio: velocidad, rapidez, aceleración
- Componentes tangencial y normal de la aceleración

#### 4. Derivadas parciales (Cap. 14)
- Funciones de varias variables: dominio, recorrido, gráficas, curvas de nivel
- Límites y continuidad de f(x,y)
- Derivadas parciales: definición, cálculo, notación ∂f/∂x
- Derivadas parciales de orden superior: mixtas (igualdad de Clairaut)
- Plano tangente a una superficie z = f(x,y)
- Diferencial total: dz = fₓdx + f_ydy
- Regla de la cadena para varias variables
- Derivada direccional: D_u f = ∇f · û
- Gradiente: ∇f = ⟨fₓ, f_y, f_z⟩, dirección de máximo crecimiento
- Máximos y mínimos locales: puntos críticos, criterio de la segunda derivada (determinante Hessiano)
- Multiplicadores de Lagrange: optimización con restricciones

#### 5. Integrales múltiples (Cap. 15)
- Integrales dobles sobre rectángulos: sumas de Riemann
- Integral iterada: Teorema de Fubini
- Integral doble sobre región general tipo I y tipo II
- Cambio de orden de integración
- Integral doble en coordenadas polares
- Aplicaciones: área, volumen, masa, centro de masa, momentos de inercia
- Integrales triples en coordenadas cartesianas
- Integrales triples en coordenadas cilíndricas
- Integrales triples en coordenadas esféricas
- Cambio de variables: Jacobiano J(u,v) = ∂(x,y)/∂(u,v)

#### 6. Cálculo vectorial (Cap. 16)
- Campos vectoriales: definición, graficación, campo gradiente
- Integral de línea de función escalar
- Integral de línea de campo vectorial: trabajo W = ∫_C F·dr
- Teorema fundamental de las integrales de línea (campos conservativos)
- Campo conservativo: F = ∇f ↔ ∮F·dr = 0 ↔ ∂F₁/∂y = ∂F₂/∂x
- Función potencial: hallazgo de f tal que ∇f = F
- **Teorema de Green:** ∮_C F·dr = ∬_D (∂Q/∂x - ∂P/∂y) dA
- Rotacional (curl): curl F = ∇ × F
- Divergencia: div F = ∇ · F
- Integrales de superficie (escalares y vectoriales: flujo)
- Parametrización de superficies
- **Teorema de Stokes:** ∬_S (curl F)·dS = ∮_C F·dr
- **Teorema de la Divergencia (Gauss):** ∯_S F·dS = ∭_E (div F) dV

---

### B) TIPOS DE PROBLEMAS

| Tipo | Ejemplo Input | Output Esperado |
|------|--------------|-----------------|
| Convergencia de serie | `Σ n!/nⁿ, n=1 a ∞` | Prueba de la razón → razón = 1/e < 1 → converge |
| Serie de Taylor | `Serie de Maclaurin de eˣ` | `Σ xⁿ/n! = 1 + x + x²/2! + ...`, radio ∞ |
| Derivada parcial | `f(x,y) = x³y² - 2xy, hallar fₓ, f_y, fₓy` | `fₓ=3x²y²-2y; f_y=2x³y-2x; fₓy=6x²y-2` |
| Gradiente y derivada direccional | `f(x,y)=x²+y², punto (1,2), dir u=(3/5, 4/5)` | `∇f=(2,4), D_uf = (2)(3/5)+(4)(4/5) = 22/5` |
| Multiplicadores de Lagrange | `Max f=xy sujeto a 2x+y=10` | `∇f=λ∇g → y=2λ, x=λ → y=2x; 2x+2x=10 → x=2.5, y=5` |
| Integral doble | `∬_R xy dA, R=[0,2]×[0,3]` | `∫₀²∫₀³ xy dy dx = ∫₀² x[y²/2]₀³ dx = ∫₀² 9x/2 dx = 9` |
| Cambio a polares | `∬ eˣ²⁺ʸ² dA, D: x²+y²≤4` | `∫₀²π∫₀² e^r² r dr dθ = π(e⁴-1)` |
| Integral triple esférica | `Volumen de esfera r=2` | `∫₀²π∫₀π∫₀² ρ²senφ dρdφdθ = 32π/3` |
| Teorema de Green | `∮ P dx+Q dy, C: cuadrado [0,1]²` | Calcular ∬(∂Q/∂x - ∂P/∂y)dA |

---

### C) REGLAS Y FÓRMULAS CLAVE

SERIES GEOMÉTRICA: Σ arⁿ = a/(1-r) si |r|<1
SERIES TAYLOR: f(x) = Σ f⁽ⁿ⁾(a)/n! · (x-a)ⁿ
MacLaurin comunes:
eˣ = Σ xⁿ/n! |x|<∞
senx = Σ (-1)ⁿx²ⁿ⁺¹/(2n+1)!
cosx = Σ (-1)ⁿx²ⁿ/(2n)!
1/(1-x) = Σ xⁿ |x|<1
GRADIENTE: ∇f = (∂f/∂x, ∂f/∂y, ∂f/∂z)
DERIVADA DIRECCIONAL: D_uf = ∇f · û
HESSIANO: H = fₓₓf_yy - (fₓy)²
H>0, fₓₓ<0 → máximo local
H>0, fₓₓ>0 → mínimo local
H<0 → punto silla
H=0 → sin conclusión
JACOBIANO: J = |∂(x,y)/∂(u,v)| = |∂x/∂u ∂x/∂v; ∂y/∂u ∂y/∂v|
POLARES: x=rcosθ, y=rsenθ, dA=r dr dθ
CILÍNDRICAS: x=rcosθ, y=rsenθ, z=z, dV=r dr dθ dz
ESFÉRICAS: x=ρsenφcosθ, y=ρsenφsenθ, z=ρcosφ, dV=ρ²senφ dρdφdθ
GREEN: ∮_C(P dx+Q dy) = ∬_D(∂Q/∂x - ∂P/∂y)dA
STOKES: ∬S(curl F)·dS = ∮∂S F·dr
GAUSS: ∯_∂E F·dS = ∭_E div F dV
text

---

### D) PROPIEDADES A IDENTIFICAR AUTOMÁTICAMENTE

- **Prueba de convergencia adecuada** para cada tipo de serie
- **Radio de convergencia** de series de potencias
- **Tipo de región** en integrales dobles (Tipo I, II, polar)
- **Sistema de coordenadas óptimo** (cartesiano, polar, cilíndrico, esférico) según la geometría
- **Campo conservativo:** verificar ∂P/∂y = ∂Q/∂x
- **Tipo de punto crítico** usando Hessiano
- **Teorema vectorial aplicable** según topología de la región/curva

---

### E) CASOS ESPECIALES Y ERRORES COMUNES

| Error | Descripción | Corrección |
|-------|-------------|------------|
| Prueba del término: condición necesaria pero no suficiente | Si lím aₙ = 0, concluir que la serie converge | Serie armónica Σ1/n diverge aunque aₙ→0 |
| Confundir orden de integración | Cambiar límites sin ajustar la región | Dibujar siempre la región D antes de iterar |
| Clairaut sin verificar continuidad | Asumir fₓy = f_yx siempre | Requiere que las derivadas sean continuas |
| Gradiente = dirección de la curva de nivel | Confundir ∇f con vector tangente | ∇f es PERPENDICULAR a las curvas de nivel |
| Jacobiano olvidado en cambio de variables | ∬ f(r,θ) dr dθ sin r | En polares, el área diferencial es r dr dθ |
| Orientación en Stokes/Green | No verificar orientación positiva (antihoraria) | La orientación determina el signo del resultado |

---

### F) FUENTE BIBLIOGRÁFICA

| Tema | Libro | Capítulo / Sección |
|------|-------|-------------------|
| Sucesiones y series | Stewart Cálculo 9ª Ed. | Cap. 11, Secciones 11.1–11.12 |
| Vectores y geometría espacial | Stewart Cálculo 9ª Ed. | Cap. 12 |
| Funciones vectoriales | Stewart Cálculo 9ª Ed. | Cap. 13 |
| Derivadas parciales | Stewart Cálculo 9ª Ed. | Cap. 14 |
| Integrales múltiples | Stewart Cálculo 9ª Ed. | Cap. 15 |
| Cálculo vectorial (Green, Stokes, Gauss) | Stewart Cálculo 9ª Ed. | Cap. 16 |

---
---

## MATERIA 5: ÁLGEBRA LINEAL
**Fuente principal:** Grossman — *Álgebra Lineal*, 8ª Ed., McGraw-Hill  
**Complemento:** Strang — *Introduction to Linear Algebra*, 6ª Ed.

---

### A) TEMAS Y SUBTEMAS COMPLETOS

#### 1. Matrices
- Definición, notación, tipos (cuadrada, triangular, diagonal, identidad, nula, simétrica, antisimétrica)
- Operaciones: suma, resta, multiplicación escalar, multiplicación matricial
- Propiedades del producto matricial (no conmutativo)
- Potencias de matrices
- Traspuesta: propiedades
- Matriz inversa: definición, unicidad, propiedades
- Matrices ortogonales: AᵀA = I

#### 2. Determinantes
- Determinante de matrices 2×2 y 3×3 (expansión de Sarrus)
- Expansión por cofactores (cualquier fila o columna)
- Propiedades: det(AB)=det(A)det(B), det(Aᵀ)=det(A)
- Efecto de operaciones de fila sobre el determinante
- Regla de Cramer
- Matriz adjunta y fórmula de la inversa: A⁻¹ = adj(A)/det(A)

#### 3. Sistemas de ecuaciones lineales
- Representación matricial: Ax = b
- Clasificación: compatible determinado, compatible indeterminado, incompatible
- Eliminación Gaussiana
- Eliminación de Gauss-Jordan (forma escalonada reducida RREF)
- Sistemas homogéneos: trivial y no trivial
- Teorema de Rouché-Frobenius: rango y soluciones
- Solución particular + solución homogénea

#### 4. Espacio vectorial
- Definición axiomática de espacio vectorial
- Subespacios: definición y verificación (cierre)
- Combinación lineal
- Dependencia e independencia lineal: definición y verificación
- Conjunto generador (span)
- Base de un espacio vectorial
- Dimensión
- Coordenadas respecto a una base

#### 5. Transformaciones lineales
- Definición: T(u+v)=T(u)+T(v), T(αu)=αT(u)
- Núcleo (kernel) e imagen de una transformación
- Teorema de la dimensión (rango-nulidad): dim(Ker T) + dim(Im T) = n
- Matriz de una transformación lineal
- Transformaciones en ℝ²: rotación, reflexión, proyección, escala
- Composición de transformaciones lineales

#### 6. Espacios con producto interno
- Producto interno: definición y propiedades
- Norma y distancia
- Ortogonalidad: vectores ortogonales, conjuntos ortogonales
- Base ortonormal
- Proceso de Gram-Schmidt
- Proyección ortogonal sobre un subespacio
- Complemento ortogonal

#### 7. Valores y vectores propios (eigenvalores y eigenvectores)
- Definición: Av = λv
- Ecuación característica: det(A - λI) = 0
- Polinomio característico
- Cálculo de eigenvalores y eigenvectores
- Espacio propio (eigenspace)
- Multiplicidad algebraica y geométrica
- Diagonalización: A = PDP⁻¹
- Condición de diagonalizabilidad
- Matrices simétricas: eigenvalores reales, eigenvectores ortogonales
- Diagonalización ortogonal: A = PDP ᵀ (P ortogonal)

#### 8. Aplicaciones
- Descomposición LU
- Mínimos cuadrados: solución de sistemas inconsistentes Ax = b → Aᵀ Ax = Aᵀ b
- Cadenas de Markov (introducción)
- Sistemas dinámicos discretos: xₙ₊₁ = Axₙ

---

### B) TIPOS DE PROBLEMAS

| Tipo | Ejemplo Input | Output Esperado |
|------|--------------|-----------------|
| Producto matricial | `A=[1,2;3,4], B=[5,6;7,8], AB=?` | Cada elemento con procedimiento de fila×columna |
| Determinante | `det [2,1,-1; 3,0,2; -1,2,1]` | Expansión cofactores → valor escalar con pasos |
| Sistema de ecuaciones | `2x+y=5; x-3y=1` (forma matricial) | Gauss-Jordan → RREF → solución única x=16/7, y=3/7 |
| Inversa 3×3 | `A=[1,2,0;0,1,3;1,0,1], hallar A⁻¹` | Método [A|I] → RREF → [I|A⁻¹] |
| Independencia lineal | `¿Son LD o LI {(1,2,3),(2,4,6),(1,0,1)}?` | Determinar si α₁v₁+α₂v₂+α₃v₃=0 tiene sol. no trivial |
| Eigenvalores y eigenvectores | `A=[4,1;2,3], λ=?, v=?` | det(A-λI)=0 → λ₁=5,λ₂=2; eigenvectores correspondientes |
| Diagonalización | `Diagonalizar A si es posible` | P=[v₁|v₂], D=diag(λ₁,λ₂), A=PDP⁻¹ |
| Gram-Schmidt | `Ortogonalizar {(1,1,0),(1,0,1),(0,1,1)}` | Proceso iterativo con proyecciones → base ortonormal |
| Mínimos cuadrados | `Ax=b inconsistente, mejor aproximación` | Aᵀ Ax̂ = Aᵀb → resolver sistema normal |

---

### C) REGLAS Y FÓRMULAS CLAVE

PROPIEDADES DETERMINANTE:
det(AB) = det(A)·det(B)
det(Aᵀ) = det(A)
det(A⁻¹) = 1/det(A)
det(cA) = cⁿ·det(A) (n=tamaño)
Intercambiar filas: cambia signo
Fila multiplicada por c: det se multiplica por c
Fila = combinación de otras: det = 0
INVERSA: A⁻¹ = (1/det(A))·adj(A)
A·A⁻¹ = A⁻¹·A = I
RANGO-NULIDAD: rango(A) + nulidad(A) = n (columnas)
EIGENVALORES: det(A - λI) = 0
DIAGONALIZACIÓN: A = PDP⁻¹
D = diag(λ₁,...,λₙ)
P = [v₁|v₂|...|vₙ] (eigenvectores columna)
GRAM-SCHMIDT:
e₁ = v₁/‖v₁‖
u₂ = v₂ - (v₂·e₁)e₁ → e₂ = u₂/‖u₂‖
...
PROYECCIÓN ORTOGONAL:
proyₐb = (b·a/‖a‖²)·a = (aᵀb/aᵀa)·a
MÍNIMOS CUADRADOS: Aᵀ Ax̂ = Aᵀ b
text

---

### D) PROPIEDADES A IDENTIFICAR AUTOMÁTICAMENTE

- **Tipo de matriz:** cuadrada, simétrica, ortogonal, diagonal, triangular
- **Invertibilidad:** det ≠ 0 ↔ rango completo ↔ columnas LI
- **Sistema compatible/incompatible** por rango de [A|b] vs rango de A
- **Diagonalizabilidad:** n eigenvectores LI
- **Simetría y sus implicaciones** (eigenvalores reales, base ortonormal)
- **Espacio nulo no trivial** → sistema homogéneo con soluciones infinitas

---

### E) CASOS ESPECIALES Y ERRORES COMUNES

| Error | Descripción | Corrección |
|-------|-------------|------------|
| Conmutatividad del producto | AB = BA | En general AB ≠ BA; demostrarlo con contraejemplo |
| Eigenvalores repetidos | Asumir que λ repetido siempre da eigenvector repetido | La multiplicidad geométrica puede ser menor que la algebraica |
| Det(A+B) = det(A)+det(B) | Error algebraico común | El determinante NO es lineal en la matriz completa |
| Inversa por cofactores vs. Gauss-Jordan | Usar adj/det para matrices grandes | Gauss-Jordan es computacionalmente más eficiente |
| Confundir base con conjunto generador | Todo generador es base | Una base es LI Y generadora |
| RREF y soluciones | Interpretar incorrectamente variables libres | Cada columna sin pivote genera un parámetro libre |

---

### F) FUENTE BIBLIOGRÁFICA

| Tema | Libro | Capítulo / Sección |
|------|-------|-------------------|
| Matrices y operaciones | Grossman Álgebra Lineal 8ª Ed. | Cap. 1 |
| Determinantes | Grossman Álgebra Lineal 8ª Ed. | Cap. 2 |
| Sistemas de ecuaciones | Grossman Álgebra Lineal 8ª Ed. | Cap. 1 y 3 |
| Espacios vectoriales | Grossman Álgebra Lineal 8ª Ed. | Cap. 4 |
| Transformaciones lineales | Grossman Álgebra Lineal 8ª Ed. | Cap. 6 |
| Producto interno, Gram-Schmidt | Grossman Álgebra Lineal 8ª Ed. | Cap. 5 |
| Eigenvalores y diagonalización | Grossman Álgebra Lineal 8ª Ed. | Cap. 7 |
| Mínimos cuadrados | Strang Introduction to Linear Algebra 6ª Ed. | Cap. 4 |

---
---

## MATERIA 6: ECUACIONES DIFERENCIALES
**Fuente principal:** Simmons — *Ecuaciones Diferenciales*, Ed. McGraw-Hill  
**Complemento:** Zill — *Ecuaciones Diferenciales con Aplicaciones de Modelado*, 11ª Ed., Cengage

---

### A) TEMAS Y SUBTEMAS COMPLETOS

#### 1. Introducción y clasificación
- Definición de EDO: relación entre función desconocida y sus derivadas
- Orden, grado, linealidad
- Solución general, particular y singular
- Problema de valor inicial (PVI)
- Dirección e isoclinas: campos de direcciones
- Existencia y unicidad (Teorema de Picard)

#### 2. Ecuaciones diferenciales de primer orden

**2.1 Separables**
- Forma: f(y)dy = g(x)dx
- Integrar ambos lados
- Aplicar condición inicial

**2.2 Lineales de primer orden**
- Forma estándar: dy/dx + P(x)y = Q(x)
- Factor integrante: μ(x) = e^(∫P(x)dx)
- Solución: y = (1/μ)·∫μQ dx + C/μ

**2.3 Exactas**
- Forma: M(x,y)dx + N(x,y)dy = 0
- Condición: ∂M/∂y = ∂N/∂x
- Hallar función potencial F tal que Fₓ=M, F_y=N
- Factor integrante para hacerla exacta

**2.4 Homogéneas**
- Forma: dy/dx = f(y/x)
- Sustitución: v = y/x → y = vx

**2.5 Bernoulli**
- Forma: dy/dx + P(x)y = Q(x)yⁿ
- Sustitución: w = y¹⁻ⁿ → ecuación lineal

**2.6 Aplicaciones de primer orden**
- Crecimiento y decaimiento: dP/dt = kP
- Ley de enfriamiento de Newton: dT/dt = k(T-Tₐ)
- Mezcla y dilución de soluciones
- Caída libre con resistencia del aire

#### 3. Ecuaciones diferenciales de segundo orden lineales

**3.1 Homogéneas con coeficientes constantes**
- Forma: ay'' + by' + cy = 0
- Ecuación característica: ar² + br + c = 0
- Casos: dos raíces reales distintas, raíz doble, raíces complejas conjugadas
- Base de soluciones y solución general

**3.2 No homogéneas: método de coeficientes indeterminados**
- Solución general = y_h + y_p
- Suposición de la forma de y_p según g(x): polinomial, exponencial, seno/coseno
- Modificación por duplicación (cuando y_p pertenece a y_h)

**3.3 No homogéneas: variación de parámetros**
- Fórmula general: y_p = y₁∫(y₂g/W)dx - y₂∫(y₁g/W)dx
- Wronskiano: W(y₁,y₂)
- Aplicable para g(x) cualquiera

**3.4 Reducción de orden**
- Conocida una solución y₁: sustitución y₂ = v(x)y₁

**3.5 Ecuación de Cauchy-Euler**
- Forma: ax²y'' + bxy' + cy = 0
- Sustitución x = eᵗ o prueba y = xᵐ

**3.6 Aplicaciones de segundo orden**
- Oscilaciones mecánicas: masa-resorte-amortiguador (my''+by'+ky=F(t))
- Casos: amortiguamiento sobre, sub y crítico
- Resonancia: frecuencia natural ω₀ = √(k/m)
- Circuitos RLC: Lq''+Rq'+q/C = E(t)

#### 4. Sistemas de ecuaciones diferenciales
- Sistemas de dos EDO lineales con coeficientes constantes
- Conversión de EDO de orden n a sistema de primer orden
- Método de valores propios para sistemas homogéneos
- Casos: eigenvalores reales distintos, repetidos, complejos
- Plano de fases: trayectorias, puntos de equilibrio
- Clasificación: nodo, espiral, punto silla, centro

#### 5. Transformada de Laplace
- Definición: ℒ{f(t)} = ∫₀^∞ e^{-st}f(t)dt = F(s)
- Tabla de transformadas fundamentales
- Propiedades:
  - Linealidad
  - Traslación en s: ℒ{eᵃᵗf(t)} = F(s-a)
  - Traslación en t (función de Heaviside): ℒ{uₐ(t)f(t-a)} = e^{-as}F(s)
  - Derivada: ℒ{f'(t)} = sF(s) - f(0); ℒ{f''} = s²F(s) - sf(0) - f'(0)
  - Convolución: ℒ{(f*g)(t)} = F(s)G(s)
- Transformada inversa: ℒ⁻¹
- Fracciones parciales en el dominio s
- Función de Heaviside (escalón unitario): uₐ(t)
- Delta de Dirac: δ(t-a), ℒ{δ(t-a)} = e^{-as}
- Solución de PVI mediante Laplace: transformar → resolver algebraicamente → transformar inversa

#### 6. Series de Fourier (introducción)
- Funciones periódicas: período, frecuencia
- Coeficientes de Fourier: a₀, aₙ, bₙ
- Serie de Fourier completa para función periódica 2L
- Series de senos y cosenos (funciones impares y pares)
- Convergencia y condiciones de Dirichlet
- Aplicación a ecuaciones diferenciales parciales (calor, onda)

---

### B) TIPOS DE PROBLEMAS

| Tipo | Ejemplo Input | Output Esperado |
|------|--------------|-----------------|
| EDO separable | `dy/dx = xy, y(0)=2` | Separar → integrar → ln|y|=x²/2+C → y=2e^(x²/2) |
| EDO lineal 1er orden | `y' + 2y = 4x, y(0)=1` | μ=e²ˣ, y=(2x-1+Ce^{-2x}), C con CI |
| EDO exacta | `(2xy+3)dx + (x²+4y)dy = 0` | Verificar ∂M/∂y=∂N/∂x → F(x,y)=x²y+3x+2y²=C |
| 2do orden homogénea | `y'' - 3y' + 2y = 0` | r²-3r+2=0 → r=1,2 → y=C₁eˣ+C₂e²ˣ |
| Coeficientes indeterminados | `y'' + y = sen(x)` | y_h=C₁cos+C₂sen; y_p=x(Acos+Bsen) (duplicación) |
| Laplace: PVI | `y'' + 4y = 0, y(0)=1, y'(0)=2` | ℒ: s²Y-s-2+4Y=0 → Y=(s+2)/(s²+4) → y=cos2t+sen2t |
| Heaviside | `f(t) = {0 si t<2; t-2 si t≥2}` | f(t)=u₂(t)(t-2) → ℒ{f}=e^{-2s}/s² |
| Sistema 2×2 | `x'=2x+y; y'=x+2y, x(0)=1, y(0)=0` | Eigenvalores λ=1,3; solución general con constantes |
| Serie Fourier | `f(x)=x en [-π,π]` | f(x)=Σ (2(-1)^{n+1}/n)·sen(nx) (serie de senos) |

---

### C) REGLAS Y FÓRMULAS CLAVE

FACTOR INTEGRANTE: μ(x) = e^{∫P(x)dx}
SOLUCIÓN LINEAL 1er ORDEN: y = (1/μ)[∫μQ dx + C]
ECUACIÓN CARACTERÍSTICA 2do ORDEN (ay''+by'+cy=0):
ar²+br+c=0
Δ>0: y = C₁e^{r₁x} + C₂e^{r₂x}
Δ=0: y = (C₁+C₂x)e^{rx}
Δ<0 (r=α±βi): y = e^{αx}(C₁cos(βx)+C₂sen(βx))
WRONSKIANO: W(y₁,y₂) = |y₁ y₂; y₁' y₂'|
VARIACIÓN DE PARÁMETROS:
y_p = -y₁∫(y₂g/W)dx + y₂∫(y₁g/W)dx
TABLA LAPLACE:
ℒ{1} = 1/s
ℒ{eᵃᵗ} = 1/(s-a)
ℒ{tⁿ} = n!/s^{n+1}
ℒ{sen(kt)} = k/(s²+k²)
ℒ{cos(kt)} = s/(s²+k²)
ℒ{f'(t)} = sF(s)-f(0)
ℒ{f''(t)} = s²F(s)-sf(0)-f'(0)
ℒ{eᵃᵗf(t)} = F(s-a)
ℒ{uₐ(t)f(t-a)} = e^{-as}F(s)
ℒ{δ(t-a)} = e^{-as}
FOURIER (período 2L):
a₀ = (1/L)∫₋ₗᴸ f(x)dx
aₙ = (1/L)∫₋ₗᴸ f(x)cos(nπx/L)dx
bₙ = (1/L)∫₋ₗᴸ f(x)sen(nπx/L)dx
f(x) = a₀/2 + Σ[aₙcos(nπx/L)+bₙsen(nπx/L)]
text

---

### D) PROPIEDADES A IDENTIFICAR AUTOMÁTICAMENTE

- **Tipo de EDO de primer orden:** separable, lineal, exacta, homogénea, Bernoulli
- **Tipo de raíces** de ecuación característica: reales distintas, repetidas, complejas conjugadas
- **¿y_p pertenece a y_h?** Para aplicar modificación (multiplicar por x) en coef. indeterminados
- **Forma de y_p** según g(x): polinomial → polinomial; eᵃˣ → Aeᵃˣ; sen/cos → Asen+Bcos
- **Condición de exactitud:** ∂M/∂y = ∂N/∂x antes de intentar resolver
- **Transformada de Laplace aplicable:** PVI con condiciones iniciales en t=0, funciones discontinuas (Heaviside, Dirac)
- **Función par o impar** para decidir serie de solo cosenos o solo senos
- **Tipo de punto de equilibrio** en sistema 2×2: eigenvalores determinan nodo/espiral/silla/centro

---

### E) CASOS ESPECIALES Y ERRORES COMUNES

| Error | Descripción | Corrección |
|-------|-------------|------------|
| EDO lineal vs. separable | Intentar separar y'+P(x)y=Q(x) directamente | Usar factor integrante; solo es separable si Q(x)=0 |
| Olvidar constante en exactas | Integrar Fₓ=M y olvidar que la "constante" depende de y | F(x,y) = ∫M dx + g(y); luego derivar en y para hallar g'(y) |
| Duplicación en coef. indeterminados | y''+y=cosx → y_p=Acosx (pero cosx ya está en y_h) | Multiplicar por x: y_p=x(Acosx+Bsenx) |
| Resonancia mal identificada | No detectar que ω_forzado = ω_natural | Verificar siempre si la frecuencia de g(t) coincide con la de y_h |
| Laplace: condiciones iniciales | Olvidar los términos f(0) y f'(0) al transformar derivadas | ℒ{y''}=s²Y-sy(0)-y'(0), nunca solo s²Y |
| Heaviside: traslación | ℒ{u₂(t)·t} ≠ e^{-2s}·(1/s²) | Debe ser u₂(t)·(t-2+2); reescribir siempre en términos de (t-a) |
| Coeficientes Fourier de función par | Calcular bₙ para función par | Si f es par, bₙ=0 automáticamente; solo calcular aₙ |
| Wronskiano cero | W=0 y concluir que las soluciones son LI | W=0 → soluciones LD → no forman base; buscar nueva solución |

---

### F) FUENTE BIBLIOGRÁFICA

| Tema | Libro | Capítulo / Sección |
|------|-------|-------------------|
| Clasificación y conceptos generales | Simmons Ecuaciones Diferenciales | Cap. 1 |
| EDO de primer orden: separables y lineales | Simmons / Zill 11ª Ed. | Cap. 2, Secciones 2.1–2.3 |
| Exactas y factores integrantes | Simmons / Zill 11ª Ed. | Cap. 2, Sección 2.4 |
| Aplicaciones de primer orden | Zill 11ª Ed. | Cap. 3 |
| EDO 2do orden: homogéneas | Simmons / Zill 11ª Ed. | Cap. 4, Secciones 4.1–4.3 |
| Coeficientes indeterminados | Zill 11ª Ed. | Cap. 4, Sección 4.4 |
| Variación de parámetros | Zill 11ª Ed. | Cap. 4, Sección 4.6 |
| Sistemas de EDO | Zill 11ª Ed. | Cap. 8–9 |
| Transformada de Laplace | Simmons / Zill 11ª Ed. | Cap. 7 |
| Series de Fourier | Simmons Ecuaciones Diferenciales | Cap. 10 |

---
---

## MATERIA 7: ESTADÍSTICA Y PROBABILIDAD
**Fuente principal:** Walpole, Myers — *Probabilidad y Estadística para Ingenieros*, 9ª Ed., Pearson  
**Complemento:** Devore — *Probabilidad y Estadística para Ingeniería y Ciencias*, 9ª Ed., Cengage

---

### A) TEMAS Y SUBTEMAS COMPLETOS

#### 1. Estadística descriptiva
- Población vs. muestra, parámetro vs. estadístico
- Tipos de datos: cualitativos, cuantitativos (discretos y continuos)
- Tablas de frecuencia: absoluta, relativa, acumulada
- Visualización: histograma, polígono de frecuencias, ogiva, boxplot, diagrama de tallo y hojas
- Medidas de tendencia central: media (x̄), mediana, moda
- Medidas de posición: percentiles, cuartiles, rango intercuartílico (IQR)
- Medidas de dispersión: rango, varianza (s²), desviación estándar (s), coeficiente de variación
- Medidas de forma: asimetría (sesgo), curtosis
- Datos atípicos (outliers): regla de 1.5·IQR

#### 2. Probabilidad
- Espacio muestral, eventos, álgebra de eventos
- Definición clásica, frecuentista y axiomática (Kolmogorov)
- Axiomas de probabilidad
- Reglas: complemento, suma P(A∪B) = P(A)+P(B)-P(A∩B)
- Probabilidad condicional: P(A|B) = P(A∩B)/P(B)
- Independencia de eventos: P(A∩B) = P(A)·P(B)
- Regla de la multiplicación
- Ley de la probabilidad total
- Teorema de Bayes

#### 3. Técnicas de conteo
- Principio fundamental de conteo
- Permutaciones: con y sin repetición
- Combinaciones: C(n,k) = n!/(k!(n-k)!)
- Combinaciones con repetición

#### 4. Variables aleatorias discretas
- Definición de variable aleatoria
- Función de masa de probabilidad (fmp): f(x) = P(X=x)
- Función de distribución acumulada (FDA): F(x) = P(X≤x)
- Valor esperado: E(X) = Σ x·f(x)
- Varianza: Var(X) = E(X²) - [E(X)]²
- Desviación estándar
- Distribuciones discretas:
  - **Bernoulli:** un ensayo, parámetro p
  - **Binomial:** B(n,p), fmp, media np, varianza np(1-p)
  - **Geométrica:** primer éxito
  - **Binomial negativa:** k-ésimo éxito
  - **Hipergeométrica:** muestreo sin reemplazo
  - **Poisson:** P(λ), eventos por unidad de tiempo/espacio, media=varianza=λ

#### 5. Variables aleatorias continuas
- Función de densidad de probabilidad (fdp): f(x) ≥ 0, ∫f(x)dx = 1
- P(a≤X≤b) = ∫ₐᵇ f(x)dx
- FDA: F(x) = ∫₋∞ˣ f(t)dt
- Valor esperado y varianza con integrales
- Distribuciones continuas:
  - **Uniforme:** U(a,b), media=(a+b)/2, var=(b-a)²/12
  - **Exponencial:** Exp(λ), fdp=λe^{-λx}, media=1/λ, propiedad sin memoria
  - **Normal:** N(μ,σ²), curva campana, simétrica
  - **Normal estándar:** Z~N(0,1), tabla z
  - **Estandarización:** Z = (X-μ)/σ
  - **Gamma:** generaliza la exponencial
  - **Chi-cuadrada:** χ²(ν), suma de normales estándar al cuadrado
  - **t de Student:** t(ν), muestras pequeñas con σ desconocido
  - **F de Snedecor:** F(ν₁,ν₂), cociente de varianzas
- Teorema del Límite Central (TLC)

#### 6. Distribuciones muestrales
- Estadísticos muestrales: X̄, S²
- Distribución muestral de X̄: E(X̄)=μ, Var(X̄)=σ²/n
- Aplicación del TLC: X̄ → N(μ, σ²/n) para n grande
- Distribución muestral de S²: (n-1)S²/σ² ~ χ²(n-1)
- Distribución de X̄₁-X̄₂

#### 7. Estimación puntual y por intervalos
- Estimadores: insesgamiento, eficiencia, consistencia
- Estimación puntual: X̄ para μ, S² para σ²
- **Intervalos de confianza para μ (σ conocido):** X̄ ± zα/2·(σ/√n)
- **Intervalos de confianza para μ (σ desconocido):** X̄ ± tα/2·(S/√n)
- **Intervalos de confianza para proporción p:** p̂ ± zα/2·√(p̂(1-p̂)/n)
- **Intervalos de confianza para σ²:** [(n-1)S²/χ²α/2, (n-1)S²/χ²₁₋α/2]
- Tamaño de muestra para un margen de error dado
- Nivel de confianza (1-α) e interpretación correcta

#### 8. Pruebas de hipótesis
- Hipótesis nula H₀ e hipótesis alternativa H₁
- Errores Tipo I (α) y Tipo II (β); potencia = 1-β
- Estadístico de prueba y valor crítico
- Valor-p: definición e interpretación
- Regiones de rechazo: una cola (izquierda/derecha) y dos colas
- **Prueba Z para μ (σ conocido)**
- **Prueba t para μ (σ desconocido):** t = (X̄-μ₀)/(S/√n)
- **Prueba para proporción p:** Z = (p̂-p₀)/√(p₀(1-p₀)/n)
- **Prueba para varianza σ²:** χ² = (n-1)S²/σ₀²
- **Prueba de dos muestras:** comparación de medias, varianzas iguales y desiguales
- **Prueba F para igualdad de varianzas:** F = S₁²/S₂²
- **Prueba χ² de bondad de ajuste**
- **Prueba χ² de independencia** (tablas de contingencia)

#### 9. Regresión y correlación
- Diagrama de dispersión
- Correlación de Pearson: r, interpretación de signo y magnitud
- Regresión lineal simple: ŷ = β̂₀ + β̂₁x
- Estimación por mínimos cuadrados: β̂₁ = Σ(xᵢ-x̄)(yᵢ-ȳ)/Σ(xᵢ-x̄)²; β̂₀ = ȳ - β̂₁x̄
- Coeficiente de determinación R²: % de variabilidad explicada
- Análisis de residuos: verificar supuestos
- Intervalos de confianza y predicción en regresión
- Regresión lineal múltiple (introducción): ŷ = β₀ + β₁x₁ + ... + βₖxₖ
- Tabla ANOVA en regresión

---

### B) TIPOS DE PROBLEMAS

| Tipo | Ejemplo Input | Output Esperado |
|------|--------------|-----------------|
| Estadística descriptiva | `Datos: {4,7,7,3,9,5,7,6}` | Media=6; Mediana=6.5; Moda=7; s²=3.43; s=1.85 |
| Probabilidad condicional | `P(A)=0.4, P(B)=0.3, P(A∩B)=0.12, ¿P(A|B)?` | P(A|B)=0.12/0.3=0.4 (A y B son independientes) |
| Bayes | `Test: sensibilidad 95%, especificidad 90%, prevalencia 1%, P(enfermo|+)?` | Aplicar Bayes → P≈8.7% (paradoja del test) |
| Binomial | `X~B(10, 0.3), P(X=4)=?` | C(10,4)(0.3)⁴(0.7)⁶ = 0.2001 |
| Poisson | `λ=2 llamadas/hora, P(X≤3)=?` | Σ e^{-2}2^k/k! para k=0,1,2,3 = 0.8571 |
| Normal estandarizada | `X~N(50,25), P(45≤X≤60)=?` | Z₁=(45-50)/5=-1; Z₂=(60-50)/5=2; P(-1≤Z≤2)=0.8186 |
| Intervalo de confianza | `n=25, x̄=80, s=10, 95% IC para μ` | t₀.₀₂₅,₂₄=2.064; IC=(75.87, 84.13) |
| Prueba de hipótesis | `H₀:μ=100, H₁:μ≠100, n=36, x̄=95, s=18, α=0.05` | t=(95-100)/(18/6)=-1.667; t_crítico=±2.030; No rechazar H₀ |
| Regresión lineal | `x={1,2,3,4,5}, y={2,4,5,4,5}` | β̂₁=0.7, β̂₀=2.0, ŷ=2+0.7x, R²=0.7 |
| Chi-cuadrada independencia | `Tabla 2×2 con frecuencias observadas/esperadas` | χ²=Σ(O-E)²/E, comparar con χ²_crítico |

---

### C) REGLAS Y FÓRMULAS CLAVE

ESTADÍSTICA DESCRIPTIVA:
x̄ = Σxᵢ/n
s² = Σ(xᵢ-x̄)²/(n-1) (muestral)
σ² = Σ(xᵢ-μ)²/N (poblacional)
CV = (s/x̄)·100%
PROBABILIDAD:
P(A∪B) = P(A)+P(B)-P(A∩B)
P(A|B) = P(A∩B)/P(B)
Bayes: P(Aᵢ|B) = P(B|Aᵢ)P(Aᵢ) / Σ P(B|Aⱼ)P(Aⱼ)
VALOR ESPERADO Y VARIANZA:
E(X) = Σx·f(x) o ∫x·f(x)dx
Var(X) = E(X²) - [E(X)]²
E(aX+b) = aE(X)+b
Var(aX+b) = a²Var(X)
DISTRIBUCIONES CLAVE:
Binomial: f(x)=C(n,x)pˣ(1-p)ⁿ⁻ˣ; μ=np; σ²=np(1-p)
Poisson: f(x)=e^{-λ}λˣ/x!; μ=σ²=λ
Normal: Z=(X-μ)/σ ~ N(0,1)
t-Student: t=(X̄-μ)/(S/√n), gl=n-1
Chi-cuad: χ²=(n-1)S²/σ², gl=n-1
F: F=S₁²/S₂², gl=(n₁-1, n₂-1)
TLC: X̄ ~ N(μ, σ²/n) aproximadamente para n≥30
INTERVALOS DE CONFIANZA:
μ (σ conocido): X̄ ± zα/2·(σ/√n)
μ (σ desconocido): X̄ ± tα/2·(S/√n)
p: p̂ ± zα/2·√(p̂(1-p̂)/n)
σ²: [(n-1)S²/χ²α/2 , (n-1)S²/χ²₁₋α/2]
REGRESIÓN LINEAL:
β̂₁ = Sxy/Sxx = Σ(xᵢ-x̄)(yᵢ-ȳ) / Σ(xᵢ-x̄)²
β̂₀ = ȳ - β̂₁x̄
R² = SCReg/SCTotal = 1 - SCError/SCTotal
r = Sxy / √(Sxx·Syy)
text

---

### D) PROPIEDADES A IDENTIFICAR AUTOMÁTICAMENTE

- **Tipo de distribución** según el contexto del problema: n ensayos→Binomial; tasa de ocurrencia→Poisson; tiempo hasta falla→Exponencial
- **σ conocido vs. desconocido** para decidir entre prueba Z o t
- **Tamaño de muestra:** n<30 y σ desconocido → t de Student
- **Una cola vs. dos colas** según la formulación de H₁
- **Grados de libertad** correctos para t, χ², F
- **Independencia de eventos** si P(A∩B)=P(A)P(B)
- **Tipo de prueba χ²:** bondad de ajuste (una variable) vs. independencia (tabla de contingencia)
- **Supuestos de regresión:** linealidad, homocedasticidad, normalidad de residuos

---

### E) CASOS ESPECIALES Y ERRORES COMUNES

| Error | Descripción | Corrección |
|-------|-------------|------------|
| Interpretar IC incorrectamente | "Hay 95% de prob. de que μ esté en el intervalo calculado" | El IC ya está calculado; la interpretación correcta es sobre el método: 95% de los IC construidos así contendrán a μ |
| P-valor como P(H₀ es verdadera) | Confundir p-valor con probabilidad de la hipótesis | P-valor = P(obtener estadístico tan o más extremo | H₀ verdadera) |
| Usar Z cuando corresponde t | n=15, σ desconocido → usar Z | Con σ desconocido y n pequeño, siempre t de Student |
| Varianza muestral con N en denominador | s² = Σ(xᵢ-x̄)²/n | Denominador correcto es n-1 (estimador insesgado) |
| Binomial para n grande y p pequeño | Calcular exactamente cuando λ=np≈constante | Aproximar por Poisson cuando n>20 y p<0.05 |
| Correlación implica causalidad | r=0.95 → "X causa Y" | Correlación no implica causalidad; puede haber variable confusora |
| R² alto garantiza buen modelo | R²=0.95 pero residuos tienen patrón | Analizar siempre residuos, no solo R² |

---

### F) FUENTE BIBLIOGRÁFICA

| Tema | Libro | Capítulo / Sección |
|------|-------|-------------------|
| Estadística descriptiva | Walpole et al. 9ª Ed. | Cap. 1 |
| Probabilidad y axiomas | Walpole et al. 9ª Ed. | Cap. 2 |
| Variables aleatorias discretas | Walpole et al. 9ª Ed. | Cap. 3 |
| Distribuciones discretas | Walpole et al. 9ª Ed. | Cap. 5 |
| Variables aleatorias continuas | Walpole et al. 9ª Ed. | Cap. 3–4 |
| Distribuciones continuas (Normal, t, χ², F) | Walpole et al. 9ª Ed. | Cap. 6 |
| Distribuciones muestrales y TLC | Walpole et al. 9ª Ed. | Cap. 8 |
| Estimación puntual e intervalos de confianza | Walpole et al. 9ª Ed. | Cap. 9 |
| Pruebas de hipótesis | Walpole et al. 9ª Ed. | Cap. 10 |
| Regresión y correlación | Walpole et al. 9ª Ed. | Cap. 11–12 |

---
---

## TABLA MAESTRA: TEMAS vs. DIFICULTAD vs. PRIORIDAD DE IMPLEMENTACIÓN

| # | Materia | Tema | Dificultad | Prioridad |
|---|---------|------|-----------|-----------|
| 1.1 | Precálculo | Dominio y recorrido de funciones | ⭐ Básica | 🔴 Alta |
| 1.2 | Precálculo | Valor absoluto: ecuaciones e inecuaciones | ⭐ Básica | 🔴 Alta |
| 1.3 | Precálculo | Funciones a trozos: evaluación y gráfica | ⭐ Básica | 🔴 Alta |
| 1.4 | Precálculo | Transformaciones de funciones | ⭐⭐ Media | 🔴 Alta |
| 1.5 | Precálculo | Composición de funciones y dominio | ⭐⭐ Media | 🔴 Alta |
| 1.6 | Precálculo | Función inversa | ⭐⭐ Media | 🔴 Alta |
| 1.7 | Precálculo | Asíntotas (vertical, horizontal, oblicua) | ⭐⭐ Media | 🔴 Alta |
| 1.8 | Precálculo | Inyectividad y biyectividad | ⭐⭐ Media | 🟡 Media |
| 1.9 | Precálculo | Funciones trigonométricas e inversas | ⭐⭐ Media | 🔴 Alta |
| 1.10 | Precálculo | Ecuaciones logarítmicas y exponenciales | ⭐⭐ Media | 🔴 Alta |
| 2.1 | Cálculo 1 | Límites por sustitución directa | ⭐ Básica | 🔴 Alta |
| 2.2 | Cálculo 1 | Límites laterales y existencia | ⭐⭐ Media | 🔴 Alta |
| 2.3 | Cálculo 1 | Indeterminación 0/0: factorización y racionalización | ⭐⭐ Media | 🔴 Alta |
| 2.4 | Cálculo 1 | Límites al infinito y asíntotas horizontales | ⭐⭐ Media | 🔴 Alta |
| 2.5 | Cálculo 1 | Continuidad y clasificación de discontinuidades | ⭐⭐ Media | 🔴 Alta |
| 2.6 | Cálculo 1 | Regla de L'Hôpital | ⭐⭐ Media | 🔴 Alta |
| 2.7 | Cálculo 1 | Derivadas: reglas básicas (potencia, suma) | ⭐ Básica | 🔴 Alta |
| 2.8 | Cálculo 1 | Regla del producto y cociente | ⭐⭐ Media | 🔴 Alta |
| 2.9 | Cálculo 1 | Regla de la cadena | ⭐⭐ Media | 🔴 Alta |
| 2.10 | Cálculo 1 | Derivada implícita | ⭐⭐⭐ Alta | 🔴 Alta |
| 2.11 | Cálculo 1 | Análisis completo de funciones (máx, mín, inflexión) | ⭐⭐⭐ Alta | 🔴 Alta |
| 2.12 | Cálculo 1 | Optimización | ⭐⭐⭐ Alta | 🔴 Alta |
| 2.13 | Cálculo 1 | Tasas de cambio relacionadas | ⭐⭐⭐ Alta | 🟡 Media |
| 3.1 | Cálculo 1 | Integral indefinida: reglas básicas | ⭐ Básica | 🔴 Alta |
| 3.2 | Cálculo 1 | Integral definida y TFC | ⭐⭐ Media | 🔴 Alta |
| 3.3 | Cálculo 1 | Sustitución (cambio de variable) | ⭐⭐ Media | 🔴 Alta |
| 3.4 | Cálculo 1 | Integración por partes | ⭐⭐⭐ Alta | 🔴 Alta |
| 3.5 | Cálculo 1 | Integrales trigonométricas | ⭐⭐⭐ Alta | 🟡 Media |
| 3.6 | Cálculo 1 | Sustitución trigonométrica | ⭐⭐⭐ Alta | 🟡 Media |
| 3.7 | Cálculo 1 | Fracciones parciales | ⭐⭐⭐ Alta | 🔴 Alta |
| 3.8 | Cálculo 1 | Integrales impropias | ⭐⭐⭐ Alta | 🟡 Media |
| 3.9 | Cálculo 1 | Área entre curvas | ⭐⭐ Media | 🔴 Alta |
| 3.10 | Cálculo 1 | Volúmenes de revolución (disco/arandela/capas) | ⭐⭐⭐ Alta | 🟡 Media |
| 3.11 | Cálculo 1 | Longitud de arco | ⭐⭐⭐ Alta | 🟢 Baja |
| 4.1 | Cálculo 2/3 | Sucesiones: límites y convergencia | ⭐⭐ Media | 🔴 Alta |
| 4.2 | Cálculo 2/3 | Series: criterios de convergencia | ⭐⭐⭐ Alta | 🔴 Alta |
| 4.3 | Cálculo 2/3 | Series de Taylor y Maclaurin | ⭐⭐⭐ Alta | 🔴 Alta |
| 4.4 | Cálculo 2/3 | Derivadas parciales de primer y segundo orden | ⭐⭐ Media | 🔴 Alta |
| 4.5 | Cálculo 2/3 | Gradiente y derivada direccional | ⭐⭐⭐ Alta | 🔴 Alta |
| 4.6 | Cálculo 2/3 | Optimización multivariable y Lagrange | ⭐⭐⭐ Alta | 🔴 Alta |
| 4.7 | Cálculo 2/3 | Integrales dobles (cartesianas y polares) | ⭐⭐⭐ Alta | 🔴 Alta |
| 4.8 | Cálculo 2/3 | Integrales triples (cilíndricas y esféricas) | ⭐⭐⭐ Alta | 🟡 Media |
| 4.9 | Cálculo 2/3 | Jacobiano y cambio de variables | ⭐⭐⭐ Alta | 🟡 Media |
| 4.10 | Cálculo 2/3 | Teorema de Green | ⭐⭐⭐⭐ Muy Alta | 🟡 Media |
| 4.11 | Cálculo 2/3 | Teorema de Stokes y Divergencia (Gauss) | ⭐⭐⭐⭐ Muy Alta | 🟢 Baja |
| 5.1 | Álgebra Lineal | Operaciones matriciales | ⭐ Básica | 🔴 Alta |
| 5.2 | Álgebra Lineal | Determinantes (2×2, 3×3, nxn) | ⭐⭐ Media | 🔴 Alta |
| 5.3 | Álgebra Lineal | Sistemas: Gauss y Gauss-Jordan | ⭐⭐ Media | 🔴 Alta |
| 5.4 | Álgebra Lineal | Matriz inversa | ⭐⭐ Media | 🔴 Alta |
| 5.5 | Álgebra Lineal | Independencia lineal y base | ⭐⭐⭐ Alta | 🔴 Alta |
| 5.6 | Álgebra Lineal | Transformaciones lineales | ⭐⭐⭐ Alta | 🟡 Media |
| 5.7 | Álgebra Lineal | Eigenvalores y eigenvectores | ⭐⭐⭐ Alta | 🔴 Alta |
| 5.8 | Álgebra Lineal | Diagonalización | ⭐⭐⭐ Alta | 🔴 Alta |
| 5.9 | Álgebra Lineal | Gram-Schmidt y ortogonalización | ⭐⭐⭐ Alta | 🟡 Media |
| 5.10 | Álgebra Lineal | Mínimos cuadrados | ⭐⭐⭐ Alta | 🟡 Media |
| 6.1 | Ec. Diferenciales | EDO separable + PVI | ⭐⭐ Media | 🔴 Alta |
| 6.2 | Ec. Diferenciales | EDO lineal 1er orden + factor integrante | ⭐⭐ Media | 🔴 Alta |
| 6.3 | Ec. Diferenciales | EDO exacta | ⭐⭐⭐ Alta | 🟡 Media |
| 6.4 | Ec. Diferenciales | Aplicaciones de 1er orden (crecimiento, mezcla, Newton) | ⭐⭐ Media | 🔴 Alta |
| 6.5 | Ec. Diferenciales | EDO 2do orden homogénea (3 casos) | ⭐⭐⭐ Alta | 🔴 Alta |
| 6.6 | Ec. Diferenciales | Coeficientes indeterminados | ⭐⭐⭐ Alta | 🔴 Alta |
| 6.7 | Ec. Diferenciales | Variación de parámetros | ⭐⭐⭐ Alta | 🟡 Media |
| 6.8 | Ec. Diferenciales | Aplicaciones mecánicas (masa-resorte, RLC) | ⭐⭐⭐ Alta | 🟡 Media |
| 6.9 | Ec. Diferenciales | Transformada de Laplace: tabla y propiedades | ⭐⭐⭐ Alta | 🔴 Alta |
| 6.10 | Ec. Diferenciales | Solución de PVI con Laplace | ⭐⭐⭐ Alta | 🔴 Alta |
| 6.11 | Ec. Diferenciales | Heaviside y Delta de Dirac con Laplace | ⭐⭐⭐⭐ Muy Alta | 🟡 Media |
| 6.12 | Ec. Diferenciales | Sistemas de EDO (eigenvalores) | ⭐⭐⭐⭐ Muy Alta | 🟡 Media |
| 6.13 | Ec. Diferenciales | Series de Fourier | ⭐⭐⭐⭐ Muy Alta | 🟢 Baja |
| 7.1 | Estadística | Estadística descriptiva completa | ⭐ Básica | 🔴 Alta |
| 7.2 | Estadística | Probabilidad: axiomas, complemento, unión | ⭐⭐ Media | 🔴 Alta |
| 7.3 | Estadística | Probabilidad condicional e independencia | ⭐⭐ Media | 🔴 Alta |
| 7.4 | Estadística | Teorema de Bayes | ⭐⭐⭐ Alta | 🟡 Media |
| 7.5 | Estadística | Distribución Binomial | ⭐⭐ Media | 🔴 Alta |
| 7.6 | Estadística | Distribución Poisson | ⭐⭐ Media | 🔴 Alta |
| 7.7 | Estadística | Distribución Normal y estandarización | ⭐⭐ Media | 🔴 Alta |
| 7.8 | Estadística | TLC y distribuciones muestrales | ⭐⭐⭐ Alta | 🔴 Alta |
| 7.9 | Estadística | Intervalos de confianza para μ, p, σ² | ⭐⭐⭐ Alta | 🔴 Alta |
| 7.10 | Estadística | Pruebas de hipótesis: Z, t, χ², F | ⭐⭐⭐ Alta | 🔴 Alta |
| 7.11 | Estadística | Regresión lineal simple | ⭐⭐⭐ Alta | 🔴 Alta |
| 7.12 | Estadística | Prueba χ² de bondad de ajuste e independencia | ⭐⭐⭐ Alta | 🟡 Media |
| 7.13 | Estadística | Regresión lineal múltiple | ⭐⭐⭐⭐ Muy Alta | 🟢 Baja |

---

### LEYENDA DE PRIORIDAD

| Símbolo | Prioridad | Criterio |
|---------|-----------|----------|
| 🔴 Alta | Implementar en MVP | Tema universal en todos los currículos de ingeniería; alta frecuencia en exámenes |
| 🟡 Media | Segunda iteración | Tema importante pero de cobertura parcial o nivel avanzado |
| 🟢 Baja | Versión futura | Tema especializado, bajo volumen de consultas o alta complejidad de implementación CAS |

---

> **Documento generado para:** MathCariola — Especificación Matemática Certificada v1.0  
> **Basado en:** Investigación Prompt 3 — Fuentes Matemáticas Certificadas  
> **Libros de referencia:** Stewart Precálculo 7ª Ed. · Stewart Cálculo 9ª Ed. · Grossman Álgebra Lineal 8ª Ed. · Simmons Ecuaciones Diferenciales · Walpole Estadística 9ª Ed.  
> **Total de temas catalogados:** 73 temas con clasificación completa
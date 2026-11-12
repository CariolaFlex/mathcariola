# ESTADO · MathCariola

**Estado al 2026-11-12, antes de la mudanza al Mac.** Revisado contra el disco, GitHub y Vercel (solo lectura).

## Qué es

Plataforma de matemáticas para ingeniería (Cálculo, Álgebra Lineal, EDO, Estadística) con CAS simbólico
(Cortex-JS), graficadoras 2D/3D (Mafs, Three.js) y solucionadores paso a paso. Next.js 16.2.3 + React 19,
Tailwind 4, Zustand, Jest. Detalle técnico en `README.md`; diseño original en `md/` (7 documentos).

- **Catálogo de Vectium** desde el 26-10: demo que vive solo en GitHub + Vercel. **No tiene nube**: nunca
  usó Firebase ni base de datos (Firebase se sacó del alcance el 11-04, commit `2ee3e9b`). No hay
  `docs/CONEXIONES.md` porque no hay nada que reconectar.
- **Sin desarrollo desde el 16-04-2026** (`3e263d5`). Los dos commits posteriores solo cambian rutas en `CLAUDE.md`.
- Origen: `C:\Universidad\mathcariola` → `C:\Proyectos\Academico\Universidad\mathcariola` (07-2026) →
  `C:\Vectium\catalogo\mathcariola` (26-10) → `C:\Cariolaspace\Vectium\catalogo\mathcariola` (07-11).
- Material universitario relacionado (`matricial\estudio`, AMDE): vive solo en Drive `Proyectos\Universidad\`. No se revisó aquí.

## Decisiones que viven en otros lados

- **No fijar este repo en el perfil de GitHub** (V51 del repo `empleo`, `05-plataformas/textos-listos.md`):
  su README habla de ingeniería y universidad, y REGLAS §1 del CV evita ese tema. Por la misma razón,
  la idea del 27-09 de sumarlo al portafolio quedó sin efecto.
- La memoria `workana_kit` (06-2026) todavía lo lista como "refuerzo técnico" del portafolio de Workana: es anterior a V51.

## Conexiones y cómo reconectar en el Mac

| Servicio | Dato | Nota |
|---|---|---|
| GitHub | `CariolaFlex/mathcariola`, **público**, rama única `main` | Sin PR, Actions, webhooks, stash, worktrees ni ramas `claude/*`. Historia revisada el 12-11: sin secretos ni datos de terceros; único autor `cariolaflex@gmail.com` |
| Vercel | Proyecto `mathcariola` (`prj_AkOwxk2xOiKL9njaCkHKxALnbnoE`), equipo `andres-cariolas-projects` (cuenta cariolaflex) | Dominio `mathcariola.vercel.app` (responde 200). Producción = `9684a65` (07-11), Node 24.x. **0 variables de entorno**, 0 crons. Git conectado: como el repo es público, el push publica bien (el bloqueo de Vercel solo afecta a repos privados) |
| Vercel (futuro) | Fase 00, tarea 3.5: pasar al equipo `vectium` | **Transferir el proyecto, no recrearlo** |
| Otros servicios | Ninguno | Sin Supabase, Firebase, Resend, pagos, OAuth ni n8n |

**Secretos:** no hay. No existe `.env.local`; la única variable (`NEXT_PUBLIC_BASE_URL`) es opcional y
el código cae a `https://mathcariola.vercel.app` (ver `.env.example`).

**Reconectar en el Mac:**
```bash
git clone https://github.com/CariolaFlex/mathcariola.git
cd mathcariola && npm install && npm run dev
vercel link --token "$VERCEL_TOKEN_CARIOLAFLEX" --scope andres-cariolas-projects   # solo si se va a publicar por CLI
```

**Datos del usuario:** la app guarda en el `localStorage` del navegador el tema, el historial del CAS
(`cas-history`), el graficador (`graph2d-state`) y el solucionador. Son datos de uso, no hay nada que rescatar.

## Fuera de git

- `next-env.d.ts` y `tsconfig.tsbuildinfo`: regenerables. `.swc/` vacía. Sin `node_modules` ni `.next` en disco.
- Drive `Proyectos\Trabajos Freelance\`: `MathCariola_Analisis_Proyecto.pdf` (29-04, no está en el repo) y
  la carpeta `MathCariola\` con los 7 `md/` en su versión original (3 idénticos; 4 son anteriores a
  sacar Firebase). El repo tiene la versión vigente. También `Experimentos Web\V6\V6-landing-math-platform.md`
  (una landing de z.ai para una plataforma de matemáticas, no es de este repo).
- Hubo una carpeta `PROYECTOS\PRODUCCION\MathCariola\Investigacion` en Documents (inventario del 07-09).
  Documents está fuera de límites: no se revisó.

## Chats

- 5 sesiones de Desktop de abril con `cwd` `C:\Universidad\mathcariola` ("Set up MathCariola…",
  "Fix SSL certificate renewal…", "Build project management study platform", "Clean up project structure
  for Vercel deployment", "Fix search display issue"). Están archivadas y **sin transcripción**: su trabajo
  solo queda en los commits. La de "project management study platform" (20 y 21-04) coincide con el arranque de
  `admi-project-assistant` (repo creado el 21-04, primer commit "Plataforma de Estudio Administración de Proyectos").
- Los chats de `C:\` que lo nombran después son solo inventarios de disco, Vercel o GitHub.

## Mac

- `CLAUDE.md` nombra rutas `C:\`. No hay scripts `.ps1` ni rutas fijas en el código.
- `.nvmrc` y `engines` piden Node 20; Vercel compila con Node 24. Funciona con cualquiera ≥ 20.
- No se probó `npm install` ni `npm run build` el 12-11.

## Pendientes menores (sin plan)

- No tiene el botón español/inglés del sello de los productos (sí tiene día/noche).
- `README.md` desactualizado en detalle: dice "99 tests" en 2 archivos (hoy hay 8 archivos en
  `src/__tests__/`) y el `git clone` apunta a `tu-usuario`.
- `src/lib/utils/exportShare.ts` documenta un dominio `mathcariola.edu` que no existe.

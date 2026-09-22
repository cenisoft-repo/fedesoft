# Portal Único del Afiliado — prototipo visual (Fedesoft)

Contexto para cualquier sesión que trabaje en este repositorio.
Idioma: interfaz, documentación y mensajes al usuario en **español**; código, identificadores y commits en **inglés**.

## Qué es esto

Prototipo navegable de alta fidelidad para la **presentación ejecutiva a Presidencia de Fedesoft**. Dos metas: enamorar visualmente y dejar ver el alcance del proyecto.

**No tiene backend.** Todos los datos son simulados y viven en `src/lib/mock/`. Ninguna pantalla guarda información ni llama a un servicio real. Si algo parece necesitar API, se resuelve con datos simulados.

El repositorio rector del proyecto —plan de ejecución, catálogo de requerimientos, arquitectura de información, consola de administración y ADRs— es `cenisoft-repo/platafor_fedesoft_v2026`.

## Identidad visual — manual de marca oficial

| Token | Hex | Uso |
|---|---|---|
| `--brand-navy` | `#0D2343` | Texto principal, titulares, superficies oscuras |
| `--brand-azure` | `#008BED` | **Solo acento**: la barra, íconos, indicadores, foco |
| `--navy-700` | `#11428a` | **Interactivo**: botones primarios y enlaces |
| `--muted` | `#637287` | Texto secundario |
| `--navy-abismo` | `#071429` | Lienzo de la página pública (derivado del navy) |

**Regla medida e innegociable:** `#008BED` da **3,6:1** sobre blanco. **Nunca** en texto de cuerpo ni en botones con texto blanco. Para eso está `#11428a` (9,7:1 ✓ AA).

**Tipografía:** Montserrat (principal, titulares e interfaz) · Lato (cuerpo) · JetBrains Mono (NIT, CUFE, folio, montos, con `tabular-nums`).

**La barra:** el gesto del wordmark — rectángulo de 3–4 px en azure. Un énfasis por vista, nunca repetido en cada tarjeta.

Detalle completo: `docs/design/identidad-visual.md` del repo rector.

## Estructura

```
src/app/(public)/     Landing cinematográfica en /
src/app/(portal)/     Portal del afiliado; el inicio vive en /portal
src/components/landing/  Campo generativo, revelado por scroll, escala
src/components/ui/    Primitivos: Boton, Card, Chip, PageHeader, Vacio
src/lib/demo.tsx      Contexto de escenarios de demostración
src/lib/mock/         Datos simulados con contenido real de Fedesoft
```

## Reglas de este prototipo

- **Nada de texto de relleno.** Se usa contenido real de Fedesoft: cursos de TrainingLAB y Series C+I con sus nombres exactos, las cuatro verticales, empresas del directorio, y formatos colombianos (NIT con dígito de verificación, pesos con punto de miles, CUFE, folio).
- **La autorización no se finge escondiendo botones.** El líder de talento recibe una pantalla de "sin permiso" explícita en facturación y oportunidades.
- **Cuatro escenarios de demostración** que recomponen la aplicación completa: gerente MIPYME al día, gerente con pago vencido, líder de talento, gerente de empresa grande con KAM. Cualquier pantalla nueva debe comportarse coherentemente en los cuatro.
- **Todos los estados**: carga, vacío, error y sin permiso. Un estado vacío nunca es una tarjeta que dice que no hay nada: desaparece o propone la acción siguiente.
- **Accesibilidad WCAG 2.1 AA**: contraste verificado, foco visible, navegación por teclado, etiquetas en formularios.
- **Tema claro y oscuro**, ambos cuidados. Los colores se definen en `:root` y se redefinen por token, nunca sueltos dentro de un bloque de tema.
- Sin bibliotecas de componentes. Los primitivos se construyen a medida para que el resultado se vea a Fedesoft y no a una plantilla.

## Dominio único (regla de Cenisoft)

Todos los proyectos de Fedesoft y Cenisoft viven bajo **un solo dominio institucional**. Una URL de proveedor (`*.vercel.app`) es provisional y no se comparte fuera del equipo.

## Comandos

```bash
pnpm install     # o npm install
pnpm dev         # http://localhost:3000
pnpm build       # compilación de producción — debe pasar sin errores de tipos
```

Despliegue: el proyecto está enlazado en Vercel, cada push a `main` redespliega.

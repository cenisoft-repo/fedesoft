# Portal Único del Afiliado — prototipo visual

Prototipo navegable de alta fidelidad del portal de afiliados de **Fedesoft**, construido para la presentación ejecutiva. **No tiene backend**: todos los datos son simulados y viven en `src/lib/mock/`.

> ⚠️ Es un prototipo visual sin sistema detrás. Ninguna pantalla guarda información ni se conecta a un servicio real.

## Ejecutar

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Otros comandos: `pnpm build` (compilación de producción) · `pnpm typecheck`.

## Modo demostración

El control flotante de la esquina inferior derecha cambia **toda la aplicación en vivo** entre cuatro escenarios. Es la herramienta central de la presentación:

| Escenario | Qué demuestra |
|---|---|
| **Gerente · MIPYME al día** | La experiencia completa: todo habilitado, certificado descargable |
| **Gerente · pago vencido** | Las reglas de negocio: el certificado se bloquea y se explica qué falta |
| **Líder de talento humano** | La segmentación por rol: ve formación, no ve facturación |
| **Gerente · empresa grande** | El Eje 2: aparece la cuenta estratégica con su gestora asignada |

También hay conmutador de tema claro/oscuro en el encabezado.

## Pantallas

| Ruta | Qué muestra |
|---|---|
| `/` | **Inicio** — personalizado por rol, segmento y estado. Reemplaza las tres puertas confusas de hoy |
| `/facturacion` | Estado de cuenta con cargos, total por pagar y facturas electrónicas |
| `/facturacion/pagar` | **Recorrido crítico**: resumen → pasarela → confirmación server-to-server → factura con CUFE → certificado habilitado |
| `/facturacion/certificado` | Certificado con folio y QR de verificación, sello #SoyAfiliadoFedesoft. Incluye el **estado bloqueado** |
| `/empresa` | Perfil editable de la empresa y contactos. El cambio alimenta el directorio |
| `/formacion` | Catálogo, inscripción de un clic e **historial del equipo** |
| `/directorio` | Buscador con las tres pestañas actuales e insignia de verificado derivada del estado real |
| `/cuenta-estrategica` | Panel consolidado para empresas grandes, con gestora de cuenta |
| `/oportunidades` | Convocatorias Cenisoft filtradas por el perfil de la empresa |
| `/admin` | Un vistazo de la **ficha 360** que ve el equipo interno de Fedesoft |

## Decisiones de construcción

- **Next.js 16 (App Router) + TypeScript + Tailwind 4.** Sin bibliotecas de componentes: todo se construyó a medida para que se vea a Fedesoft y no a una plantilla.
- **Tokens de marca** derivados del logo, en `src/app/globals.css`. Regla medida: el azul de marca `#0F8BFF` da 3,4:1 sobre blanco, así que **solo se usa en acentos**; para texto interactivo y botones va `#0A63BF` (5,9:1 ✓ AA).
- **La barra** —el gesto de las horizontales de la `f` y la `t` del logo— es el motivo gráfico, con un énfasis por pantalla.
- **Contenido real de Fedesoft** en los datos simulados: cursos de TrainingLAB, Series C+I, TIC Talks, las cuatro verticales, empresas del directorio y formatos colombianos (NIT con dígito de verificación, pesos, CUFE, folio).
- **La autorización no se finge escondiendo botones**: el líder de talento recibe una pantalla de "sin permiso" explícita en las rutas de facturación.

## Qué sigue

Este prototipo no es desechable: sus tokens y componentes se convierten en `packages/ui` y sus pantallas en el *shell* de experiencia cuando arranque la Fase 0.

El brief completo que lo originó, junto con el plan de ejecución, el catálogo de requerimientos y la arquitectura de información, vive en el repositorio `cenisoft-repo/platafor_fedesoft_v2026`.

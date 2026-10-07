# Portal Único del Afiliado — prototipo visual

Prototipo navegable de alta fidelidad del portal de afiliados de **Fedesoft**, construido para la presentación ejecutiva. **Por defecto no tiene backend**: todos los datos son simulados y viven en `src/lib/mock/`.

> ⚠️ Sin configuración es un prototipo visual sin sistema detrás: ninguna pantalla guarda información ni se conecta a un servicio real. La única excepción es el **modo API** (abajo), que solo se activa a propósito.

## Ejecutar

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Otros comandos: `pnpm build` (compilación de producción) · `pnpm typecheck`.

## Modo API (opcional): identidad real

Con `NEXT_PUBLIC_API_URL` definida **al compilar**, la identidad deja de ser simulada y usa el API del repo rector (`cenisoft-repo/platafor_fedesoft_v2026`, ADR-008):

| Qué | En modo API |
|---|---|
| `/entrar` y `/admin/entrar` | Login OIDC real (Keycloak en local); la consola exige segundo factor |
| Encabezado del portal y de la consola | Usuario, empresa y roles de la sesión real; cierre de sesión en el API y en el proveedor |
| Invitaciones pendientes | Se aceptan o rechazan al entrar |
| `/empresa/contactos` | Invitar, cambiar rol, desactivar y reactivar contra el API; si el servidor responde 403, la pantalla lo explica |
| `/admin/usuarios` | Búsqueda, ficha, roles internos, bloqueo con motivo y cierre de sesiones contra el API |
| Todo lo demás | Sigue simulado. El escenario de demostración se elige según el rol y el segmento reales |

Para correrlo en local (el API redirige al portal en el puerto 3001):

```bash
# En platafor_fedesoft_v2026: Keycloak, base de datos y API
pnpm infra:up && pnpm db:migrate && pnpm db:seed
#   en apps/api/.env: PORTAL_URL y CONSOLE_URL = http://localhost:3001
pnpm --filter @fedesoft/api build && pnpm --filter @fedesoft/api start

# Aquí
NEXT_PUBLIC_API_URL=http://localhost:3000 pnpm build
pnpm start -p 3001                # http://localhost:3001/entrar
```

Usuarios de prueba y secreto TOTP: `infra/docker/keycloak/README.md` del repo rector. La sesión vive en una cookie HttpOnly del API que este código nunca lee; el prototipo solo maneja el token CSRF que el API entrega. El despliegue de Vercel se compila **sin** esa variable y sigue siendo 100 % simulado.

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
| `/entrar` · `/entrar/recuperar` | Acceso con correo y proveedor de identidad, invitaciones y rechazos explicados |
| `/empresa/contactos` | **Contactos y accesos**: el gerente invita, cambia roles, desactiva y reactiva |
| `/admin` | Un vistazo de la **ficha 360** que ve el equipo interno de Fedesoft |
| `/admin/entrar` · `/admin/usuarios` | Consola con segundo factor obligatorio; usuarios, roles internos, bloqueo y sesiones |

## Decisiones de construcción

- **Next.js 16 (App Router) + TypeScript + Tailwind 4.** Sin bibliotecas de componentes: todo se construyó a medida para que se vea a Fedesoft y no a una plantilla.
- **Tokens de marca** derivados del logo, en `src/app/globals.css`. Regla medida: el azul de marca `#0F8BFF` da 3,4:1 sobre blanco, así que **solo se usa en acentos**; para texto interactivo y botones va `#0A63BF` (5,9:1 ✓ AA).
- **La barra** —el gesto de las horizontales de la `f` y la `t` del logo— es el motivo gráfico, con un énfasis por pantalla.
- **Contenido real de Fedesoft** en los datos simulados: cursos de TrainingLAB, Series C+I, TIC Talks, las cuatro verticales, empresas del directorio y formatos colombianos (NIT con dígito de verificación, pesos, CUFE, folio).
- **La autorización no se finge escondiendo botones**: el líder de talento recibe una pantalla de "sin permiso" explícita en las rutas de facturación.

## Qué sigue

Este prototipo no es desechable: sus tokens y componentes se convierten en `packages/ui` y sus pantallas en el *shell* de experiencia cuando arranque la Fase 0.

El brief completo que lo originó, junto con el plan de ejecución, el catálogo de requerimientos y la arquitectura de información, vive en el repositorio `cenisoft-repo/platafor_fedesoft_v2026`.

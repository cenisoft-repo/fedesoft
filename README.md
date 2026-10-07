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

El control flotante de la esquina inferior derecha cambia **toda la aplicación en vivo** entre siete escenarios: uno por persona con acceso y el de pago vencido. Desde ese mismo control se abre la consola interna, que el afiliado no ve en su menú.

| Escenario | Qué demuestra |
|---|---|
| **Gerente · MIPYME al día** | La experiencia completa: todo habilitado, certificado descargable |
| **Gerente · pago vencido** | Las reglas de negocio: el certificado se bloquea y se explica qué falta |
| **Talento humano · MIPYME** | La segmentación por rol: ve formación, no ve facturación |
| **Contacto · MIPYME** | El perfil más acotado: consulta la empresa y se inscribe a formación propia |
| **Gerente · empresa grande** | El Eje 2: aparece la cuenta estratégica con su gestora asignada |
| **Talento humano · empresa grande** | Rol y segmento juntos: ve la cuenta estratégica, no la facturación |
| **Contacto · empresa grande** | Aunque la empresa sea grande, el contacto no entra a la cuenta estratégica |

También hay conmutador de tema claro/oscuro en el encabezado.

## Quién ve qué

La separación por rol vive en un solo archivo, `src/lib/acceso.ts`. Transcribe las matrices del repo rector: `docs/03-arquitectura-de-informacion.md` §4 para el portal y `docs/01-consola-administracion.md` §2.2 para la consola.

- **El menú muestra solo lo que el rol alcanza.**
- **Entrar por la URL a un módulo ajeno da una pantalla explícita de «sin permiso»**, que dice quién sí tiene acceso. No basta con esconder el botón.
- **Los niveles:**
  - **gestiona:** ve y cambia;
  - **solo lectura:** consulta sin cambiar;
  - **solo tus empresas asignadas:** el gestor de cuenta ve únicamente las empresas a su cargo;
  - **solo tu área:** auditoría y resultados filtrados por el área de quien opera.

**Cuentas de demostración del portal** (`/entrar`; cualquier contraseña sirve):

| Rol | Persona | Empresa |
|---|---|---|
| Gerente | Camilo Restrepo | Datalabs Andina (MIPYME) |
| Talento humano | Diana Salazar | Datalabs Andina |
| Contacto | Julián Ospina | Datalabs Andina |
| Gerente | Marcela Betancur | Sistemas Vértice (grande) |
| Talento humano | Ricardo Peñaloza | Sistemas Vértice |
| Contacto | Sandra Quintero | Sistemas Vértice |

Además: Laura Gómez (invitación pendiente), Andrés Mora (acceso desactivado) y Mauricio Lara (cuenta bloqueada).

**Cuentas de demostración de la consola** (`/admin/entrar`; cualquier contraseña y el código de segundo factor que muestra la pantalla). Hay una por rol interno:

| Rol | Persona | Módulos |
|---|---|---|
| Super Admin | Natalia Rincón | Los 10 |
| Operaciones · Afiliación | Lorena Mejía | Gestiona afiliados y solicitudes; verifica y modera el directorio; consulta cartera, formación, campañas y cuentas |
| Cartera · Financiera | Andrea Villamil | Gestiona cartera; consulta afiliados, solicitudes y contenidos |
| Formación y comunidades | Paula Andrade | Gestiona formación; consulta afiliados y contenidos |
| Comunicaciones · Contenido | Valentina Duarte | Gestiona contenidos; consulta afiliados, formación y relacionamiento |
| Relacionamiento · Verticales | Germán Castaño | Gestiona relacionamiento; consulta afiliados, contenidos y cuentas |
| Gestor de cuenta | Marcela Ospina | Solo sus empresas asignadas (Sistemas Vértice) en cada módulo; consulta directorio e insights |
| Dirección | Carolina Vélez | Lectura de todo; exporta resultados |
| Auditor | Jorge Prieto | Lectura de todo; exporta resultados y auditoría |

Resultados y Auditoría los ven todos los roles, pero cada área ve solo lo suyo. En Contenidos, campañas y directorio tienen permisos distintos y cada sección aplica el suyo.

**Dos diferencias con la matriz:**
- **Dirección consulta las solicitudes pero no las aprueba.** La matriz le da una aprobación de segundo nivel, pero ese flujo aún no está definido (`docs/01` §10).
- **En modo API el servidor decide por permisos**, así que no existen los alcances «solo tus empresas» ni «solo tu área». Además, el API siembra hoy 4 de los 9 roles internos.

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
| `/admin` | **Ficha 360** de la empresa (el gestor de cuenta ve la suya asignada) |
| `/admin/solicitudes` · `/admin/cartera` | Bandeja de solicitudes de afiliación y tablero de cartera |
| `/admin/formacion` | Programación de TrainingLAB, TIC Talks y Series C+I: cupos, inscripciones y comunidades |
| `/admin/contenidos` | Campañas, insights publicados y moderación del directorio |
| `/admin/relacionamiento` | Verticales, mesas y convocatorias con sus postulaciones |
| `/admin/cuentas` | Cuentas estratégicas: salud, plan de acción y registro de interacciones |
| `/admin/resultados` | Indicadores del gremio y de cada área |
| `/admin/auditoria` | Registro de solo adición, filtrable por área |
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

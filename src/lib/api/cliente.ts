/**
 * Cliente del API de identidad (repo rector, ADR-008).
 *
 * El prototipo funciona sin backend por defecto. Solo si se define
 * `NEXT_PUBLIC_API_URL` en la compilación, la identidad (login, sesión,
 * accesos de la empresa y usuarios de la consola) se lee y escribe en el API
 * real. El resto de pantallas sigue con datos simulados.
 *
 * La sesión vive en una cookie HttpOnly que fija el API: este código nunca la
 * ve. Lo único que maneja es el token CSRF que el API entrega en la vista de
 * sesión, y que exige en todo método que cambia datos.
 */

export const API_URL: string | null = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "") || null;
export const MODO_API = API_URL !== null;

export type Superficie = "portal" | "consola";

/** Prefijo de rutas de cada superficie en el API. */
export const PREFIJO: Record<Superficie, string> = { portal: "/v1", consola: "/admin/v1" };

export class ErrorApi extends Error {
  constructor(readonly status: number, mensaje: string) {
    super(mensaje);
    this.name = "ErrorApi";
  }
}

/** Un token CSRF por superficie: cada una tiene su propia sesión. */
const csrf: Record<Superficie, string | null> = { portal: null, consola: null };

export function fijarCsrf(superficie: Superficie, token: string | null): void {
  csrf[superficie] = token;
}

/** URL a la que se navega (no se pide por fetch) para iniciar el login OIDC. */
export function urlLogin(superficie: Superficie, returnTo: string): string {
  const url = new URL(`${API_URL ?? ""}${PREFIJO[superficie]}/auth/login`);
  url.searchParams.set("returnTo", returnTo);
  return url.toString();
}

const METODOS_SEGUROS = new Set(["GET", "HEAD"]);

export async function api<T>(
  superficie: Superficie,
  ruta: string,
  opciones: { method?: string; body?: unknown } = {},
): Promise<T> {
  if (!API_URL) throw new ErrorApi(0, "El modo API no está activo.");
  const method = opciones.method ?? "GET";
  const headers: Record<string, string> = { accept: "application/json" };
  if (opciones.body !== undefined) headers["content-type"] = "application/json";
  const token = csrf[superficie];
  if (!METODOS_SEGUROS.has(method) && token) headers["x-csrf-token"] = token;

  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}${PREFIJO[superficie]}${ruta}`, {
      method,
      headers,
      credentials: "include",
      body: opciones.body !== undefined ? JSON.stringify(opciones.body) : undefined,
    });
  } catch {
    throw new ErrorApi(0, "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.");
  }

  if (!respuesta.ok) {
    const datos = (await respuesta.json().catch(() => ({}))) as { message?: unknown };
    throw new ErrorApi(respuesta.status, mensajeDeError(respuesta.status, datos.message));
  }
  if (respuesta.status === 204) return undefined as T;
  return (await respuesta.json()) as T;
}

/**
 * El API ya responde en español cuando una regla de negocio impide algo. Los
 * errores de validación llegan como lista técnica y en inglés: esos se
 * traducen a un mensaje útil, sin mostrar el detalle interno.
 */
function mensajeDeError(status: number, mensaje: unknown): string {
  if (typeof mensaje === "string" && mensaje.length > 0 && status !== 500) return mensaje;
  switch (status) {
    case 400:
      return "Revisa los datos del formulario.";
    case 401:
      return "Tu sesión terminó. Vuelve a ingresar.";
    case 403:
      return "No tienes permiso para esta acción.";
    case 404:
      return "No encontramos lo que buscas.";
    case 429:
      return "Demasiados intentos seguidos. Espera un momento y vuelve a intentar.";
    default:
      return "Algo salió mal en el servidor. Inténtalo de nuevo en unos minutos.";
  }
}

import { fetchWithKeycloak } from "@/lib/keycloak/keycloak-fetch"
import type {
  ApiConnectionSource,
  ConnectionErrorListener,
  ConnectionErrorState,
} from "@/types/types"

export type {
  ApiConnectionSource,
  ConnectionErrorListener,
  ConnectionErrorState,
} from "@/types/types"

const listeners = new Set<ConnectionErrorListener>()
let currentErrorState: ConnectionErrorState = {
  hasError: false,
  failedApis: [],
  messages: [],
}

export function subscribeToConnectionError(
  listener: ConnectionErrorListener
): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function buildConnectionErrorMessage(apiSource: ApiConnectionSource): string {
  switch (apiSource) {
    case "auth":
      return "Error de conexión con api auth"
    case "produccion":
      return "Error de conexión con api produccion"
    default:
      return "Error de conexión con la api"
  }
}

function buildStateFromFailedApis(
  failedApis: ApiConnectionSource[]
): ConnectionErrorState {
  const uniqueFailedApis = Array.from(new Set(failedApis))
  return {
    hasError: uniqueFailedApis.length > 0,
    failedApis: uniqueFailedApis,
    messages: uniqueFailedApis.map((source) =>
      buildConnectionErrorMessage(source)
    ),
  }
}

export function getApiSourceFromUrl(
  input: RequestInfo | URL
): ApiConnectionSource {
  const value =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url

  const normalized = value.toLowerCase()

  if (normalized.includes("/api/auth/")) {
    return "auth"
  }

  return "produccion"
}

export function setConnectionError(
  error: boolean,
  apiSource: ApiConnectionSource = "unknown"
) {
  const nextFailedApis = new Set(currentErrorState.failedApis)

  if (error) {
    nextFailedApis.add(apiSource)
  } else if (apiSource === "unknown") {
    nextFailedApis.clear()
  } else {
    nextFailedApis.delete(apiSource)
  }

  const nextState = buildStateFromFailedApis(Array.from(nextFailedApis))

  if (
    currentErrorState.hasError === nextState.hasError &&
    currentErrorState.failedApis.length === nextState.failedApis.length &&
    currentErrorState.failedApis.every(
      (value, index) => value === nextState.failedApis[index]
    )
  ) {
    return
  }

  currentErrorState = nextState
  listeners.forEach((listener) => listener(nextState))
}

export function getConnectionError(): ConnectionErrorState {
  return currentErrorState
}

export function resetConnectionError(apiSource?: ApiConnectionSource) {
  setConnectionError(false, apiSource ?? "unknown")
}

function isApiRouteRequest(input: RequestInfo | URL): boolean {
  const value =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url

  if (value.startsWith("/api/")) {
    return true
  }

  try {
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost"
    const url = new URL(value, base)
    return url.pathname.startsWith("/api/")
  } catch {
    return false
  }
}

function isConnectionError(data: unknown, statusCode: number): boolean {
  if (statusCode >= 500) {
    if (typeof data === "string") {
      return (
        data.includes("No se pudo conectar") ||
        data.includes("connection") ||
        data.includes("servidor")
      )
    }

    if (data && typeof data === "object") {
      if ("error" in data && typeof data.error === "string") {
        return (
          data.error.includes("No se pudo conectar") ||
          data.error.includes("connection") ||
          data.error.includes("servidor")
        )
      }
    }

    return true
  }

  return false
}

export async function fetchWithConnectionCheck(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  try {
    const response = isApiRouteRequest(input)
      ? await fetchWithKeycloak(input, init)
      : await fetch(input, init)

    if (!response.ok) {
      try {
        const contentType = response.headers.get("content-type")
        let data: unknown = null

        if (contentType && contentType.includes("application/json")) {
          try {
            data = await response.clone().json()
          } catch {
            data = await response.clone().text()
          }
        } else {
          data = await response.clone().text()
        }

        if (isConnectionError(data, response.status)) {
          setConnectionError(true, getApiSourceFromUrl(input))
        }
      } catch {
        if (response.status >= 500) {
          setConnectionError(true, getApiSourceFromUrl(input))
        }
      }
    } else {
      resetConnectionError()
    }

    return response
  } catch (error) {
    if (
      error instanceof TypeError ||
      (error instanceof Error &&
        (error.message.includes("fetch") ||
          error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError")))
    ) {
      setConnectionError(true, getApiSourceFromUrl(input))
    }
    throw error
  }
}

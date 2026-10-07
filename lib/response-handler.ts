import { toast } from "sonner"
import {
  getApiSourceFromUrl,
  resetConnectionError,
  setConnectionError,
} from "@/lib/connectionManager"

export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error

  if (Array.isArray(error)) {
    if (error.length > 0 && error[0]?.msg) {
      return error.map((e) => e.msg).join(", ")
    }
    return error
      .map((e) => {
        if (typeof e === "string") return e
        if (e?.message) return e.message
        if (e?.msg) return e.msg
        return JSON.stringify(e)
      })
      .join(", ")
  }

  if (error && typeof error === "object") {
    if ("msg" in error && typeof error.msg === "string") return error.msg
    if ("message" in error && typeof error.message === "string")
      return error.message
    if ("detail" in error) return getErrorMessage(error.detail)
    if ("error" in error) return getErrorMessage(error.error)
    if ("errors" in error && Array.isArray(error.errors)) {
      return getErrorMessage(error.errors)
    }
    return JSON.stringify(error)
  }

  return "Error desconocido"
}

export function getSuccessMessage(data: unknown): string {
  if (!data) return "Operación completada"

  if (typeof data === "string") return data

  if (Array.isArray(data)) {
    const first = data[0]
    if (typeof first === "string") return first
    if (first?.msg) return first.msg
    if (first?.message) return first.message
    return JSON.stringify(first) || "Operación completada"
  }

  if (data && typeof data === "object") {
    if ("msg" in data && typeof data.msg === "string") return data.msg
    if ("message" in data && typeof data.message === "string")
      return data.message
    if ("detail" in data && typeof data.detail === "string") return data.detail
    if (
      "success" in data &&
      data.success === true &&
      "detail" in data &&
      typeof data.detail === "string"
    ) {
      return data.detail
    }
    return "Operación completada"
  }

  return "Operación completada"
}

function isConnectionError(data: unknown): boolean {
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

  return false
}

export async function handleApiResponse<T = unknown>(
  response: Response,
  successMessage?: string | ((data: T) => string)
): Promise<T> {
  let data: unknown
  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json()
    } catch {
      data = await response.text()
    }
  } else {
    data = await response.text()
  }

  if (!response.ok) {
    const errorMsg = getErrorMessage(data)

    if (isConnectionError(data)) {
      setConnectionError(true, getApiSourceFromUrl(response.url))
    }

    toast.error(errorMsg)
    throw new Error(errorMsg)
  }

  resetConnectionError(getApiSourceFromUrl(response.url))

  const parsedData = data as T

  const msg =
    typeof successMessage === "function"
      ? successMessage(parsedData)
      : successMessage || getSuccessMessage(parsedData)
  if (msg) {
    toast.success(msg)
  }

  return parsedData
}

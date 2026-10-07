const API_AUTH_URL = process.env.API_AUTH_URL

function getApiAuthBaseUrl(): string | null {
  if (!API_AUTH_URL) {
    return null
  }

  return API_AUTH_URL.replace(/\/$/, "")
}

export function getExternalApiUrl(path: string): string | null {
  const baseUrl = getApiAuthBaseUrl()

  if (!baseUrl) {
    return null
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}

export function getBearerTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization")

  if (!authHeader?.startsWith("Bearer ")) {
    const cookieHeader = request.headers.get("cookie")

    if (!cookieHeader) {
      return null
    }

    const cookies = cookieHeader.split(";")

    for (const cookie of cookies) {
      const [rawName, ...rawValueParts] = cookie.trim().split("=")
      if (!rawName || rawValueParts.length === 0) continue

      if (rawName === "access_token" || rawName === "auth_token") {
        const tokenFromCookie = rawValueParts.join("=").trim()
        return tokenFromCookie.length > 0 ? tokenFromCookie : null
      }
    }

    return null
  }

  const token = authHeader.substring(7).trim()
  return token.length > 0 ? token : null
}

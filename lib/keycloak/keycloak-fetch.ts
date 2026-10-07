import keycloak from "@/lib/keycloak/keycloak"

export async function fetchWithKeycloak(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  if (!keycloak.authenticated) {
    throw new Error("La sesión de Keycloak no está autenticada")
  }

  await keycloak.updateToken(30)

  if (!keycloak.token) {
    throw new Error("Keycloak no proporcionó un access token")
  }

  const headers = new Headers(init.headers)
  headers.set("Authorization", `Bearer ${keycloak.token}`)

  return fetch(input, {
    ...init,
    headers,
  })
}

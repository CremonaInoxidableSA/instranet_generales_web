import keycloak, { initKeycloakOnce } from "@/lib/keycloak/keycloak"

export async function initKeycloakSession(): Promise<boolean> {
  const authenticated = await initKeycloakOnce({
    onLoad: "check-sso",
    silentCheckSsoRedirectUri:
      typeof window !== "undefined"
        ? `${window.location.origin}/silent-check-sso.html`
        : undefined,
    checkLoginIframe: false,
    pkceMethod:
      typeof window !== "undefined" && window.isSecureContext
        ? "S256"
        : undefined,
  })
  return authenticated
}

export async function keycloakLogin(): Promise<void> {
  await keycloak.login()
}

export async function keycloakLogout(): Promise<void> {
  await keycloak.logout({
    redirectUri: window.location.origin,
  })
}

export async function keycloakChangePassword(): Promise<void> {
  await keycloak.accountManagement()
}

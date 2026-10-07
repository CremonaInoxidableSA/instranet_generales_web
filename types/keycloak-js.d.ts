declare module "keycloak-js" {
  export as namespace Keycloak

  export interface KeycloakInitOptions {
    [key: string]: unknown
  }

  export default class Keycloak {
    constructor(config?: Record<string, unknown>)
    init(options?: KeycloakInitOptions): Promise<boolean>
    token?: string | null
    refreshToken?: string | null
    authenticated?: boolean
    updateToken?(minValidity?: number): Promise<boolean>
    login?(opts?: Record<string, unknown>): Promise<void> | void
    logout?(opts?: Record<string, unknown>): Promise<void> | void
    accountManagement?(opts?: Record<string, unknown>): Promise<void> | void
  }
}

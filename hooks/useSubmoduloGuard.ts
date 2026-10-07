"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthProvider"
import { useAutorizacion } from "@/context/useAutorizacion"
import type { Autorizacion } from "@/lib/permisos"

/**
 * Protege una pagina de submodulo: si el usuario autenticado no tiene
 * acceso al submodulo indicado, lo redirige a la pagina principal ("/").
 *
 * Devuelve `true` unicamente cuando ya se resolvio la sesion del usuario
 * y este tiene acceso al submodulo, para poder evitar renderizar el
 * contenido protegido mientras se decide la redireccion.
 */
export function useSubmoduloGuard(submodulo: Autorizacion) {
  const router = useRouter()
  const { loading } = useAuth()
  const { tieneAccesoSubmodulo } = useAutorizacion()

  const tieneAcceso = tieneAccesoSubmodulo(submodulo)

  useEffect(() => {
    if (!loading && !tieneAcceso) {
      router.replace("/")
    }
  }, [loading, tieneAcceso, router])

  return !loading && tieneAcceso
}

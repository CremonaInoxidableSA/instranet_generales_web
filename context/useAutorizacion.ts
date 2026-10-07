"use client"

import { useCallback, useMemo } from "react"
import { useAuth } from "@/context/AuthProvider"
import { AUTORIZACIONES, type Autorizacion } from "@/lib/permisos"
import type { NombreConNombre } from "@/types/types"

const toNombre = (value: NombreConNombre) => {
  if (typeof value === "string") {
    return value
  }

  return value?.nombre ?? ""
}

export function useAutorizacion() {
  const { user } = useAuth()

  const permisosSet = useMemo(
    () =>
      new Set(
        (user?.permisos ?? [])
          .map((permiso) => toNombre(permiso))
          .filter(Boolean)
      ),
    [user?.permisos]
  )

  const submodulosSet = useMemo(
    () =>
      new Set(
        (user?.submodulos ?? [])
          .map((submodulo) => toNombre(submodulo))
          .filter(Boolean)
      ),
    [user?.submodulos]
  )

  const tienePermiso = useCallback(
    (nombre: Autorizacion) => permisosSet.has(nombre),
    [permisosSet]
  )
  const tieneAlgunPermiso = useCallback(
    (nombres: Autorizacion[]) =>
      nombres.some((nombre) => permisosSet.has(nombre)),
    [permisosSet]
  )

  const tieneAccesoSubmodulo = useCallback(
    (nombre: string) => submodulosSet.has(nombre),
    [submodulosSet]
  )

  const autorizacion = useMemo(
    () => ({
      acceso: {
        cargarRendiciones: tienePermiso(AUTORIZACIONES.CARGAR_RENDICIONES),
        administrarRendiciones: tienePermiso(AUTORIZACIONES.ADMINISTRAR_RENDICIONES),
      },
    }),
    [tienePermiso]
  )

  return useMemo(
    () => ({
      tienePermiso,
      tieneAlgunPermiso,
      tieneAccesoSubmodulo,
      autorizacion,
    }),
    [tienePermiso, tieneAlgunPermiso, tieneAccesoSubmodulo, autorizacion]
  )
}

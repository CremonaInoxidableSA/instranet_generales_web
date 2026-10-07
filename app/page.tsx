"use client"

import { useMemo, type ComponentType, useState } from "react"
import { useRouter } from "next/navigation"
import { CircleHelp, type LucideProps } from "lucide-react"
import { useAuth } from "@/context/AuthProvider"
import { useAutorizacion } from "@/context/useAutorizacion"
import { getUnifiedSubmodulos } from "@/lib/submodulosUtils"

const fallbackIcon: ComponentType<LucideProps> = CircleHelp

export default function Home() {
  const router = useRouter()
  const { user } = useAuth()
  const { tieneAccesoSubmodulo } = useAutorizacion()
  const [, setOpen] = useState(true)

  const submodulosUnificados = useMemo(
    () =>
      getUnifiedSubmodulos(
        user?.submodulos_personales ?? {},
        tieneAccesoSubmodulo,
        true,
        false
      ),
    [tieneAccesoSubmodulo, user?.submodulos_personales]
  )

  const handleNavigation = (path: string) => {
    router.push(path)
    setOpen(false)
  }

  return (
    <div className="flex w-full flex-col items-center gap-5 p-5 text-center font-medium">
      <p className="max-w-3xl text-base leading-7">
        Hola, bienvenido a la Sistema de Producción de Cremona Inoxidable S.A.
        Desde acá podés acceder a los siguientes sistemas:
      </p>
      {submodulosUnificados.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No tenes modulos personales asignados.
        </p>
      ) : (
        <div className="grid h-full w-full grid-cols-2 content-start justify-center gap-5 p-5 md:px-50 md:py-20 xl:flex xl:flex-1 xl:flex-wrap">
          {submodulosUnificados.map((submodulo) => {
            const Icon = submodulo.Icon || fallbackIcon

            return (
              <button
                key={submodulo.nombre}
                onClick={() => handleNavigation(submodulo.path)}
                className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded bg-background2 p-5 text-center transition hover:bg-background4 xl:w-1/6"
              >
                <Icon className="aspect-square size-20" />
                <div className="text-sm font-semibold xl:text-xl">
                  {submodulo.titulo}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

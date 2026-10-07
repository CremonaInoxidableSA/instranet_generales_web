import { urlConfig } from "@/lib/config"
import { type LucideProps, CircleHelp } from "lucide-react"
import { type ComponentType } from "react"
import { icons as lucideIcons } from "lucide-react"
import { type SubmodulosPersonales } from "@/types/types"

const fallbackIcon: ComponentType<LucideProps> = CircleHelp

const resolveIcon = (iconName: string) => {
  const lucideIcon = lucideIcons[iconName as keyof typeof lucideIcons]
  return lucideIcon ?? fallbackIcon
}

const toTitle = (value: string) =>
  value
    .replace(/^SUBMODULO/, "")
    .replace(/_/g, " ")
    .replace(/PRODUCCION$/, "")
    .toUpperCase()

export interface SubmoduloItem {
  nombre: string
  titulo: string
  path: string
  Icon?: ComponentType<LucideProps>
  isSpecial?: boolean
}

export const getUnifiedSubmodulos = (
  userSubmodulos: SubmodulosPersonales = {},
  tieneAcceso: (nombre: string) => boolean,
  includeIcons: boolean = false,
  includeSpecial: boolean = true
): SubmoduloItem[] => {
  const items: SubmoduloItem[] = []

  if (includeSpecial) {
    items.push({
      nombre: "HOME",
      titulo: "HOME",
      path: urlConfig.homeUrl,
      Icon: includeIcons ? resolveIcon("Home") : undefined,
      isSpecial: true,
    })
  }

  const usuarioSubmodulos = Object.entries(userSubmodulos ?? {})
    .filter(([nombre]) => tieneAcceso(nombre))
    .map(([nombre, submodulo]) => ({
      nombre,
      titulo: toTitle(nombre),
      path: submodulo.path,
      Icon: includeIcons ? resolveIcon(submodulo.icono) : undefined,
      isSpecial: false,
    }))
    .sort((a, b) => a.titulo.localeCompare(b.titulo))

  items.push(...usuarioSubmodulos)

  if (includeSpecial) {
    items.push({
      nombre: "TICKETS_SOPORTE",
      titulo: "TICKETS SOPORTE",
      path: urlConfig.ticketsUrl,
      Icon: includeIcons ? resolveIcon("Ticket") : undefined,
      isSpecial: true,
    })
  }

  return items
}

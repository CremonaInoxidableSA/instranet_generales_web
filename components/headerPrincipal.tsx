"use client"

import { ThemeSwitcher } from "@/components/theme/themeSwitcher"
import UserIcon from "@/components/userIcon/userIcon"

import Link from "next/link"
import { useMemo, useState } from "react"
import { urlConfig } from "@/lib/config"
import { LogoCreminox as Logo } from "@/components/Logos"

import { Menu, X } from "lucide-react"
import { useAutorizacion } from "@/context/useAutorizacion"
import { useAuth } from "@/context/AuthProvider"
import { getUnifiedSubmodulos } from "@/lib/submodulosUtils"

export default function HeaderPrincipal() {
  const { user } = useAuth()
  const { tieneAccesoSubmodulo } = useAutorizacion()

  const submodulosUnificados = useMemo(
    () =>
      getUnifiedSubmodulos(
        user?.submodulos_personales ?? {},
        tieneAccesoSubmodulo,
        false,
        true
      ),
    [tieneAccesoSubmodulo, user?.submodulos_personales]
  )

  // Links para desktop (solo Home y Tickets)
  const desktopLinks = submodulosUnificados.filter((sub) => sub.isSpecial)
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <header className="flex items-center bg-headerbg px-5 py-2 xl:p-5">
        {/* Desktop: iconos izquierda */}
        <div className="hidden h-full w-[30%] flex-row items-center justify-start gap-5 xl:flex">
          <UserIcon />
          <ThemeSwitcher />
          {desktopLinks.map((item) => (
            <Link
              key={item.nombre}
              href={item.path}
              className="text-base opacity-70 transition-opacity hover:opacity-100"
              onClick={() => setDrawerOpen(false)}
              target={item.nombre === "TICKETS_SOPORTE" ? "_blank" : undefined}
              rel={
                item.nombre === "TICKETS_SOPORTE"
                  ? "noopener noreferrer"
                  : undefined
              }
            >
              {item.titulo}
            </Link>
          ))}
        </div>

        {/* Mobile: hamburger izquierda */}
        <div className="flex items-center xl:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú"
            className="flex cursor-pointer items-center justify-center"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Título centrado */}
        <p className="header flex flex-1 justify-center font-bold xl:w-[40%]">
          <span className="hidden md:inline">
            Produccion Cremona Inoxidable S.A.
          </span>
          <span className="md:hidden">Produccion Cremona</span>
        </p>

        {/* Desktop: Intranet + logo */}
        <div className="hidden w-[30%] items-center justify-end gap-5 xl:flex">
          <Link
            href={urlConfig.intranetUrl}
            className="text-base opacity-70 transition-opacity hover:opacity-100"
            rel="noopener noreferrer"
          >
            INTRANET
          </Link>
          <Link
            href={urlConfig.externalUrl}
            rel="noopener noreferrer"
            target="_blank"
            className="h-full"
          >
            <Logo extraClass="h-6" />
          </Link>
        </div>

        {/* Mobile: logo derecha */}
        <div className="flex items-center xl:hidden">
          <Link
            href={urlConfig.externalUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Logo extraClass="h-6" />
          </Link>
        </div>
      </header>

      {/* Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-100 bg-black/50 xl:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer lateral izquierdo */}
      <div
        className={`-header fixed top-0 left-0 z-100 flex h-full w-64 flex-col bg-headerbg transition-transform duration-300 ease-in-out xl:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Fila superior: perfil + theme + cerrar */}
        <div className="flex items-center justify-between border-b border-current/20 px-4 py-4">
          <div className="flex items-center gap-4">
            <UserIcon />
            <ThemeSwitcher />
            <Link
              href={urlConfig.intranetUrl}
              className="text-base opacity-70 transition-opacity hover:opacity-100"
              rel="noopener noreferrer"
            >
              INTRANET
            </Link>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Cerrar menú"
            className="flex cursor-pointer items-center justify-center"
          >
            <X size={22} />
          </button>
        </div>

        {/* Links de navegación */}
        <nav className="flex flex-col gap-5 px-4 py-5">
          {submodulosUnificados.map((submodulo) => {
            return (
              <Link
                key={submodulo.nombre}
                href={submodulo.path}
                className="text-base opacity-70 transition-opacity hover:opacity-100"
                onClick={() => setDrawerOpen(false)}
                target={
                  submodulo.nombre === "TICKETS_SOPORTE" ? "_blank" : undefined
                }
                rel={
                  submodulo.nombre === "TICKETS_SOPORTE"
                    ? "noopener noreferrer"
                    : undefined
                }
              >
                {submodulo.titulo}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}

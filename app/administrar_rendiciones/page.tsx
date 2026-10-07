"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"

import VerRendiciones from "./verRendiciones"
import AgregarOpciones from "./agregarOpciones"
import { Separator } from "@/components/ui/separator";

const secciones = [
  {
    id: 1,
    nombre: "VER RENDICIONES",
    extraClasses:
      "bg-yellowcremona/20 hover:bg-yellowcremona/60 text-yellowcremona border-2 border-yellowcremona",
  },
  {
    id: 2,
    nombre: "AGREGAR OPCIONES",
    extraClasses:
      "bg-tealcremona/20 hover:bg-tealcremona/60 text-tealcremona border-2 border-tealcremona",
  },
]

export default function AdministrarRendiciones() {
  const [seccionActiva, setSeccionActiva] = useState<number>(1)

  return (
    <div className="flex h-full flex-1 flex-col items-center gap-3 p-5">
      <h1 className="text-xl font-bold xl:text-2xl">ADMINISTRAR RENDICIONES</h1>

      <div className="flex w-full flex-row items-center justify-center gap-3 xl:hidden">
        {secciones.map(({ id, nombre, extraClasses }) => {
          const isActive = seccionActiva === id
          return (
            <Button
              key={id}
              onClick={() => setSeccionActiva(id)}
              className={`flex flex-1 items-center justify-center rounded font-semibold transition-all duration-200 ${
                isActive
                  ? `${extraClasses} opacity-100`
                  : `${extraClasses} opacity-50`
              }`}
            >
              {nombre}
            </Button>
          )
        })}
      </div>

      <div className="flex w-full min-w-0 flex-1 flex-col gap-3 xl:flex-row">
        <div
          className={`${
            seccionActiva === 1 ? "flex" : "hidden"
          } min-w-0 flex-1 flex-col gap-3 xl:flex xl:flex-3`}
        >
          <VerRendiciones />
        </div>

        <div
          className={`${
            seccionActiva === 2 ? "flex" : "hidden"
          } min-w-0 flex-1 flex-col gap-3 xl:flex xl:flex-1`}
        >
          <AgregarOpciones />
        </div>
      </div>
    </div>
  )
}

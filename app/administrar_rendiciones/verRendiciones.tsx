"use client"

import { useState } from "react"
import { SelectorConBusqueda, Boton, TextScrollArea } from "@/components/components"


const VIAJANTES_MOCK = [
  "Ivan Pennacchietti",
  "Matias Satamm",
  "Facundo Pereira",
]

const VIAJES_MOCK = [
  {
    id: 1,
    destino: "PF CHILE",
    fechaSalida: "03/03/2026",
    fechaRegreso: "07/03/2026",
    estado: "Pendiente",
  },
  {
    id: 2,
    destino: "FRANKFURT ALEMANIA",
    fechaSalida: "10/03/2026",
    fechaRegreso: "13/03/2026",
    estado: "Rendido",
  },
  {
    id: 3,
    destino: "RECREO SANTA FE",
    fechaSalida: "17/03/2026",
    fechaRegreso: "24/03/2026",
    estado: "Pendiente",
  },
  {
    id: 4,
    destino: "DESMOLDEO MEXICO",
    fechaSalida: "31/03/2026",
    fechaRegreso: "07/04/2026",
    estado: "En revisión",
  }
]

const COMENTARIOS_MOCK = [
  {
    id: 1,
    viajeId: 1,
    texto: "Comentario de ejemplo para el viaje 1"
  },
  {
    id: 2,
    viajeId: 2,
    texto: "Comentario de ejemplo para el viaje 2"
  }
]

const RECIBOS_MOCK = [
  {
    id: 1,
    viajeId: 1,
    texto: "Recibo de ejemplo para el viaje 1"
  },
  {
    id: 2,
    viajeId: 2,
    texto: "Recibo de ejemplo para el viaje 2"
  }
]

const viajesTags = VIAJES_MOCK.map((v) => v.destino)
const viajesSubtitles = VIAJES_MOCK.map(
  (v) => `${v.fechaSalida} → ${v.fechaRegreso} · ${v.estado}`
)

const comentariosTags = COMENTARIOS_MOCK.map((c) => c.texto)
const comentariosSubtitles = COMENTARIOS_MOCK.map(
  (c) => `Viaje ID: ${c.viajeId}`
)

const recibosTags = RECIBOS_MOCK.map((r) => r.texto)
const recibosSubtitles = RECIBOS_MOCK.map(
  (r) => `Viaje ID: ${r.viajeId}`
)

export default function VerRendiciones() {
  const [rendicion, setRendicion] = useState("")
  const [viajeSeleccionado, setViajeSeleccionado] = useState<number>()
  const [comentarioSeleccionado, setComentarioSeleccionado] = useState<number>()
  const [reciboSeleccionado, setReciboSeleccionado] = useState<number>()

  return (
    <div className="flex flex-1 flex-col gap-3 xl:flex-row">
      <div className="flex flex-1 flex-col gap-3 rounded xl:w-1/2">
        <div className="flex flex-1 flex-col gap-3 rounded bg-background2 p-5">
          <h1 className="w-full font-semibold">SELECCIONE EL VIAJANTE</h1>
          <SelectorConBusqueda
            extraClass="w-full"
            placeholder="Seleccionar viajante"
            searchPlaceholder="Buscar viajante..."
            data={VIAJANTES_MOCK}
            value={rendicion}
            onValueChange={setRendicion}
          />
          <TextScrollArea
            tags={viajesTags}
            subtitles={viajesSubtitles}
            selectedIndex={viajeSeleccionado}
            onTagClick={(_tag, index) => setViajeSeleccionado(index)}
            extraClass="flex-1 min-h-0"
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 rounded bg-background2 p-5">
          <div className="flex flex-row items-center justify-between gap-3">
            <h1 className="font-semibold">COMENTARIOS</h1>
            <Boton
              extraClass="bg-bluecremona/20 hover:bg-bluecremona/60 text-bluecremona border-2 border-bluecremona"
              placeholder="AGREGAR COMENTARIO"
              onClick={undefined}
            />
          </div>
          <TextScrollArea
            tags={comentariosTags}
            subtitles={comentariosSubtitles}
            selectedIndex={comentarioSeleccionado}
            onTagClick={(_tag, index) => setComentarioSeleccionado(index)}
            extraClass="flex-1 min-h-0"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 rounded bg-background2 p-5 xl:w-1/2">
        <h1 className="w-full font-semibold">
          VIAJANTE SELECCIONADO | VIAJE SELECCIONADO
        </h1>
        <div className="flex flex-row gap-2">
          <div className="w-1/2 rounded bg-background3 p-3">
            <p className="text-md">TOTAL GASTO USD</p>
            <p className="text-sm opacity-50">U$D 631,14</p>
          </div>
          <div className="w-1/2 rounded bg-background3 p-3">
            <p className="text-md">TOTAL GASTO ARS</p>
            <p className="text-sm opacity-50">AR$ 325.800</p>
          </div>
        </div>

        <div className="flex flex-row gap-2">
          <div className="w-1/2 rounded bg-background3 p-3">
            <p className="text-md">TOTAL GASTO EUR</p>
            <p className="text-sm opacity-50">€UR 325.14</p>
          </div>
          <div className="w-1/2 rounded bg-background3 p-3">
            <p className="text-md">TOTAL GASTO LOCAL</p>
            <p className="text-sm opacity-50">$ 325.14</p>
          </div>
        </div>

        <TextScrollArea
          placeholder="RECIBOS"
          tags={recibosTags}
          subtitles={recibosSubtitles}
          selectedIndex={reciboSeleccionado}
          onTagClick={(_tag, index) => setReciboSeleccionado(index)}
          extraClass="flex-1 min-h-0"
        />
      </div>
    </div>
  )
}

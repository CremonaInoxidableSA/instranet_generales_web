import { Boton } from "@/components/components"

export default function AgregarOpciones() {
  return (
    <div className="flex flex-1 flex-col gap-3 rounded">
      <div className="flex flex-1 flex-col gap-3 rounded bg-background2 p-5">
        <div className="flex flex-row justify-between gap-3 items-center">
          <h1 className="font-semibold">MEDIO DE PAGO</h1>
          <Boton
            extraClass="bg-bluecremona/20 hover:bg-bluecremona/60 text-bluecremona border-2 border-bluecremona"
            placeholder="AGREGAR MEDIO DE PAGO"
            onClick={undefined}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 rounded bg-background2 p-5">
        <div className="flex flex-row justify-between gap-3 items-center">
          <h1 className="font-semibold">DIVISAS</h1>
          <Boton
            extraClass="bg-bluecremona/20 hover:bg-bluecremona/60 text-bluecremona border-2 border-bluecremona"
            placeholder="AGREGAR DIVISAS"
            onClick={undefined}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 rounded bg-background2 p-5">
        <div className="flex flex-row justify-between gap-3 items-center">
          <h1 className="font-semibold">MOTIVOS</h1>
          <Boton
            extraClass="bg-bluecremona/20 hover:bg-bluecremona/60 text-bluecremona border-2 border-bluecremona"
            placeholder="AGREGAR MOTIVO"
            onClick={undefined}
          />
        </div>
      </div>
    </div>
  )
}

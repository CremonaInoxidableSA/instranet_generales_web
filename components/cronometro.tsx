import { useEffect, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Play, Pause, TimerReset } from "lucide-react"
import { BotonIcono } from "./components"
import type { CronometroEdicionProps } from "@/types/types"

export function CronometroCreacion({
  disabled = false,
  onConfirmar,
}: {
  disabled?: boolean
  onConfirmar?: () => Promise<void>
}) {
  const [loading, setLoading] = useState(false)

  const handleConfirmar = async () => {
    if (!onConfirmar) return
    setLoading(true)
    try {
      await onConfirmar()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-row items-center justify-between gap-4">
      <h1 className="font-mono text-xl">00:00:00</h1>
      <div className="flex gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <BotonIcono
              buttonClass="rounded bg-background6 p-2"
              iconClass="size-6"
              icono={Play}
              disabled={disabled}
            />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Está seguro que desea crear la tarea? No podrá editar los datos
                de la tarea una vez creada, solo agregar tiempo extra.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmar} disabled={loading}>
                {loading ? "Creando..." : "Continuar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export function CronometroEdicion({
  value,
  estado = "activa",
  onTogglePausa,
  onReiniciar,
}: CronometroEdicionProps) {
  const parseTime = (timeStr: string): number => {
    const parts = timeStr.split(":").map(Number)
    if (parts.length === 3) {
      return parts[0] * 3600000 + parts[1] * 60000 + parts[2] * 1000
    }
    return 0
  }

  const [displayTime, setDisplayTime] = useState<number>(parseTime(value))

  useEffect(() => {
    void (async () => {
      const newTime = parseTime(value)
      setDisplayTime(newTime)
    })()
  }, [value])

  const formatTime = (ms: number): string => {
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const isPausada = estado?.toLowerCase() === "pausada"

  return (
    <div className="flex flex-row items-center justify-between gap-4">
      <h1 className="font-mono text-xl">{formatTime(displayTime)}</h1>
      <div className="flex gap-2">
        {onTogglePausa && (
          <BotonIcono
            onClick={onTogglePausa}
            buttonClass="rounded bg-background6 p-2"
            iconClass="size-5"
            icono={isPausada ? Play : Pause}
          />
        )}
        {onReiniciar && (
          <BotonIcono
            onClick={onReiniciar}
            buttonClass="rounded bg-background6 p-2"
            iconClass="size-5"
            icono={TimerReset}
          />
        )}
      </div>
    </div>
  )
}

export function DuracionInput({
  value: externalValue,
  onChange: externalOnChange,
}: {
  value?: string
  onChange?: (value: string) => void
}) {
  const [internalValue, setInternalValue] = useState("00:00:00")

  const value = externalValue !== undefined ? externalValue : internalValue
  const setValue = externalOnChange || setInternalValue

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (/^[0-9:]*$/.test(newValue)) {
      setValue(newValue)
    }
  }

  const esValido = /^\d+:[0-5]\d:[0-5]\d$/.test(value)

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="HH:MM:SS"
        className="min-h-10 rounded border-2 border-background6 bg-background3 px-3 py-2 text-xl focus:border-background6"
      />
      {!esValido && (
        <span className="text-sm text-red-500">Formato válido: HH:MM:SS</span>
      )}
    </div>
  )
}

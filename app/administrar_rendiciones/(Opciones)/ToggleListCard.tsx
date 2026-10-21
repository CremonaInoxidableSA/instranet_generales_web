"use client"

import { useMemo, useState } from "react"
import { CircleMinus, CirclePlus, Pencil } from "lucide-react"
import { BotonIcono, TextScrollArea } from "@/components/components"
import { Checkbox } from "@/components/ui/checkbox"
import type { ToggleListItem } from "./types"
import { SectionCard } from "./SectionCard"

type Props = {
  title: string
  buttonLabel: string
  items: ToggleListItem[]
  onToggle: (item: ToggleListItem) => Promise<void> | void
  onAdd?: () => void
  onEdit?: (item: ToggleListItem) => Promise<void> | void
  actionMode?: "toggle" | "edit"
  emptyLabel?: string
}

export function ToggleListCard({
  title,
  buttonLabel,
  items,
  onToggle,
  onAdd,
  onEdit,
  actionMode = "toggle",
  emptyLabel = "Sin datos",
}: Props) {
  const [showDisabled, setShowDisabled] = useState(false)

  const enabledList = useMemo(
    () => items.filter((item) => item.estado !== false),
    [items]
  )

  const disabledList = useMemo(
    () => items.filter((item) => item.estado === false),
    [items]
  )

  const visibleList = showDisabled ? disabledList : enabledList

  return (
    <SectionCard title={title} buttonLabel={buttonLabel} onClick={onAdd}>
      <label className="flex items-center gap-2 text-sm opacity-90">
        <Checkbox
          checked={showDisabled}
          onCheckedChange={() => setShowDisabled((value) => !value)}
        />
        Mostrar deshabilitadas
      </label>
      <TextScrollArea
        tags={
          visibleList.length > 0
            ? visibleList.map((item) => item.nombre ?? String(item.id))
            : [emptyLabel]
        }
        extraClass="flex-1 min-h-0"
        withPointer={false}
        renderItem={({ tag, index }) => {
          if (visibleList.length === 0) {
            return <span className="truncate">{tag}</span>
          }

          const item = visibleList[index]
          if (!item) return null

          const isEditAction = actionMode === "edit"
          const Icono = isEditAction
            ? Pencil
            : item.estado
              ? CircleMinus
              : CirclePlus

          return (
            <div className="flex w-full items-center justify-between gap-2">
              <span className="truncate py-1">{tag}</span>
              <BotonIcono
                icono={Icono}
                iconClass={
                  isEditAction
                    ? "h-4 w-4 text-bluecremona"
                    : item.estado
                      ? "h-4 w-4 text-redcremona"
                      : "h-4 w-4 text-greencremona"
                }
                onClick={async () => {
                  if (isEditAction) {
                    if (onEdit) await onEdit(item)
                    return
                  }
                  await onToggle(item)
                }}
                ariaLabel={
                  isEditAction
                    ? "Editar elemento"
                    : item.estado
                      ? "Deshabilitar elemento"
                      : "Habilitar elemento"
                }
                title={
                  isEditAction
                    ? "Editar"
                    : item.estado
                      ? "Deshabilitar"
                      : "Habilitar"
                }
              />
            </div>
          )
        }}
      />
    </SectionCard>
  )
}

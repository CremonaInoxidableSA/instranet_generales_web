"use client"

import type { ReactNode } from "react"
import { Boton } from "@/components/components"

type Props = {
  title: string
  buttonLabel?: string
  onClick?: () => void
  children: ReactNode
}

export function SectionCard({ title, buttonLabel, onClick, children }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded bg-background2 p-5">
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-semibold">{title}</h1>
        {buttonLabel && (
          <Boton
            extraClass="bg-bluecremona/20 hover:bg-bluecremona/60 text-bluecremona border-2 border-bluecremona"
            placeholder={buttonLabel}
            onClick={onClick}
          />
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2">{children}</div>
    </div>
  )
}

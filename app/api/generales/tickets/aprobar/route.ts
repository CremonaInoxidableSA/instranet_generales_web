import { NextResponse } from "next/server"
import { getBearerTokenFromRequest } from "@/app/api/_utils/authApi"

const API_BASE_URL =
  process.env.API_GENERALES_URL ?? "http://192.168.20.151:8205"

export async function PUT(request: Request) {
  const token = getBearerTokenFromRequest(request)

  if (!token) {
    return NextResponse.json(
      { error: "No autorizado: falta el token" },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const idTicket = Number(body?.id_ticket)

    if (!Number.isFinite(idTicket) || !idTicket) {
      return NextResponse.json(
        { error: "Falta o es inválido el id_ticket" },
        { status: 400 }
      )
    }

    const response = await fetch(`${API_BASE_URL}/tickets/aprobar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id_ticket: idTicket }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "")
      return NextResponse.json(
        {
          error: "Error al aprobar el ticket",
          detail: errorText || "No se pudo aprobar el recibo",
        },
        { status: response.status }
      )
    }

    const data = await response.text()
    return NextResponse.json(data ? JSON.parse(data) : { ok: true }, {
      status: 200,
    })
  } catch {
    return NextResponse.json(
      { error: "No se pudo conectar con el servidor" },
      { status: 500 }
    )
  }
}

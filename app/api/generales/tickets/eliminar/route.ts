import { NextResponse } from "next/server"
import { getBearerTokenFromRequest } from "@/app/api/_utils/authApi"

const API_BASE_URL =
  process.env.API_GENERALES_URL ?? "http://192.168.20.151:8205"

export async function DELETE(request: Request) {
  const token = getBearerTokenFromRequest(request)

  if (!token) {
    return NextResponse.json(
      { error: "No autorizado: falta el token" },
      { status: 401 }
    )
  }

  try {
    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >
    const idTicket = Number(body.id_ticket ?? 0)

    if (!idTicket) {
      return NextResponse.json(
        { error: "Falta el id_ticket en la consulta" },
        { status: 400 }
      )
    }

    const response = await fetch(`${API_BASE_URL}/tickets/eliminar`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id_ticket: idTicket }),
    })

    const contentType = response.headers.get("content-type") ?? ""
    const data = contentType.includes("application/json")
      ? await response.json().catch(() => ({}))
      : { detail: await response.text() }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: "No se pudo conectar con el servidor" },
      { status: 500 }
    )
  }
}

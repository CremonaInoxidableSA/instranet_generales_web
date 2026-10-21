import { NextResponse } from "next/server"
import { getBearerTokenFromRequest } from "@/app/api/_utils/authApi"

const API_BASE_URL =
  process.env.API_GENERALES_URL ?? "http://192.168.20.151:8205"

export async function GET(request: Request) {
  const token = getBearerTokenFromRequest(request)
  const { searchParams } = new URL(request.url)
  const idTicket = searchParams.get("id_ticket")?.trim()

  if (!token) {
    return NextResponse.json(
      { error: "No autorizado: falta el token" },
      { status: 401 }
    )
  }

  if (!idTicket) {
    return NextResponse.json(
      { error: "Falta el id_ticket en la consulta" },
      { status: 400 }
    )
  }

  try {
    const url = new URL(`${API_BASE_URL}/tickets/detalles`)
    url.searchParams.set("id_ticket", idTicket)

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Error al consultar la API" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: "No se pudo conectar con el servidor" },
      { status: 500 }
    )
  }
}

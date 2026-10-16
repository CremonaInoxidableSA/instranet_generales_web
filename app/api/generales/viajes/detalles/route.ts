import { NextResponse } from "next/server"
import { getBearerTokenFromRequest } from "@/app/api/_utils/authApi"

const API_BASE_URL =
  process.env.API_GENERALES_URL ?? "http://192.168.20.151:8205"

export async function GET(request: Request) {
  const token = getBearerTokenFromRequest(request)

  if (!token) {
    return NextResponse.json(
      { error: "No autorizado: falta el token" },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(request.url)
  const idViaje = searchParams.get("id_viaje")

  if (!idViaje || Number.isNaN(Number(idViaje))) {
    return NextResponse.json(
      { error: "Falta el parámetro id_viaje" },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/viajes/detalles?id_viaje=${encodeURIComponent(idViaje)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return NextResponse.json(
        data ?? { error: "Error al consultar el detalle del viaje" },
        { status: response.status }
      )
    }

    return NextResponse.json(data ?? { success: true, data: null })
  } catch {
    return NextResponse.json(
      { error: "No se pudo conectar con el servidor" },
      { status: 500 }
    )
  }
}

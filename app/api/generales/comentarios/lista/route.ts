import { NextResponse } from "next/server"
import { getBearerTokenFromRequest } from "@/app/api/_utils/authApi"

const API_BASE_URL =
  process.env.API_GENERALES_URL ?? "http://192.168.20.151:8205"

export async function GET(request: Request) {
  const token = getBearerTokenFromRequest(request)
  const { searchParams } = new URL(request.url)
  const idViajeUsuario = searchParams.get("id_viaje_usuario")?.trim()

  if (!token) {
    return NextResponse.json(
      { error: "No autorizado: falta el token" },
      { status: 401 }
    )
  }

  if (!idViajeUsuario) {
    return NextResponse.json(
      { error: "Falta el id_viaje_usuario en la consulta" },
      { status: 400 }
    )
  }

  try {
    const url = new URL(`${API_BASE_URL}/comentarios/lista`)
    url.searchParams.set("id_viaje_usuario", idViajeUsuario)

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

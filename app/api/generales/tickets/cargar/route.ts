import { NextResponse } from "next/server"
import { getBearerTokenFromRequest } from "@/app/api/_utils/authApi"

const API_BASE_URL =
  process.env.API_GENERALES_URL ?? "http://192.168.20.151:8205"

export async function POST(request: Request) {
  const token = getBearerTokenFromRequest(request)
  const { searchParams } = new URL(request.url)
  const idViajeUsuario =
    searchParams.get("id_viaje_usuario")?.trim() ||
    searchParams.get("id_viaje")?.trim()

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
    const formData = await request.formData()
    const archivos = formData
      .getAll("archivos")
      .filter((value): value is File => value instanceof File && value.size > 0)

    if (!archivos.length) {
      return NextResponse.json(
        { error: "Debe enviarse al menos una imagen" },
        { status: 400 }
      )
    }

    const externalFormData = new FormData()
    archivos.forEach((archivo) => {
      externalFormData.append("archivos", archivo, archivo.name)
    })

    const response = await fetch(
      `${API_BASE_URL}/tickets/cargar-tickets?id_viaje_usuario=${encodeURIComponent(idViajeUsuario)}`,
      {
        method: "POST",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
        body: externalFormData,
      }
    )

    const contentType = response.headers.get("content-type") ?? ""
    const data = contentType.includes("application/json")
      ? await response.json()
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

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { getExternalApiUrl } from "@/app/api/_utils/authApi"

const EXTERNAL_API_URL = getExternalApiUrl("/personal/change-password")

export async function PUT(request: NextRequest) {
  if (!EXTERNAL_API_URL) {
    return NextResponse.json(
      { error: "Configuracion faltante: API_AUTH_URL" },
      { status: 500 }
    )
  }
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null

  if (!token) {
    return NextResponse.json(
      { error: "No autorizado: falta el token" },
      { status: 401 }
    )
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Solicitud inválida: body JSON requerido" },
      { status: 400 }
    )
  }

  const password = body?.password
  const password_confirmation = body?.password_confirmation

  if (!password) {
    return NextResponse.json(
      { error: "Falta la nueva contraseña" },
      { status: 400 }
    )
  }

  if (!password_confirmation) {
    return NextResponse.json(
      { error: "Falta la confirmación de la nueva contraseña" },
      { status: 400 }
    )
  }

  const externalResponse = await fetch(EXTERNAL_API_URL, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      password,
      password_confirmation,
    }),
  })

  const data = await externalResponse.json().catch(() => null)

  if (!externalResponse.ok) {
    return NextResponse.json(
      {
        error:
          data?.detail ?? data?.message ?? "Error al cambiar la contraseña",
      },
      { status: externalResponse.status }
    )
  }

  return NextResponse.json(data, { status: externalResponse.status })
}

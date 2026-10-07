"use client"

import {
  getApiSourceFromUrl,
  setConnectionError,
} from "@/lib/connectionManager"
import { handleApiResponse } from "@/lib/response-handler"

export function useFetchWithConnectionError() {
  const fetchWithErrorHandling = async <T = unknown>(
    url: string,
    options?: RequestInit,
    successMessage?: string | ((data: T) => string)
  ): Promise<T> => {
    try {
      const response = await fetch(url, options)
      return await handleApiResponse(response, successMessage)
    } catch (error) {
      if (
        error instanceof TypeError ||
        (error instanceof Error &&
          (error.message.includes("fetch") ||
            error.message.includes("Failed to fetch") ||
            error.message.includes("NetworkError")))
      ) {
        setConnectionError(true, getApiSourceFromUrl(url))
      }
      throw error
    }
  }

  return { fetchWithErrorHandling }
}

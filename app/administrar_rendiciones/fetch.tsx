function ListaMonedas() {
  const [monedas, setMonedas] = useState<Moneda[]>([])
  
  useEffect(() => {
    if (authLoading) return
    if (!user) return

    async function fetchData() {
      try {
        const response = await fetchWithConnectionCheck(
          "/api/listas/lista-sectores"
        )
        if (!response.ok) throw new Error("Error al obtener sectores")
        const data: Sector[] = await response.json()
        if (mountedRef.current) setSectores(data)
      } catch {
        if (mountedRef.current)
          setError("No se pudo cargar la lista de sectores")
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    }
    fetchData()
  }, [authLoading, user])
}
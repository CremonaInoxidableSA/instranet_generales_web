import VerRendiciones from "./(Rendiciones)/verRendiciones"

export default function CrearRendiciones() {
  return (
    <div className="flex h-full flex-1 flex-col gap-3 p-5">
      <h1 className="text-center text-xl font-bold xl:text-2xl">
        CREAR RENDICION
      </h1>
      <VerRendiciones />
    </div>
  )
}

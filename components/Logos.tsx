import Image from "next/image"

export function LogoCreminox({ extraClass }: { extraClass?: string }) {
  return (
    <Image
      alt="Creminox Logo"
      src="/creminox.png"
      width={200}
      height={48}
      className={`w-auto ${extraClass || ""}`}
      loading="eager"
    />
  )
}

export function LogoCx({ extraClass }: { extraClass?: string }) {
  return (
    <Image
      alt="Cx"
      src="/logoMetalizado.png"
      width={200}
      height={48}
      className={`w-auto ${extraClass || ""}`}
    />
  )
}

export function LogoCreminoxInnovate({ extraClass }: { extraClass?: string }) {
  return (
    <Image
      alt="Creminox Logo"
      src="/creminox_innovate.png"
      width={821}
      height={201}
      className={`w-auto ${extraClass || ""}`}
      loading="eager"
    />
  )
}

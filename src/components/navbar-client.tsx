"use client"

import { useScroll } from "@/hooks/use-scroll"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import SearchInput from "@/components/search-input"

export default function NavbarClient() {
  const { isAtTop } = useScroll()
  const pathname = usePathname()

  return (
    <div className={cn(
      "grow max-sm:hidden transition-all duration-300 ease-in-out",
      !isAtTop || pathname !== '/' ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
    )}>
      <SearchInput className="mx-auto max-w-xl" />
    </div>
  )
}
"use client"

import { useScroll } from "@/hooks/use-scroll"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import SearchInput from "@/components/search-input"
import { Tables } from "@/lib/types/supabase"

type Location = Tables<"locations">;

export default function NavbarClient({ locations }: { locations: Array<Location> | null}) {
  const { isAtTop } = useScroll()
  const pathname = usePathname()
  const isSearchPage = pathname === '/search'
  const isCommunityPage = pathname === '/community'

  return (
    <>
      {/* Desktop version */}
      <div className={cn(
        "hidden sm:block mx-auto max-w-xl transition-all duration-300 ease-in-out",
        (!isAtTop || pathname !== '/') ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
      )}>
        <SearchInput 
          locations={locations || []} 
          className="w-full" 
          size="md" 
        />
      </div>

      {/* Mobile version - only show on search and community pages */}
      {(isSearchPage || isCommunityPage) && (
        <div className="block sm:hidden w-full">
          <SearchInput 
            locations={locations || []} 
            className="w-full" 
            size="sm" 
          />
        </div>
      )}
    </>
  )
}
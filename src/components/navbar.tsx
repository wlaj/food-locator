import Logo from "@/components/logo"
import ThemeToggle from "@/components/theme-toggle"
import SearchInput from "@/components/search-input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Navbar() {
  return (
    <header className="border-b px-4 fixed top-0 right-0 bg-white w-full md:px-6">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex-1">
          <Link href="/" className="text-primary hover:text-primary/90">
            <Logo />
          </Link>
        </div>
        {/* Middle area */}
        <div className="grow max-sm:hidden">
          <SearchInput className="mx-auto max-w-xs" />
        </div>
        {/* Right side */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button asChild variant="ghost" size="sm" className="text-sm">
            <a href="#">Community</a>
          </Button>
          <Button asChild size="sm" className="text-sm">
            <a href="#">Get Started</a>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

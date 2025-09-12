import NavbarClient from "@/components/navbar-client";
import NavbarAuth from "@/components/navbar-auth";
import Link from "next/link";
import { IconInnerShadowBottomRightFilled } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { getLocations } from "@/lib/actions";

export default async function Navbar() {
  const locations = await getLocations()
  return (
    <header className="border-b z-20 fixed top-0 right-0 bg-white w-full">
      {/* Main navbar row */}
      <div className="flex h-14 md:h-16 items-center justify-between gap-2 md:gap-4 px-4 md:px-6">
        {/* Logo */}
        <div className="flex-shrink-0 md:flex-1">
          <Link href="/" className="text-foreground flex gap-2 items-center">
            <IconInnerShadowBottomRightFilled className="size-7 md:size-9 hover:rotate-45 transition-all duration-500" />
          </Link>
        </div>
        {/* Middle area - desktop only */}
        <div className="hidden sm:block flex-1 md:flex-none">
          <NavbarClient locations={locations} />
        </div>
        {/* Right side */}
        <div className="flex flex-shrink-0 md:flex-1 items-center justify-end gap-1 md:gap-2">
          <Button asChild variant="ghost" size="sm" className="text-xs md:text-sm px-2 md:px-3">
            <Link href="/community">Community</Link>
          </Button>
          <NavbarAuth />
          {/* <ThemeToggle /> */}
        </div>
      </div>
      
      {/* Mobile search row - full width */}
      <div className="sm:hidden px-4 pb-3">
        <NavbarClient locations={locations} />
      </div>
    </header>
  );
}

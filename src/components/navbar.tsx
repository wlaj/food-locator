import ThemeToggle from "@/components/theme-toggle";
import NavbarClient from "@/components/navbar-client";
import NavbarAuth from "@/components/navbar-auth";
import Link from "next/link";
import { IconInnerShadowBottomRightFilled } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <header className="border-b px-4 z-20 fixed top-0 right-0 bg-white w-full md:px-6">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex-1">
          <Link href="/" className="text-foreground flex gap-2 items-center">
            <IconInnerShadowBottomRightFilled className="size-9 hover:rotate-45 transition-all duration-500" />
          </Link>
        </div>
        {/* Middle area */}
        <NavbarClient />
        {/* Right side */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button asChild variant="ghost" size="sm" className="text-sm">
            <Link href="/community">Community</Link>
          </Button>
          <NavbarAuth />
          {/* <ThemeToggle /> */}
        </div>
      </div>
    </header>
  );
}

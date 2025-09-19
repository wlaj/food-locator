'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SignOutButtonProps {
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "text"
  size?: "default" | "sm" | "lg" | "icon"
}

export function SignOutButton({ 
  className, 
  variant = "outline", 
  size = "default" 
}: SignOutButtonProps) {
  const { pending } = useFormStatus()

  // For text variant, use a plain button
  if (variant === "text") {
    return (
      <button 
        type="submit" 
        disabled={pending}
        className={cn("w-full text-left", className)}
      >
        {pending ? 'Signing out...' : 'Sign out'}
      </button>
    )
  }

  return (
    <Button 
      type="submit" 
      variant={variant}
      size={size}
      disabled={pending}
      className={cn(className)}
    >
      {pending ? 'Signing out...' : 'Sign out'}
    </Button>
  )
}
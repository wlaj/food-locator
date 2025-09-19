'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SubmitButtonProps extends React.ComponentProps<typeof Button> {
  pendingText?: string
  children: React.ReactNode
}

export function SubmitButton({ 
  pendingText = 'Loading...', 
  children, 
  className,
  disabled,
  ...props 
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      className={cn(className)}
      {...props}
    >
      {pending ? pendingText : children}
    </Button>
  )
}
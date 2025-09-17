"use client"

import { useId } from "react"
import { OTPInput, SlotProps } from "input-otp"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

interface OTPInputComponentProps {
  name?: string
  maxLength?: number
  label?: string
  className?: string
  disabled?: boolean
}

export function OTPInputComponent({
  name = "token",
  maxLength = 6,
  label = "Enter verification code",
  className,
  disabled = false
}: OTPInputComponentProps) {
  const id = useId()
  
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <OTPInput
        id={id}
        name={name}
        maxLength={maxLength}
        disabled={disabled}
        containerClassName="flex items-center gap-3 has-disabled:opacity-50"
        render={({ slots }) => (
          <div className="flex">
            {slots.map((slot, idx) => (
              <Slot key={idx} {...slot} />
            ))}
          </div>
        )}
      />
    </div>
  )
}

function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        "border-input bg-background text-foreground relative -ms-px flex size-9 items-center justify-center border font-medium shadow-xs transition-[color,box-shadow] first:ms-0 first:rounded-s-md last:rounded-e-md",
        { "border-ring ring-ring/50 z-10 ring-[3px]": props.isActive }
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
    </div>
  )
}
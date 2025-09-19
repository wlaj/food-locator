"use client"

import { useId } from "react"
import { OTPInput, SlotProps } from "input-otp"
import { MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

interface OTPInputProps {
  maxLength?: number
  label?: string
  name?: string
  disabled?: boolean
  className?: string
  slotClassName?: string
}

export default function Component({
  maxLength = 6,
  label = "OTP input double",
  name,
  disabled = false,
  className,
  slotClassName
}: OTPInputProps = {}) {
  const id = useId()
  return (
    <div className={cn("*:not-first:mt-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <OTPInput
        id={id}
        name={name}
        maxLength={maxLength}
        disabled={disabled}
        containerClassName="flex items-center gap-3 has-disabled:opacity-50"
        render={({ slots }) => (
          <>
            <div className="flex">
              {slots.slice(0, 3).map((slot, idx) => (
                <Slot key={idx} {...slot} slotClassName={slotClassName} />
              ))}
            </div>

            <div className="text-muted-foreground/80">
              <MinusIcon size={16} aria-hidden="true" />
            </div>

            <div className="flex">
              {slots.slice(3).map((slot, idx) => (
                <Slot key={idx} {...slot} slotClassName={slotClassName} />
              ))}
            </div>
          </>
        )}
      />
      <p
        className="text-muted-foreground mt-2 text-xs"
        role="region"
        aria-live="polite"
      >
        Built with{" "}
        <a
          className="hover:text-foreground underline"
          href="https://github.com/guilhermerodz/input-otp"
          target="_blank"
          rel="noopener nofollow"
        >
          Input OTP
        </a>
      </p>
    </div>
  )
}

interface SlotComponentProps extends SlotProps {
  slotClassName?: string
}

function Slot({ slotClassName, ...props }: SlotComponentProps) {
  return (
    <div
      className={cn(
        "border-input bg-background text-foreground relative -ms-px flex size-9 items-center justify-center border font-medium shadow-xs transition-[color,box-shadow] first:ms-0 first:rounded-s-md last:rounded-e-md",
        { "border-ring ring-ring/50 z-10 ring-[3px]": props.isActive },
        slotClassName
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
    </div>
  )
}
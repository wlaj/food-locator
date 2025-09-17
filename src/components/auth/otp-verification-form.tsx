"use client"

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { verifyOtp } from '@/lib/auth-actions'
import { OTPInputComponent } from './otp-input'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function OTPVerificationForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const error = searchParams.get('error')

  if (!email) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-xl font-bold">Invalid Request</h1>
          <p className="text-center text-sm text-muted-foreground">
            No email address provided. Please start the login process again.
          </p>
          <Link href="/login" className="text-sm underline underline-offset-4">
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form action={verifyOtp}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <span className="sr-only">Food Locator</span>
            </Link>
            <h1 className="text-xl font-bold">Verify your email</h1>
            <div className="text-center text-sm text-muted-foreground">
              We sent a verification code to{" "}
              <span className="font-medium">{email}</span>
            </div>
          </div>

          {error && (
            <div className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex items-center flex-col gap-6">
            <Input type="hidden" name="email" value={email} />
            <OTPInputComponent
              name="token"
              label="Enter verification code"
              maxLength={6}
            />
            
            <Button type="submit" className="w-full">
              Verify Code
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Didn&apos;t receive a code? </span>
            <Link href={`/login?email=${encodeURIComponent(email)}`} className="underline underline-offset-4">
              Try again
            </Link>
          </div>
        </div>
      </form>
      
      <div className="text-muted-foreground text-center text-xs text-balance">
        By verifying, you agree to our <a href="/terms" className="underline underline-offset-4">Terms of Service</a>{" "}
        and <a href="/privacy" className="underline underline-offset-4">Privacy Policy</a>.
      </div>
    </div>
  )
}
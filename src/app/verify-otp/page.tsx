import { Suspense } from 'react'
import { OTPVerificationForm } from '@/components/auth/otp-verification-form'

export default function VerifyOTPPage() {
  return (
    <div className="flex min-h-svh max-w-4xl mx-auto mt-24 flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Suspense fallback={<div>Loading...</div>}>
          <OTPVerificationForm />
        </Suspense>
      </div>
    </div>
  )
}
"use client"

import { useState } from "react"

interface UseCharacterLimitProps {
  maxLength: number
  initialValue?: string
}

export function useCharacterLimit({
  maxLength,
  initialValue = "",
}: UseCharacterLimitProps) {
  const [value, setValue] = useState(initialValue)

  const characterCount = value.length
  const remaining = maxLength - characterCount

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value
    if (newValue.length <= maxLength) {
      setValue(newValue)
    }
  }

  return {
    value,
    characterCount,
    remaining,
    handleChange,
    maxLength,
  }
}
"use client"

import { useState, useRef, ChangeEvent } from "react"

interface FileWithPreview extends File {
  id: string
  preview: string
}

interface InitialFile {
  id: string
  name: string
  size: number
  type: string
  url: string
}

interface UseFileUploadProps {
  accept?: string
  multiple?: boolean
  initialFiles?: InitialFile[]
}

export function useFileUpload({
  accept = "*/*",
  multiple = false,
  initialFiles = [],
}: UseFileUploadProps = {}) {
  const [files, setFiles] = useState<(FileWithPreview | InitialFile)[]>(
    initialFiles
  )
  const inputRef = useRef<HTMLInputElement>(null)

  const openFileDialog = () => {
    inputRef.current?.click()
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    
    const newFiles = selectedFiles.map((file) => {
      const fileWithPreview = Object.assign(file, {
        id: Math.random().toString(36).substring(2, 15),
        preview: URL.createObjectURL(file),
      })
      return fileWithPreview
    })

    if (multiple) {
      setFiles(prev => [...prev, ...newFiles])
    } else {
      setFiles(newFiles)
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => {
      const updatedFiles = prev.filter(file => file.id !== id)
      // Clean up object URLs
      prev.forEach(file => {
        if ('preview' in file && file.id === id) {
          URL.revokeObjectURL(file.preview)
        }
      })
      return updatedFiles
    })
  }

  const getInputProps = () => ({
    ref: inputRef,
    type: "file" as const,
    accept,
    multiple,
    onChange: handleFileChange,
    style: { display: "none" },
  })

  return [
    { files },
    { openFileDialog, removeFile, getInputProps }
  ] as const
}
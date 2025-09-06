"use client"

import { useState, useRef, ChangeEvent, DragEvent } from "react"

interface FileWithPreview extends File {
  id: string
  preview: string
  file: File
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
  maxSize?: number
  initialFiles?: InitialFile[]
}

export function useFileUpload({
  accept = "*/*",
  multiple = false,
  maxSize = 2 * 1024 * 1024, // 2MB default
  initialFiles = [],
}: UseFileUploadProps = {}) {
  const [files, setFiles] = useState<(FileWithPreview | InitialFile)[]>(
    initialFiles
  )
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFiles = (fileList: File[]): { valid: File[], errors: string[] } => {
    const valid: File[] = []
    const newErrors: string[] = []

    fileList.forEach(file => {
      if (maxSize && file.size > maxSize) {
        newErrors.push(`File "${file.name}" is too large (max ${Math.round(maxSize / 1024 / 1024)}MB)`)
      } else {
        valid.push(file)
      }
    })

    return { valid, errors: newErrors }
  }

  const processFiles = (fileList: File[]) => {
    const { valid, errors: validationErrors } = validateFiles(fileList)
    setErrors(validationErrors)

    if (valid.length === 0) return

    const newFiles = valid.map((file) => {
      const fileWithPreview = {
        ...file,
        id: Math.random().toString(36).substring(2, 15),
        preview: URL.createObjectURL(file),
        file: file,
      } as FileWithPreview
      return fileWithPreview
    })

    if (multiple) {
      setFiles(prev => [...prev, ...newFiles])
    } else {
      setFiles(newFiles)
    }
  }

  const openFileDialog = () => {
    inputRef.current?.click()
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    processFiles(selectedFiles)
  }

  const handleDragEnter = (event: DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(event.dataTransfer.files)
    processFiles(droppedFiles)
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
    { files, isDragging, errors },
    { 
      handleDragEnter, 
      handleDragLeave, 
      handleDragOver, 
      handleDrop, 
      openFileDialog, 
      removeFile, 
      getInputProps 
    }
  ] as const
}
"use client"

import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"

import { useFileUpload } from "@/hooks/use-file-upload"
import { Button } from "@/components/ui/button"
import { uploadRestaurantImage, deleteRestaurantImage, uploadDishImage, deleteDishImage } from "@/lib/actions"

type ImageType = 'restaurant' | 'dish'

interface ImageUploadProps {
  type: ImageType
  defaultImageUrl?: string
  name?: string
  onImageChange?: (imageUrl: string | null) => void
}

export default function ImageUpload({ 
  type,
  defaultImageUrl, 
  name = "image_url",
  onImageChange 
}: ImageUploadProps) {
  const maxSizeMB = type === 'restaurant' ? 5 : 5 // 5MB limit for both
  const maxSize = maxSizeMB * 1024 * 1024
  
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(defaultImageUrl || null)
  const [isUploading, setIsUploading] = useState(false)

  const uploadFunction = type === 'restaurant' ? uploadRestaurantImage : uploadDishImage
  const deleteFunction = type === 'restaurant' ? deleteRestaurantImage : deleteDishImage

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif,image/webp",
    maxSize,
  })
  
  const currentFile = files[0]
  const previewUrl = (currentFile && 'preview' in currentFile ? currentFile.preview : null) || uploadedImageUrl || null
  const fileName = (currentFile && 'file' in currentFile ? currentFile.file.name : null)

  const handleFileUpload = useCallback(async (file: File) => {
    setIsUploading(true)
    try {
      const result = await uploadFunction(file)
      if (result.url) {
        setUploadedImageUrl(result.url)
        onImageChange?.(result.url)
        // Clear the file from the upload component since it's now uploaded
        if (files[0]) {
          removeFile(files[0].id)
        }
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }, [onImageChange, files, removeFile, uploadFunction])

  const handleRemoveImage = async () => {
    if (uploadedImageUrl && !files[0]) {
      // This is an uploaded image, delete from storage
      try {
        await deleteFunction(uploadedImageUrl)
      } catch (error) {
        console.error('Failed to delete image:', error)
      }
    }
    
    // Clear local state
    setUploadedImageUrl(null)
    onImageChange?.(null)
    
    // Remove file if it exists
    if (files[0]) {
      removeFile(files[0].id)
    }
  }

  // Auto-upload when file is selected
  useEffect(() => {
    if (currentFile && 'file' in currentFile && !isUploading && !uploadedImageUrl) {
      handleFileUpload(currentFile.file)
    }
  }, [currentFile, isUploading, uploadedImageUrl, handleFileUpload])

  const entityName = type === 'restaurant' ? 'restaurant' : 'dish'

  return (
    <div className="flex flex-col gap-2">
      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={name}
        value={uploadedImageUrl || ''}
      />
      
      <div className="relative">
        {/* Drop area */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-[input:focus]:ring-[3px]"
        >
          <input
            {...getInputProps()}
            className="sr-only"
            aria-label={`Upload ${entityName} image file`}
          />
          {previewUrl ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <Image
                src={previewUrl}
                alt={fileName || `${entityName} image`}
                className="mx-auto max-h-full rounded object-contain"
                width={400}
                height={300}
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
                  <div className="text-white text-sm">Uploading...</div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
              <div
                className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                aria-hidden="true"
              >
                <ImageIcon className="size-4 opacity-60" />
              </div>
              <p className="mb-1.5 text-sm font-medium">Drop your {entityName} image here</p>
              <p className="text-muted-foreground text-xs">
                SVG, PNG, JPG, GIF or WebP (max. {maxSizeMB}MB)
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={openFileDialog}
                disabled={isUploading}
              >
                <UploadIcon
                  className="-ms-1 size-4 opacity-60"
                  aria-hidden="true"
                />
                Select image
              </Button>
            </div>
          )}
        </div>

        {previewUrl && (
          <div className="absolute top-4 right-4">
            <button
              type="button"
              className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
              onClick={handleRemoveImage}
              disabled={isUploading}
              aria-label="Remove image"
            >
              <XIcon className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  )
}
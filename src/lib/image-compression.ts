import Compressor from 'compressorjs'

export interface CompressionOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
  convertSize?: number
  convertTypes?: string[]
}

const defaultOptions: CompressionOptions = {
  quality: 0.8,
  maxWidth: 1920,
  maxHeight: 1920,
  convertSize: 5000000,
  convertTypes: ['image/png', 'image/jpeg']
}

export function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  return new Promise((resolve, reject) => {
    const finalOptions = { ...defaultOptions, ...options }
    
    new Compressor(file, {
      quality: finalOptions.quality,
      maxWidth: finalOptions.maxWidth,
      maxHeight: finalOptions.maxHeight,
      convertSize: finalOptions.convertSize,
      convertTypes: finalOptions.convertTypes,
      mimeType: 'image/webp',
      success: (result) => {
        const compressedFile = new File([result], file.name, {
          type: result.type,
          lastModified: Date.now(),
        })
        resolve(compressedFile)
      },
      error: (error) => {
        reject(error)
      },
    })
  })
}

export const avatarCompressionOptions: CompressionOptions = {
  quality: 0.75,
  maxWidth: 400,
  maxHeight: 400,
  convertSize: 1000000,
  convertTypes: ['image/png', 'image/jpeg']
}

export const restaurantImageCompressionOptions: CompressionOptions = {
  quality: 0.90,
  maxWidth: 1200,
  maxHeight: 800,
  convertSize: 3000000,
  convertTypes: ['image/png', 'image/jpeg']
}

export const dishImageCompressionOptions: CompressionOptions = {
  quality: 0.90,
  maxWidth: 1200,
  maxHeight: 800,
  convertSize: 3000000,
  convertTypes: ['image/png', 'image/jpeg']
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadFile, getR2Config } from '@/lib/r2'

/** Allowed image MIME types */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]

/** Allowed file extensions */
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

/**
 * Magic bytes for common image formats
 * Maps magic bytes (file signature) to MIME type
 */
const MAGIC_BYTES: Array<{ signature: number[]; mimeType: string }> = [
  { signature: [0xff, 0xd8, 0xff], mimeType: 'image/jpeg' },
  { signature: [0x89, 0x50, 0x4e, 0x47], mimeType: 'image/png' },
  { signature: [0x47, 0x49, 0x46, 0x38], mimeType: 'image/gif' },
]

/**
 * Detects the actual MIME type from file magic bytes.
 * Returns the detected MIME type or null if unknown.
 */
function detectMimeType(buffer: Buffer): string | null {
  const bytes = Array.from(buffer.slice(0, 12))

  // Check against known magic bytes
  for (const { signature, mimeType } of MAGIC_BYTES) {
    const isMatch = signature.every((byte, index) => bytes[index] === byte)
    if (isMatch) return mimeType
  }

  // Check for WEBP (RIFF....WEBP pattern)
  // Format: RIFF[4 bytes]WEBP
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return 'image/webp'
  }

  return null
}

/**
 * Gets file extension from filename (lowercase).
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  return lastDot >= 0 ? filename.slice(lastDot).toLowerCase() : ''
}

/**
 * Validates file type from server-side content.
 * Checks: MIME type (from magic bytes), file extension, and client-provided MIME.
 */
function validateFileType(buffer: Buffer, filename: string, clientMimeType: string): string | null {
  // 1. Validate client-provided MIME type is in allowlist
  if (!ALLOWED_MIME_TYPES.includes(clientMimeType)) {
    return null
  }

  // 2. Validate file extension
  const ext = getFileExtension(filename)
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return null
  }

  // 3. Validate magic bytes match expected image type
  const detectedMime = detectMimeType(buffer)
  if (!detectedMime) {
    return null
  }

  // 4. Ensure detected type matches client MIME and is allowed
  if (detectedMime !== clientMimeType && !ALLOWED_MIME_TYPES.includes(detectedMime)) {
    return null
  }

  return detectedMime
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const r2Config = getR2Config()
  if (!r2Config.isConfigured) {
    return NextResponse.json(
      { error: 'File storage not configured' },
      { status: 500 }
    )
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Server-side validation: check MIME type, extension, and magic bytes
  const validatedMimeType = validateFileType(buffer, file.name, file.type)
  if (!validatedMimeType) {
    return NextResponse.json(
      { error: 'Invalid file type. Allowed: jpeg, png, gif, webp' },
      { status: 400 }
    )
  }

  try {
    const url = await uploadFile(buffer, file.name, file.type)
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
const IMGBB_API_KEY = process.env.IMGBB_API_KEY || ''

export async function uploadFile(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  if (!IMGBB_API_KEY) {
    throw new Error('imgbb API key not configured')
  }

  const base64 = file.toString('base64')
  const formData = new URLSearchParams()
  formData.append('image', base64)
  formData.append('key', IMGBB_API_KEY)

  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData,
  })

  const data = await response.json() as {
    success: boolean
    data?: {
      url: string
      delete_url?: string
    }
    error?: {
      message: string
    }
  }

  if (!data.success || !data.data?.url) {
    throw new Error(data.error?.message || 'Upload failed')
  }

  return data.data.url
}

export function getR2Config() {
  return {
    isConfigured: !!IMGBB_API_KEY,
    publicUrl: '',
  }
}
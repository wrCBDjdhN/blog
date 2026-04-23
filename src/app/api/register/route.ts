import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// Simple in-memory rate limiter
const registrationAttempts = new Map<string, { count: number; firstAttempt: number }>()

function checkRateLimit(ip: string, maxAttempts: number = 3, windowMs: number = 3600000): boolean {
  const now = Date.now()
  const record = registrationAttempts.get(ip)

  if (!record || now - record.firstAttempt > windowMs) {
    registrationAttempts.set(ip, { count: 1, firstAttempt: now })
    return true
  }

  if (record.count >= maxAttempts) {
    return false
  }

  record.count++
  return true
}

function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  return request.ip || 'unknown'
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: NextRequest) {
  // Rate limiting check
  const clientIP = getClientIP(request)
  if (!checkRateLimit(clientIP)) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Please try again later.' },
      { status: 429 }
    )
  }

  const body = await request.json()
  const { email, password, name } = body

  // Guard clauses - validate required fields
  if (!email || !password || !name) {
    return NextResponse.json(
      { error: 'Email, password, and name are required' },
      { status: 400 }
    )
  }

  // Parse and validate email format
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: 'Invalid email format' },
      { status: 400 }
    )
  }

  // Enhanced password strength validation
  const passwordRequirements = [
    { valid: password.length >= 8, message: 'at least 8 characters' },
    { valid: /\d/.test(password), message: 'at least 1 number' },
    { valid: /[A-Z]/.test(password), message: 'at least 1 uppercase letter' },
  ]

  const failedRequirement = passwordRequirements.find(r => !r.valid)
  if (failedRequirement) {
    return NextResponse.json(
      { error: `Password must contain ${failedRequirement.message}` },
      { status: 400 }
    )
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return NextResponse.json(
      { error: 'Email already registered' },
      { status: 409 }
    )
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create user - isVerified true since this is direct registration
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      isVerified: true,
    },
  })

  return NextResponse.json(
    {
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    },
    { status: 201 }
  )
}
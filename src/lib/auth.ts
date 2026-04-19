import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

const RATE_LIMIT = 5
const RATE_WINDOW_MS = 15 * 60 * 1000
const BAN_DURATION_MS = 30 * 60 * 1000

async function checkRateLimit(email: string): Promise<boolean> {
  const now = new Date()

  const existing = await prisma.rateLimit.findUnique({
    where: { identifier: email },
  })

  if (!existing || existing.expiresAt < now) {
    const expiresAt = new Date(now.getTime() + RATE_WINDOW_MS)
    await prisma.rateLimit.upsert({
      where: { identifier: email },
      create: {
        identifier: email,
        count: 1,
        firstAttempt: BigInt(now.getTime()),
        expiresAt,
      },
      update: {
        count: 1,
        firstAttempt: BigInt(now.getTime()),
        expiresAt,
      },
    })
    return true
  }

  if (existing.count >= RATE_LIMIT) {
    const banExpiresAt = new Date(now.getTime() + BAN_DURATION_MS)
    await prisma.rateLimit.update({
      where: { identifier: email },
      data: { expiresAt: banExpiresAt },
    })
    return false
  }

  await prisma.rateLimit.update({
    where: { identifier: email },
    data: { count: { increment: 1 } },
  })
  return true
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const isAllowed = await checkRateLimit(credentials.email)
        if (!isAllowed) {
          console.warn(`Rate limit exceeded for: ${credentials.email}`)
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role || 'user'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
}
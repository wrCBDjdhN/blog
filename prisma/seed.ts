import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@example.com'
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: '博主',
        bio: '欢迎来到我的个人博客，在这里分享我的想法和作品。',
      },
    })
    
    console.log('Admin user created: admin@example.com / admin123')
  } else {
    console.log('Admin user already exists')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
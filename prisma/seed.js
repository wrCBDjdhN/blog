const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    })

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(password, 10)
      
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: '博主',
          bio: '欢迎来到我的个人博客',
        },
      })
      
      console.log(`Admin user created: ${email}`)
    } else {
      console.log('Admin user already exists')
    }
  } catch (error) {
    console.error('Seed error:', error)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
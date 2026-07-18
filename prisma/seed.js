const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // V2 修复：移除硬编码弱口令回退。生产/部署必须显式提供 ADMIN_EMAIL 与
  // ADMIN_PASSWORD，缺失则直接报错退出，避免自动创建已知凭据的管理员账号。
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.error(
      'Seed aborted: ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set. ' +
        'Refusing to create an admin account with default/weak credentials.'
    )
    process.exit(1)
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('Seed aborted: ADMIN_EMAIL is not a valid email address.')
    process.exit(1)
  }

  if (password.length < 12) {
    console.error('Seed aborted: ADMIN_PASSWORD must be at least 12 characters long.')
    process.exit(1)
  }

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
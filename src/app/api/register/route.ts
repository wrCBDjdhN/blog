import { NextResponse } from 'next/server'

// V4 修复：关闭公开注册。个人博客账号仅由管理员通过 /api/init
// （INIT_SECRET 门控）或部署期 seed 创建，避免注册后直接发帖的内容投毒/垃圾。
export async function POST() {
  return NextResponse.json(
    { error: 'Public registration is disabled. Account creation is admin-only.' },
    { status: 403 }
  )
}

import nodemailer from 'nodemailer'

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

function createTransporter() {
  const host = process.env.EMAIL_HOST
  const port = parseInt(process.env.EMAIL_PORT || '587')
  const user = process.env.EMAIL_USER
  const password = process.env.EMAIL_PASSWORD

  if (!host || !user || !password) {
    throw new Error('Email configuration is missing. Please check environment variables.')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass: password,
    },
  })
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  const transporter = createTransporter()
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER

  await transporter.sendMail({
    from: `"Blog Shop" <${from}>`,
    to,
    subject,
    html,
  })
}

export async function sendOrderConfirmationEmail(
  to: string,
  orderNumber: string,
  productName: string,
  price: number,
  buyerName: string
): Promise<void> {
  const subject = `订单确认 - ${orderNumber}`
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <h1 style="color: #333; border-bottom: 2px solid #0066ff; padding-bottom: 10px;">
        订单确认
      </h1>
      
      <p style="color: #666; line-height: 1.6;">
        尊敬的 <strong>${buyerName}</strong>，您好！
      </p>
      
      <p style="color: #666; line-height: 1.6;">
        感谢您的购买！您的订单已成功创建，订单详情如下：
      </p>
      
      <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">订单号</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold;">${orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">商品名称</td>
            <td style="padding: 8px 0; text-align: right;">${productName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">订单金额</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #0066ff;">¥${price.toFixed(2)}</td>
          </tr>
        </table>
      </div>
      
      <p style="color: #666; line-height: 1.6;">
        请完成付款后，我们将会根据您提供的邮箱地址发送商品或相关信息。
      </p>
      
      <p style="color: #999; font-size: 14px; line-height: 1.6; margin-top: 30px;">
        如有任何问题，请回复此邮件联系我们。
      </p>
      
      <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
        <p>此邮件由系统自动发送，请勿回复。</p>
      </div>
    </div>
  `

  await sendEmail({ to, subject, html })
}

export async function sendOrderSuccessEmail(
  to: string,
  orderNumber: string,
  productName: string,
  price: number,
  buyerName: string
): Promise<void> {
  const subject = `订单支付成功 - ${orderNumber}`
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <h1 style="color: #22c55e; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">
        支付成功
      </h1>
      
      <p style="color: #666; line-height: 1.6;">
        尊敬的 <strong>${buyerName}</strong>，您好！
      </p>
      
      <p style="color: #666; line-height: 1.6;">
        您的订单已支付成功，订单详情如下：
      </p>
      
      <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">订单号</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold;">${orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">商品名称</td>
            <td style="padding: 8px 0; text-align: right;">${productName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">订单金额</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #22c55e;">¥${price.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">订单状态</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #22c55e;">已支付</td>
          </tr>
        </table>
      </div>
      
      <p style="color: #666; line-height: 1.6;">
        感谢您的购买！商品或相关信息将尽快发送到您的邮箱。
      </p>
      
      <p style="color: #999; font-size: 14px; line-height: 1.6; margin-top: 30px;">
        如有任何问题，请回复此邮件联系我们。
      </p>
      
      <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
        <p>此邮件由系统自动发送，请勿回复。</p>
      </div>
    </div>
  `

  await sendEmail({ to, subject, html })
}

export async function sendOrderFailedEmail(
  to: string,
  orderNumber: string,
  productName: string,
  price: number,
  buyerName: string,
  failType: 'failed' | 'expired' = 'failed'
): Promise<void> {
  const statusText = failType === 'expired' ? '已超时' : '支付失败'
  const subject = failType === 'expired' 
    ? `订单已超时 - ${orderNumber}` 
    : `订单支付失败 - ${orderNumber}`
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <h1 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">
        ${failType === 'expired' ? '订单超时' : '支付失败'}
      </h1>
      
      <p style="color: #666; line-height: 1.6;">
        尊敬的 <strong>${buyerName}</strong>，您好！
      </p>
      
      <p style="color: #666; line-height: 1.6;">
        您的订单状态更新如下：
      </p>
      
      <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">订单号</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold;">${orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">商品名称</td>
            <td style="padding: 8px 0; text-align: right;">${productName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">订单金额</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold;">¥${price.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">订单状态</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #ef4444;">${statusText}</td>
          </tr>
        </table>
      </div>
      
      <p style="color: #666; line-height: 1.6;">
        ${failType === 'expired' 
          ? '抱歉，该订单已超过24小时未完成支付，系统已自动关闭订单。' 
          : '抱歉，您的支付未成功，请重新下单并完成支付。'}
      </p>
      
      <p style="color: #999; font-size: 14px; line-height: 1.6; margin-top: 30px;">
        如有任何问题，请回复此邮件联系我们。
      </p>
      
      <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
        <p>此邮件由系统自动发送，请勿回复。</p>
      </div>
    </div>
  `

  await sendEmail({ to, subject, html })
}

const BLOGGER_EMAIL = 'huohaoxiang2012@163.com'

export async function sendPurchaseNotificationEmail(
  orderNumber: string,
  productName: string,
  price: number,
  buyerName: string,
  buyerEmail: string
): Promise<void> {
  const subject = `新订单通知 - ${orderNumber}`
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <h1 style="color: #333; border-bottom: 2px solid #0066ff; padding-bottom: 10px;">
        新订单通知
      </h1>
      
      <p style="color: #666; line-height: 1.6;">
        您有一笔新的订单，订单详情如下：
      </p>
      
      <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">订单号</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold;">${orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">商品名称</td>
            <td style="padding: 8px 0; text-align: right;">${productName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">订单金额</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #0066ff;">¥${price.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">购买人</td>
            <td style="padding: 8px 0; text-align: right;">${buyerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">购买人邮箱</td>
            <td style="padding: 8px 0; text-align: right;">${buyerEmail}</td>
          </tr>
        </table>
      </div>
      
      <p style="color: #666; line-height: 1.6;">
        请及时处理该订单。
      </p>
      
      <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
        <p>此邮件由系统自动发送。</p>
      </div>
    </div>
  `

  await sendEmail({ to: BLOGGER_EMAIL, subject, html })
}
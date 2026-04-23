import WechatPay from 'wechatpay-node-v3'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

// 微信支付配置 - 延迟加载证书
let config: {
  appid: string
  mchid: string
  publicKey: Buffer | null
  privateKey: Buffer | null
  privateKeyPath: string
  apiKeyV3: string
} | null = null

function getConfig() {
  if (config) return config

  const certPath = process.env.WECHAT_CERT_PATH 
    ? path.join(process.cwd(), process.env.WECHAT_CERT_PATH)
    : path.join(process.cwd(), 'cert', 'apiclient_cert.pem')
  
  const keyPath = process.env.WECHAT_KEY_PATH
    ? path.join(process.cwd(), process.env.WECHAT_KEY_PATH)
    : path.join(process.cwd(), 'cert', 'apiclient_key.pem')

  // 检查证书文件是否存在
  let publicKey: Buffer | null = null
  let privateKey: Buffer | null = null
  
  if (fs.existsSync(certPath)) {
    publicKey = fs.readFileSync(certPath)
  }
  
  if (fs.existsSync(keyPath)) {
    privateKey = fs.readFileSync(keyPath)
  }

  config = {
    appid: process.env.WECHAT_APPID || '',
    mchid: process.env.WECHAT_MCHID || '',
    publicKey,
    privateKey,
    privateKeyPath: process.env.WECHAT_PRIVATE_KEY || '',
    apiKeyV3: process.env.WECHAT_API_KEY_V3 || '',
  }

  return config
}

// 创建微信支付实例
let wechatPay: WechatPay | null = null

export function getWechatPay(): WechatPay | null {
  const cfg = getConfig()
  
  if (!cfg.mchid || !cfg.publicKey || !cfg.privateKey) {
    console.warn('微信支付配置不完整，请检查环境变量和证书文件')
    return null
  }

  if (!wechatPay) {
    wechatPay = new WechatPay({
      appid: cfg.appid,
      mchid: cfg.mchid,
      publicKey: cfg.publicKey,
      privateKey: cfg.privateKey,
    })
  }

  return wechatPay
}

/**
 * 生成随机字符串
 */
export function generateNonceStr(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 生成商户订单号
 */
export function generateOutTradeNo(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')
  return `ORDER${timestamp}${random}`
}

/**
 * 生成签名
 */
export function generateSignature(
  message: string,
  privateKey: string
): string {
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(message)
  return sign.sign(privateKey, 'base64')
}

/**
 * 验证签名
 */
export function verifySignature(
  message: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    const verify = crypto.createVerify('RSA-SHA256')
    verify.update(message)
    return verify.verify(publicKey, signature, 'base64')
  } catch (error) {
    console.error('签名验证失败:', error)
    return false
  }
}

/**
 * 解密通知消息
 */
export function decryptNotification(
  ciphertext: string,
  nonce: string,
  associatedData: string
): any {
  try {
    const cfg = getConfig()
    const key = cfg.apiKeyV3
    const keyBuffer = Buffer.from(key, 'utf8')
    const nonceBuffer = Buffer.from(nonce, 'utf8')
    const associatedDataBuffer = Buffer.from(associatedData, 'utf8')
    const ciphertextBuffer = Buffer.from(ciphertext, 'base64')

    const authTag = ciphertextBuffer.subarray(ciphertextBuffer.length - 16)
    const data = ciphertextBuffer.subarray(0, ciphertextBuffer.length - 16)

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      keyBuffer,
      nonceBuffer
    )
    decipher.setAuthTag(authTag)
    decipher.setAAD(associatedDataBuffer)

    const decrypted = Buffer.concat([
      decipher.update(data),
      decipher.final(),
    ])

    return JSON.parse(decrypted.toString('utf8'))
  } catch (error) {
    console.error('解密通知消息失败:', error)
    return null
  }
}

/**
 * 统一下单 (JSAPI - 公众号/小程序支付)
 */
export async function createNativeOrder(params: {
  outTradeNo: string
  description: string
  amount: number // 单位: 分
  notifyUrl: string
  openid?: string
}): Promise<{
  code_url?: string
  prepay_id?: string
  error?: string
}> {
  const wechatpay = getWechatPay()
  if (!wechatpay) {
    return { error: '微信支付未配置' }
  }

  const cfg = getConfig()
  
  try {
    const result = await wechatpay.transactions_native({
      appid: cfg.appid,
      mchid: cfg.mchid,
      description: params.description,
      out_trade_no: params.outTradeNo,
      notify_url: params.notifyUrl,
      amount: {
        total: params.amount,
        currency: 'CNY',
      },
    }) as any

    if (result.code_url) {
      return { code_url: result.code_url }
    }

    return { error: '创建订单失败' }
  } catch (error: any) {
    console.error('统一下单失败:', error)
    return { error: error.message || '创建订单失败' }
  }
}

/**
 * JSAPI 统一下单 (需要 openid)
 */
export async function createJSAPIOrder(params: {
  outTradeNo: string
  description: string
  amount: number // 单位: 分
  notifyUrl: string
  openid: string
}): Promise<{
  prepay_id?: string
  error?: string
}> {
  const wechatpay = getWechatPay()
  if (!wechatpay) {
    return { error: '微信支付未配置' }
  }

  const cfg = getConfig()

  try {
    const result = await wechatpay.transactions_jsapi({
      appid: cfg.appid,
      mchid: cfg.mchid,
      description: params.description,
      out_trade_no: params.outTradeNo,
      notify_url: params.notifyUrl,
      amount: {
        total: params.amount,
        currency: 'CNY',
      },
      payer: {
        openid: params.openid,
      },
    }) as any

    if (result.prepay_id) {
      return { prepay_id: result.prepay_id }
    }

    return { error: '创建订单失败' }
  } catch (error: any) {
    console.error('JSAPI统一下单失败:', error)
    return { error: error.message || '创建订单失败' }
  }
}

/**
 * 查询订单状态
 */
export async function queryOrder(outTradeNo: string): Promise<{
  trade_state?: string
  transaction_id?: string
  time_end?: string
  error?: string
}> {
  const wechatpay = getWechatPay()
  if (!wechatpay) {
    return { error: '微信支付未配置' }
  }

  try {
    const result = await wechatpay.query({
      out_trade_no: outTradeNo,
    }) as any

    return {
      trade_state: result.trade_state,
      transaction_id: result.transaction_id,
      time_end: result.time_end,
    }
  } catch (error: any) {
    console.error('查询订单失败:', error)
    return { error: error.message || '查询订单失败' }
  }
}

/**
 * 关闭订单
 */
export async function closeOrder(outTradeNo: string): Promise<{
  success?: boolean
  error?: string
}> {
  const wechatpay = getWechatPay()
  if (!wechatpay) {
    return { error: '微信支付未配置' }
  }

  try {
    await wechatpay.close(outTradeNo) as any

    return { success: true }
  } catch (error: any) {
    console.error('关闭订单失败:', error)
    return { error: error.message || '关闭订单失败' }
  }
}

export default {
  getWechatPay,
  generateNonceStr,
  generateOutTradeNo,
  generateSignature,
  verifySignature,
  decryptNotification,
  createNativeOrder,
  createJSAPIOrder,
  queryOrder,
  closeOrder,
}
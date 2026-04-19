'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Order {
  id: string
  orderNumber: string
  productName: string
  price: number
  buyerName: string
  buyerEmail: string
  status: 'pending' | 'paid' | 'failed' | 'expired'
  createdAt: string
  paidAt: string | null
}

const statusFilters = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'paid', label: '已支付' },
  { value: 'failed', label: '已失败' },
  { value: 'expired', label: '已超时' },
]

const statusLabels: Record<string, string> = {
  pending: '待审核',
  paid: '已支付',
  failed: '已失败',
  expired: '已超时',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800',
}

export default function AdminOrdersPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [sessionStatus, router])

  useEffect(() => {
    if (session) {
      fetchOrders()
    }
  }, [session, filterStatus])

  async function fetchOrders() {
    setLoading(true)
    try {
      const url = new URL('/api/admin/orders', window.location.origin)
      if (filterStatus) {
        url.searchParams.set('status', filterStatus)
      }
      const res = await fetch(url.toString())
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      const data = await res.json()
      setOrders(data)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('获取订单失败')
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(orderNumber: string, action: 'confirm' | 'fail' | 'expire') {
    setActionLoading(orderNumber)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, action }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || '操作失败')
        return
      }

      toast.success(
        action === 'confirm'
          ? '已确认支付'
          : action === 'fail'
          ? '已标记为支付失败'
          : '已标记为超时'
      )
      fetchOrders()
    } catch (error) {
      console.error('Failed to update order:', error)
      toast.error('操作失败')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(orderId: string) {
    if (!confirm('确定要删除这条订单记录吗？此操作不可恢复。')) {
      return
    }

    setActionLoading(orderId)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || '删除失败')
        return
      }

      toast.success('订单已删除')
      fetchOrders()
    } catch (error) {
      console.error('Failed to delete order:', error)
      toast.error('删除失败')
    } finally {
      setActionLoading(null)
    }
  }

  function isExpired(createdAt: string): boolean {
    const created = new Date(createdAt)
    const now = new Date()
    const diff = now.getTime() - created.getTime()
    return diff > 24 * 60 * 60 * 1000
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (sessionStatus === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
        <div className="flex gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === filter.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500">暂无订单</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    订单号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    商品名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    价格
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    购买人
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    邮箱
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => {
                  const expired = isExpired(order.createdAt)
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ¥{order.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.buyerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.buyerEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            statusColors[order.status]
                          }`}
                        >
                          {statusLabels[order.status]}
                          {expired && order.status === 'pending' && (
                            <span className="ml-1 text-red-600">(已超时)</span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {order.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAction(order.orderNumber, 'confirm')}
                              disabled={actionLoading === order.orderNumber}
                              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                              {actionLoading === order.orderNumber
                                ? '处理中...'
                                : '确认支付'}
                            </button>
                            <button
                              onClick={() => handleAction(order.orderNumber, 'fail')}
                              disabled={actionLoading === order.orderNumber}
                              className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                              支付失败
                            </button>
                            <button
                              onClick={() => handleAction(order.orderNumber, 'expire')}
                              disabled={actionLoading === order.orderNumber}
                              className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 disabled:opacity-50 transition-colors"
                            >
                              超时
                            </button>
                          </div>
                        )}
                        {order.status !== 'pending' && (
                          <button
                            onClick={() => handleDelete(order.id)}
                            disabled={actionLoading === order.id}
                            className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            {actionLoading === order.id ? '删除中...' : '删除'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
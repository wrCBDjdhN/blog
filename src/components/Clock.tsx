'use client'

import { useState, useEffect } from 'react'

interface TimeData {
  time: string
  date: string
}

function getCurrentTime(): TimeData {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return {
    time: `${hours}:${minutes}:${seconds}`,
    date: `${year}/${month}/${day}`,
  }
}

export default function Clock() {
  // 初始渲染不读取时间：服务端与客户端首帧必须一致（否则触发 hydration 不匹配 #425）。
  // 真实时间只在 useEffect 中读取，首帧显示占位符。
  const [timeData, setTimeData] = useState<TimeData | null>(null)

  useEffect(() => {
    setTimeData(getCurrentTime())
    const interval = setInterval(() => {
      setTimeData(getCurrentTime())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-3 px-4 rounded-lg bg-white/60 backdrop-blur-sm">
      <div className="text-2xl font-mono font-medium text-gray-800 tracking-wider">
        {timeData ? timeData.time : '--:--:--'}
      </div>
      <div className="text-sm font-mono text-gray-500 mt-1">
        {timeData ? timeData.date : '----/--/--'}
      </div>
    </div>
  )
}
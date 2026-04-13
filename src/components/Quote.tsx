'use client'

import { useState, useEffect, useCallback } from 'react'

const quotes = [
  { text: '道可道，非常道；名可名，非常名。', source: '《道德经》' },
  { text: '千里之行，始于足下。', source: '《道德经》' },
  { text: '上善若水，水善利万物而不争。', source: '《道德经》' },
  { text: '知人者智，自知者明。', source: '《道德经》' },
  { text: '大音希声，大象无形。', source: '《道德经》' },
  { text: '天网恢恢，疏而不漏。', source: '《道德经》' },
  { text: '祸兮福之所倚，福兮祸之所伏。', source: '《道德经》' },
  { text: '物以类聚，人以群分。', source: '《易经》' },
  { text: '天行健，君子以自强不息。', source: '《易经》' },
  { text: '地势坤，君子以厚德载物。', source: '《易经》' },
  { text: '学而不思则罔，思而不学则殆。', source: '《论语》' },
  { text: '己所不欲，勿施于人。', source: '《论语》' },
  { text: '三人行，必有我师焉。', source: '《论语》' },
  { text: '有朋自远方来，不亦乐乎。', source: '《论语》' },
  { text: '温故而知新，可以为师矣。', source: '《论语》' },
  { text: '岁寒，然后知松柏之后凋也。', source: '《论语》' },
]

function getRandomQuote(excludeIndex: number): { text: string; source: string; index: number } {
  let newIndex: number
  do {
    newIndex = Math.floor(Math.random() * quotes.length)
  } while (newIndex === excludeIndex && quotes.length > 1)
  
  return {
    text: quotes[newIndex].text,
    source: quotes[newIndex].source,
    index: newIndex,
  }
}

export default function Quote() {
  const [currentQuote, setCurrentQuote] = useState<{ text: string; source: string; index: number }>(() => getRandomQuote(-1))
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshQuote = useCallback(() => {
    setIsRefreshing(true)
    setTimeout(() => {
      setCurrentQuote(prev => getRandomQuote(prev.index))
      setIsRefreshing(false)
    }, 500)
  }, [])

  useEffect(() => {
    const interval = setInterval(refreshQuote, 30000)
    return () => clearInterval(interval)
  }, [refreshQuote])

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-300 via-amber-100 to-orange-200 animate-gradient-breath">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.4)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.3)_0%,transparent_40%)" />
        </div>

        <div className="relative px-4 py-3 flex items-center justify-center min-h-[60px]">
          <div className="text-center">
            <p 
              className="font-serif text-lg md:text-xl leading-relaxed transition-all duration-500"
              style={{
                color: '#1f2937',
                textShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(254,240,138,0.5), 0 2px 4px rgba(0,0,0,0.1)',
                fontFamily: '"Noto Serif SC", "Songti SC", "SimSun", serif',
                opacity: isRefreshing ? 0 : 1,
                transform: isRefreshing ? 'translateY(8px)' : 'translateY(0)',
              }}
            >
              {currentQuote.text}
            </p>
            <p 
              className="text-sm mt-1 transition-opacity duration-500"
              style={{
                color: '#4b5563',
                fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
                opacity: isRefreshing ? 0 : 1,
              }}
            >
              —— {currentQuote.source}
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-40" />
      </div>
    </div>
  )
}
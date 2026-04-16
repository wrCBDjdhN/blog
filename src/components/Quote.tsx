'use client'

import { useState, useEffect, useCallback } from 'react'

const quotes = [
  { text: '失败比成功更能让人记忆深刻。', source: 'None' },
  { text: '她说，去你妈的花海。', source: '《在》草东没有派对' },
  { text: '主，都不在乎。', source: '《三体》' },
  { text: '等石狮子上落满麻雀。', source: '《宇宙探索编辑部》' },
  { text: '别等到失去了才懂得珍惜。', source: 'None' },
  { text: '我这一生，如履薄冰，你说我能走到对岸吗。', source: 'Unknow' },
  { text: '在成人之前，真想先成为自己，在世界毁灭之前，真想先毁灭自己。', source: '《空》草东没有派对' },
  { text: '我希望她幸福她幸福她幸福。', source: '《现在你才不幸福》河南说唱之神' },
  { text: 'FACE THE FEAR,MAKE THE FUTURE。', source: 'LOBOTOMY CORTORATION' },
  { text: 'THE WORLD IS SICK', source: 'Unknow' },
  { text: '和过去的自己做个了断，弱小的人总是眼泪泡饭', source: '《矿》亚细亚旷世奇才' },
  { text: '不理解，不原谅。', source: '《宇宙探索编辑部》' },
  { text: '老唐，你就只能到这儿喽。', source: '《宇宙探索编辑部》' },
  { text: '人们把无法理解的事物，成为神话。', source: '白夜梦的摸鱼时间' },
  { text: '人类至上主义。', source: '白夜梦的摸鱼时间' },
  { text: '你愿意牺牲生命，换一个名垂史册的机会吗。', source: '白夜梦的摸鱼时间' },
  { text: '假如人类文明的命运是被设计出来的。', source: '白夜梦的摸鱼时间' },
  { text: '古人把无法解释的自然现象，称之为神话。', source: '白夜梦的摸鱼时间' },
  { text: '是牺牲99%的人类拯救剩余百分之一,还是全部的人类一起消亡?', source: '白夜梦的摸鱼时间' },
  { text: '末日即将到来，如果只能给下一轮文明留下一句话，你会说什么？', source: '白夜梦的摸鱼时间' },
  { text: '假如你的大脑潜能被100%开发，但只剩一年寿命，你会利用这智慧做些什么？', source: '白夜梦的摸鱼时间' },
  { text: '真相的厚度远不止125页论文。', source: '白夜梦的摸鱼时间' },
  { text: '屠龙的勇士终成恶龙。', source: '白夜梦的摸鱼时间' },
  { text: '爱的本质是慕强心理。', source: 'Unknow' },
  { text: '沉没成本不参与任何重大决策。', source: '让人琢磨一生的13字' },
  { text: '低谷才是常态。', source: '碎嘴企鹅' },
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
    const interval = setInterval(refreshQuote, 15000)
    return () => clearInterval(interval)
  }, [refreshQuote])

  return (
    <div className="w-full">
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
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
  { text: '我希望她幸福她幸福她幸福。', source: '《现在你才不幸福》' },
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
  { text: '沉没成本不参与任何重大决策。', source: 'Unknow' },
  { text: '低谷才是常态。', source: '碎嘴企鹅' },
  { text: '不再探索的人类，就不能再称为人类。', source: '白夜梦的摸鱼时间' },
  { text: '猫，有九条命。', source: '《不再探索的人类，就不能再称为人类》' },
  { text: '你会为了一个不可能实现的目标而努力吗?', source: '白夜梦的摸鱼时间' },
  { text: '假如你可以自己选择下辈子投什么胎，你最想成为谁?', source: '白夜梦的摸鱼时间' },
  { text: '麻痹的人生习惯痛苦的关系，但是你要习惯和那个人在一起。', source: '《搁浅的人》康士坦的变化球' },
  { text: '这全都是因为，我感觉不到痛。', source: '《搁浅的人》康士坦的变化球' },
  { text: '等风来，听雨落，等花开，追萤火。', source: '《等日落》' },
  { text: '就在弥留之际，我却看到了你。', source: '《弥留之际》' },
  { text: '失败比成功更能让人记忆深刻。', source: 'None' },
  { text: '人与人之间的距离该保持多远才显得神秘?', source: '《与众不同》' },
  { text: '放手或纠葛，你会如何选择?', source: '《如果》' },
  { text: '生命是一万次的谎话，吊唁着梦和童话。', source: '《空心人札记》' },
  { text: '我想要去的地方 他们说那是理想 我回不去的地方 他们说那是故乡。', source: '《无脚鸟》' },
  { text: '我被困在了这片混沌柳暗花明又一村一村一村一村又一村。', source: '《莫愁乡》' },
  { text: '我他妈去看海了；我他妈一个人，海也他妈是一片海。', source: 'None' },
  { text: '不被烧死的唯一方法，是活在火中。', source: 'None' },
  { text: '我们看惯了世间的罗生门 变得好像陌生人。', source: '《罗生门》' },
  { text: '她是踏碎星河落入我梦境的幻想。', source: '《堕》' },
  { text: '我并没有热爱这里，只是出生在这个地方。', source: '《工厂》' },
  { text: '你是人类以为你的以为你猜你的上帝更爱谁?', source: '《苍蝇》' },
  { text: '没杀人的杀人犯。', source: '《凶手不只一个》' },
  { text: '蝉时雨，化成淡墨渲染暮色，渗透着，勾勒出足迹与车辙。', source: '《世末歌者》' },
  { text: '偷走了夕阳，黑白了无常。', source: '《如常》' },
  { text: '芒草在山巅痛苦还留着眉间。', source: '《浴室》' },
  { text: '我理想的巨人打不过脚踩钱的侏儒。', source: '《焦作》' },
  { text: '你是圣诞老人送给我小孩子的礼物。', source: '《勾指起誓》' },
  { text: '屏幕弹窗不停滴答作响在一旁，咖啡越尝越苦却还要接着品尝。', source: '《感同身受》' },
  { text: '放弃规则后世俗在职责，放弃救赎后被评为罪恶。', source: '《调查中》' },
  { text: '没关系了我习惯逃避问题的方式，我甚至习惯我讨厌自己的样子。', source: '《搁浅的人》康士坦的变化球' },
  { text: '我愿听她说些不着边际的话 总比与你一起谈谈理想好吧。', source: '《迷恋》梅卡德尔' },
  { text: '大脑是用来让我们活着的，而不是让我们快乐的。', source: 'Unknow' },
  { text: '我一头撞死在了自己向往的蓝天里。', source: 'Unknow' },
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
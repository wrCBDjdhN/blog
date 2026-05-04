'use client'

import { useState, useEffect, useCallback } from 'react'

const quotes = [
  { text: '失败比成功更能让人记忆深刻。', source: 'None' },
  { text: '她说，去你妈的花海。', source: '《在》草东没有派对' },
  { text: '我在路灯下，遇见了很像你的她。', source: '《在》草东没有派对' },
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
  { text: '等风来，听雨落，等花开，追萤火。', source: '《等日落》瞳荧荧' },
  { text: '就在弥留之际，我却看到了你。', source: '《弥留之际》乌托邦P' },
  { text: '人与人之间的距离该保持多远才显得神秘?', source: '《与众不同》黑猫大少爷' },
  { text: '放手或纠葛，你会如何选择?', source: '《如果》翠花不太脆' },
  { text: '生命是一万次的谎话，吊唁着梦和童话。', source: '《空心人札记》星辰诗岸' },
  { text: '写下一万字的梦话，听风声吹过浪花。', source: '《空心人札记》星辰诗岸' },
  { text: '我想要去的地方 他们说那是理想 我回不去的地方 他们说那是故乡。', source: '《无脚鸟》瞳荧荧' },
  { text: '我被困在了这片混沌柳暗花明又一村一村一村一村又一村。', source: '《莫愁乡》亚细亚旷世奇才' },
  { text: '没有啥大能耐也无法忍受失败，杀死人的从来不是挫折而是期待。', source: '《莫愁乡》亚细亚旷世奇才' },
  { text: '我诉愁肠向莫愁乡把叹息吹成地上霜，明明快崩溃了却还有乔装无关痛痒。', source: '《莫愁乡》亚细亚旷世奇才' },
  { text: '纸飞机掠过操场后铁了心的要流浪，哪管前路几多长，偏信远方有朝阳，却输岁月半炷香，人走茶凉。', source: '《莫愁乡》亚细亚旷世奇才' },
  { text: '我他妈去看海了；我他妈一个人，海也他妈是一片海。', source: 'None' },
  { text: '不被烧死的唯一方法，是活在火中。', source: 'None' },
  { text: '我们看惯了世间的罗生门 变得好像陌生人。', source: '《罗生门》' },
  { text: '她是踏碎星河落入我梦境的幻想。', source: '《堕》' },
  { text: '我并没有热爱这里，只是出生在这个地方。', source: '《工厂》河南说唱之神' },
  { text: '现在我已经快丢掉信仰，但没有减小掉我的音量。', source: '《工厂》河南说唱之神' },
  { text: '你是人类以为你的以为你猜你的上帝更爱谁?', source: '《苍蝇》' },
  { text: '没杀人的杀人犯。', source: '《凶手不只一个》' },
  { text: '有位‘知情人士’爆料事情的经过，内容却前后矛盾怀疑是否有听错。', source: '《凶手不只一个》' },
  { text: '蝉时雨，化成淡墨渲染暮色，渗透着，勾勒出足迹与车辙。', source: '《世末歌者》' },
  { text: '我仍然在无人问津的阴雨霉湿之地，合着雨音唱着没有听众的歌曲。', source: '《世末歌者》' },
  { text: '偷走了夕阳，黑白了无常。', source: '《如常》草东没有排队' },
  { text: '芒草在山巅痛苦还留着眉间。', source: '《浴室》' },
  { text: '座座高楼像怪物把我束缚住，我理想的巨人打不过脚踩钱的侏儒。', source: '《焦作》亚细亚旷世奇才' },
  { text: '要如何才能逃出脚下这片沼泽，命运像把利刃把我的灵魂分割。', source: '《焦作》亚细亚旷世奇才' },
  { text: '你是圣诞老人送给我小孩子的礼物。', source: '《勾指起誓》' },
  { text: '屏幕弹窗不停滴答作响在一旁，咖啡越尝越苦却还要接着品尝。', source: '《感同身受》某幻君' },
  { text: '放弃规则后世俗在职责，放弃救赎后被评为罪恶。', source: '《调查中》' },
  { text: '没关系了我习惯逃避问题的方式，我甚至习惯我讨厌自己的样子。', source: '《搁浅的人》康士坦的变化球' },
  { text: '我愿听她说些不着边际的话 总比与你一起谈谈理想好吧。', source: '《迷恋》梅卡德尔' },
  { text: '大脑是用来让我们活着的，而不是让我们快乐的。', source: 'Unknow' },
  { text: '我一头撞死在了自己向往的蓝天里。', source: 'Unknow' },
  { text: '满地都是狼藉，他抬头，望向了月亮。', source: 'Unknow' },
  { text: '人在最难熬的时候，都会下意识地靠近一点光。', source: 'Unknow' },
  { text: '忍受着想要挣脱的生活，做出不想做的承诺。', source: '《反乌托邦》乌托邦P' },
  { text: '至少我还在为你而歌唱，在黑暗漫长的反乌托邦。', source: '《反乌托邦》乌托邦P' },
  { text: '我多浪荡我多肮脏，千页笔墨写我的罪状。', source: '《皮囊》犬儒乐队' },
  { text: '遮蔽着我黑色眼睛，赐予我肮脏的罪名。', source: '《志铭》犬儒乐队' },
  { text: '没有悲悯他的神灵，命运倒向金钱的天平。', source: '《志铭》犬儒乐队' },
  { text: '又是一个人坐电脑前发呆，游戏一旦开始就没有办法停下来。', source: '《尾巴》亚细亚旷世奇才' },
  { text: '愿做一只无脚鸟，打生下来便开始飞，愿采一朵荆棘花，把鲜血当作养料。', source: '《荆棘》亚细亚旷世奇才' },
  { text: '我把家乡装进我的行李再把我的伤口给清清创。', source: '《春城之子》亚细亚旷世奇才' },
  { text: '是孤独。', source: 'None' },
  { text: '遗憾总是贯彻人生的始终。', source: 'None' },
  { text: '未经全貌，不予评价。', source: 'None' },
  { text: '奇怪的世界里被待见的只有奇怪的东西。', source: 'None' },
  { text: '人一辈子，最重要的到底是什么？', source: 'None' },
  { text: '十个人叫欺凌，一万个人叫正义。', source: '《茧房》翠花不太脆' },
  { text: '愿你不是对世界失望，在绝望中死去。', source: '《星碎》瞳荧荧' },
  { text: '时针过一刻，夕阳挣扎着坠落，星星拉下暮色，月寥落。', source: '《星碎》瞳荧荧' },
  { text: '光与影撕扯，碎星抖落了尘锁，是谁疲惫魂魄，在不舍。', source: '《星碎》瞳荧荧' },
  { text: '时间会遗忘，可星星记得。', source: '《星碎》瞳荧荧' },
  { text: '像52Hz的蓝鲸，假装孤独的人学我到上瘾，复制的泪滴向下，坠落进了深海里。', source: '《脱水蓝鲸》' },
  { text: '一边沉默边共舞，你在世人眼中像是怪物，而我却跟着你将海游成枯竭的湖。', source: '《脱水蓝鲸》' },
  { text: '只是路过的你，请听我说，别对我太好了，我怕死时想起你会不舍。', source: '《无名情书》' },
  { text: '愿你能与珍视之人相逢，只可惜将来陪在你身边那人不会是我。', source: '《无名情书》' },
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
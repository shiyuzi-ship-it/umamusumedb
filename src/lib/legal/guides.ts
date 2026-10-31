import type { Docs } from './types';
export const guides: Docs = {
  en: {
    title: 'Guides - UmamusumeDB',
    description: 'International-focused guides for Uma Musume Pretty Derby: training fundamentals, support deck building, skills & inheritance, and competitive race strategy.',
    h1: 'Guides',
    intro: 'Written with an <strong>international player</strong> mindset: clear terminology, practical priorities, and meta-aware recommendations.',
    cards: [
      { id: 'training-basics', icon: 'rocket', title: 'Training Basics (育成)', desc: 'A fast on-ramp: what to focus on, why stats matter, and the “always good” early-game decisions.' },
      { id: 'support-decks', icon: 'layers', title: 'Support Deck Building', desc: 'How to build a 6-card deck by goal: speed-based, stamina long distance, and balanced templates.' },
      { id: 'skills-and-inheritance', icon: 'sparkles', title: 'Skills & Inheritance (因子)', desc: 'Skill priorities, acceleration vs speed, and how to think about factor inheritance without getting lost.' },
      { id: 'competitive', icon: 'target', title: 'Competitive Mindset', desc: 'Team Stadium / competitive races: what “meta” really means and how to adapt with limited cards.' },
    ],
    sections: [
      { id: 'training-basics', icon: 'rocket', h: 'Training Basics (International Terms)', blocks: [{ ul: [
        '<strong>Running styles</strong>: Nige/逃げ → “Front Runner”, Senko/先行 → “Pace Chaser”, Sashi/差し → “Late Surger”, Oikomi/追込 → “End Closer”.',
        '<strong>Most common early win condition</strong>: consistent training + strong support deck beats “perfect” RNG attempts.',
        '<strong>Skill priority shortcut</strong>: acceleration (last spurt) &gt; position control &gt; speed procs, unless the track demands stamina.'] }] },
      { id: 'support-decks', icon: 'layers', h: 'Support Deck Building', blocks: [
        { p: 'For international players, the most important habit is to build decks around <strong>one plan</strong> (distance + style), then only “splash” tech cards if your plan still hits stat targets.' },
        { p: 'Use the <a href="{L}/tools/support-deck/">Deck Builder</a> to draft templates quickly.' }] },
      { id: 'skills-and-inheritance', icon: 'sparkles', h: 'Skills & Inheritance', blocks: [{ p: 'If you’re unsure, start with “universal value” skills and avoid over-paying for situational ones. The <a href="{L}/tools/factor-calculator/">Factor Calculator</a> helps you plan inheritance without guesswork.' }] },
      { id: 'competitive', icon: 'target', h: 'Competitive Mindset', blocks: [{ p: '“Meta” is not a single tier list. It’s the combination of track conditions, popular styles, and what your card pool can support. We’ll keep expanding this section with track-specific checklists and budget alternatives.' }] },
    ],
  },
  ja: {
    title: 'ガイド - ウマ娘DB',
    description: 'ウマ娘プリティーダービー攻略ガイド:育成の基本、サポカデッキ構築、スキル&因子、対人向けの考え方。',
    h1: '攻略ガイド',
    intro: '国際版ユーザーにも分かりやすい用語で、育成の要点と考え方をまとめます(順次拡充)。',
    cards: [
      { id: 'training-basics', icon: 'rocket', title: '育成の基本', desc: '最短で伸びる優先順位と、序盤にやりがちな罠。' },
      { id: 'support-decks', icon: 'layers', title: 'サポカデッキ構築', desc: '距離×脚質で“1つの勝ち筋”を作る考え方。' },
      { id: 'skills-and-inheritance', icon: 'sparkles', title: 'スキル&因子', desc: '加速/速度/位置取りの優先順位と因子の考え方。' },
      { id: 'competitive', icon: 'target', title: '対人の考え方', desc: '“メタ”を分解して、手持ちで勝つ。' },
    ],
    sections: [
      { id: 'training-basics', icon: 'rocket', h: '育成の基本(国際版用語)', blocks: [{ ul: [
        '<strong>脚質</strong>: 逃げ=Front Runner / 先行=Pace Chaser / 差し=Late Surger / 追込=End Closer',
        '<strong>迷ったら</strong>: 最終直線の加速スキルを最優先(スタミナが足りない条件では回復も重要)',
        '<strong>デッキ</strong>: 距離と脚質を決めて“ブレない”のが一番強い'] }] },
      { id: 'support-decks', icon: 'layers', h: 'サポカデッキ構築', blocks: [{ p: 'まずは <strong>目標(距離×脚質)</strong> を決め、必要ステータスの下限を満たす形でカードを積みます。<a href="{L}/tools/support-deck/">デッキビルダー</a> を使うと雛形が作りやすいです。' }] },
      { id: 'skills-and-inheritance', icon: 'sparkles', h: 'スキル&因子', blocks: [{ p: '因子は“理想”より“再現性”が大事。まずは汎用性の高い因子から固めましょう。<a href="{L}/tools/factor-calculator/">因子計算</a> で継承確率を整理できます。' }] },
      { id: 'competitive', icon: 'target', h: '対人の考え方', blocks: [{ p: '“メタ”は環境・コース条件・主流脚質の組み合わせです。手持ちカードで勝てる形に落とし込むのがコツ。' }] },
    ],
  },
  zh: {
    title: '攻略指南 - UmamusumeDB',
    description: '面向国际玩家的《赛马娘 Pretty Derby》攻略:育成基础、支援卡组搭配、技能与因子继承、竞技比赛思路。',
    h1: '攻略指南',
    intro: '以<strong>国际玩家</strong>的视角编写:术语清晰、重点实用、紧跟环境(meta)。',
    cards: [
      { id: 'training-basics', icon: 'rocket', title: '育成基础', desc: '快速上手:该关注什么、为什么能力值重要,以及前期“怎么选都不亏”的决策。' },
      { id: 'support-decks', icon: 'layers', title: '支援卡组搭配', desc: '如何按目标搭配 6 张卡的卡组:速度型、持久力长距离型与均衡型模板。' },
      { id: 'skills-and-inheritance', icon: 'sparkles', title: '技能与因子继承', desc: '技能优先级、加速与速度的取舍,以及如何不迷失地思考因子继承。' },
      { id: 'competitive', icon: 'target', title: '竞技思路', desc: '竞技场/对战比赛:“环境”究竟指什么,以及如何用有限的卡适应环境。' },
    ],
    sections: [
      { id: 'training-basics', icon: 'rocket', h: '育成基础(国际版术语)', blocks: [{ ul: [
        '<strong>跑法</strong>:逃(Nige)→“Front Runner”,先行(Senko)→“Pace Chaser”,差(Sashi)→“Late Surger”,追(Oikomi)→“End Closer”。',
        '<strong>最常见的前期取胜条件</strong>:稳定的训练 + 强力的支援卡组,胜过追求“完美”随机结果的尝试。',
        '<strong>技能优先级捷径</strong>:加速(最后冲刺)&gt; 位置控制 &gt; 速度类发动,除非赛道要求持久力。'] }] },
      { id: 'support-decks', icon: 'layers', h: '支援卡组搭配', blocks: [
        { p: '对国际玩家而言,最重要的习惯是围绕<strong>一个方案</strong>(距离 + 跑法)搭配卡组,只有在方案仍能达到能力目标时,才“穿插”功能性卡片。' },
        { p: '可以使用<a href="{L}/tools/support-deck/">卡组编成</a>快速起草模板。' }] },
      { id: 'skills-and-inheritance', icon: 'sparkles', h: '技能与因子继承', blocks: [{ p: '如果拿不准,先从“通用价值高”的技能开始,避免为情境性技能付出过多。<a href="{L}/tools/factor-calculator/">因子计算器</a>可以帮助你有依据地规划继承。' }] },
      { id: 'competitive', icon: 'target', h: '竞技思路', blocks: [{ p: '“环境”并不是一张单一的强度榜,而是赛道条件、热门跑法和你的卡池所能支撑的内容的组合。我们会继续扩充本节,加入针对各赛道的检查清单和平价替代方案。' }] },
    ],
  },
  ko: {
    title: '가이드 - UmamusumeDB',
    description: '우마무스메 프리티 더비 글로벌 유저를 위한 가이드: 육성 기본, 서포트 덱 구성, 스킬과 인자, 대전 레이스 전략.',
    h1: '가이드',
    intro: '<strong>글로벌 플레이어</strong>의 관점에서 쓴 가이드입니다. 명확한 용어, 실용적인 우선순위, 환경(메타)을 고려한 추천을 담았습니다.',
    cards: [
      { id: 'training-basics', icon: 'rocket', title: '육성 기본', desc: '빠르게 시작하기: 무엇에 집중할지, 능력치가 왜 중요한지, 초반에 늘 좋은 선택들.' },
      { id: 'support-decks', icon: 'layers', title: '서포트 덱 구성', desc: '목표별 6장 덱 구성법: 스피드형, 스태미나 장거리형, 밸런스형 템플릿.' },
      { id: 'skills-and-inheritance', icon: 'sparkles', title: '스킬과 인자', desc: '스킬 우선순위, 가속과 속도의 비교, 인자 계승을 헷갈리지 않고 생각하는 법.' },
      { id: 'competitive', icon: 'target', title: '대전 마인드', desc: '챔피언스 미팅 등 대전 레이스: "메타"의 진짜 의미와 한정된 카드로 적응하는 법.' },
    ],
    sections: [
      { id: 'training-basics', icon: 'rocket', h: '육성 기본(글로벌 용어)', blocks: [{ ul: [
        '<strong>각질</strong>: 도주(逃げ)=Front Runner, 선행(先行)=Pace Chaser, 선입(差し)=Late Surger, 추입(追込)=End Closer.',
        '<strong>초반에 가장 흔한 승리 조건</strong>: 꾸준한 트레이닝과 강력한 서포트 덱이 "완벽한" 운빨 시도보다 낫습니다.',
        '<strong>스킬 우선순위 지름길</strong>: 가속(라스트 스퍼트) &gt; 포지션 컨트롤 &gt; 속도 발동. 단, 코스가 스태미나를 요구하면 예외입니다.'] }] },
      { id: 'support-decks', icon: 'layers', h: '서포트 덱 구성', blocks: [
        { p: '글로벌 플레이어에게 가장 중요한 습관은 <strong>하나의 플랜</strong>(거리 + 각질)을 중심으로 덱을 짜고, 그 플랜이 능력치 목표를 달성할 때만 기능성 카드를 "끼워 넣는" 것입니다.' },
        { p: '<a href="{L}/tools/support-deck/">서포트 덱 빌더</a>로 템플릿을 빠르게 짜 보세요.' }] },
      { id: 'skills-and-inheritance', icon: 'sparkles', h: '스킬과 인자', blocks: [{ p: '확신이 없다면 "범용 가치"가 높은 스킬부터 시작하고, 상황 한정 스킬에 과투자하지 마세요. <a href="{L}/tools/factor-calculator/">인자 계산기</a>로 감에 의존하지 않고 계승을 계획할 수 있습니다.' }] },
      { id: 'competitive', icon: 'target', h: '대전 마인드', blocks: [{ p: '"메타"는 하나의 티어표가 아닙니다. 코스 조건, 인기 각질, 그리고 보유 카드 풀이 뒷받침할 수 있는 것의 조합입니다. 이 섹션은 코스별 체크리스트와 저예산 대안으로 계속 확장할 예정입니다.' }] },
    ],
  },
};

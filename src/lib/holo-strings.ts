/** UI copy for the daily holographic pack, all five site locales.
 *  Do not use 抽卡 / 扭蛋 / 保底 / 欧 / 非 / 出货 / SSR (or gacha / pity / rate-up).
 */
import type { Locale } from './i18n';

export const HOLO_HTML_LANG: Record<Locale, string> = {
  en: 'en',
  ja: 'ja',
  zh: 'zh-Hans',
  'zh-tw': 'zh-Hant',
  ko: 'ko',
};

export const HOLO_OG_LOCALE: Record<Locale, string> = {
  en: 'en_US',
  ja: 'ja_JP',
  zh: 'zh_CN',
  'zh-tw': 'zh_TW',
  ko: 'ko_KR',
};

export interface HoloStrings {
  ritualTitle: string;
  ritualDesc: string;
  introTitle: string;
  introDesc: string;
  introH1: string;
  toolsCrumb: string;
  backToIntro: string;
  skip: string;
  sound: string;
  soundOn: string;
  soundOff: string;
  packAria: string;
  packTitle: string;
  packKicker: string;
  packNote: string;
  tearHint: string;
  nickCaption: string;
  tearBtn: string;
  inspectHint: string;
  issueToday: string;
  issueShared: string;
  issueLabel: string;
  streak: (n: number) => string;
  stamps: (n: number) => string;
  weekFrame: string;
  savePng: string;
  copyLink: string;
  copied: string;
  saving: string;
  saved: string;
  saveFail: string;
  charLink: string;
  replay: string;
  openOwn: string;
  dailyLock: (clock: string) => string;
  copyright: string;
  howTitle: string;
  howItems: string[];
  poolTitle: string;
  poolBody: string;
  aboutTitle: string;
  aboutBody: string;
  homeTitle: string;
  homeDesc: string;
  homeCta: string;
  toolsName: string;
  toolsDesc: string;
  charCta: string;
  shareTitle: (jp: string, en: string, id: string) => string;
  shareDesc: (jp: string, outfit: string, id: string) => string;
  notFoundTitle: string;
  notFoundH1: string;
  notFoundBody: string;
  openPack: string;
  homeLink: string;
  siteName: string;
  posterStreak: (n: number) => string;
  posterStamp: (n: number) => string;
  posterCredit: string;
  packError: string;
}

const en: HoloStrings = {
  ritualTitle: 'Daily pack · open | UmamusumeDB',
  ritualDesc: 'One free commemorative holographic card each day, with a unique issue number. Unofficial fan preview.',
  introTitle: 'Daily pack',
  introDesc: 'One free pack a day, a random commemorative holographic card, and a unique issue number. Save it, share it. Unofficial fan preview, Artwork © Cygames, Inc.',
  introH1: 'Daily pack',
  toolsCrumb: 'Tools',
  backToIntro: 'Daily pack intro',
  skip: 'Skip',
  sound: 'Sound',
  soundOn: 'Sound on',
  soundOff: 'Sound muted',
  packAria: "Today's pack. Tap, swipe the seal, or press Enter to tear it open.",
  packTitle: 'DAILY PACK',
  packKicker: 'UMAMUSUMEDB',
  packNote: 'One free pack a day · 1 commemorative holo card',
  tearHint: 'Swipe the seal · swipe up · or tap to open',
  nickCaption: 'Tear from the nick',
  tearBtn: 'Tear open',
  inspectHint: 'Drag the card to turn it in your hand · double-tap to reset',
  issueToday: "Today's number",
  issueShared: 'Shared number',
  issueLabel: 'No.',
  streak: (n) => `Day ${n}`,
  stamps: (n) => `Passed on ${n}`,
  weekFrame: '7-day frame',
  savePng: 'Save commemorative image',
  copyLink: 'Copy share link',
  copied: '✓ Link copied',
  saving: 'Creating image…',
  saved: 'Saved',
  saveFail: 'Could not save, please try again',
  charLink: 'Character profile',
  replay: 'Watch the opening again',
  openOwn: "Open today's pack →",
  dailyLock: (clock) => `Today's pack is already open · next pack in ${clock}`,
  copyright: 'Unofficial fan preview · Character artwork © Cygames, Inc. · ',
  howTitle: 'How it works',
  howItems: [
    'Once each day (by the calendar date in Beijing time) you can open one free pack and receive a random commemorative holographic card.',
    'Every card has a unique issue number in the form UMA-YYYYMMDD-XXXX.',
    'After opening, you can save a commemorative image, copy a share link, or open the character profile.',
    'No account is required, there are no paid extra packs, and sharing does not change the next day’s card.',
    'A consecutive-day counter shows “Day N”. After 7 days in a row, a decorative frame appears — a commemorative look, not a rarity.',
    'If someone opens their pack through your share link, your “Passed on” count increases by one (at most once per person per day). Passing on never grants extra packs or changes what appears.',
  ],
  poolTitle: 'The current set',
  poolBody: 'The pack can feature any character that has an official main portrait on UmamusumeDB — currently 274 commemorative cards, all using official in-game art as a fan holographic preview.',
  aboutTitle: 'About',
  aboutBody: 'This is an unofficial fan preview on umamusumedb.com. It is not affiliated with Cygames, Inc. or Umamusume: Pretty Derby, and it is not official merchandise or a digital collectible. Character artwork © Cygames, Inc.',
  homeTitle: 'Daily pack',
  homeDesc: 'One free pack a day, a random commemorative holographic card, and a unique issue number.',
  homeCta: "Open today's pack",
  toolsName: 'Daily pack',
  toolsDesc: 'One free pack a day, a random commemorative holographic card you can save and share.',
  charCta: "Open today's pack",
  shareTitle: (jp, en, id) => `${jp} / ${en} · ${id} | UmamusumeDB`,
  shareDesc: (jp, outfit, id) => `Daily pack commemorative card ${jp} (${outfit}), number ${id}. Unofficial fan preview, Artwork © Cygames, Inc.`,
  notFoundTitle: 'This commemorative card was not found | UmamusumeDB',
  notFoundH1: 'This number was not found',
  notFoundBody: 'The number in this share link does not exist, or has not been issued. Another card will not be shown at random.',
  openPack: "Open today's pack",
  homeLink: 'Home',
  siteName: 'UmamusumeDB',
  posterStreak: (n) => `Day ${n}`,
  posterStamp: (n) => `Passed on ${n}`,
  posterCredit: 'umamusumedb.com  ·  unofficial fan preview (free display, not official merchandise)  ·  Artwork © Cygames, Inc.',
  packError: 'Something went wrong. Please try again in a moment.',
};

const ja: HoloStrings = {
  ritualTitle: '今日のパック · 開封 | UmamusumeDB',
  ritualDesc: '毎日無料で1パック。ランダムな記念ホロカードに、固有の番号が付きます。非公式のファン向けプレビューです。',
  introTitle: '今日のパック',
  introDesc: '毎日無料で1パック。ランダムな記念ホロカードと固有番号。保存・共有できます。非公式ファンプレビュー、Artwork © Cygames, Inc.',
  introH1: '今日のパック',
  toolsCrumb: 'ツール',
  backToIntro: '今日のパックについて',
  skip: 'スキップ',
  sound: '音',
  soundOn: '音量オン',
  soundOff: 'ミュート中',
  packAria: '今日のパック。タップ、封のスワイプ、または Enter で開封します。',
  packTitle: '今日のパック',
  packKicker: 'UMAMUSUMEDB',
  packNote: '毎日無料1パック · 記念ホロカード1枚',
  tearHint: '封を横に滑らせる · 上にスワイプ · またはタップして開封',
  nickCaption: '切り込みから開封',
  tearBtn: '開封する',
  inspectHint: 'カードをドラッグして手元で回転 · ダブルタップで正面に戻す',
  issueToday: '本日の番号',
  issueShared: '共有された番号',
  issueLabel: '番号',
  streak: (n) => `第 ${n} 日`,
  stamps: (n) => `パス ${n}`,
  weekFrame: '七日記念フレーム',
  savePng: '記念画像を保存',
  copyLink: '共有リンクをコピー',
  copied: '✓ コピーしました',
  saving: '画像を作成中…',
  saved: '保存しました',
  saveFail: '保存に失敗しました。もう一度お試しください',
  charLink: 'キャラクター資料',
  replay: '開封をもう一度見る',
  openOwn: '今日のパックを開く →',
  dailyLock: (clock) => `今日のパックは開封済みです · 次のパックまで ${clock}`,
  copyright: '非公式ファンプレビュー · キャラクターイラストの著作権は © Cygames, Inc. に帰属 · ',
  howTitle: 'あそびかた',
  howItems: [
    '毎日（北京時間の暦日を基準）無料で1パックを開封でき、ランダムな記念ホロカードを1枚受け取ります。',
    '各カードには UMA-年月日-XXXX 形式の固有番号が付きます。',
    '開封後は記念画像の保存、共有リンクのコピー、該当キャラクター資料ページへの移動ができます。',
    'ログインは不要です。有料の追加パックはなく、共有しても翌日のカードは変わりません。',
    '連続して開封すると「第 N 日」と表示されます。7日連続で装飾フレームが付きます（記念の見た目であり、レア度ではありません）。',
    'あなたの共有リンクから誰かがその日のパックを開封すると、「パス」が1増えます（同一人物は1日1回まで）。パスしても追加パックは出ず、出現内容も変わりません。',
  ],
  poolTitle: '現在のラインナップ',
  poolBody: 'UmamusumeDB に公式のメイン立ち絵があるキャラクターはすべて登場します。現在 274 枚で、いずれもゲーム公式イラストを用いたファン向けホロプレビューです。',
  aboutTitle: 'ご案内',
  aboutBody: '本機能は umamusumedb.com の非公式ファンプレビューです。Cygames, Inc. および『ウマ娘 プリティーダービー』公式とは無関係で、公式グッズやデジタルコレクティブルではありません。キャラクターイラストの著作権は © Cygames, Inc. に帰属します。',
  homeTitle: '今日のパック',
  homeDesc: '毎日無料で1パック。ランダムな記念ホロカードと固有番号。',
  homeCta: '今日のパックを開く',
  toolsName: '今日のパック',
  toolsDesc: '毎日無料で1パック。保存・共有できる記念ホロカード。',
  charCta: '今日のパックを開く',
  shareTitle: (jp, en, id) => `${jp} / ${en} · ${id} | UmamusumeDB`,
  shareDesc: (jp, outfit, id) => `今日のパック記念カード ${jp}（${outfit}）、番号 ${id}。非公式ファンプレビュー、Artwork © Cygames, Inc.`,
  notFoundTitle: 'この記念カードは見つかりませんでした | UmamusumeDB',
  notFoundH1: 'この番号は見つかりませんでした',
  notFoundBody: '共有リンクの番号は存在しないか、まだ発行されていません。別のカードがランダムに表示されることはありません。',
  openPack: '今日のパックを開く',
  homeLink: 'ホーム',
  siteName: 'UmamusumeDB',
  posterStreak: (n) => `第 ${n} 日`,
  posterStamp: (n) => `パス ${n}`,
  posterCredit: 'umamusumedb.com  ·  非公式ファンプレビュー（無料展示、非公式グッズ）  ·  Artwork © Cygames, Inc.',
  packError: 'うまくいきませんでした。しばらくしてからもう一度お試しください。',
};

const zh: HoloStrings = {
  ritualTitle: '今日卡包 · 拆包 | UmamusumeDB',
  ritualDesc: '每日免费一包，随机一张纪念闪卡，带唯一编号。非官方同人预览。',
  introTitle: '今日卡包',
  introDesc: '每日免费一包，随机一张纪念闪卡，带唯一编号。可保存、可分享。非官方同人预览，Artwork © Cygames, Inc.',
  introH1: '今日卡包',
  toolsCrumb: '工具',
  backToIntro: '今日卡包介绍',
  skip: '跳过',
  sound: '音效',
  soundOn: '音效已开启',
  soundOff: '音效：已静音',
  packAria: '今日卡包，轻点、横向划过封口或按回车撕开',
  packTitle: '今日卡包',
  packKicker: 'UMAMUSUMEDB',
  packNote: '每日免费一包 · 内含 1 张全息闪卡',
  tearHint: '横向划过封口 · 上滑 · 或轻点拆开',
  nickCaption: '从缺口撕开',
  tearBtn: '撕开',
  inspectHint: '拖动卡片，像拿在手里一样旋转 · 双击回正',
  issueToday: '今日编号',
  issueShared: '分享编号',
  issueLabel: '编号',
  streak: (n) => `第 ${n} 日`,
  stamps: (n) => `传递 ${n}`,
  weekFrame: '七日纪念框',
  savePng: '保存纪念图',
  copyLink: '复制分享链接',
  copied: '✓ 已复制分享链接',
  saving: '生成纪念图中…',
  saved: '已保存',
  saveFail: '保存失败，请重试',
  charLink: '角色资料',
  replay: '再看一次拆包',
  openOwn: '拆开我今日的卡包 →',
  dailyLock: (clock) => `今日卡包已开启 · 距离明日新包 ${clock}`,
  copyright: '非官方同人预览 · 角色立绘版权归 © Cygames, Inc. 所有 · ',
  howTitle: '怎么玩',
  howItems: [
    '每天（以北京时间日期为准）可以免费拆开一包，随机得到一张全息纪念闪卡。',
    '每张卡都有唯一编号，格式为 UMA-年月日-XXXX。',
    '拆完可以保存纪念图、复制分享链接，也可以回到对应角色资料页。',
    '不需要登录，没有付费补包，不会改变第二天的卡片。',
    '连续拆包会显示「第 N 日」；连续 7 日会解锁一枚装饰框（只是纪念外观，不是稀有度）。',
    '如果有人通过你的分享链接完成当天的拆包，你的「传递」计数会增加一次（同一人每天最多一次）。传递不会额外发包装、也不会改变出现内容。',
  ],
  poolTitle: '当前卡池',
  poolBody: '凡在 UmamusumeDB 拥有官方主立绘的角色都会入包，目前共 274 张。全部使用游戏官方立绘做同人全息预览，不会另行重绘身体。',
  aboutTitle: '说明',
  aboutBody: '本功能是 umamusumedb.com 的非官方同人预览，与 Cygames, Inc. 及《赛马娘 Pretty Derby》官方无关，不是官方周边或数字藏品。角色立绘版权归 © Cygames, Inc. 所有。',
  homeTitle: '今日卡包',
  homeDesc: '每日免费一包，随机一张纪念闪卡，带唯一编号。',
  homeCta: '拆开今日卡包',
  toolsName: '今日卡包',
  toolsDesc: '每日免费一包，随机一张纪念闪卡，可保存与分享。',
  charCta: '去拆今日卡包',
  shareTitle: (jp, en, id) => `${jp} / ${en} · ${id} | UmamusumeDB`,
  shareDesc: (jp, outfit, id) => `今日卡包纪念闪卡 ${jp}（${outfit}），编号 ${id}。非官方同人预览，Artwork © Cygames, Inc.`,
  notFoundTitle: '未找到这张纪念闪卡 | UmamusumeDB',
  notFoundH1: '没有找到这个编号',
  notFoundBody: '分享链接里的编号不存在，或尚未发放。不会随机显示其他闪卡。',
  openPack: '拆今日卡包',
  homeLink: '返回首页',
  siteName: 'UmamusumeDB',
  posterStreak: (n) => `第 ${n} 日`,
  posterStamp: (n) => `传递 ${n}`,
  posterCredit: 'umamusumedb.com  ·  非官方同人预览（免费展示，非官方周边）  ·  Artwork © Cygames, Inc.',
  packError: '刚才出了点问题，请稍后再试。',
};

const zhtw: HoloStrings = {
  ritualTitle: '今日卡包 · 拆包 | UmamusumeDB',
  ritualDesc: '每日免費一包，隨機一張紀念閃卡，帶唯一編號。非官方同人預覽。',
  introTitle: '今日卡包',
  introDesc: '每日免費一包，隨機一張紀念閃卡，帶唯一編號。可保存、可分享。非官方同人預覽，Artwork © Cygames, Inc.',
  introH1: '今日卡包',
  toolsCrumb: '工具',
  backToIntro: '今日卡包介紹',
  skip: '跳過',
  sound: '音效',
  soundOn: '音效已開啟',
  soundOff: '音效：已靜音',
  packAria: '今日卡包，輕點、橫向劃過封口或按 Enter 撕開',
  packTitle: '今日卡包',
  packKicker: 'UMAMUSUMEDB',
  packNote: '每日免費一包 · 內含 1 張全息閃卡',
  tearHint: '橫向劃過封口 · 上滑 · 或輕點拆開',
  nickCaption: '從缺口撕開',
  tearBtn: '撕開',
  inspectHint: '拖動卡片，像拿在手裡一樣旋轉 · 點兩下回正',
  issueToday: '今日編號',
  issueShared: '分享編號',
  issueLabel: '編號',
  streak: (n) => `第 ${n} 日`,
  stamps: (n) => `傳遞 ${n}`,
  weekFrame: '七日紀念框',
  savePng: '保存紀念圖',
  copyLink: '複製分享連結',
  copied: '✓ 已複製分享連結',
  saving: '生成紀念圖中…',
  saved: '已保存',
  saveFail: '保存失敗，請重試',
  charLink: '角色資料',
  replay: '再看一次拆包',
  openOwn: '拆開我今日的卡包 →',
  dailyLock: (clock) => `今日卡包已開啟 · 距離明日新包 ${clock}`,
  copyright: '非官方同人預覽 · 角色立繪版權歸 © Cygames, Inc. 所有 · ',
  howTitle: '怎麼玩',
  howItems: [
    '每天（以北京時間日期為準）可以免費拆開一包，隨機得到一張全息紀念閃卡。',
    '每張卡都有唯一編號，格式為 UMA-年月日-XXXX。',
    '拆完可以保存紀念圖、複製分享連結，也可以回到對應角色資料頁。',
    '不需要登入，沒有付費補包，不會改變第二天的卡片。',
    '連續拆包會顯示「第 N 日」；連續 7 日會解鎖一枚裝飾框（只是紀念外觀，不是稀有度）。',
    '如果有人透過你的分享連結完成當天的拆包，你的「傳遞」計數會增加一次（同一人每天最多一次）。傳遞不會額外發包裝、也不會改變出現內容。',
  ],
  poolTitle: '目前卡池',
  poolBody: '凡在 UmamusumeDB 擁有官方主立繪的角色都會入包，目前共 274 張。全部使用遊戲官方立繪做同人全息預覽，不會另行重繪身體。',
  aboutTitle: '說明',
  aboutBody: '本功能是 umamusumedb.com 的非官方同人預覽，與 Cygames, Inc. 及《賽馬娘 Pretty Derby》官方無關，不是官方周邊或數位收藏品。角色立繪版權歸 © Cygames, Inc. 所有。',
  homeTitle: '今日卡包',
  homeDesc: '每日免費一包，隨機一張紀念閃卡，帶唯一編號。',
  homeCta: '拆開今日卡包',
  toolsName: '今日卡包',
  toolsDesc: '每日免費一包，隨機一張紀念閃卡，可保存與分享。',
  charCta: '去拆今日卡包',
  shareTitle: (jp, en, id) => `${jp} / ${en} · ${id} | UmamusumeDB`,
  shareDesc: (jp, outfit, id) => `今日卡包紀念閃卡 ${jp}（${outfit}），編號 ${id}。非官方同人預覽，Artwork © Cygames, Inc.`,
  notFoundTitle: '未找到這張紀念閃卡 | UmamusumeDB',
  notFoundH1: '沒有找到這個編號',
  notFoundBody: '分享連結裡的編號不存在，或尚未發放。不會隨機顯示其他閃卡。',
  openPack: '拆今日卡包',
  homeLink: '返回首頁',
  siteName: 'UmamusumeDB',
  posterStreak: (n) => `第 ${n} 日`,
  posterStamp: (n) => `傳遞 ${n}`,
  posterCredit: 'umamusumedb.com  ·  非官方同人預覽（免費展示，非官方周邊）  ·  Artwork © Cygames, Inc.',
  packError: '剛才出了點問題，請稍後再試。',
};

const ko: HoloStrings = {
  ritualTitle: '오늘의 팩 · 개봉 | UmamusumeDB',
  ritualDesc: '매일 무료 한 팩, 랜덤 기념 홀로그램 카드와 고유 번호. 비공식 팬 프리뷰입니다.',
  introTitle: '오늘의 팩',
  introDesc: '매일 무료 한 팩, 랜덤 기념 홀로그램 카드와 고유 번호. 저장하고 공유할 수 있습니다. 비공식 팬 프리뷰, Artwork © Cygames, Inc.',
  introH1: '오늘의 팩',
  toolsCrumb: '도구',
  backToIntro: '오늘의 팩 소개',
  skip: '건너뛰기',
  sound: '소리',
  soundOn: '소리 켜짐',
  soundOff: '음소거',
  packAria: '오늘의 팩. 탭하거나 봉인을 가로로 밀거나 Enter 로 찢어 여세요.',
  packTitle: '오늘의 팩',
  packKicker: 'UMAMUSUMEDB',
  packNote: '매일 무료 한 팩 · 기념 홀로 카드 1장',
  tearHint: '봉인을 가로로 밀기 · 위로 스와이프 · 또는 탭해서 열기',
  nickCaption: '홈에서 찢기',
  tearBtn: '찢어 열기',
  inspectHint: '카드를 드래그해 손에 들듯 회전 · 두 번 탭하면 정면으로',
  issueToday: '오늘의 번호',
  issueShared: '공유된 번호',
  issueLabel: '번호',
  streak: (n) => `${n}일차`,
  stamps: (n) => `전달 ${n}`,
  weekFrame: '7일 기념 프레임',
  savePng: '기념 이미지 저장',
  copyLink: '공유 링크 복사',
  copied: '✓ 링크를 복사했습니다',
  saving: '이미지를 만드는 중…',
  saved: '저장됨',
  saveFail: '저장에 실패했습니다. 다시 시도해 주세요',
  charLink: '캐릭터 정보',
  replay: '개봉을 다시 보기',
  openOwn: '오늘 내 팩 열기 →',
  dailyLock: (clock) => `오늘의 팩은 이미 열었습니다 · 다음 팩까지 ${clock}`,
  copyright: '비공식 팬 프리뷰 · 캐릭터 일러스트 저작권 © Cygames, Inc. · ',
  howTitle: '이용 방법',
  howItems: [
    '매일(베이징 시간 날짜 기준) 무료로 한 팩을 열어 랜덤 기념 홀로그램 카드 한 장을 받을 수 있습니다.',
    '모든 카드에는 UMA-연월일-XXXX 형식의 고유 번호가 붙습니다.',
    '개봉 후 기념 이미지를 저장하거나 공유 링크를 복사하고, 해당 캐릭터 정보 페이지로 이동할 수 있습니다.',
    '로그인은 필요 없고, 유료 추가 팩은 없으며, 공유해도 다음 날 카드는 바뀌지 않습니다.',
    '연속으로 열면 「N일차」가 표시됩니다. 7일 연속이면 장식 프레임이 추가됩니다(기념용 외형이며 희귀도가 아닙니다).',
    '다른 사람이 당신의 공유 링크로 그날의 팩을 열면 「전달」이 1 증가합니다(같은 사람은 하루에 한 번). 전달해도 추가 팩이 나오거나 등장 내용이 바뀌지 않습니다.',
  ],
  poolTitle: '현재 라인업',
  poolBody: 'UmamusumeDB 에 공식 메인 스탠딩 일러스트가 있는 캐릭터는 모두 등장합니다. 현재 274장으로, 모두 게임 공식 일러스트를 사용한 팬 홀로그램 프리뷰입니다.',
  aboutTitle: '안내',
  aboutBody: '이 기능은 umamusumedb.com 의 비공식 팬 프리뷰이며 Cygames, Inc. 및 『우마무스메 프리티 더비』 공식과 무관하고, 공식 굿즈나 디지털 수집품이 아닙니다. 캐릭터 일러스트 저작권은 © Cygames, Inc. 에 있습니다.',
  homeTitle: '오늘의 팩',
  homeDesc: '매일 무료 한 팩, 랜덤 기념 홀로그램 카드와 고유 번호.',
  homeCta: '오늘의 팩 열기',
  toolsName: '오늘의 팩',
  toolsDesc: '매일 무료 한 팩, 저장하고 공유할 수 있는 기념 홀로그램 카드.',
  charCta: '오늘의 팩 열기',
  shareTitle: (jp, en, id) => `${jp} / ${en} · ${id} | UmamusumeDB`,
  shareDesc: (jp, outfit, id) => `오늘의 팩 기념 카드 ${jp} (${outfit}), 번호 ${id}. 비공식 팬 프리뷰, Artwork © Cygames, Inc.`,
  notFoundTitle: '이 기념 카드를 찾을 수 없습니다 | UmamusumeDB',
  notFoundH1: '이 번호를 찾을 수 없습니다',
  notFoundBody: '공유 링크의 번호가 없거나 아직 발급되지 않았습니다. 다른 카드가 무작위로 표시되지 않습니다.',
  openPack: '오늘의 팩 열기',
  homeLink: '홈으로',
  siteName: 'UmamusumeDB',
  posterStreak: (n) => `${n}일차`,
  posterStamp: (n) => `전달 ${n}`,
  posterCredit: 'umamusumedb.com  ·  비공식 팬 프리뷰 (무료 전시, 비공식 굿즈)  ·  Artwork © Cygames, Inc.',
  packError: '잠시 문제가 있었습니다. 조금 있다 다시 시도해 주세요.',
};

const ALL: Record<Locale, HoloStrings> = { en, ja, zh, 'zh-tw': zhtw, ko };

export function holoStrings(locale: Locale): HoloStrings {
  return ALL[locale] || en;
}

/** Flatten functions to strings so the client bundle can read JSON. */
export function holoClientDict(locale: Locale) {
  const s = holoStrings(locale);
  return {
    locale,
    skip: s.skip,
    sound: s.sound,
    soundOn: s.soundOn,
    soundOff: s.soundOff,
    inspectHint: s.inspectHint,
    issueToday: s.issueToday,
    issueShared: s.issueShared,
    issueLabel: s.issueLabel,
    weekFrame: s.weekFrame,
    savePng: s.savePng,
    copyLink: s.copyLink,
    copied: s.copied,
    saving: s.saving,
    saved: s.saved,
    saveFail: s.saveFail,
    charLink: s.charLink,
    replay: s.replay,
    openOwn: s.openOwn,
    packError: s.packError,
    packNote: s.packNote,
    posterCredit: s.posterCredit,
    streakTemplate: s.streak(0).replace('0', '{n}'),
    stampsTemplate: s.stamps(0).replace('0', '{n}'),
    dailyLockTemplate: s.dailyLock('{clock}'),
    posterStreakTemplate: s.posterStreak(0).replace('0', '{n}'),
    posterStampTemplate: s.posterStamp(0).replace('0', '{n}'),
  };
}

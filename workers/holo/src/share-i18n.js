/** Share/404 copy used by the holo Worker. Keep in sync with src/lib/holo-strings.ts. */
export const LOCALES = ['en', 'ja', 'zh', 'zh-tw', 'ko'];

export const HTML_LANG = { en: 'en', ja: 'ja', zh: 'zh-Hans', 'zh-tw': 'zh-Hant', ko: 'ko' };
export const OG_LOCALE = { en: 'en_US', ja: 'ja_JP', zh: 'zh_CN', 'zh-tw': 'zh_TW', ko: 'ko_KR' };

export function prefix(locale) {
  return locale === 'en' ? '' : `/${locale}`;
}

export const S = {
  en: {
    intro: 'Daily pack', home: 'UmamusumeDB', save: 'Save commemorative image', copy: 'Copy share link',
    copied: '✓ Link copied', saving: 'Creating image…', saved: 'Saved', saveFail: 'Could not save, please try again',
    open: "Open today's pack", char: 'Character profile', issue: 'No.',
    week: '7-day frame', hint: 'Drag the card to turn it in your hand · double-tap to reset',
    foot: 'Unofficial fan preview · Character artwork © Cygames, Inc. · umamusumedb.com · free display, not official merchandise',
    notTitle: 'This commemorative card was not found | UmamusumeDB',
    notH1: 'This number was not found',
    notBody: 'The number in this share link does not exist, or has not been issued. Another card will not be shown at random.',
    cred: 'umamusumedb.com  ·  unofficial fan preview (free display, not official merchandise)  ·  Artwork © Cygames, Inc.',
  },
  ja: {
    intro: '今日のパック', home: 'UmamusumeDB', save: '記念画像を保存', copy: '共有リンクをコピー',
    copied: '✓ コピーしました', saving: '画像を作成中…', saved: '保存しました', saveFail: '保存に失敗しました。もう一度お試しください',
    open: '今日のパックを開く', char: 'キャラクター資料', issue: '番号',
    week: '七日記念フレーム', hint: 'カードをドラッグして手元で回転 · ダブルタップで正面に戻す',
    foot: '非公式ファンプレビュー · キャラクターイラスト © Cygames, Inc. · umamusumedb.com · 無料展示、非公式グッズ',
    notTitle: 'この記念カードは見つかりませんでした | UmamusumeDB',
    notH1: 'この番号は見つかりませんでした',
    notBody: '共有リンクの番号は存在しないか、まだ発行されていません。別のカードがランダムに表示されることはありません。',
    cred: 'umamusumedb.com  ·  非公式ファンプレビュー（無料展示、非公式グッズ）  ·  Artwork © Cygames, Inc.',
  },
  zh: {
    intro: '今日卡包', home: 'UmamusumeDB', save: '保存纪念图', copy: '复制分享链接',
    copied: '✓ 已复制分享链接', saving: '生成纪念图中…', saved: '已保存', saveFail: '保存失败，请重试',
    open: '拆今日卡包', char: '角色资料', issue: '编号',
    week: '七日纪念框', hint: '拖动卡片，像拿在手里一样旋转 · 双击回正',
    foot: '非官方同人预览 · 角色立绘版权归 © Cygames, Inc. 所有 · umamusumedb.com · 免费展示，非官方周边',
    notTitle: '未找到这张纪念闪卡 | UmamusumeDB',
    notH1: '没有找到这个编号',
    notBody: '分享链接里的编号不存在，或尚未发放。不会随机显示其他闪卡。',
    cred: 'umamusumedb.com  ·  非官方同人预览（免费展示，非官方周边）  ·  Artwork © Cygames, Inc.',
  },
  'zh-tw': {
    intro: '今日卡包', home: 'UmamusumeDB', save: '保存紀念圖', copy: '複製分享連結',
    copied: '✓ 已複製分享連結', saving: '生成紀念圖中…', saved: '已保存', saveFail: '保存失敗，請重試',
    open: '拆今日卡包', char: '角色資料', issue: '編號',
    week: '七日紀念框', hint: '拖動卡片，像拿在手裡一樣旋轉 · 點兩下回正',
    foot: '非官方同人預覽 · 角色立繪版權歸 © Cygames, Inc. 所有 · umamusumedb.com · 免費展示，非官方周邊',
    notTitle: '未找到這張紀念閃卡 | UmamusumeDB',
    notH1: '沒有找到這個編號',
    notBody: '分享連結裡的編號不存在，或尚未發放。不會隨機顯示其他閃卡。',
    cred: 'umamusumedb.com  ·  非官方同人預覽（免費展示，非官方周邊）  ·  Artwork © Cygames, Inc.',
  },
  ko: {
    intro: '오늘의 팩', home: 'UmamusumeDB', save: '기념 이미지 저장', copy: '공유 링크 복사',
    copied: '✓ 링크를 복사했습니다', saving: '이미지를 만드는 중…', saved: '저장됨', saveFail: '저장에 실패했습니다. 다시 시도해 주세요',
    open: '오늘의 팩 열기', char: '캐릭터 정보', issue: '번호',
    week: '7일 기념 프레임', hint: '카드를 드래그해 손에 들듯 회전 · 두 번 탭하면 정면으로',
    foot: '비공식 팬 프리뷰 · 캐릭터 일러스트 © Cygames, Inc. · umamusumedb.com · 무료 전시, 비공식 굿즈',
    notTitle: '이 기념 카드를 찾을 수 없습니다 | UmamusumeDB',
    notH1: '이 번호를 찾을 수 없습니다',
    notBody: '공유 링크의 번호가 없거나 아직 발급되지 않았습니다. 다른 카드가 무작위로 표시되지 않습니다.',
    cred: 'umamusumedb.com  ·  비공식 팬 프리뷰 (무료 전시, 비공식 굿즈)  ·  Artwork © Cygames, Inc.',
  },
};

export function ui(locale) {
  return S[locale] || S.en;
}

export function locPath(locale, path) {
  const pre = prefix(locale);
  return `${pre}${path}`;
}

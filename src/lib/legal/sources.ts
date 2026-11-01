import type { Docs } from './types';
const A = (u: string, t: string) => `<a href="${u}" target="_blank" rel="noopener noreferrer">${t}</a>`;
const GT = A('https://gametora.com/umamusume', 'GameTora');
export const sources: Docs = {
  en: {
    title: 'Data Sources & Licensing - UmamusumeDB',
    description: 'Transparency page for UmamusumeDB: where data comes from, what licenses apply, and how we keep the site compliant and fan-friendly.',
    h1: 'Data Sources & Licensing',
    intro: 'UmamusumeDB is a fan project. We aim to keep the site useful for players while respecting data licensing and copyrights.',
    sections: [
      { icon: 'database', h: 'Game data — GameTora', blocks: [{ p: `Characters, support cards, skills, scenarios and release dates (Global and JP servers) are imported from the public data files of ${GT} with <code>scripts/import-gametora.mjs</code>. Items that are not yet available on the Global server are marked “JP only”. Localized names and skill descriptions: English and Japanese are the official texts; Korean and Traditional Chinese (Taiwan server) come from the official in-game text on GameTora. Simplified Chinese is the Traditional Chinese text converted character by character with OpenCC — it is not the mainland-server text, so some terms may differ from the CN game client. Items without a translation fall back to the English or Japanese name. The names of the five stats, moods and scenarios in the tools follow the same official localization data.` }] },
      { icon: 'shield', h: 'Training events — not included', blocks: [{ p: 'We do not list training (story) events. The only bulk source is deliberately obfuscated data, so for compliance we neither decode nor redistribute it. Characters, support cards and skills come from public data files only.' }] },
      { icon: 'database', h: 'News headlines', blocks: [{ p: `Global announcement headlines link to ${A('https://umamusume.gg/', 'umamusume.gg')} (English). The Japanese page lists the latest headlines from the official Japanese portal ${A('https://umamusume.jp/news/', 'umamusume.jp')}. Only titles, dates and links are shown; each item opens the original article. We found no official Korean or Chinese announcement feed that can be read automatically, so those pages show the English headlines.` }] },
      { icon: 'database', h: 'Artwork and icons', blocks: [{ p: `Character, outfit, support card and skill images are copied from the image servers of ${GT} so that every page can show the right artwork. All artwork and icons are the property of Cygames, Inc.; they are used only to identify game content on this fan site. We claim no ownership and will remove any image on request.` }] },
      { icon: 'database', h: 'Formulas used in our tools', blocks: [{ p: `The training, spark-inheritance and skill-hint formulas are community-measured (Cygames does not publish them). Sources: ${A('https://uma.guide/guides/career-mechanics', 'uma.guide')}, ${A('https://www.umareference.com/', 'umareference.com')} and ${A('https://kamigame.jp/umamusume/', 'KamiGame')}. The Training Goals checklist and the Support Deck scoring are the site's own editorial guidance, not official data.` }] },
      { icon: 'database', h: 'Wikidata (CC0) — real racehorse facts', blocks: [
        { p: 'For “prototype racehorse” information (birth/death dates, sex, sire, etc.), we use <strong>Wikidata structured data</strong>. Wikidata’s structured data is available under <strong>Creative Commons CC0</strong>.' },
        { p: `${A('https://www.wikidata.org/wiki/Wikidata:Licensing', 'Wikidata Licensing')} · ${A('https://query.wikidata.org/', 'Wikidata Query Service (SPARQL)')}` }] },
      { icon: 'shield', h: 'Fan-curated game data', blocks: [{ p: 'Data on this site is organised for gameplay reference (filters, tools, cross-links, etc.). We do not claim ownership of any official content.' }] },
      { icon: 'scale', h: 'Copyright & attribution', blocks: [{ ul: ['<strong>Not affiliated</strong> with Cygames, Inc. or Uma Musume Pretty Derby.', 'All trademarks and game-related IP belong to their respective owners.', 'We provide external links to public sources when applicable.'] }] },
    ],
  },
  ja: {
    title: 'データソースとライセンス - UmamusumeDB',
    description: 'UmamusumeDB のデータ出典・ライセンス・免責事項について。',
    h1: 'データソースとライセンス',
    intro: 'UmamusumeDB はファンプロジェクトです。便利さとコンプライアンスの両立を目指します。',
    sections: [
      { icon: 'database', h: 'ゲームデータ — GameTora', blocks: [{ p: `ウマ娘・サポートカード・スキル・シナリオ・実装日(日本版とグローバル版)は ${GT} の公開データから <code>scripts/import-gametora.mjs</code> で取り込んでいます。グローバル版にまだ無いものは「JP only」と表示します。多言語の名称・スキル説明は、英語と日本語が公式テキスト、韓国語と繁体字中国語(台湾版)は GameTora が公開する公式ゲーム内テキストです。簡体字中国語は繁体字中国語のテキストを OpenCC で字形変換したもので、中国本土版のテキストではありません。翻訳が無い項目は英語または日本語の名称を表示します。ツール内の5つの能力・やる気・シナリオの名称も、同じ公式ローカライズデータに従っています。` }] },
      { icon: 'shield', h: '育成イベント — 掲載していません', blocks: [{ p: '育成イベントは掲載していません。一括で利用できる唯一の出典は意図的に難読化されたデータのため、コンプライアンス上、解読も再配布も行いません。ウマ娘・サポートカード・スキルは公開データファイルのみに基づきます。' }] },
      { icon: 'database', h: 'お知らせの見出し', blocks: [{ p: `グローバル版のお知らせの見出しは ${A('https://umamusume.gg/', 'umamusume.gg')}(英語)にリンクします。日本語ページでは、公式ポータルサイト ${A('https://umamusume.jp/news/', 'umamusume.jp')} の最新の見出しを掲載しています。表示するのはタイトル・日付・リンクのみで、各項目は元の記事を開きます。自動で取得できる韓国語・中国語の公式お知らせフィードは見つからなかったため、それらのページでは英語の見出しを表示します。` }] },
      { icon: 'database', h: 'イラストとアイコン', blocks: [{ p: `ウマ娘・勝負服・サポートカード・スキルの画像は、各ページで正しいイラストを表示するため ${GT} の画像サーバーから取得して使用しています。すべてのイラストとアイコンは株式会社Cygamesの著作物であり、本ファンサイトではゲーム内容の識別のためにのみ使用しています。所有権を主張するものではなく、ご要望があれば画像を削除します。` }] },
      { icon: 'database', h: 'ツールの計算式', blocks: [{ p: `トレーニング・因子継承・ヒント割引の計算式はコミュニティ検証によるもので、Cygamesの公式発表ではありません。出典: ${A('https://uma.guide/guides/career-mechanics', 'uma.guide')}、${A('https://www.umareference.com/', 'umareference.com')}、${A('https://kamigame.jp/umamusume/', '神ゲー攻略')}。育成目標のチェックリストとサポートデッキのスコアは、当サイト独自の編集上の目安であり、公式データではありません。` }] },
      { icon: 'database', h: 'Wikidata(CC0)— 原型馬(実馬)情報', blocks: [
        { p: '「原型となった実在競走馬」の基礎情報(生没年・性別・父など)は <strong>Wikidata の構造化データ</strong>を参照します。Wikidata の構造化データは <strong>Creative Commons CC0</strong> で提供されています。' },
        { p: `${A('https://www.wikidata.org/wiki/Wikidata:Licensing', 'Wikidata Licensing')} · ${A('https://query.wikidata.org/', 'Wikidata Query Service(SPARQL)')}` }] },
      { icon: 'shield', h: 'ファン編集のゲーム向けデータ', blocks: [{ p: 'キャラ/サポカ/スキルの情報は、育成の意思決定に役立つ形で整理しています(フィルタ、ツール、相互リンクなど)。公式コンテンツの所有権を主張するものではありません。' }] },
      { icon: 'scale', h: '免責と著作権', blocks: [{ ul: ['Cygames, Inc. およびウマ娘公式とは<strong>無関係</strong>です。', '商標・IP は各権利者に帰属します。', '必要に応じて外部の公開ソースへリンクします。'] }] },
    ],
  },
  zh: {
    title: '数据来源与许可 - UmamusumeDB',
    description: 'UmamusumeDB 透明度说明:数据从何而来、适用何种许可,以及我们如何保持网站合规并对粉丝友好。',
    h1: '数据来源与许可',
    intro: 'UmamusumeDB 是一个粉丝项目。我们希望让本站对玩家有用,同时尊重数据许可与版权。',
    sections: [
      { icon: 'database', h: '游戏数据 — GameTora', blocks: [{ p: `角色、支援卡、技能、剧本和实装日期(国际服与日服)通过 <code>scripts/import-gametora.mjs</code> 从 ${GT} 的公开数据文件导入。国际服尚未推出的内容会标注“仅日服(JP only)”。多语言名称与技能说明:英文和日文为官方文本;韩文和繁体中文(台湾服)来自 GameTora 公开的官方游戏内文本。简体中文是将繁体中文文本用 OpenCC 逐字转换而成,并非大陆服文本,因此部分用语可能与国服客户端不同。没有翻译的项目会回退为英文或日文名称。工具中五项能力、干劲和剧本的名称同样遵循这套官方本地化数据。` }] },
      { icon: 'shield', h: '育成事件 — 暂不收录', blocks: [{ p: '本站暂不收录育成事件。可批量获取的唯一来源是被故意混淆的数据,出于合规考虑,我们既不解码也不二次分发。角色、支援卡和技能仅来自公开数据文件。' }] },
      { icon: 'database', h: '公告标题', blocks: [{ p: `国际服公告标题链接到 ${A('https://umamusume.gg/', 'umamusume.gg')}(英文)。日文页面列出日本官方门户 ${A('https://umamusume.jp/news/', 'umamusume.jp')} 的最新标题。仅显示标题、日期和链接,每一项都会打开原文。我们没有找到可自动读取的韩文或中文官方公告源,因此这些页面显示英文标题。` }] },
      { icon: 'database', h: '插画与图标', blocks: [{ p: `角色、服装、支援卡和技能的图片取自 ${GT} 的图片服务器,以便每个页面都能显示正确的插画。所有插画和图标均为 Cygames, Inc. 的财产,在本粉丝站中仅用于识别游戏内容。我们不主张所有权,如有要求将删除相关图片。` }] },
      { icon: 'database', h: '工具所用公式', blocks: [{ p: `训练、因子继承和技能提示的公式来自社区实测(Cygames 并未公布)。来源:${A('https://uma.guide/guides/career-mechanics', 'uma.guide')}、${A('https://www.umareference.com/', 'umareference.com')} 和 ${A('https://kamigame.jp/umamusume/', 'KamiGame')}。育成目标清单和支援卡组评分是本站自己的编辑性建议,并非官方数据。` }] },
      { icon: 'database', h: 'Wikidata(CC0)— 真实赛马资料', blocks: [
        { p: '“原型赛马”信息(出生/死亡日期、性别、父系等)使用 <strong>Wikidata 结构化数据</strong>。Wikidata 的结构化数据以 <strong>Creative Commons CC0</strong> 提供。' },
        { p: `${A('https://www.wikidata.org/wiki/Wikidata:Licensing', 'Wikidata 许可')} · ${A('https://query.wikidata.org/', 'Wikidata 查询服务(SPARQL)')}` }] },
      { icon: 'shield', h: '粉丝整理的游戏数据', blocks: [{ p: '本站数据为方便游戏参考而整理(筛选、工具、交叉链接等)。我们不主张对任何官方内容的所有权。' }] },
      { icon: 'scale', h: '版权与署名', blocks: [{ ul: ['与 Cygames, Inc. 及《赛马娘 Pretty Derby》<strong>没有关联</strong>。', '所有商标和游戏相关知识产权归其各自所有者所有。', '在适用时,我们会提供指向公开来源的外部链接。'] }] },
    ],
  },
  ko: {
    title: '데이터 출처 및 라이선스 - UmamusumeDB',
    description: 'UmamusumeDB 투명성 안내: 데이터의 출처, 적용되는 라이선스, 사이트를 규정에 맞게 팬 친화적으로 운영하는 방법.',
    h1: '데이터 출처 및 라이선스',
    intro: 'UmamusumeDB는 팬 프로젝트입니다. 데이터 라이선스와 저작권을 존중하면서 플레이어에게 유용한 사이트를 목표로 합니다.',
    sections: [
      { icon: 'database', h: '게임 데이터 — GameTora', blocks: [{ p: `캐릭터, 서포트 카드, 스킬, 시나리오, 출시일(글로벌/일본 서버)은 ${GT}의 공개 데이터 파일에서 <code>scripts/import-gametora.mjs</code>로 가져옵니다. 글로벌 서버에 아직 없는 항목은 "JP only"로 표시합니다. 다국어 이름과 스킬 설명: 영어와 일본어는 공식 텍스트이고, 한국어와 번체 중국어(대만 서버)는 GameTora가 공개한 공식 게임 내 텍스트입니다. 간체 중국어는 번체 중국어 텍스트를 OpenCC로 글자 변환한 것으로 중국 본토 서버 텍스트가 아니므로 일부 용어가 중국 클라이언트와 다를 수 있습니다. 번역이 없는 항목은 영어 또는 일본어 이름으로 표시됩니다. 도구 안의 다섯 가지 능력치·의욕·시나리오 이름도 같은 공식 현지화 데이터를 따릅니다.` }] },
      { icon: 'shield', h: '육성 이벤트 — 수록하지 않음', blocks: [{ p: '육성 이벤트는 수록하지 않습니다. 일괄로 이용할 수 있는 유일한 출처가 의도적으로 난독화된 데이터이므로, 규정 준수를 위해 해독도 재배포도 하지 않습니다. 캐릭터, 서포트 카드, 스킬은 공개 데이터 파일만 사용합니다.' }] },
      { icon: 'database', h: '뉴스 제목', blocks: [{ p: `글로벌 공지 제목은 ${A('https://umamusume.gg/', 'umamusume.gg')}(영어)로 연결됩니다. 일본어 페이지에는 일본 공식 포털 ${A('https://umamusume.jp/news/', 'umamusume.jp')}의 최신 제목을 표시합니다. 제목, 날짜, 링크만 보여 주며 각 항목은 원문을 엽니다. 자동으로 읽을 수 있는 한국어·중국어 공식 공지 피드를 찾지 못해 해당 페이지에서는 영어 제목을 표시합니다.` }] },
      { icon: 'database', h: '일러스트와 아이콘', blocks: [{ p: `캐릭터, 의상, 서포트 카드, 스킬 이미지는 각 페이지에 올바른 일러스트를 표시하기 위해 ${GT}의 이미지 서버에서 가져와 사용합니다. 모든 일러스트와 아이콘은 Cygames, Inc.의 자산이며 이 팬 사이트에서는 게임 콘텐츠를 식별하는 용도로만 사용합니다. 소유권을 주장하지 않으며 요청이 있으면 이미지를 삭제하겠습니다.` }] },
      { icon: 'database', h: '도구에 사용된 공식', blocks: [{ p: `트레이닝, 인자 계승, 스킬 힌트 공식은 커뮤니티가 실측한 것입니다(Cygames는 공개하지 않음). 출처: ${A('https://uma.guide/guides/career-mechanics', 'uma.guide')}, ${A('https://www.umareference.com/', 'umareference.com')}, ${A('https://kamigame.jp/umamusume/', 'KamiGame')}. 육성 목표 체크리스트와 서포트 덱 점수는 사이트 자체의 편집상 가이드이며 공식 데이터가 아닙니다.` }] },
      { icon: 'database', h: 'Wikidata(CC0) — 실제 경주마 정보', blocks: [
        { p: '"원형 경주마" 정보(생몰일, 성별, 아비마 등)는 <strong>Wikidata 구조화 데이터</strong>를 사용합니다. Wikidata의 구조화 데이터는 <strong>Creative Commons CC0</strong>로 제공됩니다.' },
        { p: `${A('https://www.wikidata.org/wiki/Wikidata:Licensing', 'Wikidata 라이선스')} · ${A('https://query.wikidata.org/', 'Wikidata 쿼리 서비스(SPARQL)')}` }] },
      { icon: 'shield', h: '팬이 정리한 게임 데이터', blocks: [{ p: '이 사이트의 데이터는 게임 참고용으로 정리되어 있습니다(필터, 도구, 상호 링크 등). 공식 콘텐츠에 대한 소유권을 주장하지 않습니다.' }] },
      { icon: 'scale', h: '저작권 및 출처 표기', blocks: [{ ul: ['Cygames, Inc. 및 「우마무스메 프리티 더비」와 <strong>관련이 없습니다</strong>.', '모든 상표와 게임 관련 IP는 각 소유자에게 있습니다.', '해당하는 경우 공개 출처로 외부 링크를 제공합니다.'] }] },
    ],
  },
};

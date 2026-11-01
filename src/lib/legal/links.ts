import type { Docs } from './types';
const EXT = (u: string, t: string) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`;
const MAIL = '<a href="mailto:hello@umamusumedb.com">hello@umamusumedb.com</a>';
const PYOI = EXT('https://umamusume-umapyoi.com/', 'ウマ娘うまぴょい速報');
export const links: Docs = {
  en: {
    title: 'Friends & Link Exchange - UmamusumeDB',
    description: 'Uma Musume fan sites we link to, and how Uma Musume related sites can apply for a link exchange with UmamusumeDB.',
    h1: 'Friends & Link Exchange',
    intro: 'Fan sites we like and link to. UmamusumeDB is a fan project, and we are happy to link to other Uma Musume fan sites.',
    sections: [
      { icon: 'layers', h: 'Friend sites', blocks: [
        { ul: [`${PYOI} (Japanese) — a Japanese news and community-summary blog about Uma Musume with daily updates.`] },
        { p: 'Links on this page are normal links; we do not sell links and we do not accept paid placements.' }] },
      { icon: 'sparkles', h: 'Apply for a link exchange', blocks: [
        { p: `Uma Musume related sites are welcome to apply for a link exchange. Please email ${MAIL} with your site name, URL and a one-line description (and the page where you link to us, if you already do).` },
        { ul: ['The site is about Uma Musume (a database, tools, guides, news or a fan project) and is actively updated.', 'No illegal, adult, hateful, piracy or cheat content.', 'We review every request by hand and may decline, for example when a site is unrelated, inactive or mainly advertising.', 'Accepted sites get a normal link on this page (and in the footer of the matching language where it makes sense).'] }] },
      { icon: 'shield', h: 'About us', blocks: [{ p: 'UmamusumeDB is a fan-made site with a few ads that pay for hosting. Game data comes from GameTora’s public data files (see <a href="{L}/data-sources/">Data Sources &amp; Licensing</a>). Not affiliated with Cygames, Inc.' }] },
    ],
  },
  ja: {
    title: '友情リンク・相互リンク - UmamusumeDB',
    description: 'UmamusumeDB がご紹介しているウマ娘ファンサイトと、ウマ娘関連サイトの相互リンクのご案内です。',
    h1: '友情リンク・相互リンク',
    intro: 'UmamusumeDB が紹介しているファンサイトです。UmamusumeDB はファンプロジェクトで、他のウマ娘ファンサイトとの相互リンクを歓迎しています。',
    sections: [
      { icon: 'layers', h: '友情リンク', blocks: [
        { ul: [`${PYOI} — ウマ娘のニュースやコミュニティの話題をまとめている、毎日更新の日本語サイトです。`] },
        { p: 'このページのリンクは通常のリンクです。リンクの販売や有料の掲載は行っていません。' }] },
      { icon: 'sparkles', h: '相互リンクのお申し込み', blocks: [
        { p: `ウマ娘に関連するサイトの相互リンクを歓迎します。サイト名・URL・一行の紹介文(すでに当サイトへリンクいただいている場合はそのページ)を ${MAIL} までメールでお送りください。` },
        { ul: ['ウマ娘に関するサイト(データベース、ツール、攻略、ニュース、ファンサイトなど)で、継続的に更新されていること。', '違法・アダルト・差別的な内容、海賊版やチートに関する内容を含まないこと。', 'すべて手作業で確認します。関連が薄い、更新が止まっている、広告が主な目的などの場合はお断りすることがあります。', '承認したサイトは、このページ(必要に応じて該当言語のフッター)に通常のリンクで掲載します。'] }] },
      { icon: 'shield', h: '運営について', blocks: [{ p: 'UmamusumeDB はファンが作ったサイトで、サーバー費用のために少量の広告を表示しています。ゲームデータは GameTora の公開データを元にしています(<a href="{L}/data-sources/">データ出典とライセンス</a>を参照)。株式会社Cygamesとは無関係です。' }] },
    ],
  },
  zh: {
    title: '友情链接 - UmamusumeDB',
    description: 'UmamusumeDB 推荐的赛马娘粉丝站，以及赛马娘相关网站如何申请互换链接。',
    h1: '友情链接',
    intro: '我们喜欢并链接的粉丝站点。UmamusumeDB 是粉丝项目，欢迎与其他赛马娘粉丝站互相链接。',
    sections: [
      { icon: 'layers', h: '友站', blocks: [
        { ul: [`${PYOI}（日文）— 每天更新的日文赛马娘新闻与社区话题汇总站。`] },
        { p: '本页的链接均为普通链接；我们不出售链接，也不接受付费位置。' }] },
      { icon: 'sparkles', h: '申请互换链接', blocks: [
        { p: `欢迎赛马娘相关网站申请互换链接。请发邮件到 ${MAIL}，写明站点名称、网址和一句话简介（如果已经链接了本站，请附上链接所在页面）。` },
        { ul: ['站点与赛马娘相关（数据库、工具、攻略、新闻或粉丝项目）并持续更新。', '不含违法、成人、仇恨、盗版或外挂内容。', '我们逐一人工审核，如站点无关、不更新或主要用于广告，可能会拒绝。', '通过的站点会在本页（以及适合的语言页脚）获得一个普通链接。'] }] },
      { icon: 'shield', h: '关于我们', blocks: [{ p: 'UmamusumeDB 是粉丝自制站点，展示少量广告用于支付服务器费用。游戏数据来自 GameTora 的公开数据文件（见<a href="{L}/data-sources/">数据来源与授权</a>）。与 Cygames, Inc. 没有关联。' }] },
    ],
  },
  ko: {
    title: '친구 링크 · 상호 링크 - UmamusumeDB',
    description: 'UmamusumeDB가 소개하는 우마무스메 팬사이트와, 우마무스메 관련 사이트의 상호 링크 신청 안내입니다.',
    h1: '친구 링크 · 상호 링크',
    intro: 'UmamusumeDB가 소개하는 팬사이트입니다. UmamusumeDB는 팬 프로젝트이며, 다른 우마무스메 팬사이트와의 상호 링크를 환영합니다.',
    sections: [
      { icon: 'layers', h: '친구 사이트', blocks: [
        { ul: [`${PYOI}(일본어) — 우마무스메 소식과 커뮤니티 화제를 매일 정리해 올리는 일본어 사이트입니다.`] },
        { p: '이 페이지의 링크는 일반 링크입니다. 링크 판매나 유료 게재는 하지 않습니다.' }] },
      { icon: 'sparkles', h: '상호 링크 신청', blocks: [
        { p: `우마무스메 관련 사이트의 상호 링크 신청을 환영합니다. 사이트 이름, URL, 한 줄 소개(이미 저희 사이트에 링크하셨다면 그 페이지)를 ${MAIL} 으로 메일로 보내 주세요.` },
        { ul: ['우마무스메 관련 사이트(데이터베이스, 도구, 공략, 뉴스, 팬 프로젝트 등)이며 꾸준히 업데이트될 것.', '불법·성인·혐오·불법 복제·치트 관련 내용이 없을 것.', '모든 신청은 직접 확인하며, 관련이 적거나 업데이트가 멈췄거나 광고가 주목적인 경우 거절할 수 있습니다.', '승인된 사이트는 이 페이지(필요하면 해당 언어 푸터)에 일반 링크로 게재합니다.'] }] },
      { icon: 'shield', h: '운영 안내', blocks: [{ p: 'UmamusumeDB는 팬이 만든 사이트이며, 서버 비용을 위해 소량의 광고를 표시합니다. 게임 데이터는 GameTora의 공개 데이터 파일을 기반으로 합니다(<a href="{L}/data-sources/">데이터 출처 및 라이선스</a> 참조). Cygames, Inc.와는 무관합니다.' }] },
    ],
  },
};

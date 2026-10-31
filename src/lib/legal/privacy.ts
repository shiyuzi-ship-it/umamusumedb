import type { Docs } from './types';
const EMAIL = 'martinsjo865@gmail.com';
const contact = (label1: string, label2: string) => `<strong>${label1}:</strong> ${EMAIL}<br><strong>${label2}:</strong> <a href="https://umamusumedb.com">https://umamusumedb.com</a>`;
export const privacy: Docs = {
  en: {
    title: 'Privacy Policy - UmamusumeDB',
    description: 'Privacy Policy for UmamusumeDB - Learn how we collect, use, and protect your data.',
    h1: 'Privacy Policy', updated: 'Last Updated: October 31, 2026',
    sections: [
      { h: '1. Introduction', blocks: [
        { p: 'Welcome to UmamusumeDB ("we," "our," or "us"). We are committed to protecting your privacy and ensuring transparency about how we collect, use, and safeguard your information.' },
        { p: 'This Privacy Policy explains our practices regarding data collection and usage when you visit our website at <a href="https://umamusumedb.com">https://umamusumedb.com</a>.' } ] },
      { h: '2. Information We Collect', blocks: [
        { h3: '2.1 Automatically Collected Information' },
        { p: 'When you visit UmamusumeDB, we automatically collect certain information through cookies and similar technologies, including:' },
        { ul: ['IP address and general location information', 'Browser type and version', 'Device information (type, operating system)', 'Pages visited and time spent on our site', 'Referring website addresses', 'Click patterns and navigation paths'] },
        { h3: '2.2 Analytics Data' },
        { p: 'We use Google Analytics to understand how visitors use our site. Google Analytics collects information such as how often users visit our site, what pages they visit, and what other sites they used prior to coming to our site.' },
        { h3: '2.3 Information Stored in Your Browser' },
        { p: 'Some tools store your settings or progress (for example, completed goals in the Training Goals tool) in your browser\'s local storage. This data stays on your device; we do not receive it. You can remove it at any time by clearing your browser\'s site data.' } ] },
      { h: '3. How We Use Your Information', blocks: [
        { p: 'We use the collected information for the following purposes:' },
        { ul: ['To provide and maintain our service', 'To improve and optimize our website', 'To analyze usage patterns and trends', 'To detect and prevent technical issues', 'To serve relevant advertisements through Google AdSense', 'To comply with legal obligations'] } ] },
      { h: '4. Cookies and Tracking Technologies', blocks: [
        { p: 'UmamusumeDB uses cookies and similar tracking technologies to enhance your browsing experience. Cookies are small data files stored on your device.' },
        { h3: 'Types of Cookies We Use:' },
        { ul: ['<strong>Essential Cookies:</strong> Necessary for the website to function properly', '<strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website (Google Analytics)', '<strong>Advertising Cookies:</strong> Used to deliver relevant ads through Google AdSense'] },
        { p: 'You can control cookies through your browser settings. However, disabling cookies may affect the functionality of our website.' } ] },
      { h: '5. Third-Party Services', blocks: [
        { h3: '5.1 Google Analytics' },
        { p: 'We use Google Analytics to analyze website traffic. Google Analytics uses cookies to collect information anonymously and report website trends. You can opt-out of Google Analytics by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">Google Analytics Opt-out Browser Add-on</a>.' },
        { h3: '5.2 Google AdSense' },
        { p: 'We use Google AdSense to display advertisements on our website. Google may use cookies to serve ads based on your prior visits to our website or other websites. You can opt-out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google Ads Settings</a>.' },
        { h3: '5.3 Cloudflare' },
        { p: 'Our website is hosted on Cloudflare Pages. Cloudflare may collect certain technical information for security and performance purposes. Please review <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener">Cloudflare\'s Privacy Policy</a>.' } ] },
      { h: '6. Data Security', blocks: [{ p: 'We implement reasonable security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.' }] },
      { h: '7. Children\'s Privacy', blocks: [{ p: 'Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.' }] },
      { h: '8. International Users', blocks: [{ p: 'UmamusumeDB is hosted globally through Cloudflare\'s network. By using our website, you consent to the transfer of your information to servers located worldwide.' }] },
      { h: '9. Your Rights', blocks: [
        { p: 'Depending on your location, you may have the following rights:' },
        { ul: ['Right to access your personal data', 'Right to rectify inaccurate data', 'Right to request deletion of your data', 'Right to object to data processing', 'Right to data portability', 'Right to withdraw consent'] } ] },
      { h: '10. Changes to This Privacy Policy', blocks: [{ p: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.' }] },
      { h: '11. Contact Us', blocks: [{ p: 'If you have any questions about this Privacy Policy, please contact us at:' }, { box: contact('Email', 'Website') }] },
      { h: '12. Disclaimer', blocks: [{ p: 'UmamusumeDB is a fan-created database and is not affiliated with Cygames, Inc. or any official Uma Musume Pretty Derby entities. All game data, character names, and related content are property of their respective owners.' }] },
    ],
  },
  ja: {
    title: 'プライバシーポリシー - UmamusumeDB',
    description: 'UmamusumeDB のプライバシーポリシー。取得する情報、その利用方法、保護の取り組みについて説明します。',
    h1: 'プライバシーポリシー', updated: '最終更新日: 2026年10月31日',
    sections: [
      { h: '1. はじめに', blocks: [
        { p: 'UmamusumeDB(以下「当サイト」)へようこそ。当サイトは、利用者のプライバシーを守り、情報の取得・利用・保護の方法を透明にお伝えすることを約束します。' },
        { p: '本ポリシーは、<a href="https://umamusumedb.com">https://umamusumedb.com</a> をご利用いただく際の情報の取得と利用に関する当サイトの取り組みを説明するものです。' } ] },
      { h: '2. 取得する情報', blocks: [
        { h3: '2.1 自動的に取得される情報' },
        { p: '当サイトをご利用いただくと、Cookie および類似の技術により、次のような情報が自動的に取得されます。' },
        { ul: ['IPアドレスおよびおおまかな位置情報', 'ブラウザの種類とバージョン', 'デバイス情報(種類、OS)', '閲覧したページと滞在時間', '参照元のウェブサイトのアドレス', 'クリックの傾向や移動経路'] },
        { h3: '2.2 アクセス解析データ' },
        { p: '訪問者が当サイトをどのように利用しているかを把握するため、Google アナリティクスを使用しています。Google アナリティクスは、サイトの訪問頻度、閲覧ページ、訪問前に利用していたサイトなどの情報を収集します。' },
        { h3: '2.3 ブラウザに保存される情報' },
        { p: '一部のツールは、設定や進捗(例: 育成目標ツールの達成済み目標)をブラウザのローカルストレージに保存します。このデータは利用者のデバイス内にのみ保存され、当サイトには送信されません。ブラウザのサイトデータを削除すればいつでも消去できます。' } ] },
      { h: '3. 情報の利用目的', blocks: [
        { p: '取得した情報は、次の目的で利用します。' },
        { ul: ['サービスの提供と維持', 'ウェブサイトの改善と最適化', '利用状況や傾向の分析', '技術的な問題の検出と防止', 'Google AdSense による関連性の高い広告の配信', '法令上の義務の履行'] } ] },
      { h: '4. Cookie とトラッキング技術', blocks: [
        { p: '当サイトは、閲覧体験を向上させるために Cookie および類似のトラッキング技術を使用します。Cookie は、利用者のデバイスに保存される小さなデータファイルです。' },
        { h3: '使用する Cookie の種類:' },
        { ul: ['<strong>必須 Cookie:</strong> ウェブサイトが正しく動作するために必要です', '<strong>解析用 Cookie:</strong> 訪問者が当サイトをどう利用しているかを把握するために使用します(Google アナリティクス)', '<strong>広告用 Cookie:</strong> Google AdSense で関連性の高い広告を配信するために使用します'] },
        { p: 'Cookie はブラウザの設定で制御できます。ただし、Cookie を無効にすると当サイトの一部機能に影響が出る場合があります。' } ] },
      { h: '5. 第三者サービス', blocks: [
        { h3: '5.1 Google アナリティクス' },
        { p: 'ウェブサイトのトラフィックを分析するため、Google アナリティクスを使用しています。Google アナリティクスは Cookie を使って匿名で情報を収集し、サイトの傾向をレポートします。<a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">Google アナリティクス オプトアウト アドオン</a>をインストールすると、収集を無効にできます。' },
        { h3: '5.2 Google AdSense' },
        { p: '当サイトでは Google AdSense を使用して広告を表示しています。Google は、利用者の当サイトや他のサイトへの過去の訪問に基づいて広告を配信するために Cookie を使用することがあります。<a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google 広告設定</a>から、パーソナライズ広告を無効にできます。' },
        { h3: '5.3 Cloudflare' },
        { p: '当サイトは Cloudflare Pages でホスティングされています。Cloudflare は、セキュリティとパフォーマンスのために一部の技術情報を収集することがあります。<a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener">Cloudflare のプライバシーポリシー</a>をご確認ください。' } ] },
      { h: '6. データのセキュリティ', blocks: [{ p: '当サイトは、不正アクセス、改ざん、開示、破壊から情報を守るため、合理的なセキュリティ対策を講じています。ただし、インターネット上の通信方法に100%安全なものはなく、絶対的な安全性を保証することはできません。' }] },
      { h: '7. お子様のプライバシー', blocks: [{ p: '当サイトは13歳未満のお子様を対象としていません。13歳未満のお子様の個人情報を意図的に取得することはありません。保護者の方で、お子様が個人情報を提供したと思われる場合は、ご連絡ください。' }] },
      { h: '8. 海外からの利用者', blocks: [{ p: 'UmamusumeDB は Cloudflare のネットワークを通じて世界中で提供されています。当サイトを利用することで、利用者の情報が世界各地のサーバーに転送されることに同意したものとみなされます。' }] },
      { h: '9. 利用者の権利', blocks: [
        { p: 'お住まいの地域によっては、次の権利を有する場合があります。' },
        { ul: ['個人データへのアクセス権', '不正確なデータの訂正を求める権利', 'データの削除を求める権利', 'データ処理に異議を申し立てる権利', 'データポータビリティの権利', '同意を撤回する権利'] } ] },
      { h: '10. 本ポリシーの変更', blocks: [{ p: '本ポリシーは随時更新されることがあります。変更があった場合は、このページに新しいポリシーを掲載し、「最終更新日」を更新することでお知らせします。' }] },
      { h: '11. お問い合わせ', blocks: [{ p: '本ポリシーに関するご質問は、次の連絡先までお寄せください。' }, { box: contact('メール', 'ウェブサイト') }] },
      { h: '12. 免責事項', blocks: [{ p: 'UmamusumeDB はファンが作成したデータベースであり、株式会社Cygames および『ウマ娘 プリティーダービー』の公式とは一切関係ありません。ゲームデータ、キャラクター名、関連コンテンツの権利は、それぞれの権利者に帰属します。' }] },
    ],
  },
  zh: {
    title: '隐私政策 - UmamusumeDB',
    description: 'UmamusumeDB 隐私政策:了解我们如何收集、使用和保护您的数据。',
    h1: '隐私政策', updated: '最后更新:2026 年 10 月 31 日',
    sections: [
      { h: '1. 简介', blocks: [
        { p: '欢迎来到 UmamusumeDB(以下称“我们”)。我们致力于保护您的隐私,并公开透明地说明我们如何收集、使用和保护您的信息。' },
        { p: '本隐私政策说明您访问我们的网站 <a href="https://umamusumedb.com">https://umamusumedb.com</a> 时,我们在数据收集和使用方面的做法。' } ] },
      { h: '2. 我们收集的信息', blocks: [
        { h3: '2.1 自动收集的信息' },
        { p: '当您访问 UmamusumeDB 时,我们会通过 Cookie 及类似技术自动收集某些信息,包括:' },
        { ul: ['IP 地址和大致位置信息', '浏览器类型和版本', '设备信息(类型、操作系统)', '访问的页面和停留时间', '来源网站地址', '点击习惯和浏览路径'] },
        { h3: '2.2 分析数据' },
        { p: '我们使用 Google Analytics 来了解访客如何使用本站。Google Analytics 会收集访客访问本站的频率、浏览的页面以及访问前使用过的其他网站等信息。' },
        { h3: '2.3 存储在浏览器中的信息' },
        { p: '部分工具会将您的设置或进度(例如“育成目标”工具中已完成的目标)保存在浏览器的本地存储中。这些数据只保存在您的设备上,我们不会收到。您可以随时通过清除浏览器的网站数据将其删除。' } ] },
      { h: '3. 我们如何使用您的信息', blocks: [
        { p: '我们将收集到的信息用于以下目的:' },
        { ul: ['提供和维护我们的服务', '改进和优化我们的网站', '分析使用模式和趋势', '检测和预防技术问题', '通过 Google AdSense 展示相关广告', '履行法律义务'] } ] },
      { h: '4. Cookie 和跟踪技术', blocks: [
        { p: 'UmamusumeDB 使用 Cookie 及类似的跟踪技术来改善您的浏览体验。Cookie 是存储在您设备上的小型数据文件。' },
        { h3: '我们使用的 Cookie 类型:' },
        { ul: ['<strong>必要 Cookie:</strong>网站正常运行所必需', '<strong>分析 Cookie:</strong>帮助我们了解访客如何与网站互动(Google Analytics)', '<strong>广告 Cookie:</strong>用于通过 Google AdSense 投放相关广告'] },
        { p: '您可以通过浏览器设置控制 Cookie。但禁用 Cookie 可能会影响本网站的部分功能。' } ] },
      { h: '5. 第三方服务', blocks: [
        { h3: '5.1 Google Analytics' },
        { p: '我们使用 Google Analytics 分析网站流量。Google Analytics 使用 Cookie 匿名收集信息并报告网站趋势。您可以安装 <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">Google Analytics 停用浏览器插件</a>来选择退出。' },
        { h3: '5.2 Google AdSense' },
        { p: '我们使用 Google AdSense 在网站上展示广告。Google 可能会使用 Cookie,根据您以前访问本站或其他网站的情况投放广告。您可以访问 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google 广告设置</a>选择退出个性化广告。' },
        { h3: '5.3 Cloudflare' },
        { p: '我们的网站托管在 Cloudflare Pages 上。Cloudflare 可能会出于安全和性能目的收集某些技术信息。请查阅 <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener">Cloudflare 隐私政策</a>。' } ] },
      { h: '6. 数据安全', blocks: [{ p: '我们采取合理的安全措施,保护您的信息免遭未经授权的访问、篡改、披露或破坏。但互联网上的任何传输方式都不是 100% 安全的,我们无法保证绝对的安全。' }] },
      { h: '7. 儿童隐私', blocks: [{ p: '本网站不面向 13 岁以下的儿童。我们不会有意收集 13 岁以下儿童的个人信息。如果您是家长或监护人,并认为您的孩子向我们提供了个人信息,请与我们联系。' }] },
      { h: '8. 国际用户', blocks: [{ p: 'UmamusumeDB 通过 Cloudflare 的网络在全球范围内托管。使用本网站即表示您同意将您的信息传输到位于世界各地的服务器。' }] },
      { h: '9. 您的权利', blocks: [
        { p: '根据您所在的地区,您可能享有以下权利:' },
        { ul: ['访问个人数据的权利', '更正不准确数据的权利', '要求删除数据的权利', '反对数据处理的权利', '数据可携权', '撤回同意的权利'] } ] },
      { h: '10. 本隐私政策的变更', blocks: [{ p: '我们可能会不时更新本隐私政策。我们会在本页面发布新的隐私政策并更新“最后更新”日期,以此通知您相关变更。' }] },
      { h: '11. 联系我们', blocks: [{ p: '如果您对本隐私政策有任何疑问,请通过以下方式联系我们:' }, { box: contact('邮箱', '网站') }] },
      { h: '12. 免责声明', blocks: [{ p: 'UmamusumeDB 是由粉丝制作的数据库,与 Cygames, Inc. 及《赛马娘 Pretty Derby》官方没有任何关联。所有游戏数据、角色名称及相关内容均为其各自所有者的财产。' }] },
    ],
  },
  ko: {
    title: '개인정보처리방침 - UmamusumeDB',
    description: 'UmamusumeDB 개인정보처리방침: 수집하는 정보, 이용 방법, 보호 방법을 안내합니다.',
    h1: '개인정보처리방침', updated: '최종 수정일: 2026년 10월 31일',
    sections: [
      { h: '1. 소개', blocks: [
        { p: 'UmamusumeDB(이하 "당사이트")에 오신 것을 환영합니다. 당사이트는 이용자의 개인정보를 보호하고, 정보를 수집·이용·보호하는 방식을 투명하게 알리기 위해 최선을 다합니다.' },
        { p: '이 개인정보처리방침은 <a href="https://umamusumedb.com">https://umamusumedb.com</a>을 방문하실 때 정보를 수집하고 이용하는 당사이트의 방식을 설명합니다.' } ] },
      { h: '2. 수집하는 정보', blocks: [
        { h3: '2.1 자동으로 수집되는 정보' },
        { p: 'UmamusumeDB를 방문하시면 쿠키 및 유사 기술을 통해 다음과 같은 정보가 자동으로 수집됩니다.' },
        { ul: ['IP 주소 및 대략적인 위치 정보', '브라우저 종류와 버전', '기기 정보(종류, 운영체제)', '방문한 페이지와 체류 시간', '유입 사이트 주소', '클릭 패턴과 이동 경로'] },
        { h3: '2.2 분석 데이터' },
        { p: '방문자가 사이트를 어떻게 이용하는지 파악하기 위해 Google 애널리틱스를 사용합니다. Google 애널리틱스는 사이트 방문 빈도, 방문한 페이지, 방문 전에 이용한 다른 사이트 등의 정보를 수집합니다.' },
        { h3: '2.3 브라우저에 저장되는 정보' },
        { p: '일부 도구는 설정이나 진행 상황(예: 육성 목표 도구의 완료한 목표)을 브라우저의 로컬 저장소에 저장합니다. 이 데이터는 이용자의 기기에만 남으며 당사이트로 전송되지 않습니다. 브라우저의 사이트 데이터를 삭제하면 언제든 지울 수 있습니다.' } ] },
      { h: '3. 정보의 이용 목적', blocks: [
        { p: '수집한 정보는 다음 목적으로 이용합니다.' },
        { ul: ['서비스 제공 및 유지', '웹사이트 개선 및 최적화', '이용 패턴과 추세 분석', '기술적 문제의 탐지 및 예방', 'Google AdSense를 통한 관련 광고 게재', '법적 의무 준수'] } ] },
      { h: '4. 쿠키 및 추적 기술', blocks: [
        { p: 'UmamusumeDB는 이용 경험을 향상시키기 위해 쿠키 및 유사한 추적 기술을 사용합니다. 쿠키는 이용자의 기기에 저장되는 작은 데이터 파일입니다.' },
        { h3: '사용하는 쿠키의 종류:' },
        { ul: ['<strong>필수 쿠키:</strong> 웹사이트가 제대로 작동하는 데 필요합니다', '<strong>분석 쿠키:</strong> 방문자가 웹사이트를 어떻게 이용하는지 파악하는 데 도움이 됩니다(Google 애널리틱스)', '<strong>광고 쿠키:</strong> Google AdSense를 통해 관련 광고를 제공하는 데 사용됩니다'] },
        { p: '쿠키는 브라우저 설정에서 제어할 수 있습니다. 다만 쿠키를 비활성화하면 웹사이트의 일부 기능에 영향이 있을 수 있습니다.' } ] },
      { h: '5. 제3자 서비스', blocks: [
        { h3: '5.1 Google 애널리틱스' },
        { p: '웹사이트 트래픽을 분석하기 위해 Google 애널리틱스를 사용합니다. Google 애널리틱스는 쿠키를 사용해 익명으로 정보를 수집하고 사이트 추세를 보고합니다. <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">Google 애널리틱스 선택 해제 브라우저 부가기능</a>을 설치하면 수집을 거부할 수 있습니다.' },
        { h3: '5.2 Google AdSense' },
        { p: '당사이트는 Google AdSense를 사용해 광고를 표시합니다. Google은 이용자의 당사이트 또는 다른 사이트 방문 기록을 바탕으로 광고를 게재하기 위해 쿠키를 사용할 수 있습니다. <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google 광고 설정</a>에서 맞춤 광고를 해제할 수 있습니다.' },
        { h3: '5.3 Cloudflare' },
        { p: '당사이트는 Cloudflare Pages에서 호스팅됩니다. Cloudflare는 보안 및 성능을 위해 일부 기술 정보를 수집할 수 있습니다. <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener">Cloudflare 개인정보처리방침</a>을 확인해 주세요.' } ] },
      { h: '6. 데이터 보안', blocks: [{ p: '당사이트는 무단 접근, 변경, 공개, 파괴로부터 정보를 보호하기 위해 합리적인 보안 조치를 시행합니다. 그러나 인터넷을 통한 전송 방법 중 100% 안전한 방법은 없으며, 절대적인 보안을 보장할 수는 없습니다.' }] },
      { h: '7. 아동의 개인정보', blocks: [{ p: '당사이트는 만 13세 미만 아동을 대상으로 하지 않습니다. 만 13세 미만 아동의 개인정보를 의도적으로 수집하지 않습니다. 부모 또는 보호자께서 자녀가 개인정보를 제공했다고 생각되시면 문의해 주세요.' }] },
      { h: '8. 해외 이용자', blocks: [{ p: 'UmamusumeDB는 Cloudflare 네트워크를 통해 전 세계에서 제공됩니다. 당사이트를 이용하면 이용자의 정보가 전 세계에 위치한 서버로 전송되는 것에 동의한 것으로 간주됩니다.' }] },
      { h: '9. 이용자의 권리', blocks: [
        { p: '거주 지역에 따라 다음과 같은 권리를 가질 수 있습니다.' },
        { ul: ['개인정보 열람권', '부정확한 정보의 정정을 요구할 권리', '정보 삭제를 요구할 권리', '정보 처리에 이의를 제기할 권리', '정보 이동권', '동의를 철회할 권리'] } ] },
      { h: '10. 개인정보처리방침의 변경', blocks: [{ p: '이 개인정보처리방침은 수시로 변경될 수 있습니다. 변경 시 이 페이지에 새로운 방침을 게시하고 "최종 수정일"을 갱신하여 알려드립니다.' }] },
      { h: '11. 문의', blocks: [{ p: '이 개인정보처리방침에 관한 질문은 아래 연락처로 문의해 주세요.' }, { box: contact('이메일', '웹사이트') }] },
      { h: '12. 면책 조항', blocks: [{ p: 'UmamusumeDB는 팬이 만든 데이터베이스이며 Cygames, Inc. 및 「우마무스메 프리티 더비」 공식과 아무런 관련이 없습니다. 모든 게임 데이터, 캐릭터 이름 및 관련 콘텐츠의 권리는 각 소유자에게 있습니다.' }] },
    ],
  },
};

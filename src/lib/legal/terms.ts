import type { Docs } from './types';
const EMAIL = 'martinsjo865@gmail.com';
const contact = (a: string, b: string) => `<strong>${a}:</strong> ${EMAIL}<br><strong>${b}:</strong> <a href="https://umamusumedb.com">https://umamusumedb.com</a>`;
export const terms: Docs = {
  en: {
    title: 'Terms of Service - UmamusumeDB',
    description: 'Terms of Service for UmamusumeDB - the rules for using our Uma Musume database and tools.',
    h1: 'Terms of Service', updated: 'Last Updated: October 31, 2026',
    sections: [
      { h: '1. Acceptance of Terms', blocks: [
        { p: 'Welcome to UmamusumeDB. By accessing or using our website at <a href="https://umamusumedb.com">https://umamusumedb.com</a> (the "Service"), you agree to be bound by these Terms of Service ("Terms").' },
        { p: 'If you do not agree to these Terms, please do not use our Service.' } ] },
      { h: '2. Description of Service', blocks: [
        { p: 'UmamusumeDB is a fan-created, community-driven database and resource website for the game Uma Musume Pretty Derby. We provide:' },
        { ul: ['Character information and statistics', 'Support card and skill databases, including training events', 'Release timeline and announcement headlines', 'Training calculators and tools', 'Game guides and strategies'] } ] },
      { h: '3. Disclaimer and Affiliation', blocks: [
        { p: '<strong>UmamusumeDB is NOT affiliated with, endorsed by, or sponsored by:</strong>' },
        { ul: ['Cygames, Inc.', 'Uma Musume Pretty Derby official team', 'Any official game publishers or developers'] },
        { p: 'All game content, character names, images, and trademarks are property of their respective owners. This is a fan-made resource created for informational and educational purposes only.' } ] },
      { h: '4. User Conduct', blocks: [
        { p: 'You agree not to:' },
        { ul: ['Use the Service for any illegal purpose', 'Attempt to gain unauthorized access to our systems', 'Distribute malware or harmful code', 'Scrape, copy, or redistribute our content without permission', 'Impersonate others or provide false information', 'Interfere with or disrupt the Service', 'Violate any applicable laws or regulations'] } ] },
      { h: '5. Intellectual Property Rights', blocks: [
        { h3: '5.1 Game Content' },
        { p: 'All game-related content, including but not limited to character designs, names, images, and game mechanics, are owned by Cygames, Inc. and their respective copyright holders. We claim no ownership over this content.' },
        { h3: '5.2 Our Content' },
        { p: 'The design, layout, code, databases, and original content created by UmamusumeDB are protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.' } ] },
      { h: '6. Data Accuracy', blocks: [{ p: 'While we strive to provide accurate and up-to-date information, we make no guarantees about the completeness, reliability, or accuracy of the data on our website. Game data may change due to updates, patches, or corrections.' }] },
      { h: '7. Third-Party Links and Services', blocks: [
        { p: 'Our Service may contain links to third-party websites or services. We are not responsible for the content, privacy policies, or practices of these external sites.' },
        { p: 'Third-party services we use include:' },
        { ul: ['Google Analytics (for website analytics)', 'Google AdSense (for advertisements)', 'Cloudflare (for hosting and CDN)'] } ] },
      { h: '8. Advertising', blocks: [{ p: 'UmamusumeDB displays advertisements through Google AdSense to support the operation of this website. We do not control the content of these advertisements and are not responsible for any products or services advertised.' }] },
      { h: '9. Disclaimer of Warranties', blocks: [
        { p: 'THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:' },
        { ul: ['Merchantability', 'Fitness for a particular purpose', 'Non-infringement', 'Accuracy, reliability, or completeness of content', 'Uninterrupted or error-free service'] } ] },
      { h: '10. Limitation of Liability', blocks: [{ p: 'TO THE FULLEST EXTENT PERMITTED BY LAW, UmamusumeDB AND ITS OPERATORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR USE, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.' }] },
      { h: '11. Indemnification', blocks: [{ p: 'You agree to indemnify and hold harmless UmamusumeDB, its operators, and affiliates from any claims, damages, losses, liabilities, and expenses arising from your use of the Service or violation of these Terms.' }] },
      { h: '12. Privacy Policy', blocks: [{ p: 'Your use of the Service is also governed by our <a href="{L}/privacy-policy/">Privacy Policy</a>. Please review it to understand our data practices.' }] },
      { h: '13. Changes to Terms', blocks: [{ p: 'We reserve the right to modify these Terms at any time. We will notify users of significant changes by updating the "Last Updated" date. Your continued use of the Service after changes constitutes acceptance of the new Terms.' }] },
      { h: '14. Termination', blocks: [{ p: 'We reserve the right to terminate or suspend access to our Service immediately, without prior notice, for any reason, including breach of these Terms.' }] },
      { h: '15. Governing Law', blocks: [{ p: 'These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.' }] },
      { h: '16. Severability', blocks: [{ p: 'If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.' }] },
      { h: '17. Entire Agreement', blocks: [{ p: 'These Terms, together with our Privacy Policy, constitute the entire agreement between you and UmamusumeDB regarding the use of our Service.' }] },
      { h: '18. Contact Information', blocks: [{ p: 'If you have any questions about these Terms of Service, please contact us:' }, { box: contact('Email', 'Website') }, { box: '<strong>Note:</strong> By using UmamusumeDB, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.' }] },
    ],
  },
  ja: {
    title: '利用規約 - UmamusumeDB',
    description: 'UmamusumeDB の利用規約。ウマ娘データベースとツールのご利用にあたってのルールを定めます。',
    h1: '利用規約', updated: '最終更新日: 2026年10月31日',
    sections: [
      { h: '1. 規約への同意', blocks: [
        { p: 'UmamusumeDB へようこそ。<a href="https://umamusumedb.com">https://umamusumedb.com</a>(以下「本サービス」)にアクセスまたは利用することで、本利用規約(以下「本規約」)に拘束されることに同意したものとみなされます。' },
        { p: '本規約に同意しない場合は、本サービスを利用しないでください。' } ] },
      { h: '2. サービスの内容', blocks: [
        { p: 'UmamusumeDB は、ゲーム『ウマ娘 プリティーダービー』のファンが作成したコミュニティ運営のデータベース・情報サイトです。次の内容を提供します。' },
        { ul: ['キャラクター情報とステータス', '育成イベントを含むサポートカード・スキルのデータベース', 'リリース年表とお知らせの見出し', '育成計算などのツール', 'ゲームのガイドと攻略'] } ] },
      { h: '3. 免責事項と関係性について', blocks: [
        { p: '<strong>UmamusumeDB は、次のいずれとも提携・承認・後援の関係にありません。</strong>' },
        { ul: ['株式会社Cygames', '『ウマ娘 プリティーダービー』公式チーム', 'ゲームの公式な発売元・開発元'] },
        { p: 'ゲームの内容、キャラクター名、画像、商標の権利は、それぞれの権利者に帰属します。本サイトは、情報提供と学習を目的としたファンメイドのリソースです。' } ] },
      { h: '4. 利用者の行為', blocks: [
        { p: '利用者は、次の行為をしないことに同意します。' },
        { ul: ['違法な目的で本サービスを利用すること', '当サイトのシステムへの不正アクセスを試みること', 'マルウェアや有害なコードを配布すること', '許可なく当サイトのコンテンツをスクレイピング・複製・再配布すること', '他者になりすますこと、または虚偽の情報を提供すること', '本サービスを妨害・中断させること', '適用される法令に違反すること'] } ] },
      { h: '5. 知的財産権', blocks: [
        { h3: '5.1 ゲームのコンテンツ' },
        { p: 'キャラクターデザイン、名称、画像、ゲームの仕組みなど、ゲームに関するコンテンツの権利は、株式会社Cygamesおよび各権利者に帰属します。当サイトはこれらのコンテンツの所有権を主張しません。' },
        { h3: '5.2 当サイトのコンテンツ' },
        { p: 'UmamusumeDB が作成したデザイン、レイアウト、コード、データベース、オリジナルコンテンツは、著作権その他の知的財産権法で保護されています。当サイトの書面による許可なく、複製、配布、二次的著作物の作成を行うことはできません。' } ] },
      { h: '6. データの正確性', blocks: [{ p: '当サイトは正確で最新の情報の提供に努めていますが、掲載データの完全性、信頼性、正確性を保証するものではありません。ゲームデータは、アップデートやパッチ、修正により変更されることがあります。' }] },
      { h: '7. 第三者のリンクとサービス', blocks: [
        { p: '本サービスには、第三者のウェブサイトやサービスへのリンクが含まれる場合があります。当サイトは、これら外部サイトの内容、プライバシーポリシー、運営について責任を負いません。' },
        { p: '当サイトが利用している第三者サービスは次のとおりです。' },
        { ul: ['Google アナリティクス(アクセス解析)', 'Google AdSense(広告)', 'Cloudflare(ホスティングおよびCDN)'] } ] },
      { h: '8. 広告', blocks: [{ p: 'UmamusumeDB は、サイトの運営を支えるために Google AdSense を通じて広告を表示しています。当サイトはこれらの広告の内容を管理しておらず、広告される商品やサービスについて責任を負いません。' }] },
      { h: '9. 保証の否認', blocks: [
        { p: '本サービスは、明示・黙示を問わず、いかなる種類の保証もなく「現状有姿」かつ「提供可能な範囲」で提供されます。これには次のものが含まれますが、これらに限られません。' },
        { ul: ['商品性', '特定目的への適合性', '権利を侵害しないこと', 'コンテンツの正確性、信頼性、完全性', 'サービスが中断されないこと、エラーがないこと'] } ] },
      { h: '10. 責任の制限', blocks: [{ p: '法律で認められる最大限の範囲において、UmamusumeDB およびその運営者は、本サービスの利用に起因または関連して生じるいかなる間接的、付随的、特別、結果的、懲罰的損害(利益、データ、使用機会の損失を含みますが、これらに限られません)についても責任を負いません。' }] },
      { h: '11. 補償', blocks: [{ p: '利用者は、本サービスの利用または本規約への違反に起因して生じるあらゆる請求、損害、損失、責任、費用について、UmamusumeDB、その運営者および関係者を補償し、免責することに同意します。' }] },
      { h: '12. プライバシーポリシー', blocks: [{ p: '本サービスの利用には、<a href="{L}/privacy-policy/">プライバシーポリシー</a>も適用されます。当サイトのデータの取り扱いについては、そちらをご確認ください。' }] },
      { h: '13. 規約の変更', blocks: [{ p: '当サイトは、本規約をいつでも変更する権利を有します。重要な変更は「最終更新日」を更新することでお知らせします。変更後も本サービスを継続して利用した場合、新しい規約に同意したものとみなされます。' }] },
      { h: '14. サービスの停止', blocks: [{ p: '当サイトは、本規約への違反を含むあらゆる理由により、事前の通知なく、本サービスへのアクセスを直ちに終了または停止する権利を有します。' }] },
      { h: '15. 準拠法', blocks: [{ p: '本規約は、法の抵触に関する原則にかかわらず、適用される法令に従って解釈され、その準拠法とします。' }] },
      { h: '16. 分離可能性', blocks: [{ p: '本規約のいずれかの条項が執行不能または無効と判断された場合、その条項は必要最小限の範囲で制限または削除され、残りの条項は引き続き完全に有効とします。' }] },
      { h: '17. 完全合意', blocks: [{ p: '本規約とプライバシーポリシーは、本サービスの利用に関する、利用者と UmamusumeDB との間の完全な合意を構成します。' }] },
      { h: '18. お問い合わせ', blocks: [{ p: '本利用規約に関するご質問は、次の連絡先までお寄せください。' }, { box: contact('メール', 'ウェブサイト') }, { box: '<strong>注:</strong> UmamusumeDB を利用することで、本利用規約を読み、理解し、これに拘束されることに同意したものとみなされます。' }] },
    ],
  },
  zh: {
    title: '服务条款 - UmamusumeDB',
    description: 'UmamusumeDB 服务条款:使用本站赛马娘数据库和工具的规则。',
    h1: '服务条款', updated: '最后更新:2026 年 10 月 31 日',
    sections: [
      { h: '1. 接受条款', blocks: [
        { p: '欢迎来到 UmamusumeDB。访问或使用我们的网站 <a href="https://umamusumedb.com">https://umamusumedb.com</a>(以下称“本服务”),即表示您同意受本服务条款(以下称“本条款”)的约束。' },
        { p: '如果您不同意本条款,请不要使用本服务。' } ] },
      { h: '2. 服务说明', blocks: [
        { p: 'UmamusumeDB 是由粉丝制作、社区驱动的《赛马娘 Pretty Derby》数据库与资料网站。我们提供:' },
        { ul: ['角色信息与能力数据', '支援卡与技能数据库(含育成事件)', '实装时间线与公告标题', '育成计算器等工具', '游戏指南与攻略'] } ] },
      { h: '3. 免责声明与关联关系', blocks: [
        { p: '<strong>UmamusumeDB 与下列各方没有任何关联,也未获得其认可或赞助:</strong>' },
        { ul: ['Cygames, Inc.', '《赛马娘 Pretty Derby》官方团队', '任何官方游戏发行商或开发商'] },
        { p: '所有游戏内容、角色名称、图片和商标均为其各自所有者的财产。本站是粉丝制作的资料站,仅用于提供信息和学习交流。' } ] },
      { h: '4. 用户行为', blocks: [
        { p: '您同意不:' },
        { ul: ['将本服务用于任何非法目的', '试图未经授权访问我们的系统', '传播恶意软件或有害代码', '未经许可抓取、复制或再分发我们的内容', '冒充他人或提供虚假信息', '干扰或破坏本服务', '违反任何适用的法律法规'] } ] },
      { h: '5. 知识产权', blocks: [
        { h3: '5.1 游戏内容' },
        { p: '所有与游戏相关的内容,包括但不限于角色设计、名称、图片和游戏机制,均归 Cygames, Inc. 及各自的版权所有者所有。我们不主张对这些内容的所有权。' },
        { h3: '5.2 我们的内容' },
        { p: 'UmamusumeDB 创作的设计、版式、代码、数据库和原创内容受版权及其他知识产权法保护。未经我们书面许可,您不得复制、分发或创作衍生作品。' } ] },
      { h: '6. 数据准确性', blocks: [{ p: '我们努力提供准确、最新的信息,但不对本网站数据的完整性、可靠性或准确性作任何保证。游戏数据可能因更新、补丁或修正而发生变化。' }] },
      { h: '7. 第三方链接与服务', blocks: [
        { p: '本服务可能包含指向第三方网站或服务的链接。我们不对这些外部网站的内容、隐私政策或做法负责。' },
        { p: '我们使用的第三方服务包括:' },
        { ul: ['Google Analytics(网站分析)', 'Google AdSense(广告)', 'Cloudflare(托管与 CDN)'] } ] },
      { h: '8. 广告', blocks: [{ p: 'UmamusumeDB 通过 Google AdSense 展示广告,以支持本网站的运营。我们无法控制这些广告的内容,也不对所宣传的任何产品或服务负责。' }] },
      { h: '9. 免责保证声明', blocks: [
        { p: '本服务按“现状”和“可用”的状态提供,不附带任何明示或暗示的保证,包括但不限于:' },
        { ul: ['适销性', '特定用途的适用性', '不侵权', '内容的准确性、可靠性或完整性', '服务不中断或无错误'] } ] },
      { h: '10. 责任限制', blocks: [{ p: '在法律允许的最大范围内,UmamusumeDB 及其运营者不对因您使用本服务而产生或与之相关的任何间接、附带、特殊、后果性或惩罚性损害承担责任,包括但不限于利润、数据或使用机会的损失。' }] },
      { h: '11. 赔偿', blocks: [{ p: '对于因您使用本服务或违反本条款而产生的任何索赔、损害、损失、责任和费用,您同意对 UmamusumeDB、其运营者及关联方进行赔偿并使其免受损害。' }] },
      { h: '12. 隐私政策', blocks: [{ p: '您对本服务的使用同时受我们的<a href="{L}/privacy-policy/">隐私政策</a>约束。请查阅以了解我们的数据处理方式。' }] },
      { h: '13. 条款变更', blocks: [{ p: '我们保留随时修改本条款的权利。对于重大变更,我们将通过更新“最后更新”日期来通知用户。变更后您继续使用本服务,即视为接受新条款。' }] },
      { h: '14. 终止', blocks: [{ p: '我们保留出于任何原因(包括违反本条款)立即终止或暂停访问本服务的权利,且无需事先通知。' }] },
      { h: '15. 适用法律', blocks: [{ p: '本条款受适用法律管辖并据其解释,不考虑法律冲突原则。' }] },
      { h: '16. 可分割性', blocks: [{ p: '如果本条款的任何规定被认定为不可执行或无效,该规定将在必要的最小范围内被限制或删除,其余规定仍然完全有效。' }] },
      { h: '17. 完整协议', blocks: [{ p: '本条款与我们的隐私政策共同构成您与 UmamusumeDB 之间关于使用本服务的完整协议。' }] },
      { h: '18. 联系方式', blocks: [{ p: '如果您对本服务条款有任何疑问,请联系我们:' }, { box: contact('邮箱', '网站') }, { box: '<strong>注意:</strong>使用 UmamusumeDB 即表示您已阅读、理解并同意受本服务条款的约束。' }] },
    ],
  },
  ko: {
    title: '이용약관 - UmamusumeDB',
    description: 'UmamusumeDB 이용약관: 우마무스메 데이터베이스와 도구 이용에 관한 규칙입니다.',
    h1: '이용약관', updated: '최종 수정일: 2026년 10월 31일',
    sections: [
      { h: '1. 약관 동의', blocks: [
        { p: 'UmamusumeDB에 오신 것을 환영합니다. <a href="https://umamusumedb.com">https://umamusumedb.com</a>(이하 "서비스")에 접속하거나 이용하면 본 이용약관(이하 "약관")에 구속되는 것에 동의한 것으로 간주됩니다.' },
        { p: '약관에 동의하지 않으시면 서비스를 이용하지 마세요.' } ] },
      { h: '2. 서비스 설명', blocks: [
        { p: 'UmamusumeDB는 게임 「우마무스메 프리티 더비」의 팬이 만든 커뮤니티 기반 데이터베이스 및 정보 사이트입니다. 다음을 제공합니다.' },
        { ul: ['캐릭터 정보와 능력치', '육성 이벤트를 포함한 서포트 카드·스킬 데이터베이스', '출시 연표와 공지 제목', '육성 계산기 등 도구', '게임 가이드와 공략'] } ] },
      { h: '3. 면책 및 제휴 관계', blocks: [
        { p: '<strong>UmamusumeDB는 다음 어느 쪽과도 제휴·승인·후원 관계가 없습니다.</strong>' },
        { ul: ['Cygames, Inc.', '「우마무스메 프리티 더비」 공식 팀', '공식 게임 퍼블리셔 또는 개발사'] },
        { p: '모든 게임 콘텐츠, 캐릭터 이름, 이미지, 상표의 권리는 각 소유자에게 있습니다. 이 사이트는 정보 제공과 학습을 위해 팬이 만든 자료입니다.' } ] },
      { h: '4. 이용자의 행동', blocks: [
        { p: '이용자는 다음 행위를 하지 않는 데 동의합니다.' },
        { ul: ['불법적인 목적으로 서비스를 이용하는 것', '당사이트 시스템에 무단 접근을 시도하는 것', '악성 코드나 유해한 코드를 배포하는 것', '허락 없이 당사이트 콘텐츠를 스크래핑·복사·재배포하는 것', '타인을 사칭하거나 허위 정보를 제공하는 것', '서비스를 방해하거나 중단시키는 것', '관련 법령을 위반하는 것'] } ] },
      { h: '5. 지식재산권', blocks: [
        { h3: '5.1 게임 콘텐츠' },
        { p: '캐릭터 디자인, 이름, 이미지, 게임 시스템 등 게임과 관련된 모든 콘텐츠의 권리는 Cygames, Inc. 및 각 저작권자에게 있습니다. 당사이트는 이러한 콘텐츠에 대한 소유권을 주장하지 않습니다.' },
        { h3: '5.2 당사이트의 콘텐츠' },
        { p: 'UmamusumeDB가 만든 디자인, 레이아웃, 코드, 데이터베이스 및 오리지널 콘텐츠는 저작권법 및 기타 지식재산권법의 보호를 받습니다. 당사이트의 서면 허락 없이 복제, 배포하거나 2차적 저작물을 만들 수 없습니다.' } ] },
      { h: '6. 데이터의 정확성', blocks: [{ p: '당사이트는 정확하고 최신의 정보를 제공하기 위해 노력하지만, 웹사이트 데이터의 완전성, 신뢰성, 정확성을 보증하지 않습니다. 게임 데이터는 업데이트, 패치 또는 정정으로 인해 변경될 수 있습니다.' }] },
      { h: '7. 제3자 링크 및 서비스', blocks: [
        { p: '서비스에는 제3자 웹사이트나 서비스로 연결되는 링크가 포함될 수 있습니다. 당사이트는 이러한 외부 사이트의 내용, 개인정보처리방침, 운영 방식에 대해 책임지지 않습니다.' },
        { p: '당사이트가 이용하는 제3자 서비스는 다음과 같습니다.' },
        { ul: ['Google 애널리틱스(웹사이트 분석)', 'Google AdSense(광고)', 'Cloudflare(호스팅 및 CDN)'] } ] },
      { h: '8. 광고', blocks: [{ p: 'UmamusumeDB는 사이트 운영을 위해 Google AdSense를 통해 광고를 표시합니다. 당사이트는 이러한 광고의 내용을 통제하지 않으며 광고되는 제품이나 서비스에 대해 책임지지 않습니다.' }] },
      { h: '9. 보증의 부인', blocks: [
        { p: '서비스는 명시적이든 묵시적이든 어떠한 종류의 보증도 없이 "있는 그대로", "이용 가능한 상태로" 제공됩니다. 여기에는 다음이 포함되며 이에 한정되지 않습니다.' },
        { ul: ['상품성', '특정 목적에의 적합성', '비침해성', '콘텐츠의 정확성, 신뢰성 또는 완전성', '서비스의 중단 없음 또는 오류 없음'] } ] },
      { h: '10. 책임의 제한', blocks: [{ p: '법률이 허용하는 최대 범위에서 UmamusumeDB와 운영자는 서비스 이용으로 인해 또는 이와 관련하여 발생하는 모든 간접적, 부수적, 특별, 결과적 또는 징벌적 손해(이익, 데이터 또는 이용 기회의 손실을 포함하되 이에 한정되지 않음)에 대해 책임지지 않습니다.' }] },
      { h: '11. 면책 보상', blocks: [{ p: '이용자는 서비스 이용 또는 본 약관 위반으로 인해 발생하는 모든 청구, 손해, 손실, 책임 및 비용으로부터 UmamusumeDB, 운영자 및 관계자를 면책하고 보호하는 데 동의합니다.' }] },
      { h: '12. 개인정보처리방침', blocks: [{ p: '서비스 이용에는 <a href="{L}/privacy-policy/">개인정보처리방침</a>도 적용됩니다. 당사이트의 데이터 처리 방식은 해당 방침을 확인해 주세요.' }] },
      { h: '13. 약관의 변경', blocks: [{ p: '당사이트는 언제든지 약관을 변경할 권리를 가집니다. 중요한 변경은 "최종 수정일"을 갱신하여 알려드립니다. 변경 후에도 서비스를 계속 이용하면 새로운 약관에 동의한 것으로 간주됩니다.' }] },
      { h: '14. 이용 종료', blocks: [{ p: '당사이트는 약관 위반을 포함한 어떠한 이유로든 사전 통지 없이 서비스 접근을 즉시 종료하거나 중지할 권리를 가집니다.' }] },
      { h: '15. 준거법', blocks: [{ p: '본 약관은 법률 충돌 원칙과 관계없이 관련 법령에 따라 규율되고 해석됩니다.' }] },
      { h: '16. 분리 가능성', blocks: [{ p: '본 약관의 일부 조항이 집행 불가능하거나 무효로 판단되는 경우, 해당 조항은 필요한 최소한의 범위로 제한되거나 삭제되며 나머지 조항은 완전한 효력을 유지합니다.' }] },
      { h: '17. 완전 합의', blocks: [{ p: '본 약관과 개인정보처리방침은 서비스 이용에 관한 이용자와 UmamusumeDB 간의 완전한 합의를 구성합니다.' }] },
      { h: '18. 연락처', blocks: [{ p: '본 이용약관에 관한 질문은 아래로 문의해 주세요.' }, { box: contact('이메일', '웹사이트') }, { box: '<strong>참고:</strong> UmamusumeDB를 이용하면 본 이용약관을 읽고 이해했으며 이에 구속되는 데 동의한 것으로 간주됩니다.' }] },
    ],
  },
};

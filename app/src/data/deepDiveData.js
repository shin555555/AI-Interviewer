/**
 * deepDiveData.js
 *
 * 深掘り対話モード用の「レゴブロック辞書」データ。
 * LLM APIを使わず、テンプレート＋ユーザー入力キーワードの動的合成で
 * パーソナライズされた対話を生成する。
 *
 * 心理学的基盤:
 *   - ストレングス・ベースド & スモール・ウィン
 *   - STAR法への言い換え（「なぜ」の禁止）
 *   - ナラティブ・セラピー（外在化）
 *   - ラダリング法（具体→動機→価値観）
 *
 * 構造:
 *   ROUTES          … 4つの入り口ルート定義
 *   TAGS            … 選択肢に紐づく裏タグ（属性）定義
 *   QUESTION_POOLS  … ルート×フェーズ別の質問プール
 *   TEMPLATE_BLOCKS … タグ組み合わせに応じた共感・課題・リフレーミングの文章パーツ
 *   REFRAMING_DICT  … ネガティブ→ポジティブ変換辞書
 *   TORISETSU_TEMPLATES  … 「私のトリセツ」生成テンプレート
 *   ADVOCACY_TEMPLATES   … 支援員への代弁カードテンプレート
 */

// ============================================================
// 1. ルート定義
// ============================================================

export const ROUTES = [
    {
        id: 'moyamoya',
        label: 'モヤモヤを話してみる',
        description: '気になること、困っていることを一緒に整理しましょう',
        icon: '☁️',
        color: '#7B9ACC',
    },
    {
        id: 'dekitakoto',
        label: 'できたことを見つける',
        description: '日常のなかの「小さなよかった」を探しましょう',
        icon: '✨',
        color: '#E8A87C',
    },
    {
        id: 'torisetsu',
        label: '自分のトリセツを作る',
        description: '自分が心地よく過ごせる条件を言葉にしましょう',
        icon: '📖',
        color: '#85CDCA',
    },
    {
        id: 'omakase',
        label: 'AIにお任せ',
        description: 'テーマをAIがランダムに選びます',
        icon: '🎲',
        color: '#D4A5A5',
    },
]

// ============================================================
// 2. タグ定義（選択肢の裏タグ）
// ============================================================

export const TAGS = {
    // --- 環境系 ---
    env_sensitive:   { id: 'env_sensitive',   category: 'environment', label: '環境に敏感' },
    quiet_preferred: { id: 'quiet_preferred', category: 'environment', label: '静かな場所が好き' },
    people_fatigue:  { id: 'people_fatigue',  category: 'environment', label: '対人で疲れやすい' },
    change_averse:   { id: 'change_averse',   category: 'environment', label: '変化が苦手' },
    routine_lover:   { id: 'routine_lover',   category: 'environment', label: 'ルーティンが好き' },
    outdoors_ok:     { id: 'outdoors_ok',     category: 'environment', label: '外の活動も平気' },

    // --- 行動系 ---
    careful:         { id: 'careful',         category: 'action', label: '慎重に進める' },
    steady_pace:     { id: 'steady_pace',     category: 'action', label: 'マイペース' },
    action_first:    { id: 'action_first',    category: 'action', label: 'まず動く' },
    detail_oriented: { id: 'detail_oriented', category: 'action', label: '細部にこだわる' },
    helper:          { id: 'helper',          category: 'action', label: '人の役に立ちたい' },
    solo_worker:     { id: 'solo_worker',     category: 'action', label: '一人で取り組みたい' },

    // --- 感情系 ---
    emotional:       { id: 'emotional',       category: 'feeling', label: '感情が豊か' },
    introspective:   { id: 'introspective',   category: 'feeling', label: '内省的' },
    optimistic:      { id: 'optimistic',      category: 'feeling', label: '前向き' },
    perfectionist:   { id: 'perfectionist',   category: 'feeling', label: '完璧を求める' },
    anxious:         { id: 'anxious',         category: 'feeling', label: '不安になりやすい' },
    patient:         { id: 'patient',         category: 'feeling', label: '辛抱強い' },

    // --- 強み系 ---
    considerate:     { id: 'considerate',     category: 'strength', label: '気配り上手' },
    focus_power:     { id: 'focus_power',     category: 'strength', label: '集中力がある' },
    endurance:       { id: 'endurance',       category: 'strength', label: '粘り強い' },
    creative:        { id: 'creative',        category: 'strength', label: '発想が豊か' },
    observant:       { id: 'observant',       category: 'strength', label: '観察力がある' },
    empathetic:      { id: 'empathetic',      category: 'strength', label: '共感力がある' },
}

// ============================================================
// 2b. 心理学的知見データ
// ============================================================

// --- 動機・価値観マップ（自己決定理論 + シュワルツの価値観理論ベース） ---
// タグの組み合わせから、その人の「根底にある動機」を推定する。
// 「何が好き」ではなく「なぜそれを好むのか」を明らかにする。
export const VALUES_MAP = [
    {
        id: 'autonomy',
        name: '自律性（自分で決めたい）',
        description: '自分のペースや方法で物事を進めたいという欲求が根底にあります。指示されるより、自分で考えて行動するときに最もエネルギーが湧きます。',
        relatedTags: ['solo_worker', 'steady_pace', 'action_first', 'creative'],
        psychNote: '自己決定理論（デシ＆ライアン）では、自律性は人間の基本的な心理的欲求の一つとされています。この欲求が満たされると、内発的な動機づけが高まり、より質の高い成果が生まれます。',
    },
    {
        id: 'mastery',
        name: '熟達（ちゃんとやりたい）',
        description: '物事を正確に、丁寧に、高い水準でやり遂げたいという気持ちが強いです。「ちゃんとできた」という実感が、大きな満足感につながります。',
        relatedTags: ['detail_oriented', 'perfectionist', 'focus_power', 'careful', 'endurance'],
        psychNote: '「熟達動機」は、成果そのものより「うまくなるプロセス」に喜びを見出す傾向です。この動機が強い人は、フィードバックがあると成長が加速します。',
    },
    {
        id: 'connection',
        name: 'つながり（人と関わりたい）',
        description: '人との温かいつながりや、誰かの役に立つことに価値を感じています。一人で完結するより、誰かと共有できたときに充実感を覚えます。',
        relatedTags: ['empathetic', 'helper', 'considerate', 'emotional'],
        psychNote: '関係性の欲求は、人間の幸福感に最も強く影響する要因の一つです。この欲求が強い人は、「ありがとう」の一言がモチベーションの源になります。',
    },
    {
        id: 'safety',
        name: '安心（予測できる環境がほしい）',
        description: '見通しが立つこと、予測できることに安心感を覚えます。急な変化より、安定した環境の中で力を発揮するタイプです。',
        relatedTags: ['routine_lover', 'change_averse', 'careful', 'anxious', 'quiet_preferred'],
        psychNote: 'マズローの欲求階層では「安全の欲求」に対応します。これが満たされて初めて、挑戦やイノベーションへのエネルギーが生まれます。安心は弱さではなく、成長の土台です。',
    },
    {
        id: 'meaning',
        name: '意味（深く理解したい）',
        description: '物事の表面ではなく、本質や意味を理解したいという欲求があります。「なんとなく」で終わらせず、自分なりに納得するまで考える人です。',
        relatedTags: ['introspective', 'observant', 'emotional', 'patient'],
        psychNote: 'ヴィクトール・フランクルの「意味への意志」に通じる傾向です。この動機が強い人は、仕事の意義や目的を理解できると、モチベーションが大きく向上します。',
    },
]

// --- 内的葛藤ペア ---
// 矛盾するタグが同時に出たときに検出される。
// 葛藤はネガティブなものではなく、「心理的な複雑さ・奥行き」を示す。
export const TENSION_PAIRS = [
    {
        tags: ['action_first', 'careful'],
        title: '「動きたい」と「慎重でいたい」の間で',
        analysis: '行動したい気持ちと、慎重に確認したい気持ちの両方を持っています。これは単なる矛盾ではなく、「行動力がありながら、リスクも見える」という高度なバランス感覚です。',
        advice: 'どちらか一方に決めるのではなく、場面に応じて使い分けられることが強みです。「まずは小さく試してみて、確認しながら進める」というスタイルが合うかもしれません。',
    },
    {
        tags: ['solo_worker', 'helper'],
        title: '「一人でいたい」と「人の役に立ちたい」の間で',
        analysis: '一人の時間を大切にしながらも、誰かの力になりたいという気持ちも持っています。この一見矛盾する二つの気持ちは、「自分のペースで、人のために役立つ仕事がしたい」という深い価値観を示しています。',
        advice: '対面でのサポートではなく、「裏方で誰かの役に立つ仕事」（データ整理、資料作成、環境整備など）が最もフィットする可能性があります。',
    },
    {
        tags: ['perfectionist', 'anxious'],
        title: '「完璧にしたい」と「失敗が怖い」の間で',
        analysis: '高い基準を持っているからこそ、そこに届かないかもしれないという不安も大きくなります。これは「質へのこだわり」と「責任感の強さ」が生む、真面目な人特有の葛藤です。',
        advice: '「100点を目指す気持ち」はそのままに、「今日は70点でOK」と自分にゴールラインを設定する練習が効果的です。完璧でなくても、あなたの70点は多くの人の100点に匹敵します。',
    },
    {
        tags: ['creative', 'routine_lover'],
        title: '「新しいことをしたい」と「安定がほしい」の間で',
        analysis: '新しいアイデアに惹かれる一方で、変わらない安定も求めています。これは「安全な土台の上で創造性を発揮したい」という健全な欲求です。',
        advice: '「毎日のルーティンの中に、小さな工夫や変化を取り入れる」というスタイルが合います。大きな変化は苦手でも、小さな改善を重ねることで創造性と安定の両方を満たせます。',
    },
    {
        tags: ['empathetic', 'env_sensitive'],
        title: '「人に寄り添いたい」と「刺激に疲れやすい」の間で',
        analysis: '人の気持ちを深く感じ取れるからこそ、その分エネルギーも消耗しやすいです。共感力が高いほど、「感情の受信機」としての負荷も大きくなります。',
        advice: '「共感のオン・オフ」を意識的に切り替える練習が大切です。人と関わる時間と、完全に一人になれる時間を交互に設けることで、共感力を持続的に活かせます。',
    },
    {
        tags: ['introspective', 'action_first'],
        title: '「じっくり考えたい」と「すぐ動きたい」の間で',
        analysis: '深く考える力と、素早く行動する力の両方を持っています。状況によってどちらが表に出るかが変わるため、自分でも「自分はどっちのタイプだろう？」と迷うことがあるかもしれません。',
        advice: 'これは「考えてから動ける」という、とても価値あるスキルの表れです。重要な場面では考える力を、日常の場面では行動力を、と使い分けられるのが強みです。',
    },
    {
        tags: ['optimistic', 'anxious'],
        title: '「前向きでいたい」と「心配してしまう」の間で',
        analysis: '前を向こうとする力と、リスクを察知する力が同居しています。「大丈夫、なんとかなる」と思いながらも「でも、もし…」と心配する——この振り子のような動きは、楽観と現実主義のバランスを取ろうとする心の働きです。',
        advice: '不安は「未来を予測する力」、楽観は「困難を乗り越える力」。どちらも大事なエネルギーです。不安が出てきたら「これは自分のセンサーが働いている」と捉え、同時に「でも最終的にはなんとかなってきた」という過去の経験を思い出してみてください。',
    },
]

// --- 対処法アドバイス（CBT/DBT/ACTベース） ---
// 苦手項目に対する、心理学ベースの具体的な対処法。
// トリセツの「苦手な場面」セクションに付加する。
export const COPING_STRATEGIES = [
    {
        targetTags: ['anxious'],
        technique: 'グラウンディング（5-4-3-2-1法）',
        description: '不安が強くなったとき、周りの環境に意識を向ける方法です。「見えるもの5つ、聞こえるもの4つ、触れるもの3つ、匂い2つ、味1つ」を頭の中で挙げてみてください。',
        whenToUse: '不安で頭がいっぱいになったとき',
    },
    {
        targetTags: ['people_fatigue', 'env_sensitive'],
        technique: '刺激コントロール',
        description: '疲れを感じたら、一人になれる場所で5分間目を閉じるだけでも回復効果があります。可能であれば、イヤホンや仕切りで刺激を調整しましょう。',
        whenToUse: '人が多い場面や刺激の多い環境で消耗を感じたとき',
    },
    {
        targetTags: ['perfectionist', 'detail_oriented'],
        technique: '「十分良い」ライン設定',
        description: '作業を始める前に「ここまでできたらOK」という基準を具体的に決めておきます。完璧を目指す気持ちは残しつつ、「今日はここまで」と区切る練習です。',
        whenToUse: '作業がなかなか終えられない、もっとやらなきゃと思ってしまうとき',
    },
    {
        targetTags: ['change_averse', 'routine_lover'],
        technique: '変化の予行演習',
        description: '変更の予定があるとき、頭の中で「新しい流れ」を事前にシミュレーションしてみましょう。紙に新しい手順を書き出すだけでも、不安は大きく減ります。',
        whenToUse: '予定変更の連絡を受けたとき、不安になったとき',
    },
    {
        targetTags: ['emotional', 'introspective'],
        technique: '感情のラベリング',
        description: '気分が揺れたとき、「今の気持ちは何だろう？」と名前をつけてみてください。「悲しい」「イライラ」「もやもや」——名前をつけるだけで、感情は少し落ち着きます。これは脳科学でも実証されている方法です。',
        whenToUse: '気持ちが大きく揺れたとき、原因がよく分からないとき',
    },
    {
        targetTags: ['solo_worker', 'quiet_preferred'],
        technique: 'エネルギー管理',
        description: '人と関わる時間と一人の時間を、スケジュールの中で意識的に交互に配置しましょう。「午前は共同作業、午後は一人作業」のように、回復の時間を組み込むことが大切です。',
        whenToUse: '一日の終わりにぐったりしてしまうとき',
    },
]

// ============================================================
// 3. 対話フェーズ定義
// ============================================================
// 各ルートは約10ターンで構成され、以下のフェーズを辿る。
//   phase1_opening   (ターン1-2)  … アイスブレイク・テーマ導入
//   phase2_explore   (ターン3-5)  … 水平展開（STAR法で具体化）
//   phase3_deepdive  (ターン6-7)  … 深掘り（ラダリング・自由記述フィーチャー）
//   phase4_reframe   (ターン8-9)  … リフレーミング・強み変換
//   phase5_summary   (ターン10)   … まとめ・トリセツプレビュー

export const PHASES = [
    { id: 'phase1_opening',  label: 'はじめに',     turns: [1] },
    { id: 'phase1_followup', label: 'はじめに',     turns: [2] },
    { id: 'phase2_explore',  label: 'くわしく',     turns: [3, 4, 5] },
    { id: 'phase3_deepdive', label: 'もっと深く',   turns: [6, 7], featureFreetextUI: true },
    { id: 'phase4_reframe',  label: '強みに変える', turns: [8, 9] },
    { id: 'phase5_summary',  label: 'まとめ',       turns: [10] },
]

// ============================================================
// 4. 質問プール（ルート × フェーズ別）
// ============================================================
// 各質問オブジェクト:
//   id:         一意ID
//   phase:      フェーズID
//   text:       AIの発話テンプレート（[keyword] で変数代入可能）
//   choices:    選択肢の配列（label, tags[], nextHint?）
//   freetext:   自由記述プロンプト（任意）
//   featureUI:  true の場合、自由記述を大きく表示するフィーチャーUI

export const QUESTION_POOLS = {

    // ================================================================
    // ルート1: モヤモヤ・悩み相談
    // ================================================================
    moyamoya: {
        phase1_opening: [
            {
                id: 'moya_op_01',
                phase: 'phase1_opening',
                text: 'まず教えてください。最近、一番「う〜ん」と思ったのは、どんな場面でしたか？',
                choices: [
                    { label: '仕事や作業のこと', tags: ['env_sensitive', 'careful'] },
                    { label: '人との関わりのこと', tags: ['people_fatigue', 'empathetic'] },
                    { label: '自分の体調や気分のこと', tags: ['introspective', 'anxious'] },
                    { label: 'なんとなくモヤモヤするけど、うまく言えない', tags: ['introspective', 'emotional'] },
                ],
                freetext: 'もし具体的な場面があれば、ここに書いてみてください（書かなくても大丈夫です）',
            },
            {
                id: 'moya_op_02',
                phase: 'phase1_opening',
                text: '最近のことで、ちょっとした「引っかかり」を感じていることはありますか？\n大きなことでなくても大丈夫です。小さなことでも気軽に教えてください。',
                choices: [
                    { label: '作業中に困ったことがあった', tags: ['careful', 'env_sensitive'] },
                    { label: '誰かに言われた一言が気になっている', tags: ['people_fatigue', 'emotional'] },
                    { label: '気持ちが沈んでいて、原因がよく分からない', tags: ['anxious', 'introspective'] },
                    { label: '「これでいいのかな」と不安に思うことがある', tags: ['perfectionist', 'anxious'] },
                ],
                freetext: '最近あったことを、少しだけ教えてもらえますか？',
            },
            {
                id: 'moya_op_03',
                phase: 'phase1_opening',
                text: 'ここ最近で、「ちょっと疲れたな」「しんどいな」と感じたことはありましたか？',
                choices: [
                    { label: '体がだるかったり、疲れが取れない日があった', tags: ['env_sensitive', 'endurance'] },
                    { label: '気持ちの面でしんどいと感じた', tags: ['emotional', 'anxious'] },
                    { label: '周りに合わせるのがつらかった', tags: ['people_fatigue', 'steady_pace'] },
                    { label: '特に思い当たることはないけど、なんとなく元気が出ない', tags: ['introspective', 'anxious'] },
                ],
                freetext: 'そのとき、どんな様子でしたか？',
            },
        ],

        phase1_followup: [
            {
                id: 'moya_fu_01',
                phase: 'phase1_followup',
                text: '「[keyword]」のことが気になっているんですね。\nそれは、いつごろから感じていることですか？',
                choices: [
                    { label: 'ここ最近になって感じるようになった', tags: ['env_sensitive', 'observant'] },
                    { label: '少し前からずっと気になっている', tags: ['introspective', 'patient'] },
                    { label: 'かなり前から続いている', tags: ['endurance', 'anxious'] },
                    { label: 'はっきり覚えていないけど、ずっとある気がする', tags: ['introspective', 'steady_pace'] },
                ],
                freetext: 'いつごろから感じているか、思い出せる範囲で教えてください',
            },
            {
                id: 'moya_fu_02',
                phase: 'phase1_followup',
                text: 'なるほど、「[keyword]」のことですね。\nそのモヤモヤは、普段どんなときに一番強く感じますか？',
                choices: [
                    { label: '朝や仕事の始まりごろ', tags: ['env_sensitive', 'routine_lover'] },
                    { label: '作業中や集中しているとき', tags: ['focus_power', 'anxious'] },
                    { label: '人と接しているとき', tags: ['people_fatigue', 'empathetic'] },
                    { label: '夜、一人で考えているとき', tags: ['introspective', 'emotional'] },
                ],
                freetext: 'どんなときに特に強く感じるか、教えてください',
            },
            {
                id: 'moya_fu_03',
                phase: 'phase1_followup',
                text: '「[keyword]」のこと、話してくださってありがとうございます。\nそれって、[userName]さんの中ではどのくらい大きなことですか？',
                choices: [
                    { label: '毎日頭にあるくらい、大きなこと', tags: ['anxious', 'emotional'] },
                    { label: 'ときどき気になるくらい', tags: ['observant', 'careful'] },
                    { label: '小さなことだけど、積み重なっている感じ', tags: ['endurance', 'env_sensitive'] },
                    { label: 'うまく言えないけど、なんとなく引っかかる', tags: ['introspective', 'steady_pace'] },
                ],
                freetext: 'そのモヤモヤの大きさを、たとえるとどんな感じですか？',
            },
        ],

        phase2_explore: [
            {
                id: 'moya_ex_01',
                phase: 'phase2_explore',
                text: '[keyword]のことが気になっているんですね。\nそのとき、どんな状況でしたか？ たとえば、場所や時間帯、まわりにいた人など、思い出せる範囲で教えてもらえますか？',
                choices: [
                    { label: '朝や午前中に起きやすい', tags: ['env_sensitive', 'routine_lover'] },
                    { label: '午後や夕方に起きやすい', tags: ['endurance', 'env_sensitive'] },
                    { label: '特定の人がいるときに起きやすい', tags: ['people_fatigue', 'observant'] },
                    { label: '場所や時間に関係なく起きる', tags: ['anxious', 'introspective'] },
                ],
                freetext: 'そのときの状況を、もう少し聞かせてもらえますか？',
            },
            {
                id: 'moya_ex_02',
                phase: 'phase2_explore',
                text: 'なるほど。そのモヤモヤが現れたとき、[userName]さんはどうしましたか？\n何か行動したこと、逆に動けなかったこと、どちらでも構いません。',
                choices: [
                    { label: '自分なりに対処しようとした', tags: ['action_first', 'endurance'] },
                    { label: 'じっと我慢して、やり過ごした', tags: ['patient', 'careful'] },
                    { label: '誰かに相談した、または話を聞いてもらった', tags: ['helper', 'empathetic'] },
                    { label: '何もできなかった', tags: ['anxious', 'introspective'] },
                ],
                freetext: 'そのときの行動を、もう少し教えてください',
            },
            {
                id: 'moya_ex_03',
                phase: 'phase2_explore',
                text: 'そうだったんですね。\n「[keyword]」というモヤモヤを、もし人やキャラクターに例えるとしたら、どんな感じでしょう？\n（ナラティブ・セラピーでは、困りごとを自分から切り離して眺めることで、気持ちが楽になることがあります）',
                choices: [
                    { label: 'いつの間にか隣にいる、しつこい霧のような存在', tags: ['anxious', 'env_sensitive'] },
                    { label: '突然やってくる嵐のようなもの', tags: ['emotional', 'change_averse'] },
                    { label: '重たい荷物を背負わせてくる誰か', tags: ['endurance', 'people_fatigue'] },
                    { label: '自分の中にいる、心配性なもう一人の自分', tags: ['introspective', 'perfectionist'] },
                ],
                freetext: '自分なりの例えがあれば、教えてください',
            },
            {
                id: 'moya_ex_04',
                phase: 'phase2_explore',
                text: 'その[keyword]は、[userName]さんの毎日の中で、どのくらいの頻度で現れますか？',
                choices: [
                    { label: 'ほぼ毎日感じる', tags: ['anxious', 'env_sensitive'] },
                    { label: '週に何回かある', tags: ['introspective', 'careful'] },
                    { label: 'たまに、ふとした時に感じる', tags: ['observant', 'emotional'] },
                    { label: '特定の場面でだけ強く出てくる', tags: ['env_sensitive', 'change_averse'] },
                ],
                freetext: 'どんなときに特に強く感じますか？',
            },
        ],

        phase3_deepdive: [
            {
                id: 'moya_dd_01',
                phase: 'phase3_deepdive',
                featureUI: true,
                text: 'ここまで話してくださって、ありがとうございます。\n少し視点を変えてみましょう。\n\nそのモヤモヤがもし完全になくなったとしたら、[userName]さんの毎日はどんなふうに変わると思いますか？\n自由に想像してみてください。',
                choices: [
                    { label: '気持ちが軽くなって、もっと動けると思う', tags: ['action_first', 'optimistic'] },
                    { label: '安心して、自分のペースで過ごせると思う', tags: ['steady_pace', 'routine_lover'] },
                    { label: '人との関わりが楽になると思う', tags: ['people_fatigue', 'empathetic'] },
                    { label: '正直、あまり想像できない', tags: ['introspective', 'anxious'] },
                ],
                freetext: '想像した「理想の1日」を、自由に書いてみてください',
            },
            {
                id: 'moya_dd_02',
                phase: 'phase3_deepdive',
                featureUI: true,
                text: '[userName]さんにとって、「心地よい」「安心できる」と感じるのは、どんな状態のときですか？\n仕事の場面でも、プライベートでも、どちらでも構いません。',
                choices: [
                    { label: '自分のペースで、一つのことに集中できているとき', tags: ['focus_power', 'solo_worker'] },
                    { label: '誰かと一緒にいて、認めてもらえていると感じるとき', tags: ['empathetic', 'helper'] },
                    { label: '決まった流れがあって、次にやることが分かっているとき', tags: ['routine_lover', 'careful'] },
                    { label: '好きなことに没頭しているとき', tags: ['creative', 'focus_power'] },
                ],
                freetext: 'あなたにとっての「安心できる状態」を、自分の言葉で教えてください',
            },
        ],

        phase4_reframe: [
            {
                id: 'moya_rf_01',
                phase: 'phase4_reframe',
                text: 'ここまでのお話を聞いて、一つ気づいたことがあります。\n\n[userName]さんが「[keyword]」と感じているのは、実は[userName]さんが周りのことをよく見ていて、小さな変化にも気づける力を持っているからかもしれません。\n\nこの見方について、どう感じますか？',
                choices: [
                    { label: '言われてみると、そうかもしれない', tags: ['observant', 'optimistic'] },
                    { label: '少し意外だけど、嬉しい', tags: ['emotional', 'empathetic'] },
                    { label: 'まだピンとこない', tags: ['introspective', 'careful'] },
                    { label: '確かに、気づきすぎてしまうところはある', tags: ['env_sensitive', 'observant'] },
                ],
                freetext: '自分の「強み」について、思うことがあれば教えてください',
            },
            {
                id: 'moya_rf_02',
                phase: 'phase4_reframe',
                text: '[userName]さんが今日お話ししてくれた中で、とても大事なことがあります。\nそれは、モヤモヤを感じながらも、毎日ここに来て、こうして自分のことを振り返ろうとしていることです。\nこれは「粘り強さ」であり、「自分を大切にしたい」という気持ちの表れです。\n\nこれまでの中で、「しんどかったけど、なんとかやり続けた」ということはありますか？',
                choices: [
                    { label: '通所を続けていること自体がそうだと思う', tags: ['endurance', 'patient'] },
                    { label: '苦手な作業にも取り組んだことがある', tags: ['endurance', 'action_first'] },
                    { label: '人間関係で悩みながらも、離れずにいたことがある', tags: ['empathetic', 'patient'] },
                    { label: '自分ではあまり思いつかない', tags: ['introspective', 'anxious'] },
                ],
                freetext: '「なんとかやり続けた経験」を、教えてもらえますか？',
            },
        ],

        phase5_summary: [
            {
                id: 'moya_sm_01',
                phase: 'phase5_summary',
                text: '今日はたくさんお話しいただき、ありがとうございました。\n\n[userName]さんとの対話を通じて見えてきたことを、「私のトリセツ」としてまとめました。\n結果を見てみましょう。',
                choices: [
                    { label: '結果を見る', tags: [] },
                ],
            },
        ],
    },

    // ================================================================
    // ルート2: できたこと発見
    // ================================================================
    dekitakoto: {
        phase1_opening: [
            {
                id: 'deki_op_01',
                phase: 'phase1_opening',
                text: '大きなことじゃなくて大丈夫です。\nここ最近で、「ちょっとうまくいったな」と思ったことはありますか？',
                choices: [
                    { label: '作業や仕事でうまくいったことがある', tags: ['focus_power', 'action_first'] },
                    { label: '人との関わりでよかったことがある', tags: ['empathetic', 'helper'] },
                    { label: '自分の体調管理や生活面でできたことがある', tags: ['careful', 'routine_lover'] },
                    { label: 'うーん、あまり思いつかない', tags: ['introspective', 'anxious'] },
                ],
                freetext: '最近の「ちょっとよかったこと」を教えてください',
            },
            {
                id: 'deki_op_02',
                phase: 'phase1_opening',
                text: '昨日やおとといのことを思い出してみてください。\n「いつもよりスムーズにできた」「思ったより平気だった」ということはありましたか？',
                choices: [
                    { label: 'いつもより早く作業が終わった', tags: ['focus_power', 'steady_pace'] },
                    { label: '苦手な場面で、思ったより落ち着いていられた', tags: ['patient', 'emotional'] },
                    { label: '自分から挨拶や声かけができた', tags: ['action_first', 'helper'] },
                    { label: '朝、時間通りに起きて準備ができた', tags: ['routine_lover', 'careful'] },
                ],
                freetext: '思い出したことを、教えてください',
            },
            {
                id: 'deki_op_03',
                phase: 'phase1_opening',
                text: '人は自分のことを厳しく見がちですが、実は毎日たくさんの「できていること」があります。\n\n今週、「当たり前にやっていたけど、実はすごいこと」はありませんか？',
                choices: [
                    { label: '毎日、休まずに通えている', tags: ['endurance', 'routine_lover'] },
                    { label: '決められた時間に作業を始めている', tags: ['careful', 'routine_lover'] },
                    { label: '困ったときに誰かに聞くことができた', tags: ['helper', 'action_first'] },
                    { label: '体調が悪い日も、自分で判断して休めた', tags: ['introspective', 'careful'] },
                ],
                freetext: '「当たり前だけど、実はがんばっていること」を教えてください',
            },
        ],

        phase1_followup: [
            {
                id: 'deki_fu_01',
                phase: 'phase1_followup',
                text: '「[keyword]」ができたんですね。それはすごいことですよ。\nそれができたとき、どんな気持ちでしたか？',
                choices: [
                    { label: '少しうれしかった', tags: ['optimistic', 'emotional'] },
                    { label: 'ホッとした、安心した', tags: ['anxious', 'careful'] },
                    { label: 'あまり実感はなかった', tags: ['introspective', 'steady_pace'] },
                    { label: '「もっとできるかも」と思った', tags: ['action_first', 'endurance'] },
                ],
                freetext: 'そのときの気持ちを、もう少し教えてください',
            },
            {
                id: 'deki_fu_02',
                phase: 'phase1_followup',
                text: '「[keyword]」、いいですね。\nそれをやろうと思ったきっかけや理由はありますか？',
                choices: [
                    { label: '自分からやろうと思った', tags: ['action_first', 'creative'] },
                    { label: '誰かに言われて、やってみた', tags: ['helper', 'empathetic'] },
                    { label: '自然とそうなっていた', tags: ['steady_pace', 'routine_lover'] },
                    { label: 'よく覚えていないけど、なんとなく', tags: ['introspective', 'observant'] },
                ],
                freetext: 'きっかけを、もう少し教えてください',
            },
            {
                id: 'deki_fu_03',
                phase: 'phase1_followup',
                text: 'なるほど、「[keyword]」のことですね。\nそれは[userName]さんにとって、よくあることですか？ それとも珍しいことですか？',
                choices: [
                    { label: '実は、わりとよくできている気がする', tags: ['optimistic', 'endurance'] },
                    { label: '今回は特にうまくいった', tags: ['observant', 'focus_power'] },
                    { label: '前はできなかったけど、最近できるようになった', tags: ['action_first', 'patient'] },
                    { label: 'たまたまだと思う', tags: ['introspective', 'anxious'] },
                ],
                freetext: 'それについて、もう少し教えてください',
            },
        ],

        phase2_explore: [
            {
                id: 'deki_ex_01',
                phase: 'phase2_explore',
                text: '「[keyword]」ができたんですね。すばらしいです。\nそのとき、どんな状況でしたか？ 場所や、まわりにいた人のことなど、覚えていることを教えてください。',
                choices: [
                    { label: '一人で集中してやっていた', tags: ['solo_worker', 'focus_power'] },
                    { label: '誰かと一緒に取り組んでいた', tags: ['helper', 'empathetic'] },
                    { label: 'いつもと同じ場所・時間だった', tags: ['routine_lover', 'steady_pace'] },
                    { label: 'いつもと違う環境だった', tags: ['action_first', 'creative'] },
                ],
                freetext: 'そのときの様子を、もう少し教えてください',
            },
            {
                id: 'deki_ex_02',
                phase: 'phase2_explore',
                text: 'なるほど。そのとき[userName]さんが工夫したこと、意識したことはありましたか？\n些細なことでも構いません。',
                choices: [
                    { label: '手順や進め方を自分なりに考えた', tags: ['careful', 'detail_oriented'] },
                    { label: '焦らず、落ち着いてやることを心がけた', tags: ['patient', 'steady_pace'] },
                    { label: '周りの人を見て、やり方を参考にした', tags: ['observant', 'empathetic'] },
                    { label: '特に意識はしていなかった。自然にできた', tags: ['optimistic', 'action_first'] },
                ],
                freetext: '工夫したことがあれば、教えてください',
            },
            {
                id: 'deki_ex_03',
                phase: 'phase2_explore',
                text: 'その結果、どうなりましたか？\n自分の気持ちや、まわりの反応など、何か変化はありましたか？',
                choices: [
                    { label: '自分でも「やれた」と少し嬉しかった', tags: ['optimistic', 'emotional'] },
                    { label: '周りの人に認めてもらえた', tags: ['empathetic', 'helper'] },
                    { label: '特に反応はなかったけど、自分の中で達成感があった', tags: ['introspective', 'endurance'] },
                    { label: 'あまり実感はなかった', tags: ['introspective', 'anxious'] },
                ],
                freetext: 'そのときの気持ちを、教えてください',
            },
            {
                id: 'deki_ex_04',
                phase: 'phase2_explore',
                text: '同じような「うまくいった経験」が、他にもありますか？\n仕事以外でも、家でのことや趣味でも構いません。',
                choices: [
                    { label: '似たようなことが他にもあった気がする', tags: ['observant', 'optimistic'] },
                    { label: '趣味や家での出来事で、似た経験がある', tags: ['creative', 'steady_pace'] },
                    { label: '今回が初めてかもしれない', tags: ['introspective', 'careful'] },
                    { label: '覚えていないけど、あったかもしれない', tags: ['introspective', 'patient'] },
                ],
                freetext: '他にも思い出した経験があれば、教えてください',
            },
        ],

        phase3_deepdive: [
            {
                id: 'deki_dd_01',
                phase: 'phase3_deepdive',
                featureUI: true,
                text: 'ここまでのお話を聞いて、[userName]さんには一つのパターンがあるように感じます。\nそれは「[keyword]」という場面で力を発揮できるということです。\n\n[userName]さんにとって、「自分が一番いい状態で取り組めている」と感じるのは、どんなときですか？\nぜひ、自分の言葉で教えてください。',
                choices: [
                    { label: '自分のペースが守られているとき', tags: ['steady_pace', 'routine_lover'] },
                    { label: 'やることが明確で、迷わないとき', tags: ['careful', 'detail_oriented'] },
                    { label: '誰かに頼られたり、感謝されたとき', tags: ['helper', 'empathetic'] },
                    { label: '新しいことに挑戦しているとき', tags: ['creative', 'action_first'] },
                ],
                freetext: '「自分がいい状態で取り組めているとき」を、自由に書いてみてください',
            },
            {
                id: 'deki_dd_02',
                phase: 'phase3_deepdive',
                featureUI: true,
                text: '「できたこと」の裏側には、[userName]さんが大事にしている価値観があるかもしれません。\n\n[userName]さんが日々の中で「これだけは守りたい」「これは自分にとって大切」と感じていることは何ですか？',
                choices: [
                    { label: '自分のペースを崩さないこと', tags: ['steady_pace', 'routine_lover'] },
                    { label: '丁寧に、正確にやること', tags: ['detail_oriented', 'perfectionist'] },
                    { label: '周りの人と穏やかにいること', tags: ['empathetic', 'considerate'] },
                    { label: '自分で決めて、自分でやること', tags: ['action_first', 'solo_worker'] },
                ],
                freetext: '大切にしていることを、自分の言葉で書いてみてください',
            },
        ],

        phase4_reframe: [
            {
                id: 'deki_rf_01',
                phase: 'phase4_reframe',
                text: '今日のお話を振り返ると、[userName]さんの中に確かな強みが見えてきます。\n\n「[keyword]」ができるのは、[userName]さんに[strengthLabel]があるからです。\nこれは、どんな職場でも役に立つ力です。\n\nこの強みを、どんな場面で活かしていきたいですか？',
                choices: [
                    { label: '今の作業をもっとうまくやりたい', tags: ['focus_power', 'endurance'] },
                    { label: '新しいことにも挑戦してみたい', tags: ['creative', 'action_first'] },
                    { label: '人の役に立てる場面で使いたい', tags: ['helper', 'empathetic'] },
                    { label: 'まだ分からないけど、自信にはなった', tags: ['optimistic', 'introspective'] },
                ],
                freetext: 'この強みをどう活かしたいか、教えてください',
            },
            {
                id: 'deki_rf_02',
                phase: 'phase4_reframe',
                text: '最後に一つ。\n[userName]さんは、自分のことを「あまりできていない」と思うことがあるかもしれません。\nでも、今日の対話で分かったように、[userName]さんは毎日たくさんのことを「できて」います。\n\n自分に声をかけるとしたら、どんな言葉がしっくりきますか？',
                choices: [
                    { label: '「よくやってるよ」', tags: ['optimistic', 'endurance'] },
                    { label: '「もう少しだけ、がんばってみよう」', tags: ['patient', 'action_first'] },
                    { label: '「そのままでいいよ」', tags: ['steady_pace', 'empathetic'] },
                    { label: 'まだうまく言葉にできない', tags: ['introspective', 'anxious'] },
                ],
                freetext: '自分への言葉を、ここに書いてみてください',
            },
        ],

        phase5_summary: [
            {
                id: 'deki_sm_01',
                phase: 'phase5_summary',
                text: '今日はたくさんの「できたこと」を一緒に見つけることができました。ありがとうございます。\n\n[userName]さんの強みと、今日見つけた「できたこと」をまとめました。\n結果を見てみましょう。',
                choices: [
                    { label: '結果を見る', tags: [] },
                ],
            },
        ],
    },

    // ================================================================
    // ルート3: 自己分析（トリセツ作成）
    // ================================================================
    torisetsu: {
        phase1_opening: [
            {
                id: 'tori_op_01',
                phase: 'phase1_opening',
                text: 'まず、[userName]さんの「得意なこと」から始めたいと思います。\n仕事に限らず、「これは割と苦にならない」と感じることはありますか？',
                choices: [
                    { label: 'コツコツ同じことを繰り返すこと', tags: ['routine_lover', 'endurance'] },
                    { label: '細かい部分に気を配ること', tags: ['detail_oriented', 'observant'] },
                    { label: '人の話を聞いたり、気持ちを想像すること', tags: ['empathetic', 'considerate'] },
                    { label: '一人で黙々と作業すること', tags: ['solo_worker', 'focus_power'] },
                ],
                freetext: '「苦にならないこと」を教えてください',
            },
            {
                id: 'tori_op_02',
                phase: 'phase1_opening',
                text: '最初の質問です。[userName]さんが「調子がいいな」と感じるのは、どんな環境のときですか？',
                choices: [
                    { label: '静かで、自分のスペースがあるとき', tags: ['quiet_preferred', 'solo_worker'] },
                    { label: '適度に人がいて、声が聞こえるとき', tags: ['empathetic', 'helper'] },
                    { label: 'やることが決まっていて、流れが分かるとき', tags: ['routine_lover', 'careful'] },
                    { label: '少し変化や刺激があるとき', tags: ['creative', 'action_first'] },
                ],
                freetext: '「調子がいいとき」の環境を教えてください',
            },
        ],

        phase1_followup: [
            {
                id: 'tori_fu_01',
                phase: 'phase1_followup',
                text: '「[keyword]」が得意なんですね。\nでは反対に、「これはちょっと苦手だな」と感じることはありますか？',
                choices: [
                    { label: '急に予定が変わること', tags: ['change_averse', 'careful'] },
                    { label: 'たくさんの人がいる場面', tags: ['quiet_preferred', 'people_fatigue'] },
                    { label: '自分で何をするか決めないといけないとき', tags: ['routine_lover', 'anxious'] },
                    { label: 'スピードを求められること', tags: ['steady_pace', 'detail_oriented'] },
                ],
                freetext: '苦手に感じることを、教えてください',
            },
            {
                id: 'tori_fu_02',
                phase: 'phase1_followup',
                text: 'なるほど、「[keyword]」のときが調子いいんですね。\n逆に、調子が落ちやすいのはどんな場面ですか？',
                choices: [
                    { label: '環境が騒がしいとき', tags: ['env_sensitive', 'quiet_preferred'] },
                    { label: '誰かに急かされるとき', tags: ['steady_pace', 'patient'] },
                    { label: '何をすればいいか分からないとき', tags: ['anxious', 'routine_lover'] },
                    { label: '長い時間、人と一緒にいるとき', tags: ['people_fatigue', 'solo_worker'] },
                ],
                freetext: '調子が落ちやすい場面を教えてください',
            },
        ],

        phase2_explore: [
            {
                id: 'tori_ex_01',
                phase: 'phase2_explore',
                text: 'では反対に、「ちょっと苦手だな」「疲れやすいな」と感じるのはどんな場面ですか？\n苦手なことを知るのも、自分を理解する大事な一歩です。',
                choices: [
                    { label: '急な予定変更や、突然のお願い', tags: ['change_averse', 'careful'] },
                    { label: '大勢の人がいる場面や、にぎやかな場所', tags: ['quiet_preferred', 'people_fatigue'] },
                    { label: '自由にやっていいよと言われて、何をすればいいか分からないとき', tags: ['routine_lover', 'anxious'] },
                    { label: '長時間ずっと同じことを続けること', tags: ['creative', 'env_sensitive'] },
                ],
                freetext: '苦手な場面を、もう少し教えてください',
            },
            {
                id: 'tori_ex_02',
                phase: 'phase2_explore',
                text: 'なるほど。「[keyword]」が苦手なんですね。\nそういうとき、[userName]さんはどうやって乗り越えていますか？ また、こうしてもらえると助かるということはありますか？',
                choices: [
                    { label: '事前に教えてもらえると助かる', tags: ['careful', 'routine_lover'] },
                    { label: '少し休憩を取れると落ち着く', tags: ['env_sensitive', 'steady_pace'] },
                    { label: '手順書やメモがあると安心', tags: ['detail_oriented', 'careful'] },
                    { label: '一人になれる時間があると回復できる', tags: ['quiet_preferred', 'solo_worker'] },
                ],
                freetext: '「こうしてもらえると助かる」ことを教えてください',
            },
            {
                id: 'tori_ex_03',
                phase: 'phase2_explore',
                text: '[userName]さんの1日の中で、「一番調子がいい時間帯」はありますか？\n体力や気分のリズムを知ることも、トリセツの大事な要素です。',
                choices: [
                    { label: '午前中が一番元気', tags: ['routine_lover', 'action_first'] },
                    { label: '午後からエンジンがかかるタイプ', tags: ['steady_pace', 'creative'] },
                    { label: '時間帯より「休憩を挟めるかどうか」が大事', tags: ['env_sensitive', 'careful'] },
                    { label: '日によってバラバラで、安定しない', tags: ['anxious', 'change_averse'] },
                ],
                freetext: '自分のリズムについて、気づいていることがあれば教えてください',
            },
            {
                id: 'tori_ex_04',
                phase: 'phase2_explore',
                text: '人との関わり方についても聞かせてください。\n[userName]さんは、どのくらいのコミュニケーション量が心地よいですか？',
                choices: [
                    { label: '必要なときだけ、短く話せればいい', tags: ['solo_worker', 'quiet_preferred'] },
                    { label: 'ときどき雑談があると安心する', tags: ['empathetic', 'considerate'] },
                    { label: '文字（メモやチャット）でのやり取りが楽', tags: ['careful', 'detail_oriented'] },
                    { label: 'いろんな人と話すのが好き', tags: ['helper', 'action_first'] },
                ],
                freetext: '人との関わりで「心地よい距離感」を教えてください',
            },
        ],

        phase3_deepdive: [
            {
                id: 'tori_dd_01',
                phase: 'phase3_deepdive',
                featureUI: true,
                text: 'ここまで、得意なこと・苦手なこと・リズム・人との距離感について教えてもらいました。\n\n[userName]さんが働くうえで「これだけは大切にしたい」と思うことは何ですか？\nこれがトリセツの「核」になります。ぜひ、自分の言葉で聞かせてください。',
                choices: [
                    { label: '自分のペースを守れること', tags: ['steady_pace', 'routine_lover'] },
                    { label: '安心できる人間関係があること', tags: ['empathetic', 'considerate'] },
                    { label: '何をすればいいか明確であること', tags: ['careful', 'detail_oriented'] },
                    { label: '成長を実感できること', tags: ['action_first', 'optimistic'] },
                ],
                freetext: '「働くうえで一番大切にしたいこと」を、自分の言葉で書いてみてください',
            },
            {
                id: 'tori_dd_02',
                phase: 'phase3_deepdive',
                featureUI: true,
                text: 'もう一つ大事な質問です。\n\nもし支援員さんや職場の方に「[userName]さんのことをもっと知りたい」と言われたら、何を伝えたいですか？\n言いにくいことでも、ここでなら大丈夫です。',
                choices: [
                    { label: '調子が悪い日のサインを知ってほしい', tags: ['env_sensitive', 'anxious'] },
                    { label: '声のかけ方に配慮があると嬉しい', tags: ['people_fatigue', 'considerate'] },
                    { label: 'できることを認めて、任せてほしい', tags: ['action_first', 'endurance'] },
                    { label: '急かさないでほしい', tags: ['steady_pace', 'patient'] },
                ],
                freetext: '支援員さんや職場の人に伝えたいことを、自由に書いてください',
            },
        ],

        phase4_reframe: [
            {
                id: 'tori_rf_01',
                phase: 'phase4_reframe',
                text: '[userName]さんのトリセツが、だいぶ形になってきました。\n\n今日わかった[userName]さんの特徴を、強みとして言い換えてみますね。\n「[keyword]」→「[reframing]」\n\nこの言い換え、しっくりきますか？',
                choices: [
                    { label: 'しっくりくる。自分の強みだと思える', tags: ['optimistic', 'endurance'] },
                    { label: '少し恥ずかしいけど、嬉しい', tags: ['emotional', 'empathetic'] },
                    { label: 'もう少し違う表現のほうがいいかも', tags: ['detail_oriented', 'introspective'] },
                    { label: 'まだ実感がわかない', tags: ['anxious', 'introspective'] },
                ],
                freetext: '自分の強みについて、補足や修正があれば教えてください',
            },
            {
                id: 'tori_rf_02',
                phase: 'phase4_reframe',
                text: '最後に。[userName]さんの「トリセツ」に、「こういうサポートがあると助かります」という項目を加えたいと思います。\n\n支援員さんに「こうしてほしい」と思うことを、一つ選んでみてください。',
                choices: [
                    { label: '困っているときに、さりげなく声をかけてほしい', tags: ['considerate', 'empathetic'] },
                    { label: '手順やルールを、分かりやすく紙に書いてほしい', tags: ['detail_oriented', 'careful'] },
                    { label: '調子が悪い日は、無理させないでほしい', tags: ['env_sensitive', 'patient'] },
                    { label: 'できたことを、たまに言葉で伝えてほしい', tags: ['optimistic', 'emotional'] },
                ],
                freetext: '支援員さんへのお願いを、自由に書いてください',
            },
        ],

        phase5_summary: [
            {
                id: 'tori_sm_01',
                phase: 'phase5_summary',
                text: '今日は一緒に[userName]さんの「トリセツ」を作ることができました。ありがとうございます。\n\n得意なこと、苦手なこと、心地よい環境、そしてサポートのお願い。\nこの4つの柱でまとめました。\n結果を見てみましょう。',
                choices: [
                    { label: '結果を見る', tags: [] },
                ],
            },
        ],
    },
}

// ============================================================
// 5. テンプレートブロック辞書
// ============================================================
// タグの組み合わせに基づいて選択される文章パーツ。
// 複数ブロックを連結してAIの返答を動的に構成する。
//
// 変数: [userName], [keyword], [userInput], [strengthLabel]

export const TEMPLATE_BLOCKS = {

    // --- 共感ブロック（相手の気持ちを受け止める） ---
    empathy: [
        {
            id: 'emp_general',
            matchTags: [],
            text: '[userName]さんが話してくださったこと、しっかり受け止めました。',
        },
        {
            id: 'emp_anxiety',
            matchTags: ['anxious'],
            text: '不安な気持ちを抱えながら、こうして自分のことを振り返ろうとしているのは、とても勇気のあることです。',
        },
        {
            id: 'emp_fatigue',
            matchTags: ['people_fatigue'],
            text: '人との関わりで疲れを感じること、ありますよね。それは[userName]さんが周りのことをよく気にかけているからこそです。',
        },
        {
            id: 'emp_env',
            matchTags: ['env_sensitive'],
            text: '環境の変化に敏感なのは、つらいときもあるかもしれません。でも、それは[userName]さんの繊細なアンテナが常に働いている証拠でもあります。',
        },
        {
            id: 'emp_change',
            matchTags: ['change_averse'],
            text: '急な変化は、誰でも戸惑いますよね。[userName]さんが「安定」を大事にしたいと思う気持ちは、とても自然なことです。',
        },
        {
            id: 'emp_perfectionist',
            matchTags: ['perfectionist'],
            text: '「ちゃんとやりたい」という気持ちが強いからこそ、つらくなることがありますよね。その真面目さは、間違いなく[userName]さんの力です。',
        },
        {
            id: 'emp_emotional',
            matchTags: ['emotional'],
            text: '感情が揺れるのは、[userName]さんが物事を深く受け止めている証拠です。感じる力は、大切な強みです。',
        },
        {
            id: 'emp_introspective',
            matchTags: ['introspective'],
            text: '自分の内面をじっくり見つめようとしているのは、なかなかできることではありません。[userName]さんの内省力は、すばらしいものです。',
        },
        {
            id: 'emp_solo',
            matchTags: ['solo_worker'],
            text: '一人の時間を大事にしたいと思うのは、自然なことです。[userName]さんは、静かな環境で力を発揮できるタイプなのかもしれませんね。',
        },
    ],

    // --- 課題ブロック（外在化して客観視を促す） ---
    challenge: [
        {
            id: 'chal_general',
            matchTags: [],
            text: '[userName]さんを困らせている「[keyword]」という存在。これは[userName]さん自身の欠点ではなく、対処できる「相手」として見てみましょう。',
        },
        {
            id: 'chal_anxiety_fog',
            matchTags: ['anxious', 'env_sensitive'],
            text: '[userName]さんのまわりに、ときどき「不安の霧」がやってくるようですね。この霧は[userName]さんの一部ではなく、天気のように外からやってくるものです。',
        },
        {
            id: 'chal_people_weight',
            matchTags: ['people_fatigue', 'empathetic'],
            text: '人の気持ちを敏感に拾ってしまうことで、「重たい荷物」を背負ってしまうことがあるようですね。その荷物は、少しずつ下ろしていいんです。',
        },
        {
            id: 'chal_perfectionism',
            matchTags: ['perfectionist', 'detail_oriented'],
            text: '「完璧にやらなきゃ」という声が、[userName]さんの中で大きくなることがあるようですね。この声は「品質管理係」のようなもので、悪い存在ではないですが、たまに厳しくなりすぎることがあります。',
        },
        {
            id: 'chal_change_storm',
            matchTags: ['change_averse', 'routine_lover'],
            text: '「急な変化」は[userName]さんにとって「突然の嵐」のようなものですね。嵐は[userName]さんのせいではなく、外から来るものです。大事なのは、嵐が来たときの「避難場所」を知っておくことです。',
        },
        {
            id: 'chal_energy_drain',
            matchTags: ['endurance', 'env_sensitive'],
            text: '一日の中で、エネルギーがだんだん減っていくのを感じることがあるようですね。これは[userName]さんが全力で取り組んでいるからこそ起きること。「充電ポイント」を見つけることが大切です。',
        },
    ],

    // --- リフレーミングブロック（強み変換） ---
    reframing: [
        {
            id: 'ref_general',
            matchTags: [],
            text: '今日のお話を通じて、[userName]さんの強みが見えてきました。',
        },
        {
            id: 'ref_sensitivity_to_antenna',
            matchTags: ['env_sensitive', 'observant'],
            text: '環境の変化に気づきやすいということは、「高性能なアンテナ」を持っているということです。これは、周りの変化にいち早く対応できる力です。',
        },
        {
            id: 'ref_caution_to_reliability',
            matchTags: ['careful', 'detail_oriented'],
            text: '慎重に進めるということは、「信頼性」が高いということです。ミスが少なく、丁寧な仕事ができるのは、大きな強みです。',
        },
        {
            id: 'ref_fatigue_to_empathy',
            matchTags: ['people_fatigue', 'empathetic'],
            text: '人との関わりで疲れやすいのは、相手の気持ちを深く感じ取れる「共感力」の裏返しです。これは、チームの中で欠かせない力です。',
        },
        {
            id: 'ref_routine_to_stability',
            matchTags: ['routine_lover', 'endurance'],
            text: 'ルーティンを好むのは、「安定した成果を出し続けられる力」です。同じことをコツコツ続けられるのは、立派な才能です。',
        },
        {
            id: 'ref_anxiety_to_foresight',
            matchTags: ['anxious', 'careful'],
            text: '不安になりやすいということは、「先を見通す力」があるということです。リスクに気づけるのは、物事をうまく進めるうえで大切な能力です。',
        },
        {
            id: 'ref_slow_to_thoughtful',
            matchTags: ['steady_pace', 'introspective'],
            text: 'マイペースに進むのは、「じっくり考えて行動できる力」です。衝動的に動かないからこそ、判断の質が高いのです。',
        },
        {
            id: 'ref_solo_to_independence',
            matchTags: ['solo_worker', 'focus_power'],
            text: '一人で作業するのが好きなのは、「自立して集中できる力」です。指示がなくても黙々と進められるのは、どんな職場でも重宝されます。',
        },
        {
            id: 'ref_emotional_to_depth',
            matchTags: ['emotional', 'creative'],
            text: '感情が豊かなのは、「物事を深く味わえる力」です。この感受性は、クリエイティブな仕事や、人に寄り添う仕事で大きな強みになります。',
        },
        {
            id: 'ref_perfectionist_to_quality',
            matchTags: ['perfectionist', 'endurance'],
            text: '完璧を求める気持ちは、「品質へのこだわり」という素晴らしい力です。妥協しない姿勢は、信頼される仕事につながります。',
        },
    ],
}

// ============================================================
// 6. リフレーミング辞書（ネガティブ → ポジティブ変換）
// ============================================================

export const REFRAMING_DICT = [
    {
        negative: '人と話すのが苦手',
        positive: '一人の時間を大切にでき、集中して物事に取り組める',
        strengthTag: 'focus_power',
    },
    {
        negative: '変化に弱い',
        positive: '安定した環境で持続的に力を発揮できる',
        strengthTag: 'routine_lover',
    },
    {
        negative: '心配性',
        positive: 'リスクを事前に察知し、慎重に準備できる',
        strengthTag: 'careful',
    },
    {
        negative: '作業が遅い',
        positive: '一つひとつ丁寧に取り組み、正確な成果を出せる',
        strengthTag: 'detail_oriented',
    },
    {
        negative: '疲れやすい',
        positive: '自分の体調に敏感で、無理をしすぎない判断ができる',
        strengthTag: 'introspective',
    },
    {
        negative: '集中が続かない',
        positive: '複数のことに注意を向けられ、変化に気づきやすい',
        strengthTag: 'observant',
    },
    {
        negative: '気分にムラがある',
        positive: '感受性が豊かで、物事を深く味わえる',
        strengthTag: 'emotional',
    },
    {
        negative: '自分の意見が言えない',
        positive: '周りの意見を尊重し、場の調和を大切にできる',
        strengthTag: 'considerate',
    },
    {
        negative: '頑固・こだわりが強い',
        positive: '自分の基準を持ち、ブレずに取り組める',
        strengthTag: 'endurance',
    },
    {
        negative: '人の目が気になる',
        positive: '周囲をよく観察し、空気を読む力がある',
        strengthTag: 'observant',
    },
    {
        negative: '不器用',
        positive: '一つのやり方を覚えたら、着実にこなせる',
        strengthTag: 'steady_pace',
    },
    {
        negative: '落ち込みやすい',
        positive: '物事を真剣に受け止め、誠実に向き合える',
        strengthTag: 'empathetic',
    },
    {
        negative: '指示がないと動けない',
        positive: 'ルールや手順を守って正確に作業できる',
        strengthTag: 'careful',
    },
    {
        negative: '一人でいるのが好き',
        positive: '自立して作業でき、他者に依存しない安定感がある',
        strengthTag: 'solo_worker',
    },
    {
        negative: '完璧じゃないと気が済まない',
        positive: '品質にこだわり、信頼性の高い仕事ができる',
        strengthTag: 'perfectionist',
    },
    {
        negative: '人付き合いで疲れる',
        positive: '相手の気持ちに寄り添い、深い共感ができる',
        strengthTag: 'empathetic',
    },
    {
        negative: '断るのが苦手',
        positive: '人の気持ちを大切にし、協調性がある',
        strengthTag: 'considerate',
    },
    {
        negative: '新しいことが怖い',
        positive: '慎重にリスクを見極め、安全な判断ができる',
        strengthTag: 'careful',
    },
]

// ============================================================
// 7. トリセツ（取扱説明書）生成テンプレート
// ============================================================
// 蓄積タグから自動生成される「私のトリセツ」の各セクション。

export const TORISETSU_TEMPLATES = {

    // セクション1: 私の強み
    // 複合タグ版を優先し、単一タグ版はフォールバックとして残す
    strengths: {
        title: '私の強み',
        templates: [
            // --- 複合タグ版（優先度高） ---
            {
                matchTags: ['focus_power', 'solo_worker'],
                priority: 2,
                text: '一人で作業に没頭すると、周りが驚くほどの集中力を発揮します。この「静かな集中力」は、正確さが求められる仕事で特に大きな武器になります。',
            },
            {
                matchTags: ['empathetic', 'observant'],
                priority: 2,
                text: '周りの人の気持ちの変化に気づき、さりげなく寄り添える力があります。言葉にされなくても、相手が何を必要としているかを感じ取れる人です。',
            },
            {
                matchTags: ['endurance', 'routine_lover'],
                priority: 2,
                text: '決めたことをコツコツと、ブレずにやり続ける力があります。成果はすぐに見えなくても、時間をかけて着実に積み上げていくタイプです。',
            },
            {
                matchTags: ['careful', 'detail_oriented'],
                priority: 2,
                text: '「丁寧にやりたい」という気持ちが自然と行動に表れる人です。他の人が見落としがちな部分にも気づけるため、任された仕事の信頼性が高いです。',
            },
            {
                matchTags: ['empathetic', 'helper'],
                priority: 2,
                text: '人の役に立ちたいという気持ちと、相手の状況を察する力を両方持っています。押しつけない自然なサポートができるのは、大きな強みです。',
            },
            {
                matchTags: ['patient', 'endurance'],
                priority: 2,
                text: '焦らず、粘り強く取り組む力があります。周りが諦めそうな場面でも、静かに踏みとどまれる持久力は、長期的に成果を出すうえで欠かせない強みです。',
            },
            {
                matchTags: ['creative', 'action_first'],
                priority: 2,
                text: '「やってみよう」と思ったことを形にする力があります。アイデアを頭の中だけで終わらせず、実際に動ける行動力と組み合わさった、貴重なタイプです。',
            },
            {
                matchTags: ['introspective', 'careful'],
                priority: 2,
                text: '自分の状態を客観的に把握し、無理のない範囲で着実に進む力があります。自分を知っているからこそ、安定したパフォーマンスを出せます。',
            },
            // --- 単一タグ版（フォールバック） ---
            {
                matchTags: ['focus_power'],
                priority: 1,
                text: '一つのことに集中して取り組める力があります。',
            },
            {
                matchTags: ['endurance'],
                priority: 1,
                text: '決めたことを最後まで続けられる粘り強さがあります。',
            },
            {
                matchTags: ['empathetic'],
                priority: 1,
                text: '人の気持ちに寄り添い、チームの雰囲気を大切にできます。',
            },
            {
                matchTags: ['detail_oriented'],
                priority: 1,
                text: '細かい部分にも気を配り、正確な仕事ができます。',
            },
            {
                matchTags: ['observant'],
                priority: 1,
                text: '周りの変化に気づき、状況に合わせた行動ができます。',
            },
            {
                matchTags: ['creative'],
                priority: 1,
                text: '柔軟な発想で新しいアイデアを生み出す力があります。',
            },
            {
                matchTags: ['considerate'],
                priority: 1,
                text: '周りへの気配りが自然にでき、場の調和を保てます。',
            },
            {
                matchTags: ['helper'],
                priority: 1,
                text: '人の役に立ちたいという気持ちが行動に表れます。',
            },
            {
                matchTags: ['patient'],
                priority: 1,
                text: '辛抱強く、感情に左右されず冷静に対応できます。',
            },
            {
                matchTags: ['careful'],
                priority: 1,
                text: '慎重に進めることで、ミスを防ぎ信頼される仕事ができます。',
            },
        ],
    },

    // セクション2: 心地よい環境
    comfortZone: {
        title: '力を発揮しやすい環境',
        templates: [
            // --- 複合タグ版 ---
            {
                matchTags: ['quiet_preferred', 'solo_worker'],
                priority: 2,
                text: '静かで、自分のスペースが確保された環境が合っています。一人で没頭できる時間があると、最も力を発揮できます。',
            },
            {
                matchTags: ['routine_lover', 'careful'],
                priority: 2,
                text: '手順が明確で、「次にやること」がはっきりしている環境で安心して取り組めます。曖昧な指示より、具体的な段取りが示されると力が出ます。',
            },
            {
                matchTags: ['steady_pace', 'patient'],
                priority: 2,
                text: '自分のリズムで丁寧に進められる環境で本領を発揮します。時間に追われるより、じっくり取り組める余裕がある方が成果の質が上がります。',
            },
            {
                matchTags: ['helper', 'empathetic'],
                priority: 2,
                text: '仲間と協力しながら進められ、お互いに支え合える環境で力を発揮します。「ありがとう」の一言がエネルギーになります。',
            },
            // --- 単一タグ版 ---
            {
                matchTags: ['quiet_preferred'],
                priority: 1,
                text: '静かで落ち着いた環境が合っています。',
            },
            {
                matchTags: ['routine_lover'],
                priority: 1,
                text: '手順やルールが決まっている環境で安心して取り組めます。',
            },
            {
                matchTags: ['solo_worker'],
                priority: 1,
                text: '一人で集中できるスペースがあると力を発揮しやすいです。',
            },
            {
                matchTags: ['steady_pace'],
                priority: 1,
                text: '自分のペースで進められる環境が合っています。',
            },
            {
                matchTags: ['helper'],
                priority: 1,
                text: '人と協力しながら進められる環境で力を発揮します。',
            },
        ],
    },

    // セクション3: 苦手な場面と対処法
    challenges: {
        title: '苦手な場面と助かるサポート',
        templates: [
            // --- 複合タグ版 ---
            {
                matchTags: ['change_averse', 'routine_lover'],
                priority: 2,
                text: '急な予定変更や「やり方を変えて」と言われると戸惑いやすいです。→ 変更の際は理由と新しい手順をセットで伝えてもらえると、切り替えがスムーズになります。',
            },
            {
                matchTags: ['people_fatigue', 'env_sensitive'],
                priority: 2,
                text: '大勢の人がいる場面や刺激の多い環境で消耗しやすいです。→ こまめに休憩を取れる仕組みと、静かに過ごせる場所があると回復できます。',
            },
            {
                matchTags: ['anxious', 'perfectionist'],
                priority: 2,
                text: '「失敗したらどうしよう」という気持ちが強くなり、始める前から不安になることがあります。→ 「まずは7割でOK」「ここまでで合格」という具体的な基準を示してもらえると安心します。',
            },
            // --- 単一タグ版 ---
            {
                matchTags: ['change_averse'],
                priority: 1,
                text: '急な変更が苦手です。→ できるだけ事前に教えてもらえると助かります。',
            },
            {
                matchTags: ['people_fatigue'],
                priority: 1,
                text: '人が多い場面で疲れやすいです。→ 適度に一人になれる時間があると回復できます。',
            },
            {
                matchTags: ['anxious'],
                priority: 1,
                text: '先が見えない状況で不安になりやすいです。→ 見通しやゴールを示してもらえると安心します。',
            },
            {
                matchTags: ['env_sensitive'],
                priority: 1,
                text: '音や光などの刺激に敏感です。→ 可能であれば、刺激の少ない場所での作業が助かります。',
            },
            {
                matchTags: ['perfectionist'],
                priority: 1,
                text: '自分を追い込みがちです。→ 「ここまでで大丈夫」と声をかけてもらえると楽になります。',
            },
        ],
    },
}

// ============================================================
// 8. 支援員への代弁カードテンプレート
// ============================================================

export const ADVOCACY_TEMPLATES = [
    {
        matchTags: ['env_sensitive', 'quiet_preferred'],
        title: '環境への配慮',
        forStaff: '[userName]さんは、音や光などの刺激に敏感です。可能であれば、静かな場所での作業をご配慮ください。',
        suggestion: '「場所を変えてもいいですか」と自分から言えるように、声かけのきっかけを作ってあげてください。',
    },
    {
        matchTags: ['people_fatigue', 'empathetic'],
        title: 'コミュニケーションへの配慮',
        forStaff: '[userName]さんは、人の気持ちに敏感で共感力が高い一方、対人場面で疲れやすい傾向があります。',
        suggestion: '長時間のグループ作業の後に、一人の時間を設けると回復しやすいです。',
    },
    {
        matchTags: ['change_averse', 'routine_lover'],
        title: 'スケジュールの配慮',
        forStaff: '[userName]さんは、決まった流れの中で安定して力を発揮するタイプです。急な変更は負荷になりやすいです。',
        suggestion: '予定変更がある場合は、できるだけ早めに伝え、新しい流れを紙などで可視化すると安心されます。',
    },
    {
        matchTags: ['anxious', 'careful'],
        title: '先の見通しを伝える',
        forStaff: '[userName]さんは、先が見えない状況で不安を感じやすいです。ただし、それはリスクを事前に察知できる強みの裏返しです。',
        suggestion: '作業の全体像やゴールを最初に伝えると、安心して取り組めます。「ここまでで大丈夫」という声かけも効果的です。',
    },
    {
        matchTags: ['steady_pace', 'patient'],
        title: 'ペースへの配慮',
        forStaff: '[userName]さんは、じっくり取り組むことで質の高い成果を出すタイプです。急かすと逆効果になることがあります。',
        suggestion: '締め切りは余裕を持って伝え、「自分のペースでいいよ」と声をかけると力を発揮しやすいです。',
    },
    {
        matchTags: ['perfectionist', 'detail_oriented'],
        title: 'ゴールの伝え方',
        forStaff: '[userName]さんは、品質へのこだわりが強く、「まだ足りない」と自分を追い込みがちな面があります。',
        suggestion: '「ここまでで合格ライン」を具体的に伝えると、区切りをつけやすくなります。成果を具体的に褒めると自信につながります。',
    },
    {
        matchTags: ['solo_worker', 'focus_power'],
        title: '作業スタイルへの配慮',
        forStaff: '[userName]さんは、一人で集中する時間があると力を発揮しやすいタイプです。',
        suggestion: '可能であれば、個別の作業スペースや、集中タイムを設けると生産性が上がりやすいです。',
    },
    {
        matchTags: ['emotional', 'introspective'],
        title: '気持ちの波への理解',
        forStaff: '[userName]さんは、感受性が豊かで、気持ちの波が大きい日があるかもしれません。これは弱さではなく、物事を深く受け止める力の表れです。',
        suggestion: '調子が悪そうなときは、「大丈夫？」ではなく「何か手伝えることある？」と聞くと、受け入れやすいです。',
    },
]

// ============================================================
// 9. 深層分析パターン（複合タグ組み合わせによる洞察）
// ============================================================
// 単一タグのオウム返しではなく、複数タグの組み合わせから
// 表面には見えない深層的な傾向・価値観・強みを導き出す。

export const INSIGHT_PATTERNS = [
    {
        id: 'silent_professional',
        requiredTags: ['solo_worker', 'focus_power'],
        optionalTags: ['detail_oriented', 'careful'],
        title: '静かなプロフェッショナル',
        insight: '一人で黙々と取り組むことで、高い品質の成果を生み出すタイプです。目立つことはなくても、安定感と正確さで周りから信頼される存在です。',
        deeperMeaning: '「一人が好き」の裏にあるのは、「自分の手で責任を持って仕上げたい」という誠実さです。これは仕事の場面で、上司や同僚から「この人に任せれば大丈夫」と思われる力につながります。',
    },
    {
        id: 'empathic_antenna',
        requiredTags: ['empathetic', 'people_fatigue'],
        optionalTags: ['observant', 'considerate'],
        title: '繊細な共感アンテナ',
        insight: '人の気持ちを深く感じ取れる力があります。その分、自分も疲れやすい面がありますが、これは「人の心のクッション役」ができるという、チームに欠かせない力です。',
        deeperMeaning: '疲れやすさは弱さではなく、他の人が気づかない微妙な空気の変化まで感じ取れている証拠です。この力があるからこそ、誰かが困っているときにいち早く気づけるのです。',
    },
    {
        id: 'stability_anchor',
        requiredTags: ['routine_lover', 'careful'],
        optionalTags: ['change_averse', 'steady_pace'],
        title: '安定の要（かなめ）',
        insight: '決まった手順を守り、一定の品質でコツコツと成果を積み上げていく力があります。急な変化は苦手でも、安定した環境では誰よりも頼りになる存在です。',
        deeperMeaning: '「変化が苦手」と感じるのは、一つひとつの作業に真剣に向き合っているからこそです。「変わらない」ことの価値——継続・安定・信頼——を体現できる人は、実はとても貴重な存在です。',
    },
    {
        id: 'thoughtful_observer',
        requiredTags: ['introspective', 'observant'],
        optionalTags: ['careful', 'patient'],
        title: '思慮深い観察者',
        insight: '自分の内面をじっくり見つめる力と、周りの変化に気づく力を併せ持っています。すぐに行動に移さなくても、状況を正確に理解し、的確な判断ができるタイプです。',
        deeperMeaning: '「考えすぎ」と言われることがあるかもしれません。でも、あなたの「考える力」は問題を未然に防いだり、人の気持ちの機微を理解したりする土台になっています。これは「頭の良さ」とは違う、人としての深さです。',
    },
    {
        id: 'anxious_planner',
        requiredTags: ['anxious', 'careful'],
        optionalTags: ['perfectionist', 'detail_oriented'],
        title: '先を見通す力の持ち主',
        insight: '不安を感じやすいのは、先のことを考える力が人より強いからです。リスクを事前に察知して準備できるこの力は、計画や品質管理の場面で大きな武器になります。',
        deeperMeaning: '不安は「危険を知らせるセンサー」です。このセンサーが敏感であることは、慎重で信頼できる仕事につながります。大事なのは、不安に飲み込まれるのではなく、「準備のためのエネルギー」として使えるようになることです。',
    },
    {
        id: 'creative_feeler',
        requiredTags: ['emotional', 'creative'],
        optionalTags: ['introspective', 'optimistic'],
        title: '感性豊かな表現者',
        insight: '豊かな感情と創造力を持ち合わせています。感じたことを形にする力は、ものづくりや人に寄り添う仕事で大きな強みになります。',
        deeperMeaning: '感情の波があるのは、物事を表面的に流さず、一つひとつ深く受け止めているからです。この「深く味わう力」こそが、他の人には生み出せない豊かな発想の源になっています。',
    },
    {
        id: 'gentle_supporter',
        requiredTags: ['helper', 'empathetic'],
        optionalTags: ['considerate', 'patient'],
        title: '寄り添い型サポーター',
        insight: '人の役に立ちたいという気持ちと、相手の気持ちを理解する力を持っています。自然と周りの人を支える存在で、チームの中で欠かせない潤滑油のような役割を果たせます。',
        deeperMeaning: '「助けたい」という気持ちの根底には、「人とのつながりを大切にしたい」という深い価値観があります。ただし、自分を後回しにしすぎないことも大切です。あなた自身が満たされていることが、周りへの良いサポートの土台になります。',
    },
    {
        id: 'enduring_worker',
        requiredTags: ['endurance', 'patient'],
        optionalTags: ['steady_pace', 'routine_lover'],
        title: '静かな持久力の持ち主',
        insight: '派手さはなくても、粘り強くコツコツと取り組み続ける力があります。短期的な成果より、長期的に安定した成果を出せるタイプです。',
        deeperMeaning: '「辛抱強さ」の裏には、「最後までやり遂げたい」という強い意志があります。すぐに結果が出なくても諦めないこの姿勢は、長い目で見ると最も確実に成長できる力です。周りが焦っているときに冷静でいられるのも、大きな強みです。',
    },
    {
        id: 'precise_craftsperson',
        requiredTags: ['detail_oriented', 'perfectionist'],
        optionalTags: ['careful', 'focus_power'],
        title: '精密な職人気質',
        insight: '「ちゃんとやりたい」「正確でありたい」という気持ちが強く、妥協しない仕事ができます。品質にこだわるこの姿勢は、専門的な仕事で高く評価されます。',
        deeperMeaning: '完璧を求めるのは時につらいこともありますが、その根底にあるのは「良いものを作りたい」「相手に迷惑をかけたくない」という誠実さです。100点を目指せる人が、80点でもOKと自分に許可を出せるようになったとき、最も力を発揮できます。',
    },
    {
        id: 'action_pioneer',
        requiredTags: ['action_first', 'optimistic'],
        optionalTags: ['creative', 'helper'],
        title: '前に進む推進力',
        insight: 'まず動いてみる力と、前向きな気持ちを持っています。困難な場面でも「なんとかなる」と思える強さがあり、周りにもエネルギーを与えられる存在です。',
        deeperMeaning: '行動力の裏にあるのは、「現状を変えたい」「もっと良くしたい」という向上心です。この力は、周りの人が一歩踏み出せないときに背中を押せるリーダーシップにもなります。',
    },
    {
        id: 'sensitive_sensor',
        requiredTags: ['env_sensitive', 'observant'],
        optionalTags: ['quiet_preferred', 'introspective'],
        title: '高性能センサー',
        insight: '環境の微細な変化を感じ取る力があります。音・光・空気感の違いに気づけるこの力は、異変をいち早く察知したり、場の雰囲気を正確に読んだりする場面で活きます。',
        deeperMeaning: '「敏感すぎる」と思うかもしれませんが、この感度の高さは「世界を豊かに感じ取れる力」です。自分に合った環境を見つけることで、この力は大きな強みとして花開きます。',
    },
    {
        id: 'inner_compass',
        requiredTags: ['introspective', 'emotional'],
        optionalTags: ['empathetic', 'creative'],
        title: '内なるコンパス',
        insight: '自分の気持ちや価値観をしっかり持っていて、それを基準に物事を判断できます。外からの評価に流されにくく、自分なりの基準で行動を選べる人です。',
        deeperMeaning: '感情を深く感じ取り、自分の内面と向き合える力は、自分を見失わない「内なるコンパス」です。この力があるからこそ、本当に自分に合った場所や働き方を見つけることができます。',
    },
]

// ============================================================
// 10. ユーティリティ（ランダム抽出・テンプレート合成）
// ============================================================

/**
 * 指定ルート・フェーズから質問をランダムに1つ抽出する
 * @param {string} routeId - ルートID
 * @param {string} phaseId - フェーズID
 * @param {string[]} excludeIds - 除外する質問ID（既出のもの）
 * @returns {Object|null} 質問オブジェクト or null
 */
export function selectQuestion(routeId, phaseId, excludeIds = []) {
    const pool = QUESTION_POOLS[routeId]?.[phaseId]
    if (!pool || pool.length === 0) return null

    const candidates = pool.filter(q => !excludeIds.includes(q.id))
    if (candidates.length === 0) return pool[Math.floor(Math.random() * pool.length)]

    return candidates[Math.floor(Math.random() * candidates.length)]
}

/**
 * 蓄積タグに最もマッチするテンプレートブロックを取得する
 * @param {string} blockType - 'empathy' | 'challenge' | 'reframing'
 * @param {string[]} accumulatedTags - 蓄積されたタグIDの配列
 * @returns {Object} 最もマッチ度の高いテンプレートブロック
 */
export function findBestBlock(blockType, accumulatedTags) {
    const blocks = TEMPLATE_BLOCKS[blockType]
    if (!blocks || blocks.length === 0) return null

    let bestBlock = blocks[0] // matchTags: [] のフォールバック
    let bestScore = 0

    for (const block of blocks) {
        if (block.matchTags.length === 0) continue
        const score = block.matchTags.filter(t => accumulatedTags.includes(t)).length
        if (score > bestScore) {
            bestScore = score
            bestBlock = block
        }
    }

    return bestBlock
}

/**
 * テンプレート文中の変数を置換する
 * @param {string} template - テンプレート文
 * @param {Object} vars - 変数マップ { userName, keyword, userInput, strengthLabel, reframing }
 * @returns {string} 置換後の文
 */
export function fillTemplate(template, vars = {}) {
    let result = template
    if (vars.userName)      result = result.replace(/\[userName\]/g, vars.userName)
    if (vars.keyword)       result = result.replace(/\[keyword\]/g, vars.keyword)
    if (vars.userInput)     result = result.replace(/\[userInput\]/g, vars.userInput)
    if (vars.strengthLabel) result = result.replace(/\[strengthLabel\]/g, vars.strengthLabel)
    if (vars.reframing)     result = result.replace(/\[reframing\]/g, vars.reframing)
    return result
}

/**
 * 蓄積タグからトリセツの各セクションを生成する。
 * 複合タグテンプレート（priority:2）を優先し、
 * カバーされなかったタグのみ単一タグ版（priority:1）でフォールバックする。
 * これにより「オウム返し」ではなく、タグの組み合わせから
 * より深い洞察を含むトリセツを生成する。
 *
 * @param {string[]} accumulatedTags - 蓄積されたタグIDの配列
 * @param {Object} vars - テンプレート変数
 * @returns {Object} { strengths: {...}, comfortZone: {...}, challenges: {...} }
 */
export function generateTorisetsu(accumulatedTags, vars = {}) {
    const result = {}

    for (const [sectionKey, section] of Object.entries(TORISETSU_TEMPLATES)) {
        // マッチする全テンプレートを取得
        const allMatched = section.templates.filter(t =>
            t.matchTags.some(tag => accumulatedTags.includes(tag))
        )

        // 複合タグ版（priority >= 2）を優先的に選出
        const composite = allMatched
            .filter(t => (t.priority || 1) >= 2)
            .sort((a, b) => {
                // マッチしたタグ数が多いほど高スコア
                const scoreA = a.matchTags.filter(tag => accumulatedTags.includes(tag)).length
                const scoreB = b.matchTags.filter(tag => accumulatedTags.includes(tag)).length
                return scoreB - scoreA
            })

        // 複合タグ版でカバー済みのタグを記録
        const coveredTags = new Set()
        const selectedItems = []

        // 複合タグ版を最大3件まで採用
        for (const t of composite) {
            if (selectedItems.length >= 3) break
            // 既にカバー済みのタグと完全重複していなければ採用
            const newTags = t.matchTags.filter(tag => !coveredTags.has(tag))
            if (newTags.length > 0 || selectedItems.length === 0) {
                selectedItems.push(t)
                t.matchTags.forEach(tag => coveredTags.add(tag))
            }
        }

        // カバーされなかったタグを単一タグ版で補完（最大2件）
        const fallback = allMatched
            .filter(t => (t.priority || 1) === 1)
            .filter(t => !t.matchTags.some(tag => coveredTags.has(tag)))
        const fallbackCount = Math.min(fallback.length, Math.max(0, 3 - selectedItems.length))
        for (let i = 0; i < fallbackCount; i++) {
            selectedItems.push(fallback[i])
        }

        result[sectionKey] = {
            title: section.title,
            items: selectedItems.map(m => fillTemplate(m.text, vars)),
        }
    }

    return result
}

/**
 * 蓄積タグから支援員への代弁カードを生成する
 * @param {string[]} accumulatedTags - 蓄積されたタグIDの配列
 * @param {Object} vars - テンプレート変数
 * @returns {Array} マッチした代弁カードの配列
 */
export function generateAdvocacyCards(accumulatedTags, vars = {}) {
    return ADVOCACY_TEMPLATES
        .filter(card => card.matchTags.some(tag => accumulatedTags.includes(tag)))
        .map(card => ({
            title: card.title,
            forStaff: fillTemplate(card.forStaff, vars),
            suggestion: fillTemplate(card.suggestion, vars),
        }))
}

/**
 * 蓄積タグに最もマッチするリフレーミングを取得する
 * @param {string[]} accumulatedTags - 蓄積されたタグIDの配列
 * @returns {Array} マッチしたリフレーミングの配列（上位3件）
 */
export function findReframings(accumulatedTags) {
    return REFRAMING_DICT
        .filter(r => accumulatedTags.includes(r.strengthTag))
        .sort((a, b) => {
            const countA = accumulatedTags.filter(t => t === a.strengthTag).length
            const countB = accumulatedTags.filter(t => t === b.strengthTag).length
            return countB - countA
        })
        .slice(0, 3)
}

/**
 * 蓄積タグに基づいてリフレーミングテキストを1つ取得する
 * （対話中の [reframing] 変数用）
 */
export function getReframingText(accumulatedTags) {
    const matched = findReframings(accumulatedTags)
    if (matched.length === 0) return 'あなたらしい強み'
    return matched[0].positive
}

/**
 * 蓄積タグから「根底にある動機・価値観」を推定する。
 * 自己決定理論＋シュワルツの価値観理論に基づき、
 * タグの出現頻度から上位の動機を特定する。
 *
 * @param {string[]} accumulatedTags - 蓄積タグ
 * @returns {Array} マッチした価値観（上位2件、scoreつき）
 */
export function inferValues(accumulatedTags) {
    const tagCounts = {}
    accumulatedTags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1 })

    return VALUES_MAP.map(value => {
        const matchedTags = value.relatedTags.filter(t => accumulatedTags.includes(t))
        if (matchedTags.length === 0) return null
        // 出現頻度も加味したスコア
        const score = matchedTags.reduce((sum, t) => sum + (tagCounts[t] || 0), 0)
        return { ...value, score, matchedCount: matchedTags.length }
    })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
}

/**
 * 蓄積タグの中に存在する「内的葛藤」を検出する。
 * 矛盾するタグが同時に出現している場合、
 * それを「心理的な複雑さ・奥行き」として肯定的に分析する。
 *
 * @param {string[]} accumulatedTags - 蓄積タグ
 * @returns {Array} 検出された葛藤パターン（最大2件）
 */
export function detectTensions(accumulatedTags) {
    return TENSION_PAIRS
        .filter(pair => pair.tags.every(t => accumulatedTags.includes(t)))
        .slice(0, 2)
}

/**
 * 蓄積タグにマッチする対処法アドバイスを取得する。
 *
 * @param {string[]} accumulatedTags - 蓄積タグ
 * @returns {Array} マッチした対処法（最大3件）
 */
export function matchCopingStrategies(accumulatedTags) {
    return COPING_STRATEGIES
        .filter(s => s.targetTags.some(t => accumulatedTags.includes(t)))
        .slice(0, 3)
}

/**
 * タグの出現傾向から、統合的な「人物像のナラティブ」を生成する。
 * キーワードの羅列ではなく、対話全体を通して見えた
 * その人らしさを1つの文章で語る。
 *
 * @param {string[]} accumulatedTags - 蓄積されたタグIDの配列
 * @param {string[]} keywords - ユーザーのキーワード
 * @param {Object} vars - テンプレート変数
 * @returns {string} ナラティブ文章
 */
export function generateProfileNarrative(accumulatedTags, keywords = [], vars = {}) {
    const tagCounts = {}
    accumulatedTags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1 })

    // カテゴリ別の優勢タグを取得
    const categorized = {}
    for (const [tagId, count] of Object.entries(tagCounts)) {
        const tag = TAGS[tagId]
        if (!tag) continue
        if (!categorized[tag.category] || categorized[tag.category].count < count) {
            categorized[tag.category] = { tagId, label: tag.label, count }
        }
    }

    const dominant = Object.values(categorized).sort((a, b) => b.count - a.count)
    const userName = vars.userName || 'あなた'

    // 文の構成要素を動的に決定
    const coreTraitMap = {
        environment: {
            quiet_preferred: '静かな環境で自分のペースを大切にする',
            env_sensitive: '周りの空気を敏感に感じ取る',
            people_fatigue: '人の気持ちを深く受け止めすぎてしまう',
            change_averse: '安定した環境の中で力を発揮する',
            routine_lover: '決まった流れの中で着実に成果を出す',
            outdoors_ok: 'さまざまな環境に柔軟に対応できる',
        },
        action: {
            careful: '慎重に、一つひとつ確認しながら進む',
            steady_pace: '焦らず自分のリズムを守る',
            action_first: '考えるより先に動いてみる',
            detail_oriented: '細部にまでこだわりを持って取り組む',
            helper: '誰かの役に立つことに喜びを感じる',
            solo_worker: '一人の空間で集中力を最大限に発揮する',
        },
        feeling: {
            emotional: '物事を深く感じ取り、心で受け止める',
            introspective: '自分の内面としっかり向き合う',
            optimistic: '前を向いて、次の一歩を踏み出す',
            perfectionist: '「ちゃんとやりたい」という高い基準を持つ',
            anxious: '先のことを見通し、備えようとする',
            patient: '静かに、辛抱強く待つことができる',
        },
        strength: {
            considerate: '周りの人が心地よくいられるよう配慮する',
            focus_power: '一つのことに深く集中する',
            endurance: 'どんなときも粘り強く続ける',
            creative: '柔軟な発想で新しい視点を持つ',
            observant: '小さな変化にもいち早く気づく',
            empathetic: '人の気持ちに自然と寄り添う',
        },
    }

    // ナラティブ文を組み立てる
    const parts = []

    // コア特性（上位2つ）
    for (let i = 0; i < Math.min(2, dominant.length); i++) {
        const d = dominant[i]
        const traitText = coreTraitMap[d.tagId in TAGS ? TAGS[d.tagId].category : '']?.[d.tagId]
        if (traitText) parts.push(traitText)
    }

    if (parts.length === 0) {
        return `${userName}さんは、対話を通じて自分自身のことを丁寧に振り返ることができました。これは、自己理解を深めるうえでとても大切な一歩です。`
    }

    // 文章化
    let narrative = `${userName}さんは、「${parts[0]}」タイプです。`

    if (parts.length >= 2) {
        narrative += `それに加えて、「${parts[1]}」という面も持っています。`
    }

    // 価値観の推定結果を統合
    const values = inferValues(accumulatedTags)
    if (values.length > 0) {
        const primaryValue = values[0]
        narrative += `\n\n対話全体を通じて見えてきたのは、${userName}さんの根底にある「${primaryValue.name}」という動機です。`
        narrative += primaryValue.description
    }

    // 強みの統合メッセージ
    const strengthTag = dominant.find(d => TAGS[d.tagId]?.category === 'strength')
    if (strengthTag) {
        const strengthLabel = TAGS[strengthTag.tagId]?.label || ''
        narrative += `\n\nそして、その動機を支えているのが「${strengthLabel}」という力です。`
        narrative += `これは意識して身につけたものではなく、${userName}さんの自然な在り方そのものから生まれている強みです。`
    }

    // キーワードからの具体性追加
    const meaningfulKeywords = keywords.filter(kw =>
        kw.length > 4 && !['結果を見る', 'スキップ'].includes(kw)
    )
    if (meaningfulKeywords.length >= 2) {
        narrative += `\n\n今日の対話では「${meaningfulKeywords[0]}」「${meaningfulKeywords[1]}」といった言葉が印象的でした。こうした具体的な経験の中に、${userName}さんらしさが表れています。`
    }

    return narrative
}

/**
 * 蓄積タグの複合パターンから深層分析を生成する。
 * 単一タグのオウム返しではなく、タグの組み合わせが示す
 * 「表面には見えない傾向・価値観・深層的な強み」を言語化する。
 *
 * @param {string[]} accumulatedTags - 蓄積されたタグIDの配列
 * @param {string[]} keywords - ユーザーが選択/入力したキーワード
 * @param {Object} vars - テンプレート変数
 * @returns {Array} マッチした深層分析パターン（上位2件）
 */
export function generateDeepAnalysis(accumulatedTags, keywords = [], vars = {}) {
    const tagCounts = {}
    accumulatedTags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1 })

    const matches = INSIGHT_PATTERNS.map(pattern => {
        const requiredMatch = pattern.requiredTags.filter(t => accumulatedTags.includes(t)).length
        const requiredTotal = pattern.requiredTags.length

        // 全ての必須タグが揃っていなければスキップ
        if (requiredMatch < requiredTotal) return null

        const optionalMatch = (pattern.optionalTags || []).filter(t => accumulatedTags.includes(t)).length
        // 必須タグの出現頻度もスコアに加味（繰り返し出るタグほど確度が高い）
        const frequencyBonus = pattern.requiredTags.reduce((sum, t) => sum + (tagCounts[t] || 0), 0) / 10
        const score = requiredMatch * 2 + optionalMatch + frequencyBonus

        return { ...pattern, score }
    }).filter(Boolean).sort((a, b) => b.score - a.score)

    return matches.slice(0, 2).map(m => ({
        title: m.title,
        insight: fillTemplate(m.insight, vars),
        deeperMeaning: fillTemplate(m.deeperMeaning, vars),
    }))
}

/**
 * 現在のターン番号からフェーズIDを取得する
 * @param {number} turn - 現在のターン番号（1-10）
 * @returns {Object} フェーズオブジェクト
 */
export function getPhaseForTurn(turn) {
    return PHASES.find(p => p.turns.includes(turn)) || PHASES[0]
}

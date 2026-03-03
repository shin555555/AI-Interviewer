/**
 * 30問カモフラージュ・マトリックス質問データ
 * 
 * 属性カテゴリー:
 *   Work Style (P): 正確性, 持続力, 体力管理, IT道具, 報連相
 *   Mindset (I):    集中力, 感情制御, 規律性, 柔軟性, 自己発信
 * 
 * スコア: 各選択肢に 3(高) / 2(中) / 1(低) を割り当て。
 * ※ I4（柔軟性）は一部の質問でスコアが反転する（詳細は各質問のscoreを参照）。
 */

export const ATTRIBUTES = [
    { id: 'P1', name: '正確性', category: 'workStyle' },
    { id: 'P2', name: '持続力', category: 'workStyle' },
    { id: 'P3', name: '体力管理', category: 'workStyle' },
    { id: 'P4', name: 'IT道具', category: 'workStyle' },
    { id: 'P5', name: '報連相', category: 'workStyle' },
    { id: 'I1', name: '集中力', category: 'mindset' },
    { id: 'I2', name: '感情制御', category: 'mindset' },
    { id: 'I3', name: '規律性', category: 'mindset' },
    { id: 'I4', name: '柔軟性', category: 'mindset' },
    { id: 'I5', name: '自己発信', category: 'mindset' },
]

export const QUESTIONS = [
    // === P1: 正確性 ===
    {
        id: 'P1-1',
        attributeId: 'P1',
        text: 'スマホのアプリに赤い数字（通知）がたくさんついていると、どう感じますか？',
        choices: [
            { label: 'すぐ消したい', score: 3 },
            { label: 'たまに消す', score: 2 },
            { label: '気にならない', score: 1 },
        ],
    },
    {
        id: 'P1-2',
        attributeId: 'P1',
        text: '1000ピースのパズルで、最後の1枚が足りない時は？',
        choices: [
            { label: '絶対に見つける', score: 3 },
            { label: '少し探して諦める', score: 2 },
            { label: '気にしない', score: 1 },
        ],
    },
    {
        id: 'P1-3',
        attributeId: 'P1',
        text: '料理で「お塩を大さじ1杯」と書いてあったら？',
        choices: [
            { label: 'スプーンではかる', score: 3 },
            { label: 'だいたいで入れる', score: 2 },
            { label: '入れないこともある', score: 1 },
        ],
    },

    // === P2: 持続力 ===
    {
        id: 'P2-1',
        attributeId: 'P2',
        text: 'YouTubeなどの動画を見る時、早送りをよく使いますか？',
        choices: [
            { label: '全く使わない', score: 3 },
            { label: 'たまに使う', score: 2 },
            { label: 'よく使う', score: 1 },
        ],
    },
    {
        id: 'P2-2',
        attributeId: 'P2',
        text: '散歩に行くなら、どちらが自分らしいですか？',
        choices: [
            { label: '決めた道を最後まで歩く', score: 3 },
            { label: '適当に歩く', score: 2 },
            { label: '疲れたらすぐ帰る', score: 1 },
        ],
    },
    {
        id: 'P2-3',
        attributeId: 'P2',
        text: '漫画を読む時は、1巻から順番に読みますか？',
        choices: [
            { label: '必ず順番に', score: 3 },
            { label: '好きな巻から', score: 2 },
            { label: '最後の方を先に読む', score: 1 },
        ],
    },

    // === P3: 体力管理 ===
    {
        id: 'P3-1',
        attributeId: 'P3',
        text: '朝起きてから「今日着る服」を決めるまで、時間はかかりますか？',
        choices: [
            { label: 'いつも決まっている', score: 3 },
            { label: '少し迷う', score: 2 },
            { label: 'その時でバラバラ', score: 1 },
        ],
    },
    {
        id: 'P3-2',
        attributeId: 'P3',
        text: '季節が変わる時、自分の体調の変化にすぐ気づきますか？',
        choices: [
            { label: 'すぐ気づく', score: 3 },
            { label: '言われてみれば', score: 2 },
            { label: '倒れるまで気づかない', score: 1 },
        ],
    },
    {
        id: 'P3-3',
        attributeId: 'P3',
        text: '休みの日も、平日の仕事の日と同じ時間に起きますか？',
        choices: [
            { label: '同じ時間に起きる', score: 3 },
            { label: '少し遅く起きる', score: 2 },
            { label: '昼過ぎまで寝ている', score: 1 },
        ],
    },

    // === P4: IT道具 ===
    {
        id: 'P4-1',
        attributeId: 'P4',
        text: '新しい機械を買った時、説明書（せつめいしょ）を読みますか？',
        choices: [
            { label: '全部読む', score: 3 },
            { label: '困った時だけ見る', score: 2 },
            { label: '読まずに触ってみる', score: 1 },
        ],
    },
    {
        id: 'P4-2',
        attributeId: 'P4',
        text: 'リモコンに使ったことがないボタンがあったら？',
        choices: [
            { label: '押して試してみたい', score: 3 },
            { label: '気にならない', score: 2 },
            { label: '触るのが怖い', score: 1 },
        ],
    },
    {
        id: 'P4-3',
        attributeId: 'P4',
        text: 'メモを取るなら、どちらが楽ですか？',
        choices: [
            { label: 'スマホが楽', score: 3 },
            { label: 'どちらでもいい', score: 2 },
            { label: '紙とペンが楽', score: 1 },
        ],
    },

    // === P5: 報連相 ===
    {
        id: 'P5-1',
        attributeId: 'P5',
        text: '友達との待ち合わせに5分遅れそう。どうしますか？',
        choices: [
            { label: 'わかった時点で即連絡する', score: 3 },
            { label: '着いてから謝る', score: 2 },
            { label: '連絡しない', score: 1 },
        ],
    },
    {
        id: 'P5-2',
        attributeId: 'P5',
        text: '街の中で道に迷ってしまいました。どうしますか？',
        choices: [
            { label: 'すぐ誰かに聞く', score: 3 },
            { label: 'しばらく自分で探す', score: 2 },
            { label: '絶対に自力で探す', score: 1 },
        ],
    },
    {
        id: 'P5-3',
        attributeId: 'P5',
        text: '借りていた本を返す時、何か一言付け加えますか？',
        choices: [
            { label: '感想などを伝える', score: 3 },
            { label: '「ありがとう」だけ', score: 2 },
            { label: '黙って返す', score: 1 },
        ],
    },

    // === I1: 集中力 ===
    {
        id: 'I1-1',
        attributeId: 'I1',
        text: '周りで誰かがお喋りしていても、好きなことは続けられますか？',
        choices: [
            { label: '気にせず続けられる', score: 3 },
            { label: '少し気になる', score: 2 },
            { label: 'やめてしまう', score: 1 },
        ],
    },
    {
        id: 'I1-2',
        attributeId: 'I1',
        text: '夢中になって、気づいたら数時間経っていたことはありますか？',
        choices: [
            { label: 'よくある', score: 3 },
            { label: 'たまにある', score: 2 },
            { label: 'あまりない', score: 1 },
        ],
    },
    {
        id: 'I1-3',
        attributeId: 'I1',
        text: '一度に2つのことを頼まれたら、どう感じますか？',
        choices: [
            { label: '1つずつ片付けたい', score: 3 },
            { label: '交互に進められる', score: 2 },
            { label: 'パニックになる', score: 1 },
        ],
    },

    // === I2: 感情制御 ===
    {
        id: 'I2-1',
        attributeId: 'I2',
        text: '楽しみな予定が雨で中止。その後どうしますか？',
        choices: [
            { label: '家での楽しみに切り替える', score: 3 },
            { label: '残念だけどすぐ忘れる', score: 2 },
            { label: '一日中落ち込む', score: 1 },
        ],
    },
    {
        id: 'I2-2',
        attributeId: 'I2',
        text: 'ゲームで負けてしまった時、どう思いますか？',
        choices: [
            { label: '相手が強かったな', score: 3 },
            { label: '運が悪かったな', score: 2 },
            { label: '自分がダメだな', score: 1 },
        ],
    },
    {
        id: 'I2-3',
        attributeId: 'I2',
        text: 'レジで前の人がゆっくり動いていたら、どう思いますか？',
        choices: [
            { label: '気にせず待てる', score: 3 },
            { label: '少しイライラする', score: 2 },
            { label: '列を離れる', score: 1 },
        ],
    },

    // === I3: 規律性 ===
    {
        id: 'I3-1',
        attributeId: 'I3',
        text: '靴を脱いだとき、かかとを揃える癖がありますか？',
        choices: [
            { label: '自然に揃える', score: 3 },
            { label: '言われればやる', score: 2 },
            { label: '揃えない', score: 1 },
        ],
    },
    {
        id: 'I3-2',
        attributeId: 'I3',
        text: '車が全く来ない赤信号。あなたならどうしますか？',
        choices: [
            { label: '青になるまで待つ', score: 3 },
            { label: '誰か渡れば続く', score: 2 },
            { label: '渡る', score: 1 },
        ],
    },
    {
        id: 'I3-3',
        attributeId: 'I3',
        text: 'ズルをせずに、正しいルールで遊びたいですか？',
        choices: [
            { label: '正しいルールが好き', score: 3 },
            { label: '楽ならズルも使う', score: 2 },
            { label: 'ズルばかり使う', score: 1 },
        ],
    },

    // === I4: 柔軟性（スコア反転注意） ===
    {
        id: 'I4-1',
        attributeId: 'I4',
        text: '飲食店に行った時、いつも同じメニューを頼みますか？',
        choices: [
            { label: '絶対同じ', score: 1 },  // 低（変化を嫌う）
            { label: 'たまに変える', score: 2 },
            { label: '毎回違う', score: 3 },  // 高（変化を好む）
        ],
    },
    {
        id: 'I4-2',
        attributeId: 'I4',
        text: '机の物の位置を、勝手に変えられたらどう思いますか？',
        choices: [
            { label: 'とても嫌だ', score: 1 },  // 低
            { label: '少し落ち着かない', score: 2 },
            { label: '気にしない', score: 3 },  // 高
        ],
    },
    {
        id: 'I4-3',
        attributeId: 'I4',
        text: '「今日はカレー」の予定が急に「うどん」と言われたら？',
        choices: [
            { label: 'うどんでいい', score: 3 },  // 高
            { label: '少し迷う', score: 2 },
            { label: '絶対カレー', score: 1 },  // 低
        ],
    },

    // === I5: 自己発信 ===
    {
        id: 'I5-1',
        attributeId: 'I5',
        text: '髪を切る時、「もう少し短くして」と自分から言えますか？',
        choices: [
            { label: '言える', score: 3 },
            { label: '頑張れば言える', score: 2 },
            { label: '言えない', score: 1 },
        ],
    },
    {
        id: 'I5-2',
        attributeId: 'I5',
        text: 'プレゼントをもらった時、気持ちを言葉で伝えられますか？',
        choices: [
            { label: 'しっかり伝えられる', score: 3 },
            { label: '相手に合わせる', score: 2 },
            { label: '言葉が出ない', score: 1 },
        ],
    },
    {
        id: 'I5-3',
        attributeId: 'I5',
        text: '話し合いで「何かありますか？」と言われたら？',
        choices: [
            { label: '自分の意見を言う', score: 3 },
            { label: 'たまに言う', score: 2 },
            { label: '絶対に黙っている', score: 1 },
        ],
    },
]

/**
 * AIの相槌メッセージ（回答後にランダムで表示される受容的な応答）
 */
export const AI_RESPONSES = [
    '教えてくれてありがとうございます。',
    'なるほど、よくわかりました。',
    'そうなんですね。',
    'ありがとうございます。次の質問です。',
    'あなたのことが少しわかってきました。',
]

/**
 * 4桁の再開コードを生成する
 */
export function generateSessionCode() {
    return String(Math.floor(1000 + Math.random() * 9000))
}

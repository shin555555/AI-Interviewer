/**
 * 90問カモフラージュ・マトリックス質問プール（5択版）
 * 
 * 属性カテゴリー:
 *   Work Style (P): 正確性, 持続力, 体力管理, IT道具, 報連相
 *   Mindset (I):    集中力, 感情制御, 規律性, 柔軟性, 自己発信
 * 
 * スコア: 各選択肢に 5(とても高い) / 4(高い) / 3(中) / 2(低い) / 1(とても低い) を割り当て。
 * 毎回、各属性から3問ずつランダムに抽出し、計30問を出題する。
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

/**
 * 全90問の質問プール（各属性9問 × 10属性）
 */
export const QUESTION_POOL = [
    // ============================================================
    // P1: 正確性（9問）
    // ============================================================
    {
        id: 'P1-1', attributeId: 'P1',
        text: 'スマホのアプリに赤い数字（通知）がたくさんついていると、どう感じますか？',
        choices: [
            { label: '一つ残らず全部消す', score: 5 },
            { label: 'すぐ消したい', score: 4 },
            { label: 'たまに消す', score: 3 },
            { label: 'あまり気にしない', score: 2 },
            { label: '全く気にならない', score: 1 },
        ],
    },
    {
        id: 'P1-2', attributeId: 'P1',
        text: '1000ピースのパズルで、最後の1枚が足りない時は？',
        choices: [
            { label: '家中をひっくり返して探す', score: 5 },
            { label: '時間をかけて探す', score: 4 },
            { label: '少し探して様子を見る', score: 3 },
            { label: '少し残念だが諦める', score: 2 },
            { label: '全く気にしない', score: 1 },
        ],
    },
    {
        id: 'P1-3', attributeId: 'P1',
        text: '料理で「お塩を大さじ1杯」と書いてあったら？',
        choices: [
            { label: '計量スプーンで正確にはかる', score: 5 },
            { label: 'スプーンで大体はかる', score: 4 },
            { label: '手で適当に入れる', score: 3 },
            { label: '目分量で入れる', score: 2 },
            { label: '入れ忘れることもある', score: 1 },
        ],
    },
    {
        id: 'P1-4', attributeId: 'P1',
        text: 'メールやLINEを送る前に、文章を読み返しますか？',
        choices: [
            { label: '何度も読み返してから送る', score: 5 },
            { label: '一度読み返してから送る', score: 4 },
            { label: '気になる時だけ確認する', score: 3 },
            { label: 'あまり確認しない', score: 2 },
            { label: 'そのまますぐ送る', score: 1 },
        ],
    },
    {
        id: 'P1-5', attributeId: 'P1',
        text: '買い物リストを作った時、リストに書いていない物も買いますか？',
        choices: [
            { label: 'リスト通りにしか買わない', score: 5 },
            { label: 'ほぼリスト通りに買う', score: 4 },
            { label: 'たまに余計な物も買う', score: 3 },
            { label: 'リストは参考程度', score: 2 },
            { label: 'リストは見ない', score: 1 },
        ],
    },
    {
        id: 'P1-6', attributeId: 'P1',
        text: '写真を撮る時、何枚ぐらい撮りますか？',
        choices: [
            { label: '納得いくまで何十枚も撮る', score: 5 },
            { label: '数枚撮って良いのを選ぶ', score: 4 },
            { label: '2〜3枚撮る', score: 3 },
            { label: '1枚だけ撮る', score: 2 },
            { label: '撮らないことが多い', score: 1 },
        ],
    },
    {
        id: 'P1-7', attributeId: 'P1',
        text: '本棚の本がバラバラに並んでいたら気になりますか？',
        choices: [
            { label: 'すぐにきれいに並べ直す', score: 5 },
            { label: '時間がある時に直す', score: 4 },
            { label: '少し気になるが放置する', score: 3 },
            { label: 'あまり気にならない', score: 2 },
            { label: '全く気にならない', score: 1 },
        ],
    },
    {
        id: 'P1-8', attributeId: 'P1',
        text: 'お釣りが間違っていた（多くもらった）ことに気づいたら？',
        choices: [
            { label: 'すぐに店員さんに返す', score: 5 },
            { label: '次に来た時に伝える', score: 4 },
            { label: '迷うが返すと思う', score: 3 },
            { label: '少額なら気にしない', score: 2 },
            { label: 'ラッキーと思う', score: 1 },
        ],
    },
    {
        id: 'P1-9', attributeId: 'P1',
        text: 'テストや書類で名前を書く時、丁寧に書きますか？',
        choices: [
            { label: 'いつも一画ずつ丁寧に書く', score: 5 },
            { label: '丁寧に書くよう心がける', score: 4 },
            { label: '普通に書く', score: 3 },
            { label: '急いで書くことが多い', score: 2 },
            { label: '読めればいいと思う', score: 1 },
        ],
    },

    // ============================================================
    // P2: 持続力（9問）
    // ============================================================
    {
        id: 'P2-1', attributeId: 'P2',
        text: 'YouTubeなどの動画を見る時、早送りをよく使いますか？',
        choices: [
            { label: '最初から最後まで必ず全部見る', score: 5 },
            { label: 'ほとんど早送りしない', score: 4 },
            { label: 'たまに早送りする', score: 3 },
            { label: 'よく早送りする', score: 2 },
            { label: 'ほぼ早送りで見る', score: 1 },
        ],
    },
    {
        id: 'P2-2', attributeId: 'P2',
        text: '散歩に行くなら、どちらが自分らしいですか？',
        choices: [
            { label: '決めた道を最後まで必ず歩く', score: 5 },
            { label: '決めた道をだいたい歩く', score: 4 },
            { label: '気分で道を変えつつ歩く', score: 3 },
            { label: '疲れたら早めに帰る', score: 2 },
            { label: 'すぐ疲れて帰りたくなる', score: 1 },
        ],
    },
    {
        id: 'P2-3', attributeId: 'P2',
        text: '漫画を読む時は、1巻から順番に読みますか？',
        choices: [
            { label: '必ず1巻から順番に全巻読む', score: 5 },
            { label: 'だいたい順番に読む', score: 4 },
            { label: '好きな巻から読むこともある', score: 3 },
            { label: '面白そうな巻だけ読む', score: 2 },
            { label: '途中で飽きてやめることが多い', score: 1 },
        ],
    },
    {
        id: 'P2-4', attributeId: 'P2',
        text: '長い映画（3時間）を映画館で見る時、どう思いますか？',
        choices: [
            { label: '全く苦にならない', score: 5 },
            { label: '楽しければ大丈夫', score: 4 },
            { label: '少し長いと感じる', score: 3 },
            { label: '途中で休憩が欲しい', score: 2 },
            { label: '最後まで見られないかも', score: 1 },
        ],
    },
    {
        id: 'P2-5', attributeId: 'P2',
        text: '毎日の日記や記録をつけたことはありますか？',
        choices: [
            { label: '1年以上続けたことがある', score: 5 },
            { label: '数ヶ月続いたことがある', score: 4 },
            { label: '1ヶ月ぐらい続いた', score: 3 },
            { label: '数日で終わった', score: 2 },
            { label: 'やったことがない', score: 1 },
        ],
    },
    {
        id: 'P2-6', attributeId: 'P2',
        text: '筋トレやストレッチなど、毎日の運動を続けられますか？',
        choices: [
            { label: '毎日欠かさず続けられる', score: 5 },
            { label: 'ほぼ毎日できる', score: 4 },
            { label: '週に数回はできる', score: 3 },
            { label: '気が向いた時だけ', score: 2 },
            { label: '続けられない', score: 1 },
        ],
    },
    {
        id: 'P2-7', attributeId: 'P2',
        text: '読書で分厚い本を渡されたら、どう感じますか？',
        choices: [
            { label: 'ワクワクする', score: 5 },
            { label: '読んでみようと思う', score: 4 },
            { label: '少し構えるが読む', score: 3 },
            { label: '薄い本の方がいい', score: 2 },
            { label: '読む気がなくなる', score: 1 },
        ],
    },
    {
        id: 'P2-8', attributeId: 'P2',
        text: '同じ作業を2時間続けることはできますか？',
        choices: [
            { label: '集中して続けられる', score: 5 },
            { label: '休憩なしでもだいたい大丈夫', score: 4 },
            { label: '途中で少し休めばできる', score: 3 },
            { label: '1時間が限界', score: 2 },
            { label: '30分も難しい', score: 1 },
        ],
    },
    {
        id: 'P2-9', attributeId: 'P2',
        text: 'ゲームで難しいステージに何回も挑戦できますか？',
        choices: [
            { label: 'クリアするまで何十回でもやる', score: 5 },
            { label: '何回か挑戦する', score: 4 },
            { label: '数回やって考える', score: 3 },
            { label: '2〜3回で別のことをする', score: 2 },
            { label: 'すぐ諦める', score: 1 },
        ],
    },

    // ============================================================
    // P3: 体力管理（9問）
    // ============================================================
    {
        id: 'P3-1', attributeId: 'P3',
        text: '朝起きてから「今日着る服」を決めるまで、時間はかかりますか？',
        choices: [
            { label: '前日に準備してある', score: 5 },
            { label: 'いつも決まっている', score: 4 },
            { label: '少し迷うが決められる', score: 3 },
            { label: 'かなり迷う', score: 2 },
            { label: 'その時でバラバラ', score: 1 },
        ],
    },
    {
        id: 'P3-2', attributeId: 'P3',
        text: '季節が変わる時、自分の体調の変化にすぐ気づきますか？',
        choices: [
            { label: '事前に対策もしている', score: 5 },
            { label: 'すぐ気づく', score: 4 },
            { label: '言われてみれば気づく', score: 3 },
            { label: 'あまり気づかない', score: 2 },
            { label: '気づかない', score: 1 },
        ],
    },
    {
        id: 'P3-3', attributeId: 'P3',
        text: '休みの日も、平日の仕事の日と同じ時間に起きますか？',
        choices: [
            { label: '必ず同じ時間に起きる', score: 5 },
            { label: 'ほぼ同じ時間に起きる', score: 4 },
            { label: '少し遅く起きる', score: 3 },
            { label: 'かなり遅く起きる', score: 2 },
            { label: '昼過ぎまで寝ている', score: 1 },
        ],
    },
    {
        id: 'P3-4', attributeId: 'P3',
        text: '夜、決まった時間に寝る習慣はありますか？',
        choices: [
            { label: '毎日同じ時間に寝る', score: 5 },
            { label: 'だいたい同じ時間に寝る', score: 4 },
            { label: '平日は気をつけている', score: 3 },
            { label: '日によってバラバラ', score: 2 },
            { label: '全く決まっていない', score: 1 },
        ],
    },
    {
        id: 'P3-5', attributeId: 'P3',
        text: '自分が疲れている時、それを自覚できますか？',
        choices: [
            { label: '疲れる前に休むようにしている', score: 5 },
            { label: '疲れたらすぐ気づく', score: 4 },
            { label: '人に言われて気づくことがある', score: 3 },
            { label: '限界まで気づかないことがある', score: 2 },
            { label: '倒れるまで気づかない', score: 1 },
        ],
    },
    {
        id: 'P3-6', attributeId: 'P3',
        text: '毎日の食事は規則正しく食べていますか？',
        choices: [
            { label: '3食きちんと食べている', score: 5 },
            { label: 'ほぼ3食食べている', score: 4 },
            { label: '時々食事を抜くことがある', score: 3 },
            { label: '食事の時間はバラバラ', score: 2 },
            { label: '食べたり食べなかったり', score: 1 },
        ],
    },
    {
        id: 'P3-7', attributeId: 'P3',
        text: '天気予報を見て、服装や持ち物を変えますか？',
        choices: [
            { label: '毎日確認して準備する', score: 5 },
            { label: 'だいたい確認する', score: 4 },
            { label: '雨の日だけ確認する', score: 3 },
            { label: 'あまり見ない', score: 2 },
            { label: '全く見ない', score: 1 },
        ],
    },
    {
        id: 'P3-8', attributeId: 'P3',
        text: '体調が少し悪い時、仕事や学校を休む判断ができますか？',
        choices: [
            { label: '無理せず早めに休む', score: 5 },
            { label: '様子を見て判断する', score: 4 },
            { label: '迷いながら行くことが多い', score: 3 },
            { label: '我慢して行くことが多い', score: 2 },
            { label: '限界まで頑張ってしまう', score: 1 },
        ],
    },
    {
        id: 'P3-9', attributeId: 'P3',
        text: '週末に予定を入れすぎて疲れることはありますか？',
        choices: [
            { label: '休息の時間も計画に入れる', score: 5 },
            { label: '予定は無理のない範囲で入れる', score: 4 },
            { label: '少し詰め込みがち', score: 3 },
            { label: 'よく予定を入れすぎる', score: 2 },
            { label: 'いつも疲れ切っている', score: 1 },
        ],
    },

    // ============================================================
    // P4: IT道具（9問）
    // ============================================================
    {
        id: 'P4-1', attributeId: 'P4',
        text: '新しい機械を買った時、説明書を読みますか？',
        choices: [
            { label: '全部しっかり読む', score: 5 },
            { label: '大事な部分は読む', score: 4 },
            { label: '困った時だけ見る', score: 3 },
            { label: '読まずにまず触る', score: 2 },
            { label: '説明書は見ない', score: 1 },
        ],
    },
    {
        id: 'P4-2', attributeId: 'P4',
        text: 'リモコンに使ったことがないボタンがあったら？',
        choices: [
            { label: '全部の機能を試してみたい', score: 5 },
            { label: '気になるボタンは押してみる', score: 4 },
            { label: '特に気にならない', score: 3 },
            { label: 'よくわからないので触らない', score: 2 },
            { label: '触るのが怖い', score: 1 },
        ],
    },
    {
        id: 'P4-3', attributeId: 'P4',
        text: 'メモを取るなら、どの方法が楽ですか？',
        choices: [
            { label: 'スマホのアプリが一番楽', score: 5 },
            { label: 'スマホかPCが楽', score: 4 },
            { label: 'どちらでもいい', score: 3 },
            { label: '紙の方が楽', score: 2 },
            { label: '紙とペン以外は使いたくない', score: 1 },
        ],
    },
    {
        id: 'P4-4', attributeId: 'P4',
        text: 'スマホの新しいアプリを使い始める時、どう感じますか？',
        choices: [
            { label: 'ワクワクしてすぐ使いこなせる', score: 5 },
            { label: '楽しみながら覚える', score: 4 },
            { label: '必要なら使えるようになる', score: 3 },
            { label: '少し面倒に感じる', score: 2 },
            { label: 'できれば使いたくない', score: 1 },
        ],
    },
    {
        id: 'P4-5', attributeId: 'P4',
        text: 'パソコンでわからない操作があった時、どうしますか？',
        choices: [
            { label: '自分で検索して解決する', score: 5 },
            { label: 'いろいろ試してみる', score: 4 },
            { label: '詳しい人に聞く', score: 3 },
            { label: '誰かにやってもらう', score: 2 },
            { label: '諦める', score: 1 },
        ],
    },
    {
        id: 'P4-6', attributeId: 'P4',
        text: 'セルフレジ（無人レジ）を使うのは？',
        choices: [
            { label: 'むしろセルフレジが好き', score: 5 },
            { label: '普通に使える', score: 4 },
            { label: '使えるが少し緊張する', score: 3 },
            { label: 'できれば有人レジがいい', score: 2 },
            { label: '絶対に有人レジを選ぶ', score: 1 },
        ],
    },
    {
        id: 'P4-7', attributeId: 'P4',
        text: 'Wi-Fiがつながらない時、自分で直そうとしますか？',
        choices: [
            { label: '設定を確認して自分で直す', score: 5 },
            { label: 'ルーターの再起動ぐらいはする', score: 4 },
            { label: '少し試すが難しければ聞く', score: 3 },
            { label: 'すぐ誰かに頼む', score: 2 },
            { label: 'どうすればいいかわからない', score: 1 },
        ],
    },
    {
        id: 'P4-8', attributeId: 'P4',
        text: 'オンライン会議（ZoomやTeams）に参加する時、どう感じますか？',
        choices: [
            { label: '慣れていて問題ない', score: 5 },
            { label: '普通にできる', score: 4 },
            { label: '少し緊張するができる', score: 3 },
            { label: 'かなり苦手に感じる', score: 2 },
            { label: 'できれば避けたい', score: 1 },
        ],
    },
    {
        id: 'P4-9', attributeId: 'P4',
        text: 'キーボードで文字を打つのは得意ですか？',
        choices: [
            { label: '両手でスムーズに打てる', score: 5 },
            { label: 'そこそこ速く打てる', score: 4 },
            { label: 'ゆっくりなら打てる', score: 3 },
            { label: '一本指で打つ', score: 2 },
            { label: 'ほとんど打てない', score: 1 },
        ],
    },

    // ============================================================
    // P5: 報連相（9問）
    // ============================================================
    {
        id: 'P5-1', attributeId: 'P5',
        text: '友達との待ち合わせに5分遅れそう。どうしますか？',
        choices: [
            { label: 'わかった時点で即連絡し到着時刻も伝える', score: 5 },
            { label: 'すぐに遅れると連絡する', score: 4 },
            { label: '少し遅れるかもと伝える', score: 3 },
            { label: '着いてから謝る', score: 2 },
            { label: '特に連絡しない', score: 1 },
        ],
    },
    {
        id: 'P5-2', attributeId: 'P5',
        text: '街の中で道に迷ってしまいました。どうしますか？',
        choices: [
            { label: 'すぐ近くの人に聞く', score: 5 },
            { label: 'しばらく探してダメなら聞く', score: 4 },
            { label: 'スマホの地図で自力で探す', score: 3 },
            { label: 'とにかく自分で歩いて探す', score: 2 },
            { label: '聞くのが恥ずかしくて動けない', score: 1 },
        ],
    },
    {
        id: 'P5-3', attributeId: 'P5',
        text: '借りていた本を返す時、何か一言付け加えますか？',
        choices: [
            { label: '感想や気に入った部分を詳しく伝える', score: 5 },
            { label: '簡単な感想を伝える', score: 4 },
            { label: '「ありがとう」と言う', score: 3 },
            { label: '短く返すだけ', score: 2 },
            { label: '黙って返す', score: 1 },
        ],
    },
    {
        id: 'P5-4', attributeId: 'P5',
        text: '仕事や作業で困った時、すぐに相談できますか？',
        choices: [
            { label: '困る前に早めに相談する', score: 5 },
            { label: '困ったらすぐ相談する', score: 4 },
            { label: '少し自分で考えてから相談する', score: 3 },
            { label: 'なかなか相談できない', score: 2 },
            { label: '一人で抱え込んでしまう', score: 1 },
        ],
    },
    {
        id: 'P5-5', attributeId: 'P5',
        text: '作業の進み具合を、頼まれた人に自分から報告しますか？',
        choices: [
            { label: 'こまめに自分から報告する', score: 5 },
            { label: '区切りの良い所で報告する', score: 4 },
            { label: '聞かれたら答える', score: 3 },
            { label: '報告するのを忘れがち', score: 2 },
            { label: '完了するまで何も言わない', score: 1 },
        ],
    },
    {
        id: 'P5-6', attributeId: 'P5',
        text: '予定が変わった時、関係する人にすぐ伝えますか？',
        choices: [
            { label: '変わった瞬間に全員に伝える', score: 5 },
            { label: 'すぐに伝えるようにする', score: 4 },
            { label: '会った時に伝える', score: 3 },
            { label: '伝え忘れることがある', score: 2 },
            { label: '伝えないことが多い', score: 1 },
        ],
    },
    {
        id: 'P5-7', attributeId: 'P5',
        text: 'グループでの作業中、自分の意見を言えますか？',
        choices: [
            { label: '積極的に発言する', score: 5 },
            { label: '求められれば話す', score: 4 },
            { label: '場の雰囲気次第', score: 3 },
            { label: '言うのが苦手', score: 2 },
            { label: '全く言えない', score: 1 },
        ],
    },
    {
        id: 'P5-8', attributeId: 'P5',
        text: 'わからない言葉が出てきた時、質問できますか？',
        choices: [
            { label: 'その場ですぐ聞ける', score: 5 },
            { label: '後で確認する', score: 4 },
            { label: '自分で調べる', score: 3 },
            { label: '聞きたいが聞けない', score: 2 },
            { label: 'わからないまま放置する', score: 1 },
        ],
    },
    {
        id: 'P5-9', attributeId: 'P5',
        text: '体調が悪い時、上司や先生に伝えられますか？',
        choices: [
            { label: 'すぐに自分から伝える', score: 5 },
            { label: 'なるべく早く伝える', score: 4 },
            { label: '聞かれたら答える', score: 3 },
            { label: '伝えにくいと感じる', score: 2 },
            { label: '我慢してしまう', score: 1 },
        ],
    },

    // ============================================================
    // I1: 集中力（9問）
    // ============================================================
    {
        id: 'I1-1', attributeId: 'I1',
        text: '周りで誰かがお喋りしていても、好きなことは続けられますか？',
        choices: [
            { label: '全く気にならず没頭できる', score: 5 },
            { label: 'ほぼ気にせず続けられる', score: 4 },
            { label: '少し気になるが続けられる', score: 3 },
            { label: 'かなり気になる', score: 2 },
            { label: 'やめてしまう', score: 1 },
        ],
    },
    {
        id: 'I1-2', attributeId: 'I1',
        text: '夢中になって、気づいたら数時間経っていたことはありますか？',
        choices: [
            { label: 'しょっちゅうある', score: 5 },
            { label: '結構ある', score: 4 },
            { label: 'たまにある', score: 3 },
            { label: 'ほとんどない', score: 2 },
            { label: '全くない', score: 1 },
        ],
    },
    {
        id: 'I1-3', attributeId: 'I1',
        text: '一度に2つのことを頼まれたら、どう感じますか？',
        choices: [
            { label: '順番を決めて落ち着いて取り組む', score: 5 },
            { label: '1つずつ片付けたい', score: 4 },
            { label: '交互に進められる', score: 3 },
            { label: '少し混乱する', score: 2 },
            { label: 'パニックになる', score: 1 },
        ],
    },
    {
        id: 'I1-4', attributeId: 'I1',
        text: '作業中にスマホの通知が来たら、どうしますか？',
        choices: [
            { label: '作業が終わるまで見ない', score: 5 },
            { label: '区切りが良い所で確認する', score: 4 },
            { label: 'チラッと確認して戻る', score: 3 },
            { label: 'つい見てしまう', score: 2 },
            { label: 'すぐ見て返信してしまう', score: 1 },
        ],
    },
    {
        id: 'I1-5', attributeId: 'I1',
        text: '騒がしいカフェでも勉強や読書ができますか？',
        choices: [
            { label: 'むしろ集中できる', score: 5 },
            { label: '問題なくできる', score: 4 },
            { label: 'イヤホンがあればできる', score: 3 },
            { label: '静かな場所でないと難しい', score: 2 },
            { label: '全くできない', score: 1 },
        ],
    },
    {
        id: 'I1-6', attributeId: 'I1',
        text: '細かい間違い探し（絵の違いを見つける）は得意ですか？',
        choices: [
            { label: 'すぐに全部見つけられる', score: 5 },
            { label: 'だいたい見つけられる', score: 4 },
            { label: '時間をかければ見つかる', score: 3 },
            { label: 'あまり得意ではない', score: 2 },
            { label: '苦手', score: 1 },
        ],
    },
    {
        id: 'I1-7', attributeId: 'I1',
        text: '長い話を最後まで集中して聞けますか？',
        choices: [
            { label: '最後まで集中して聞ける', score: 5 },
            { label: 'だいたい集中できる', score: 4 },
            { label: '途中で少しぼんやりする', score: 3 },
            { label: '途中から聞いていない', score: 2 },
            { label: 'すぐに別のことを考える', score: 1 },
        ],
    },
    {
        id: 'I1-8', attributeId: 'I1',
        text: '1つの作業を始めたら、完了するまで他に手をつけずにいられますか？',
        choices: [
            { label: '必ず完了してから次へ行く', score: 5 },
            { label: 'ほぼ最後までやり切る', score: 4 },
            { label: '途中で寄り道することもある', score: 3 },
            { label: 'よく他のことに手を出す', score: 2 },
            { label: '色々手をつけて全部中途半端', score: 1 },
        ],
    },
    {
        id: 'I1-9', attributeId: 'I1',
        text: 'テレビを見ながら別のことをする（ながら作業）ことは多いですか？',
        choices: [
            { label: '一つのことに集中するタイプ', score: 5 },
            { label: 'あまりながら作業はしない', score: 4 },
            { label: 'たまにする', score: 3 },
            { label: 'よくする', score: 2 },
            { label: 'いつもながら作業', score: 1 },
        ],
    },

    // ============================================================
    // I2: 感情制御（9問）
    // ============================================================
    {
        id: 'I2-1', attributeId: 'I2',
        text: '楽しみな予定が雨で中止。その後どうしますか？',
        choices: [
            { label: 'すぐ代わりの楽しみを見つける', score: 5 },
            { label: '家での楽しみに切り替える', score: 4 },
            { label: '残念だけどすぐ忘れる', score: 3 },
            { label: 'しばらく落ち込む', score: 2 },
            { label: '一日中落ち込む', score: 1 },
        ],
    },
    {
        id: 'I2-2', attributeId: 'I2',
        text: 'ゲームで負けてしまった時、どう思いますか？',
        choices: [
            { label: '次の作戦を考える', score: 5 },
            { label: '相手が強かったなと思う', score: 4 },
            { label: '運が悪かったなと思う', score: 3 },
            { label: '少しイライラする', score: 2 },
            { label: '自分がダメだと落ち込む', score: 1 },
        ],
    },
    {
        id: 'I2-3', attributeId: 'I2',
        text: 'レジで前の人がゆっくり動いていたら、どう思いますか？',
        choices: [
            { label: 'スマホを見て気楽に待つ', score: 5 },
            { label: '気にせず待てる', score: 4 },
            { label: '少し気になるが我慢する', score: 3 },
            { label: 'イライラする', score: 2 },
            { label: '列を離れるか態度に出る', score: 1 },
        ],
    },
    {
        id: 'I2-4', attributeId: 'I2',
        text: '失敗した時、気持ちの切り替えはどのくらいでできますか？',
        choices: [
            { label: 'すぐに次のことに集中できる', score: 5 },
            { label: '数分で切り替えられる', score: 4 },
            { label: '数時間かかる', score: 3 },
            { label: '翌日まで引きずる', score: 2 },
            { label: '何日も引きずる', score: 1 },
        ],
    },
    {
        id: 'I2-5', attributeId: 'I2',
        text: '注意された時、どう受け止めますか？',
        choices: [
            { label: '素直に受け止めて改善する', score: 5 },
            { label: '一度考えてから受け入れる', score: 4 },
            { label: '少し落ち込むが立ち直れる', score: 3 },
            { label: 'かなり落ち込む', score: 2 },
            { label: '怒りや悲しみが止まらない', score: 1 },
        ],
    },
    {
        id: 'I2-6', attributeId: 'I2',
        text: '思い通りにいかない日が続いた時、どうしますか？',
        choices: [
            { label: 'やり方を変えて工夫する', score: 5 },
            { label: '誰かに相談する', score: 4 },
            { label: 'とりあえず続けてみる', score: 3 },
            { label: 'やる気がなくなる', score: 2 },
            { label: '何もしたくなくなる', score: 1 },
        ],
    },
    {
        id: 'I2-7', attributeId: 'I2',
        text: '急に予定が変わった時、気持ちはどうなりますか？',
        choices: [
            { label: '特に動じない', score: 5 },
            { label: '少し驚くがすぐ順応する', score: 4 },
            { label: 'モヤモヤするが対応できる', score: 3 },
            { label: 'かなり動揺する', score: 2 },
            { label: 'パニックになる', score: 1 },
        ],
    },
    {
        id: 'I2-8', attributeId: 'I2',
        text: '嫌なことがあった日の夜、眠れますか？',
        choices: [
            { label: 'いつも通り眠れる', score: 5 },
            { label: '少し考えるが眠れる', score: 4 },
            { label: '寝つきが悪くなる', score: 3 },
            { label: 'なかなか眠れない', score: 2 },
            { label: '全く眠れない', score: 1 },
        ],
    },
    {
        id: 'I2-9', attributeId: 'I2',
        text: '人と意見が違った時、冷静でいられますか？',
        choices: [
            { label: '相手の意見を興味深く聞ける', score: 5 },
            { label: '冷静に話し合える', score: 4 },
            { label: '少し感情的になるが抑えられる', score: 3 },
            { label: 'つい感情的になる', score: 2 },
            { label: '怒りが抑えられない', score: 1 },
        ],
    },

    // ============================================================
    // I3: 規律性（9問）
    // ============================================================
    {
        id: 'I3-1', attributeId: 'I3',
        text: '靴を脱いだとき、かかとを揃える癖がありますか？',
        choices: [
            { label: '毎回自然に揃える', score: 5 },
            { label: 'だいたい揃える', score: 4 },
            { label: '気づいた時だけ揃える', score: 3 },
            { label: 'あまり揃えない', score: 2 },
            { label: '揃えない', score: 1 },
        ],
    },
    {
        id: 'I3-2', attributeId: 'I3',
        text: '車が全く来ない赤信号。あなたならどうしますか？',
        choices: [
            { label: 'どんな時も青になるまで待つ', score: 5 },
            { label: '基本的に待つ', score: 4 },
            { label: '周りの様子を見て判断する', score: 3 },
            { label: '誰かが渡れば続く', score: 2 },
            { label: '確認して渡る', score: 1 },
        ],
    },
    {
        id: 'I3-3', attributeId: 'I3',
        text: 'ゲームやスポーツで、ルールを守って遊びたいですか？',
        choices: [
            { label: 'ルールは絶対に守る', score: 5 },
            { label: '基本的にルールを守る', score: 4 },
            { label: '楽しければ多少はOK', score: 3 },
            { label: '面倒なルールは無視する', score: 2 },
            { label: '自分ルールで遊ぶ', score: 1 },
        ],
    },
    {
        id: 'I3-4', attributeId: 'I3',
        text: '約束の時間に遅れないように行動できますか？',
        choices: [
            { label: 'いつも余裕を持って早く着く', score: 5 },
            { label: 'ほぼ時間通りに着く', score: 4 },
            { label: 'ギリギリになることがある', score: 3 },
            { label: '遅刻することがよくある', score: 2 },
            { label: 'いつも遅れる', score: 1 },
        ],
    },
    {
        id: 'I3-5', attributeId: 'I3',
        text: 'ゴミの分別（燃えるゴミ、プラ等）をきちんとしていますか？',
        choices: [
            { label: '細かく完璧に分別する', score: 5 },
            { label: 'だいたい分別する', score: 4 },
            { label: '主要なものは分ける', score: 3 },
            { label: 'あまり気にしない', score: 2 },
            { label: '分別しない', score: 1 },
        ],
    },
    {
        id: 'I3-6', attributeId: 'I3',
        text: '使った物を元の場所に戻す習慣はありますか？',
        choices: [
            { label: '使ったらすぐに必ず戻す', score: 5 },
            { label: 'だいたい戻す', score: 4 },
            { label: '時々忘れる', score: 3 },
            { label: '出しっぱなしが多い', score: 2 },
            { label: '全く戻さない', score: 1 },
        ],
    },
    {
        id: 'I3-7', attributeId: 'I3',
        text: '提出物の期限を守れますか？',
        choices: [
            { label: '期限より早く提出する', score: 5 },
            { label: '期限通りに出す', score: 4 },
            { label: 'ギリギリになることがある', score: 3 },
            { label: '遅れることがよくある', score: 2 },
            { label: 'いつも遅れる', score: 1 },
        ],
    },
    {
        id: 'I3-8', attributeId: 'I3',
        text: '毎朝の支度（準備）は決まった手順でしますか？',
        choices: [
            { label: 'いつも同じ手順で効率良くする', score: 5 },
            { label: 'だいたい決まっている', score: 4 },
            { label: '日によって少し違う', score: 3 },
            { label: 'バラバラ', score: 2 },
            { label: '毎朝バタバタしている', score: 1 },
        ],
    },
    {
        id: 'I3-9', attributeId: 'I3',
        text: '「ここは走らないでください」と書いてある場所で、急いでいたらどうしますか？',
        choices: [
            { label: '絶対に走らない', score: 5 },
            { label: '早歩きにする', score: 4 },
            { label: '周りに人がいなければ走るかも', score: 3 },
            { label: '急いでいたら走る', score: 2 },
            { label: '気にせず走る', score: 1 },
        ],
    },

    // ============================================================
    // I4: 柔軟性（9問）※スコア反転注意
    // ============================================================
    {
        id: 'I4-1', attributeId: 'I4',
        text: '飲食店に行った時、いつも同じメニューを頼みますか？',
        choices: [
            { label: '絶対に同じものしか頼まない', score: 1 },
            { label: 'ほぼ同じものを頼む', score: 2 },
            { label: 'たまに違うものも試す', score: 3 },
            { label: 'いろいろ試すのが好き', score: 4 },
            { label: '毎回違うものを頼む', score: 5 },
        ],
    },
    {
        id: 'I4-2', attributeId: 'I4',
        text: '机の物の位置を、勝手に変えられたらどう思いますか？',
        choices: [
            { label: 'とても嫌で元に戻す', score: 1 },
            { label: '嫌だがなんとか我慢', score: 2 },
            { label: '少し落ち着かない', score: 3 },
            { label: 'あまり気にならない', score: 4 },
            { label: '全く気にしない', score: 5 },
        ],
    },
    {
        id: 'I4-3', attributeId: 'I4',
        text: '「今日はカレー」の予定が急に「うどん」と言われたら？',
        choices: [
            { label: '絶対カレーがいい', score: 1 },
            { label: 'できればカレーがよかった', score: 2 },
            { label: '少し迷うがうどんでもいい', score: 3 },
            { label: 'うどんでいいよ', score: 4 },
            { label: 'どちらでも全然OK', score: 5 },
        ],
    },
    {
        id: 'I4-4', attributeId: 'I4',
        text: '通勤・通学の道がいつもと違うルートになったら？',
        choices: [
            { label: '強いストレスを感じる', score: 1 },
            { label: '落ち着かない', score: 2 },
            { label: '少し不安だが対応できる', score: 3 },
            { label: '特に気にならない', score: 4 },
            { label: '新しいルートを楽しめる', score: 5 },
        ],
    },
    {
        id: 'I4-5', attributeId: 'I4',
        text: '急に「今日は○○をやってほしい」と頼まれたら？',
        choices: [
            { label: '予定通りにしたい', score: 1 },
            { label: 'できれば前もって言ってほしい', score: 2 },
            { label: '少し戸惑うができる', score: 3 },
            { label: '特に問題ない', score: 4 },
            { label: '柔軟に対応できる', score: 5 },
        ],
    },
    {
        id: 'I4-6', attributeId: 'I4',
        text: '旅行の計画は細かく立てますか？',
        choices: [
            { label: '分刻みで完璧に計画する', score: 1 },
            { label: 'かなり詳しく計画する', score: 2 },
            { label: 'ざっくり計画する', score: 3 },
            { label: 'ほぼノープラン', score: 4 },
            { label: '行き当たりばったりが好き', score: 5 },
        ],
    },
    {
        id: 'I4-7', attributeId: 'I4',
        text: '座席が自由席の時、いつも同じ席に座りますか？',
        choices: [
            { label: '必ず決まった席に座る', score: 1 },
            { label: 'できれば同じ席がいい', score: 2 },
            { label: '空いていれば座る', score: 3 },
            { label: '特にこだわらない', score: 4 },
            { label: '毎回違う席を楽しむ', score: 5 },
        ],
    },
    {
        id: 'I4-8', attributeId: 'I4',
        text: '仕事や作業のやり方が急に変わったら？',
        choices: [
            { label: '非常に困る', score: 1 },
            { label: '戸惑いが大きい', score: 2 },
            { label: '少し時間が必要だが慣れる', score: 3 },
            { label: '割とすぐ対応できる', score: 4 },
            { label: '新しいやり方を歓迎する', score: 5 },
        ],
    },
    {
        id: 'I4-9', attributeId: 'I4',
        text: '毎日のルーティン（習慣）が崩れた時、どう感じますか？',
        choices: [
            { label: '非常に不安になる', score: 1 },
            { label: 'かなり気になる', score: 2 },
            { label: '少し落ち着かないが大丈夫', score: 3 },
            { label: 'あまり気にならない', score: 4 },
            { label: '全く気にならない', score: 5 },
        ],
    },

    // ============================================================
    // I5: 自己発信（9問）
    // ============================================================
    {
        id: 'I5-1', attributeId: 'I5',
        text: '髪を切る時、「もう少し短くして」と自分から言えますか？',
        choices: [
            { label: '具体的にリクエストできる', score: 5 },
            { label: '一言ぐらいは言える', score: 4 },
            { label: '頑張れば言える', score: 3 },
            { label: '言いにくい', score: 2 },
            { label: '全く言えない', score: 1 },
        ],
    },
    {
        id: 'I5-2', attributeId: 'I5',
        text: 'プレゼントをもらった時、気持ちを言葉で伝えられますか？',
        choices: [
            { label: '嬉しさを詳しく伝えられる', score: 5 },
            { label: 'しっかり感謝を伝えられる', score: 4 },
            { label: '「ありがとう」は言える', score: 3 },
            { label: '恥ずかしくて短くなる', score: 2 },
            { label: '言葉が出てこない', score: 1 },
        ],
    },
    {
        id: 'I5-3', attributeId: 'I5',
        text: '話し合いで「何かありますか？」と言われたら？',
        choices: [
            { label: '積極的に自分の意見を述べる', score: 5 },
            { label: '考えがあれば発言する', score: 4 },
            { label: 'たまに発言する', score: 3 },
            { label: '聞かれても言いにくい', score: 2 },
            { label: '絶対に黙っている', score: 1 },
        ],
    },
    {
        id: 'I5-4', attributeId: 'I5',
        text: '自分の得意なことや好きなことを人に説明できますか？',
        choices: [
            { label: '具体的にわかりやすく話せる', score: 5 },
            { label: 'ある程度説明できる', score: 4 },
            { label: '聞かれれば答えられる', score: 3 },
            { label: 'うまく説明できない', score: 2 },
            { label: '何が得意かわからない', score: 1 },
        ],
    },
    {
        id: 'I5-5', attributeId: 'I5',
        text: '自己紹介をする時、どう感じますか？',
        choices: [
            { label: '楽しんで話せる', score: 5 },
            { label: '普通にできる', score: 4 },
            { label: '少し緊張するがなんとかできる', score: 3 },
            { label: 'かなり緊張する', score: 2 },
            { label: 'できれば避けたい', score: 1 },
        ],
    },
    {
        id: 'I5-6', attributeId: 'I5',
        text: '嫌なことを頼まれた時、「嫌です」と断れますか？',
        choices: [
            { label: '理由をつけてはっきり断れる', score: 5 },
            { label: 'やんわりと断れる', score: 4 },
            { label: '迷うが断ることもある', score: 3 },
            { label: '断りにくくて引き受ける', score: 2 },
            { label: '絶対に断れない', score: 1 },
        ],
    },
    {
        id: 'I5-7', attributeId: 'I5',
        text: '自分の体調や気分を言葉にして人に伝えられますか？',
        choices: [
            { label: '具体的に説明できる', score: 5 },
            { label: 'だいたい伝えられる', score: 4 },
            { label: '聞かれれば答えられる', score: 3 },
            { label: 'うまく言葉にできない', score: 2 },
            { label: '全く伝えられない', score: 1 },
        ],
    },
    {
        id: 'I5-8', attributeId: 'I5',
        text: '初対面の人と会話を続けられますか？',
        choices: [
            { label: '自分から話題を振って楽しめる', score: 5 },
            { label: '普通に会話できる', score: 4 },
            { label: '相手が話してくれれば大丈夫', score: 3 },
            { label: '会話が続かないことが多い', score: 2 },
            { label: 'とても苦手', score: 1 },
        ],
    },
    {
        id: 'I5-9', attributeId: 'I5',
        text: '自分が間違った時、「ごめんなさい」とすぐ言えますか？',
        choices: [
            { label: 'すぐに素直に謝れる', score: 5 },
            { label: '少し間を置いて謝れる', score: 4 },
            { label: '場合による', score: 3 },
            { label: '謝るのが苦手', score: 2 },
            { label: 'なかなか謝れない', score: 1 },
        ],
    },
]

/**
 * AIの相槌メッセージ
 */
export const AI_RESPONSES = [
    '教えてくれてありがとうございます。',
    'なるほど、よくわかりました。',
    'そうなんですね。',
    'ありがとうございます。次の質問です。',
    'あなたのことが少しわかってきました。',
    'いい答えですね。続けていきましょう。',
    '正直に答えてくれて嬉しいです。',
]

/**
 * 4桁の再開コードを生成する
 */
export function generateSessionCode() {
    return String(Math.floor(1000 + Math.random() * 9000))
}

/**
 * 質問プールから各属性ごとにN問ずつランダムに抽出して出題セットを作成する
 * @param {number} questionsPerAttr - 各属性から何問抽出するか（デフォルト3）
 * @returns {Array} シャッフルされた出題用質問配列
 */
export function selectRandomQuestions(questionsPerAttr = 3) {
    const selected = []

    ATTRIBUTES.forEach(attr => {
        const pool = QUESTION_POOL.filter(q => q.attributeId === attr.id)
        const shuffled = [...pool].sort(() => Math.random() - 0.5)
        selected.push(...shuffled.slice(0, questionsPerAttr))
    })

    // 属性順を維持（P1の3問→P2の3問→…の順）
    return selected
}

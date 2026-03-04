/**
 * strengthDescriptions.js
 * 
 * 各属性スコアに基づいた「やさしい日本語」による強みの言語化。
 * ネガティブな表現を避け、具体的な「できること」に変換する。
 * 
 * 例: 
 *   「柔軟性が低い」→「決まった手順を正しく繰り返す力があります」
 *   「報連相が苦手」→「自分のペースで集中して作業に取り組めます」
 */

/**
 * 強み/特性の解説テンプレート
 * high: スコアが高い場合（normalized >= 3.5）
 * mid : スコアが中程度の場合（2.5 <= normalized < 3.5）
 * low : スコアが低い場合（normalized < 2.5）
 * ※ すべてポジティブな表現にする
 */
const DESCRIPTIONS = {
    P1: { // 正確性
        name: '正確性',
        high: '細かいところまでよく気がつきます。ミスの少ない仕事が得意です。',
        mid: 'ある程度のていねいさを持ちながら、バランスよく仕事ができます。',
        low: 'おおまかに全体を見る力があります。細かいことに気を取られず、流れをつくれます。',
    },
    P2: { // 持続力
        name: '持続力',
        high: 'ひとつのことをこつこつと続けられます。あきらめずに取り組むことができます。',
        mid: '集中する時間と休む時間のバランスをとりながら、仕事ができます。',
        low: '短い時間で集中して仕事をする力があります。気持ちの切り替えが得意です。',
    },
    P3: { // 体力管理
        name: '体力管理',
        high: '自分の体の調子によく気づき、うまく気をつけることができます。決まった生活リズムを持っています。',
        mid: 'ある程度、自分の体の調子に気を配ることができます。',
        low: '体の調子をサポートしてもらえる職場で、安心して力を発揮できます。',
    },
    P4: { // IT道具
        name: 'IT道具の活用',
        high: 'パソコンやスマホなど、新しい道具を自分から進んで使うことができます。',
        mid: '必要な時に、ITの道具を使って仕事ができます。',
        low: '手を使って作業することが得意です。紙やペンを使った仕事に向いています。',
    },
    P5: { // 報連相
        name: '報告・連絡・相談',
        high: '困った時にすぐ相談でき、まわりの人とうまくコミュニケーションがとれます。',
        mid: '必要な場面では、報告や連絡ができます。',
        low: '自分のペースで集中して作業ができます。静かな職場で力を発揮します。',
    },
    I1: { // 集中力
        name: '集中力',
        high: 'まわりの音が気にならないくらい、ひとつのことに集中できる力があります。',
        mid: 'ひつような分だけ集中しながら、まわりの様子にも気を配ることができます。',
        low: 'まわりの動きによく気がつきます。チームでの作業で、変化に合わせることができます。',
    },
    I2: { // 感情制御
        name: '気持ちのコントロール',
        high: '気持ちの切り替えが上手で、予定の変更にも落ち着いて動くことができます。',
        mid: '少し時間はかかることもありますが、気持ちの整理ができます。',
        low: 'ものごとを深く感じ取る力があります。まわりの理解とサポートがあれば、安心して働けます。',
    },
    I3: { // 規律性
        name: 'ルールを守る力',
        high: 'ルールや決まりを大切にし、きちんと守って行動できます。',
        mid: '基本のルールを守りながら、その時に合わせた動きもできます。',
        low: '自由な考え方でものごとを見ることが得意です。新しいやり方を見つける力があります。',
    },
    I4: { // 柔軟性
        name: '変化への対応',
        high: '急な変更にもうまく合わせることができます。新しいことへのチャレンジが得意です。',
        mid: '少し時間をもらえれば、変化にも合わせることができます。',
        low: '決まった手順（順番）を正しく繰り返す力があります。いつも同じ作業をする仕事で力を発揮します。',
    },
    I5: { // 自己発信
        name: '自分の気持ちを伝える力',
        high: '自分の意見や気持ちを、しっかり言葉で伝えることができます。',
        mid: '場面にあわせて、自分の考えを伝えることができます。',
        low: '人の話をしっかり聞く力があります。聞き上手としてまわりの人から頼りにされます。',
    },
}

/**
 * 属性スコアに基づいて強みの解説文を生成する
 * 
 * @param {Object} scores - calculateAttributeScores().scores
 * @returns {Array} [{ attributeId, name, level, description, normalizedScore }]
 */
export function generateStrengthDescriptions(scores) {
    return Object.entries(DESCRIPTIONS).map(([attrId, desc]) => {
        const score = scores[attrId]
        if (!score) return null

        const normalized = score.normalized
        let level, description

        if (normalized >= 3.5) {
            level = '高い'
            description = desc.high
        } else if (normalized >= 2.5) {
            level = '中くらい'
            description = desc.mid
        } else {
            level = '低い'
            description = desc.low
        }

        return {
            attributeId: attrId,
            name: desc.name,
            level,
            description,
            normalizedScore: normalized,
        }
    }).filter(Boolean)
}

/**
 * 最も高いスコアの属性を「最大の強み」として抽出し、
 * エグゼクティブ・サマリー（3行の要約）を生成する
 * 
 * @param {Object} scores - calculateAttributeScores().scores
 * @returns {string} 3行のサマリーテキスト
 */
export function generateExecutiveSummary(scores) {
    // スコアが高い順にソート
    const sorted = Object.entries(scores)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.normalized - a.normalized)

    const top1 = sorted[0]
    const top2 = sorted[1]
    const desc1 = DESCRIPTIONS[top1.id]
    const desc2 = DESCRIPTIONS[top2.id]

    const line1 = `あなたの一番の強みは「${desc1.name}」です。`
    const line2 = desc1.high
    const line3 = `さらに「${desc2.name}」の力も持っています。${desc2.high.replace(/。$/, 'ので、')}いろいろな仕事で活かせます。`

    return `${line1}\n${line2}\n${line3}`
}

/**
 * 環境への処方箋（合理的配慮の案）を生成する
 * スコアの低い属性に対して、企業に伝えるべき配慮事項を提案する。
 * 
 * @param {Object} scores - calculateAttributeScores().scores
 * @returns {Array} [{ attributeId, name, suggestion }]
 */
export function generateAccommodations(scores) {
    const ACCOMMODATIONS = {
        P1: '作業の順番を書いたメモを用意し、確認する時間をつくる。',
        P2: '長い時間の作業は、間に休みを入れながら、短い時間で区切って進められるようにする。',
        P3: '体の調子が悪い時に相談しやすい雰囲気（ふんいき）づくりと、無理のないはたらく時間にする。',
        P4: 'わかりやすい説明書を用意し、困った時にすぐ聞ける場所にする。',
        P5: 'お願いごと（指示）は口（言葉）だけでなくメモでも渡し、報告するタイミングを決めておく。',
        I1: '静かなはたらく場所をつくり、集中が切れた時に声をかけてサポートする。',
        I2: '落ち着ける場所を用意し、気持ちの波があっても安心できる環境（かんきょう）をつくる。',
        I3: '作業のルールややり方を文章にして、曖昧（あいまい）な指示をしない。',
        I4: '作業の変更は早めに伝え、急な変更をできるだけ少なくする。',
        I5: '意見を聞く時は１対１で行い、書面やメモでも伝えられるようにする。',
    }

    // スコアが低い（normalized < 3.0）属性に対して配慮事項を生成
    return Object.entries(scores)
        .filter(([, data]) => data.normalized < 3.0)
        .sort((a, b) => a[1].normalized - b[1].normalized) // 低い順
        .map(([id, data]) => ({
            attributeId: id,
            name: DESCRIPTIONS[id]?.name || id,
            normalizedScore: data.normalized,
            suggestion: ACCOMMODATIONS[id] || '',
        }))
}

/**
 * アクションプラン（支援員への相談を促すメッセージ）を生成する
 * 
 * @param {Object} scores - calculateAttributeScores().scores
 * @param {Array} recommendations - getTopRecommendations() の結果
 * @returns {string} アクションプランのテキスト
 */
export function generateActionPlan(scores, recommendations) {
    const sorted = Object.entries(scores)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.normalized - a.normalized)

    const topStrength = DESCRIPTIONS[sorted[0].id]?.name || sorted[0].name
    const topJob = recommendations?.bestMatches?.[0]?.job?.name || 'あなたにぴったりの仕事'

    return [
        `あなたの強みは「${topStrength}」です。この力を活かせる場所を、支援員の方と一緒に探してみましょう。`,
        `今回のおすすめの1位は「${topJob}」でした。実際にどんな仕事なのか、支援員の方に聞いてみてください。`,
        '結果について気になることがあれば、いつでも支援員の方に相談してください。あなたのペースで大丈夫です。',
    ].join('\n')
}

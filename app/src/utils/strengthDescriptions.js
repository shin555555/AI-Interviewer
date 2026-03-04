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
        high: '細かいところまで気がつく力があります。ミスの少ない仕事が得意です。',
        mid: 'ある程度のていねいさを持ちながら、バランスよく仕事に取り組めます。',
        low: 'おおまかに全体を見る力があります。細かいことに気を取られず、流れをつくれます。',
    },
    P2: { // 持続力
        name: '持続力',
        high: 'ひとつのことをこつこつと続けられる力があります。粘り強く取り組めます。',
        mid: '集中する時間と休む時間のバランスをとりながら、仕事に取り組めます。',
        low: '短い時間で集中して取り組む力があります。切り替えが得意です。',
    },
    P3: { // 体力管理
        name: '体力管理',
        high: '自分の体調の変化によく気づき、上手に管理できます。安定した生活リズムを持っています。',
        mid: 'ある程度自分の体調に気を配ることができます。',
        low: '体調の管理をサポートしてもらえる環境で、安心して力を発揮できます。',
    },
    P4: { // IT道具
        name: 'IT道具の活用',
        high: 'パソコンやスマホなど、新しい道具を積極的に使いこなせます。',
        mid: '必要な時にITの道具を使って仕事に取り組めます。',
        low: '手を使って作業することが得意です。紙やペンを使った仕事に向いています。',
    },
    P5: { // 報連相
        name: '報告・連絡・相談',
        high: '困った時にすぐ相談でき、まわりの人と上手にコミュニケーションがとれます。',
        mid: '必要な場面では報告や連絡ができます。',
        low: '自分のペースで集中して作業に取り組めます。静かな環境で力を発揮します。',
    },
    I1: { // 集中力
        name: '集中力',
        high: 'まわりの音が気にならないくらい、ひとつのことに集中できる力があります。',
        mid: '適度に集中しながら、まわりの様子にも気を配ることができます。',
        low: 'まわりの動きによく気がつきます。チームでの作業で、変化に対応できます。',
    },
    I2: { // 感情制御
        name: '気持ちのコントロール',
        high: '気持ちの切り替えが上手で、予定の変更にも落ち着いて対応できます。',
        mid: '少し時間はかかることもありますが、気持ちの整理ができます。',
        low: '物事を深く感じ取る力があります。まわりの理解とサポートがあれば、安心して働けます。',
    },
    I3: { // 規律性
        name: 'ルールを守る力',
        high: 'ルールや決まりを大切にし、きちんと守って行動できます。',
        mid: '基本的なルールを守りながら、状況に応じた対応もできます。',
        low: '自由な発想で物事を考えることが得意です。新しいやり方を見つける力があります。',
    },
    I4: { // 柔軟性
        name: '変化への対応',
        high: '急な変更にも柔軟に対応できます。新しいことへのチャレンジが得意です。',
        mid: '少し時間をもらえれば、変化にも対応できます。',
        low: '決まった手順を正しく繰り返す力があります。ルーティンワークで力を発揮します。',
    },
    I5: { // 自己発信
        name: '自分の気持ちを伝える力',
        high: '自分の意見や気持ちをしっかり言葉で伝えることができます。',
        mid: '場面に応じて、自分の考えを伝えることができます。',
        low: '人の話をしっかり聞く力があります。聞き上手として信頼されます。',
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

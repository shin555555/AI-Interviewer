/**
 * scoreCalculator.js
 * 
 * 10個の属性スコア計算、メタデータ解析（矛盾判定）を行うモジュール。
 * 
 * 仕様:
 * - 全10属性（P1〜P5, I1〜I5）をそれぞれ3問で判定
 * - 各質問 3点(高) / 2点(中) / 1点(低) の合計（3〜9点）
 * - 矛盾判定: 1属性内（3問）のスコア分散が大きい場合「環境による変動あり」フラグ
 * - 回答時間: <3s=直感的(本心)、>15s=熟考(迷い)
 */

import { ATTRIBUTES } from '../data/questions'

/**
 * 回答データから10属性のスコアを計算する
 * 
 * @param {Array} answers - 回答データの配列
 *   各要素: { questionId, attributeId, choiceIndex, score, responseTimeMs, toggleCount, freeText }
 * @returns {Object} 属性スコアオブジェクト
 *   {
 *     scores: { P1: { raw, normalized, questions }, ... },
 *     metadata: { totalTime, avgTime, confidence },
 *     contradictions: [{ attributeId, flag: true, variance }],
 *     workStyleScores: [...],
 *     mindsetScores: [...],
 *   }
 */
export function calculateAttributeScores(answers) {
    // 属性ごとに回答をグループ化
    const grouped = {}
    ATTRIBUTES.forEach(attr => {
        grouped[attr.id] = {
            id: attr.id,
            name: attr.name,
            category: attr.category,
            answers: [],
        }
    })

    answers.forEach(answer => {
        if (grouped[answer.attributeId]) {
            grouped[answer.attributeId].answers.push(answer)
        }
    })

    // 各属性のスコアを計算
    const scores = {}
    const contradictions = []

    Object.values(grouped).forEach(group => {
        const questionScores = group.answers.map(a => a.score)
        const raw = questionScores.reduce((sum, s) => sum + s, 0) // 3〜9
        const normalized = normalizeScore(raw) // 1〜5 に正規化

        // 分散計算（矛盾判定）
        const variance = calculateVariance(questionScores)
        const hasContradiction = variance >= 0.67 // 3問中、[3,3,1]や[1,1,3]のケースで分散≈0.67

        scores[group.id] = {
            raw,
            normalized,
            name: group.name,
            category: group.category,
            questions: group.answers.map(a => ({
                questionId: a.questionId,
                score: a.score,
                responseTimeMs: a.responseTimeMs,
                toggleCount: a.toggleCount,
                freeText: a.freeText,
            })),
            variance: Math.round(variance * 100) / 100,
            hasContradiction,
        }

        if (hasContradiction) {
            contradictions.push({
                attributeId: group.id,
                attributeName: group.name,
                variance: Math.round(variance * 100) / 100,
            })
        }
    })

    // メタデータ集計
    const metadata = calculateMetadata(answers)

    // カテゴリー別に分割
    const workStyleScores = ATTRIBUTES
        .filter(a => a.category === 'workStyle')
        .map(a => ({ id: a.id, name: a.name, ...scores[a.id] }))

    const mindsetScores = ATTRIBUTES
        .filter(a => a.category === 'mindset')
        .map(a => ({ id: a.id, name: a.name, ...scores[a.id] }))

    return {
        scores,
        metadata,
        contradictions,
        workStyleScores,
        mindsetScores,
    }
}

/**
 * 3問合計（3〜9点）を 1〜5 の5段階に正規化する
 * 3→1, 4→1.33, 5→1.67, 6→3, 7→3.33, 8→3.67, 9→5
 * 均等分割: (raw - 3) / 6 * 4 + 1
 */
function normalizeScore(raw) {
    const normalized = ((raw - 3) / 6) * 4 + 1
    return Math.round(normalized * 10) / 10
}

/**
 * 分散（標準偏差の二乗）を計算
 */
function calculateVariance(values) {
    if (values.length === 0) return 0
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
    return squaredDiffs.reduce((sum, d) => sum + d, 0) / values.length
}

/**
 * メタデータ解析
 * - 回答時間の分布
 * - 修正回数の合計
 * - 自己理解の確信度
 */
function calculateMetadata(answers) {
    const responseTimes = answers.map(a => a.responseTimeMs)
    const totalTime = responseTimes.reduce((sum, t) => sum + t, 0)
    const avgTime = totalTime / answers.length

    // 回答時間分類
    const intuitiveCount = responseTimes.filter(t => t < 3000).length    // <3s: 直感的
    const deliberateCount = responseTimes.filter(t => t > 15000).length  // >15s: 熟考
    const normalCount = answers.length - intuitiveCount - deliberateCount

    // 修正（トグル）の合計
    const totalToggles = answers.reduce((sum, a) => sum + (a.toggleCount || 0), 0)

    // 確信度の算出: 直感回答が多く、トグルが少ないほど確信度が高い
    const intuitiveRatio = intuitiveCount / answers.length
    const togglePenalty = Math.min(totalToggles / answers.length, 1) // 0〜1にクリップ
    const confidenceRaw = intuitiveRatio * 0.7 + (1 - togglePenalty) * 0.3
    let confidenceLevel
    if (confidenceRaw >= 0.6) confidenceLevel = '高(直感)'
    else if (confidenceRaw >= 0.3) confidenceLevel = '中'
    else confidenceLevel = '低(迷い)'

    // 自由記述のある回答
    const freeTextAnswers = answers.filter(a => a.freeText)

    return {
        totalTimeMs: totalTime,
        totalTimeFormatted: formatTime(totalTime),
        avgTimeMs: Math.round(avgTime),
        intuitiveCount,
        deliberateCount,
        normalCount,
        totalToggles,
        confidenceRaw: Math.round(confidenceRaw * 100) / 100,
        confidenceLevel,
        freeTextCount: freeTextAnswers.length,
        freeTexts: freeTextAnswers.map(a => ({
            questionId: a.questionId,
            text: a.freeText,
        })),
    }
}

/**
 * ミリ秒を「○分○秒」形式にフォーマット
 */
function formatTime(ms) {
    const totalSec = Math.round(ms / 1000)
    const min = Math.floor(totalSec / 60)
    const sec = totalSec % 60
    if (min === 0) return `${sec}秒`
    return `${min}分${sec}秒`
}

/**
 * 回答時間のラベルを取得
 */
export function getResponseTimeLabel(ms) {
    if (ms < 3000) return '直感的'
    if (ms > 15000) return '熟考'
    return '標準'
}

/**
 * 正規化スコア(1〜5)をレーダーチャート表示用の％値（0〜100）に変換
 */
export function scoreToPercent(normalizedScore) {
    return Math.round(((normalizedScore - 1) / 4) * 100)
}

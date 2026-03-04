/**
 * jobMatcher.js
 * 
 * 適職マッチング（MatchScore）計算モジュール
 * 
 * 計算式: MatchScore = 100 - (Σ|U_i - R_i| × weight)
 * 
 * 【重要：柔軟性(I4)の反転ロジック】
 * ルーティンワークが重要な職種（データ入力、梱包等）では、
 * 柔軟性スコアが低い = 適合度が高い と判定する。
 * 「変化が苦手」を「ルーティンへの適性」として正しく評価。
 * 
 * 具体的には: 職種のI4要求値が3未満の場合、ユーザーの柔軟性スコアを反転させる。
 * 反転式: U_I4_inverted = (5 + 1) - U_I4 = 6 - U_I4
 */

import { JOBS_DATABASE, JOB_CATEGORIES, ATTRIBUTE_KEYS } from '../data/jobsDatabase'

/** 
 * 属性ごとの重み係数（均等の場合は全て1.0）
 * 必要に応じて調整可能 
 */
const WEIGHTS = {
    P1: 1.0, // 正確性
    P2: 1.0, // 持続力
    P3: 1.0, // 体力管理
    P4: 1.0, // IT道具
    P5: 1.0, // 報連相
    I1: 1.0, // 集中力
    I2: 1.0, // 感情制御
    I3: 1.0, // 規律性
    I4: 1.0, // 柔軟性
    I5: 1.0, // 自己発信
}

/**
 * I4(柔軟性)反転ロジックの閾値
 * 職種のI4要求値がこの値未満の場合、反転計算を適用
 */
const FLEXIBILITY_INVERSION_THRESHOLD = 3

/**
 * 全40職種に対するマッチスコアを計算し、降順にソートして返す
 * 
 * @param {Object} attributeScores - calculateAttributeScores() の戻り値の .scores
 * @returns {Array} ソート済みのマッチ結果配列
 *   [{ job, matchScore, details: [{ attr, userScore, requiredScore, diff }] }, ...]
 */
export function calculateJobMatches(attributeScores) {
    // ユーザースコアを配列形式に変換（正規化済み1〜5）
    const userScores = ATTRIBUTE_KEYS.map(key => attributeScores[key]?.normalized ?? 3)

    const results = JOBS_DATABASE.map(job => {
        const details = []
        let totalPenalty = 0

        ATTRIBUTE_KEYS.forEach((key, i) => {
            let userScore = userScores[i]
            const requiredScore = job.required[i]
            const weight = WEIGHTS[key]

            // 【反転ロジック】I4(柔軟性)の特殊処理
            if (key === 'I4' && requiredScore < FLEXIBILITY_INVERSION_THRESHOLD) {
                // 柔軟性要求が低い（ルーティン重視の）職種:
                // ユーザーの柔軟性が低い(=1) → 反転後は高い(=5) → 差が小さくなる → マッチ度↑
                userScore = 6 - userScore
            }

            const diff = Math.abs(userScore - requiredScore)
            const penalty = diff * weight

            totalPenalty += penalty

            details.push({
                attributeKey: key,
                attributeName: getAttributeName(key),
                userScore: userScores[i], // 元のスコア（表示用）
                requiredScore,
                diff: Math.round(diff * 10) / 10,
                isInverted: key === 'I4' && requiredScore < FLEXIBILITY_INVERSION_THRESHOLD,
            })
        })

        // MatchScore = 100 - 合計ペナルティ（下限0）
        const matchScore = Math.max(0, Math.round((100 - totalPenalty * 2.5) * 10) / 10)

        // カテゴリー情報を付与
        const category = JOB_CATEGORIES.find(c => c.id === job.categoryId)

        return {
            job: {
                id: job.id,
                name: job.name,
                categoryId: job.categoryId,
                categoryName: category?.name ?? '',
                categoryIcon: category?.icon ?? '',
            },
            matchScore,
            details,
        }
    })

    // マッチスコア降順でソート
    results.sort((a, b) => b.matchScore - a.matchScore)

    return results
}

/**
 * TOP N の推奨職種を取得する
 * 仕様: 上位3つを「ベストマッチ」、4〜5位を「可能性の広がり」
 * 
 * @param {Array} matchResults - calculateJobMatches() の戻り値
 * @param {number} topN - 上位何件を返すか（デフォルト5）
 * @returns {Object} { bestMatches: [...], possibilities: [...] }
 */
export function getTopRecommendations(matchResults, topN = 5) {
    const top = matchResults.slice(0, topN)
    return {
        bestMatches: top.slice(0, 3),       // ベストマッチ（1〜3位）
        possibilities: top.slice(3, 5),      // 可能性の広がり（4〜5位）
    }
}

/**
 * カテゴリー別の適合トレンドを集計する
 * @param {Array} matchResults - calculateJobMatches() の戻り値
 * @returns {Array} [{ categoryId, categoryName, icon, avgScore, count }, ...]
 */
export function getCategoryTrend(matchResults) {
    const categoryMap = {}

    matchResults.forEach(result => {
        const catId = result.job.categoryId
        if (!categoryMap[catId]) {
            categoryMap[catId] = {
                categoryId: catId,
                categoryName: result.job.categoryName,
                icon: result.job.categoryIcon,
                totalScore: 0,
                count: 0,
            }
        }
        categoryMap[catId].totalScore += result.matchScore
        categoryMap[catId].count += 1
    })

    return Object.values(categoryMap)
        .map(cat => ({
            ...cat,
            avgScore: Math.round((cat.totalScore / cat.count) * 10) / 10,
        }))
        .sort((a, b) => b.avgScore - a.avgScore)
}

/**
 * 属性キーから日本語名を取得するヘルパー
 */
function getAttributeName(key) {
    const names = {
        P1: '正確性', P2: '持続力', P3: '体力管理', P4: 'IT道具', P5: '報連相',
        I1: '集中力', I2: '感情制御', I3: '規律性', I4: '柔軟性', I5: '自己発信',
    }
    return names[key] || key
}

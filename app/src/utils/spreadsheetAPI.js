/**
 * spreadsheetAPI.js
 * 
 * Googleスプレッドシートとの連携インターフェース。
 * Google Apps Script (GAS) のWebアプリとしてデプロイされたエンドポイントに
 * fetch で接続し、利用者データの読み書きを行う。
 * 
 * 実運用時にGASのURLを環境変数 VITE_GAS_API_URL に設定する。
 * 開発時はモックデータにフォールバックする。
 */

// GAS WebアプリのURLを環境変数から取得
const GAS_API_URL = import.meta.env.VITE_GAS_API_URL || ''

/**
 * 開発用モックモードかどうか
 */
const IS_MOCK = !GAS_API_URL

// ============================================================
// モックデータ（開発環境用）
// ============================================================

const MOCK_USERS = [
    {
        id: 'user_001',
        name: '田中 A.',
        createdAt: '2026-02-20T10:00:00',
        scores: {
            P1: { raw: 8, normalized: 4.3 }, P2: { raw: 7, normalized: 3.7 },
            P3: { raw: 5, normalized: 2.3 }, P4: { raw: 9, normalized: 5.0 },
            P5: { raw: 4, normalized: 1.7 }, I1: { raw: 8, normalized: 4.3 },
            I2: { raw: 6, normalized: 3.0 }, I3: { raw: 7, normalized: 3.7 },
            I4: { raw: 5, normalized: 2.3 }, I5: { raw: 4, normalized: 1.7 },
        },
        topStrength: 'IT道具',
        topWeakness: '報連相',
        confidenceLevel: '高い',
        totalTime: '12分30秒',
        freeTexts: ['人混みが苦手です'],
        contradictions: [],
        topJob: 'データ入力',
        matchScore: 82.5,
        categoryTrend: '事務・IT',
    },
    {
        id: 'user_002',
        name: '鈴木 B.',
        createdAt: '2026-02-22T14:30:00',
        scores: {
            P1: { raw: 9, normalized: 5.0 }, P2: { raw: 6, normalized: 3.0 },
            P3: { raw: 6, normalized: 3.0 }, P4: { raw: 5, normalized: 2.3 },
            P5: { raw: 7, normalized: 3.7 }, I1: { raw: 7, normalized: 3.7 },
            I2: { raw: 8, normalized: 4.3 }, I3: { raw: 8, normalized: 4.3 },
            I4: { raw: 3, normalized: 1.0 }, I5: { raw: 6, normalized: 3.0 },
        },
        topStrength: '正確性',
        topWeakness: '柔軟性',
        confidenceLevel: '低い',
        totalTime: '18分45秒',
        freeTexts: [],
        contradictions: ['I4'],
        topJob: '検品',
        matchScore: 78.3,
        categoryTrend: '物流・軽作業',
    },
    {
        id: 'user_003',
        name: '佐藤 C.',
        createdAt: '2026-02-25T09:15:00',
        scores: {
            P1: { raw: 6, normalized: 3.0 }, P2: { raw: 5, normalized: 2.3 },
            P3: { raw: 8, normalized: 4.3 }, P4: { raw: 4, normalized: 1.7 },
            P5: { raw: 6, normalized: 3.0 }, I1: { raw: 5, normalized: 2.3 },
            I2: { raw: 4, normalized: 1.7 }, I3: { raw: 7, normalized: 3.7 },
            I4: { raw: 6, normalized: 3.0 }, I5: { raw: 5, normalized: 2.3 },
        },
        topStrength: '体力管理',
        topWeakness: '感情制御',
        confidenceLevel: '中',
        totalTime: '15分20秒',
        freeTexts: ['薬の副作用で眠くなることがあります'],
        contradictions: ['I2'],
        topJob: 'ビル清掃',
        matchScore: 75.0,
        categoryTrend: '清掃・施設管理',
    },
    {
        id: 'user_004',
        name: '高橋 D.',
        createdAt: '2026-03-01T11:00:00',
        scores: {
            P1: { raw: 7, normalized: 3.7 }, P2: { raw: 8, normalized: 4.3 },
            P3: { raw: 7, normalized: 3.7 }, P4: { raw: 6, normalized: 3.0 },
            P5: { raw: 5, normalized: 2.3 }, I1: { raw: 6, normalized: 3.0 },
            I2: { raw: 7, normalized: 3.7 }, I3: { raw: 6, normalized: 3.0 },
            I4: { raw: 7, normalized: 3.7 }, I5: { raw: 8, normalized: 4.3 },
        },
        topStrength: '自己発信',
        topWeakness: '報連相',
        confidenceLevel: '高い',
        totalTime: '10分50秒',
        freeTexts: ['話すことが好きです'],
        contradictions: [],
        topJob: '接客補助',
        matchScore: 80.1,
        categoryTrend: '調理補助・サービス',
    },
    {
        id: 'user_005',
        name: '伊藤 E.',
        createdAt: '2026-03-03T16:40:00',
        scores: {
            P1: { raw: 5, normalized: 2.3 }, P2: { raw: 7, normalized: 3.7 },
            P3: { raw: 8, normalized: 4.3 }, P4: { raw: 3, normalized: 1.0 },
            P5: { raw: 6, normalized: 3.0 }, I1: { raw: 4, normalized: 1.7 },
            I2: { raw: 6, normalized: 3.0 }, I3: { raw: 8, normalized: 4.3 },
            I4: { raw: 4, normalized: 1.7 }, I5: { raw: 3, normalized: 1.0 },
        },
        topStrength: '規律性',
        topWeakness: '自己発信',
        confidenceLevel: '中',
        totalTime: '20分10秒',
        freeTexts: [],
        contradictions: ['P1'],
        topJob: '梱包',
        matchScore: 72.8,
        categoryTrend: '物流・軽作業',
    },
]

// ============================================================
// Public API
// ============================================================

/**
 * 利用者一覧を取得する
 * @returns {Promise<Array>} 利用者データ配列
 */
export async function fetchUsers() {
    if (IS_MOCK) return MOCK_USERS

    const res = await fetch(`${GAS_API_URL}?action=getUsers`)
    const data = await res.json()
    return data.users || []
}

/**
 * 特定の利用者の詳細（時系列データ含む）を取得する
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
export async function fetchUserDetail(userId) {
    if (IS_MOCK) {
        const user = MOCK_USERS.find(u => u.id === userId)
        // モック：過去の診断結果を疑似生成
        return {
            ...user,
            history: [
                {
                    date: '2026-01-15',
                    scores: Object.fromEntries(
                        Object.entries(user.scores).map(([k, v]) => [k, { ...v, normalized: Math.max(1, v.normalized - 0.5 - Math.random() * 0.5) }])
                    ),
                },
                {
                    date: '2026-02-01',
                    scores: Object.fromEntries(
                        Object.entries(user.scores).map(([k, v]) => [k, { ...v, normalized: Math.max(1, v.normalized - Math.random() * 0.3) }])
                    ),
                },
                {
                    date: user.createdAt.split('T')[0],
                    scores: user.scores,
                },
            ],
        }
    }

    const res = await fetch(`${GAS_API_URL}?action=getUserDetail&userId=${userId}`)
    const data = await res.json()
    return data.user || null
}

/**
 * 利用者の診断結果をスプレッドシートに保存する
 * @param {Object} userData - 保存するユーザーデータ
 * @returns {Promise<Object>}
 */
export async function saveUserResult(userData) {
    if (IS_MOCK) {
        console.log('[MOCK] saveUserResult:', userData)
        return { success: true, id: `user_${Date.now()}` }
    }

    // GAS WebアプリではContent-Type: application/jsonだとCORSエラーになるため
    // text/plain で送信する（GAS側ではe.postData.contentsで受け取れる）
    const res = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'saveResult', data: userData }),
        redirect: 'follow',
    })
    return await res.json()
}

/**
 * 全体統計データ（平均スコア、カテゴリー分布等）を計算する
 * ※ フロントエンドでの集計。APIからのデータ取得後に使用。
 * 
 * @param {Array} users - fetchUsers() の結果
 * @returns {Object} 統計データ
 */
export function calculateOverallStats(users) {
    if (!users || users.length === 0) {
        return { averageScores: {}, categoryDistribution: [], lowScoreItems: [], totalUsers: 0 }
    }

    const ATTR_KEYS = ['P1', 'P2', 'P3', 'P4', 'P5', 'I1', 'I2', 'I3', 'I4', 'I5']
    const ATTR_NAMES = {
        P1: '正確性', P2: '持続力', P3: '体力管理', P4: 'IT道具', P5: '報連相',
        I1: '集中力', I2: '感情制御', I3: '規律性', I4: '柔軟性', I5: '自己発信',
    }

    // 平均スコア計算
    const averageScores = {}
    ATTR_KEYS.forEach(key => {
        const sum = users.reduce((acc, u) => acc + (u.scores[key]?.normalized || 0), 0)
        averageScores[key] = {
            name: ATTR_NAMES[key],
            average: Math.round((sum / users.length) * 10) / 10,
        }
    })

    // 低スコア項目TOP3（事業所全体の課題）
    const lowScoreItems = Object.entries(averageScores)
        .sort((a, b) => a[1].average - b[1].average)
        .slice(0, 3)
        .map(([key, data]) => ({ key, name: data.name, average: data.average }))

    // カテゴリー分布（適合トレンド分析）
    const categoryCount = {}
    users.forEach(u => {
        const cat = u.categoryTrend || '不明'
        categoryCount[cat] = (categoryCount[cat] || 0) + 1
    })

    const categoryDistribution = Object.entries(categoryCount).map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / users.length) * 100),
    }))

    return {
        totalUsers: users.length,
        completedUsers: users.length, // モックでは全員完了
        averageScores,
        lowScoreItems,
        categoryDistribution,
    }
}

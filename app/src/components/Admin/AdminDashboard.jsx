import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    CategoryScale,
    LinearScale,
    ArcElement,
    BarElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js'
import { Radar, Doughnut, Bar } from 'react-chartjs-2'
import { fetchUsers, fetchUserDetail, calculateOverallStats } from '../../utils/spreadsheetAPI'
import { calculateJobMatches, getTopRecommendations } from '../../utils/jobMatcher'
import { generateStrengthDescriptions, generateExecutiveSummary, generateAccommodations, generateActionPlan } from '../../utils/strengthDescriptions'
import { generateUserReportPDF } from '../../utils/pdfGenerator'
import './AdminDashboard.css'

// Chart.js 登録
ChartJS.register(
    RadialLinearScale, PointElement, LineElement, CategoryScale,
    LinearScale, ArcElement, BarElement, Filler, Tooltip, Legend
)

const ATTR_KEYS = ['P1', 'P2', 'P3', 'P4', 'P5', 'I1', 'I2', 'I3', 'I4', 'I5']
const ATTR_NAMES = {
    P1: '正確性', P2: '持続力', P3: '体力管理', P4: 'IT道具', P5: '報連相',
    I1: '集中力', I2: '感情制御', I3: '規律性', I4: '柔軟性', I5: '自己発信',
}

const NAV_ITEMS = [
    { id: 'dashboard', icon: '📊', label: 'ダッシュボード' },
    { id: 'users', icon: '👥', label: '利用者一覧' },
]

const CATEGORY_COLORS = [
    'rgba(33, 150, 243, 0.8)',    // 事務・IT
    'rgba(0, 178, 95, 0.8)',      // 物流・軽作業
    'rgba(255, 152, 0, 0.8)',     // 清掃・施設管理
    'rgba(156, 39, 176, 0.8)',    // 調理補助・サービス
    'rgba(96, 125, 139, 0.8)',    // 専門・その他
]

/**
 * AdminDashboard - 管理者ダッシュボード画面
 */
export default function AdminDashboard({ onBack }) {
    const [activeNav, setActiveNav] = useState('dashboard')
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(null)
    const [selectedUserId, setSelectedUserId] = useState(null)
    const [userDetail, setUserDetail] = useState(null)
    const [detailLoading, setDetailLoading] = useState(false)
    const [detailError, setDetailError] = useState(null)
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
    const reportRef = useRef(null)

    // 初期データ読み込み
    const loadUsers = useCallback(async () => {
        setLoading(true)
        setLoadError(null)
        try {
            const data = await fetchUsers()
            setUsers(data)
        } catch (err) {
            console.error('ユーザーデータの取得に失敗:', err)
            setLoadError(err.message || 'データの読み込みに失敗しました')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadUsers()
    }, [loadUsers])

    // 全体統計
    const stats = useMemo(() => calculateOverallStats(users), [users])

    // --- 個別ユーザー詳細の読み込み ---
    const handleSelectUser = useCallback(async (userId) => {
        setSelectedUserId(userId)
        setActiveNav('users')
        setDetailLoading(true)
        setDetailError(null)
        try {
            const detail = await fetchUserDetail(userId)
            setUserDetail(detail)
        } catch (err) {
            console.error('ユーザー詳細の取得に失敗:', err)
            setDetailError(err.message || '詳細データの読み込みに失敗しました')
        } finally {
            setDetailLoading(false)
        }
    }, [])

    const handleBackToList = useCallback(() => {
        setSelectedUserId(null)
        setUserDetail(null)
    }, [])

    // --- PDF生成ハンドラ ---
    const handleDownloadUserPDF = useCallback(async (userName) => {
        if (!reportRef.current) return
        setIsGeneratingPDF(true)
        try {
            await generateUserReportPDF(reportRef.current, userName || '利用者')
        } catch (err) {
            console.error('PDF生成に失敗しました:', err)
            alert('PDF生成に失敗しました。もう一度お試しください。')
        } finally {
            setIsGeneratingPDF(false)
        }
    }, [])

    // 一覧から直接PDFを生成する（詳細を取得してから生成）
    const handleQuickPDF = useCallback(async (userId, userName) => {
        // まず詳細画面に遷移
        await handleSelectUser(userId)
        // 少し待ってDOMレンダリング完了を待つ
        setTimeout(async () => {
            if (reportRef.current) {
                setIsGeneratingPDF(true)
                try {
                    await generateUserReportPDF(reportRef.current, userName || '利用者')
                } catch (err) {
                    console.error('PDF生成に失敗しました:', err)
                    alert('PDF生成に失敗しました。もう一度お試しください。')
                } finally {
                    setIsGeneratingPDF(false)
                }
            }
        }, 1500)
    }, [handleSelectUser])

    // ============================================================
    // チャートデータ
    // ============================================================

    // 全体平均レーダーチャート
    const avgRadarData = {
        labels: ATTR_KEYS.map(k => ATTR_NAMES[k]),
        datasets: [{
            label: '利用者全体の平均',
            data: ATTR_KEYS.map(k => stats.averageScores[k]?.average || 0),
            backgroundColor: 'rgba(33, 150, 243, 0.12)',
            borderColor: 'rgba(33, 150, 243, 0.7)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(33, 150, 243, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
        }],
    }

    const radarOptions = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            r: {
                min: 0, max: 5,
                ticks: { stepSize: 1, font: { size: 10 }, backdropColor: 'transparent' },
                pointLabels: { font: { size: 11, weight: '600' }, color: '#495057' },
                grid: { color: 'rgba(0,0,0,0.05)' },
                angleLines: { color: 'rgba(0,0,0,0.05)' },
            },
        },
        plugins: { legend: { display: false } },
    }

    // カテゴリー分布ドーナツチャート
    const doughnutData = {
        labels: stats.categoryDistribution.map(d => d.name),
        datasets: [{
            data: stats.categoryDistribution.map(d => d.count),
            backgroundColor: CATEGORY_COLORS.slice(0, stats.categoryDistribution.length),
            borderWidth: 2,
            borderColor: '#fff',
        }],
    }

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 16 } },
            tooltip: {
                callbacks: {
                    label: (ctx) => `${ctx.label}: ${ctx.raw}人 (${stats.categoryDistribution[ctx.dataIndex]?.percentage || 0}%)`,
                },
            },
        },
    }

    // 低スコア棒グラフ
    const barData = {
        labels: stats.lowScoreItems.map(item => item.name),
        datasets: [{
            label: '平均スコア',
            data: stats.lowScoreItems.map(item => item.average),
            backgroundColor: ['rgba(255, 87, 34, 0.7)', 'rgba(255, 152, 0, 0.7)', 'rgba(255, 193, 7, 0.7)'],
            borderRadius: 6,
            barThickness: 40,
        }],
    }

    const barOptions = {
        responsive: true,
        maintainAspectRatio: true,
        indexAxis: 'y',
        scales: {
            x: { min: 0, max: 5, ticks: { stepSize: 1 } },
            y: { ticks: { font: { size: 12, weight: '600' } } },
        },
        plugins: { legend: { display: false } },
    }

    // ============================================================
    // 個別ユーザー用チャート
    // ============================================================
    // 回答時間を安全にフォーマットするヘルパー
    const formatTotalTime = (user) => {
        // totalTimeが既にフォーマット済み文字列の場合、異常値でないかチェック
        if (user.totalTime) {
            const match = user.totalTime.match(/(\d+)分/)
            if (match && parseInt(match[1]) > 1440) {
                // 1440分(24時間)超えは明らかに異常 → metadata.totalTimeMsから再計算
                return null
            }
            return user.totalTime
        }
        return null
    }

    // ============================================================
    // Render
    // ============================================================

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="admin-loading">📡 データを読み込んでいます...</div>
            </div>
        )
    }

    if (loadError) {
        return (
            <div className="admin-dashboard">
                <div className="admin-error">
                    <div className="admin-error-icon">⚠️</div>
                    <p>データの読み込みに失敗しました</p>
                    <p className="admin-error-detail">{loadError}</p>
                    <button className="admin-retry-btn" onClick={loadUsers}>
                        🔄 もう一度読み込む
                    </button>
                    <button className="admin-logout-btn" onClick={onBack} style={{ marginTop: '12px' }}>
                        ← トップに戻る
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="admin-dashboard">
            {/* サイドバー */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-title">AI ワーク・プロファイル</div>
                <div className="admin-sidebar-subtitle">管理画面</div>
                <nav className="admin-nav">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.id}
                            className={`admin-nav-item ${activeNav === item.id ? 'is-active' : ''}`}
                            onClick={() => {
                                setActiveNav(item.id)
                                if (item.id === 'dashboard') {
                                    setSelectedUserId(null)
                                    setUserDetail(null)
                                }
                            }}
                        >
                            <span className="admin-nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="admin-sidebar-footer">
                    <button className="admin-logout-btn" onClick={onBack}>
                        ← トップに戻る
                    </button>
                </div>
            </aside>

            {/* メインコンテンツ */}
            <main className="admin-main">
                {activeNav === 'dashboard' && renderDashboard()}
                {activeNav === 'users' && !selectedUserId && renderUserList()}
                {activeNav === 'users' && selectedUserId && renderUserDetail()}
            </main>
        </div>
    )

    // ============================================================
    // ダッシュボード画面
    // ============================================================
    function renderDashboard() {
        // 要注意アラートは削除済みのため不要

        return (
            <>
                <div className="admin-main-header">
                    <h1>📊 ダッシュボード</h1>
                    <span className="admin-last-updated">
                        最終更新: {new Date().toLocaleString('ja-JP')}
                    </span>
                </div>

                {/* ステータスバー */}
                <div className="admin-stats-bar">
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon is-primary">👤</div>
                        <div>
                            <div className="admin-stat-value">{stats.totalUsers}人</div>
                            <div className="admin-stat-label">登録人数</div>
                        </div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon is-success">✅</div>
                        <div>
                            <div className="admin-stat-value">{stats.completedUsers}人</div>
                            <div className="admin-stat-label">診断完了</div>
                        </div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon is-info">📈</div>
                        <div>
                            <div className="admin-stat-value">
                                {stats.categoryDistribution[0]?.name || '-'}
                            </div>
                            <div className="admin-stat-label">最多適合カテゴリー</div>
                        </div>
                    </div>
                </div>

                {/* チャートエリア */}
                <div className="admin-charts-grid">
                    {/* 全体平均レーダー */}
                    <div className="admin-chart-card">
                        <h2>🔷 事業所の特性分布</h2>
                        <div className="admin-chart-wrapper">
                            <Radar data={avgRadarData} options={radarOptions} />
                        </div>
                    </div>

                    {/* カテゴリー分布ドーナツ */}
                    <div className="admin-chart-card">
                        <h2>🎯 適合職種トレンド</h2>
                        <div className="admin-chart-wrapper">
                            <Doughnut data={doughnutData} options={doughnutOptions} />
                        </div>
                    </div>
                </div>

                {/* 低スコア課題 */}
                <div className="admin-issues-card">
                    <h2>📋 優先すべき訓練プログラム（低スコア TOP3）</h2>
                    {stats.lowScoreItems.map((item, i) => (
                        <div key={item.key} className="admin-issue-row">
                            <span className="admin-issue-rank">{i + 1}.</span>
                            <span className="admin-issue-name">{item.name}</span>
                            <div className="admin-issue-bar-container">
                                <div
                                    className="admin-issue-bar"
                                    style={{ width: `${(item.average / 5) * 100}%` }}
                                />
                            </div>
                            <span className="admin-issue-value">{item.average}/5.0</span>
                        </div>
                    ))}
                </div>

                {/* 利用者テーブル（概要版） */}
                {renderUserTable(true)}
            </>
        )
    }

    // ============================================================
    // 利用者一覧画面
    // ============================================================
    function renderUserList() {
        return (
            <>
                <div className="admin-main-header">
                    <h1>👥 利用者一覧</h1>
                </div>
                {renderUserTable(false)}
            </>
        )
    }

    // ============================================================
    // 利用者テーブル共通
    // ============================================================
    function renderUserTable(compact) {
        return (
            <div className="admin-users-card">
                {compact && <h2>👥 利用者個別データ</h2>}
                <table className="admin-users-table" id="users-table">
                    <thead>
                        <tr>
                            <th>氏名</th>
                            <th>強み</th>
                            <th>課題</th>
                            <th>確信度</th>
                            <th>自由記述</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} onClick={() => handleSelectUser(user.id)}>
                                <td className="user-name-cell">{user.name}</td>
                                <td>
                                    <span className="tag tag-strength">{user.topStrength}</span>
                                </td>
                                <td>
                                    <span className="tag tag-weakness">{user.topWeakness}</span>
                                </td>
                                <td>
                                    <span className={`tag tag-confidence-${getConfidenceClass(user.confidenceLevel)}`}>
                                        {user.confidenceLevel}
                                    </span>
                                </td>
                                <td className="free-text-cell">
                                    {user.freeTexts?.[0] || '（なし）'}
                                </td>
                                <td className="action-cell">
                                    <button
                                        className="admin-action-btn"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleSelectUser(user.id)
                                        }}
                                    >
                                        詳細
                                    </button>
                                    <button
                                        className="admin-action-btn admin-pdf-btn"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleQuickPDF(user.id, user.name)
                                        }}
                                        title="PDFをダウンロード"
                                    >
                                        📄
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    // ============================================================
    // 個別詳細画面
    // ============================================================
    function renderUserDetail() {
        if (detailLoading) {
            return <div className="admin-loading">📡 データを読み込んでいます...</div>
        }

        if (detailError) {
            return (
                <div className="admin-error">
                    <div className="admin-error-icon">⚠️</div>
                    <p>詳細データの読み込みに失敗しました</p>
                    <p className="admin-error-detail">{detailError}</p>
                    <button className="admin-retry-btn" onClick={() => handleSelectUser(selectedUserId)}>
                        🔄 もう一度読み込む
                    </button>
                    <button className="admin-back-btn" onClick={handleBackToList} style={{ marginTop: '12px' }}>
                        ← 一覧に戻る
                    </button>
                </div>
            )
        }

        if (!userDetail) {
            return <div className="admin-loading">📡 データを読み込んでいます...</div>
        }

        const userRadarData = {
            labels: ATTR_KEYS.map(k => ATTR_NAMES[k]),
            datasets: [{
                label: userDetail.name,
                data: ATTR_KEYS.map(k => userDetail.scores[k]?.normalized || 0),
                backgroundColor: 'rgba(0, 178, 95, 0.12)',
                borderColor: 'rgba(0, 178, 95, 0.7)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(0, 178, 95, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
            }],
        }

        return (
            <div className="admin-user-detail">
                <div className="admin-detail-top-bar">
                    <button className="admin-back-btn" onClick={handleBackToList}>
                        ← 一覧に戻る
                    </button>
                    <button
                        className="admin-detail-pdf-btn"
                        onClick={() => handleDownloadUserPDF(userDetail.name)}
                        disabled={isGeneratingPDF}
                        id="admin-pdf-download-btn"
                    >
                        {isGeneratingPDF ? '⏳ 作成中...' : '📄 PDFをダウンロード'}
                    </button>
                </div>

                <div ref={reportRef}>
                    <div className="admin-user-header">
                        <h2>📋 {userDetail.name} の詳細</h2>
                        <div className="admin-user-meta">
                            <span>診断日: {userDetail.createdAt?.split('T')[0]}</span>
                            <span>確信度: {userDetail.confidenceLevel}</span>
                            <span>マッチ1位: {userDetail.topJob} ({userDetail.matchScore}%)</span>
                        </div>
                    </div>

                    <div className="admin-detail-charts">
                        {/* 個人レーダーチャート */}
                        <div className="admin-detail-card">
                            <h3>🔷 属性スコア</h3>
                            <div className="admin-chart-wrapper">
                                <Radar data={userRadarData} options={radarOptions} />
                            </div>
                        </div>
                    </div>

                    {/* メタデータ */}
                    <div className="admin-detail-card" style={{ marginBottom: 'var(--space-6)' }}>
                        <h3>📋 回答メタデータ</h3>
                        <div className="admin-metadata-grid">
                            <div className="admin-metadata-item">
                                <div className="metadata-value">{formatTotalTime(userDetail) || '—'}</div>
                                <div className="metadata-label">回答時間</div>
                            </div>
                            <div className="admin-metadata-item">
                                <div className="metadata-value">{userDetail.confidenceLevel}</div>
                                <div className="metadata-label">確信度</div>
                            </div>
                            <div className="admin-metadata-item">
                                <div className="metadata-value">{userDetail.contradictions?.length || 0}項目</div>
                                <div className="metadata-label">矛盾フラグ</div>
                            </div>
                        </div>
                    </div>

                    {/* ========== レポート詳細エリア ========== */}
                    {renderReportDetail()}

                    {/* 自由記述 */}
                    {userDetail.freeTexts && userDetail.freeTexts.length > 0 && (
                        <div className="admin-free-texts">
                            <h3>💬 自由記述</h3>
                            {userDetail.freeTexts.map((text, i) => (
                                <div key={i} className="admin-free-text-item">{text}</div>
                            ))}
                        </div>
                    )}
                </div>{/* end of reportRef */}
            </div>
        )
    }
    // ============================================================
    // レポート詳細エリア（ResultScreenと同等の情報を管理者向けに表示）
    // ============================================================
    function renderReportDetail() {
        if (!userDetail?.scores) return null

        // スコアから解析結果を再計算
        const scores = userDetail.scores
        const summary = generateExecutiveSummary(scores)
        const strengths = generateStrengthDescriptions(scores)
        const jobMatches = calculateJobMatches(scores)
        const recommendations = getTopRecommendations(jobMatches)
        const accommodations = generateAccommodations(scores)
        const actionPlan = generateActionPlan(scores, recommendations)

        return (
            <div className="admin-report-detail">
                <div className="admin-report-divider">
                    <span>📄 レポート詳細</span>
                </div>

                {/* サマリー */}
                <div className="admin-detail-card" style={{ marginBottom: 'var(--space-6)', borderLeft: '4px solid var(--color-primary-500)' }}>
                    <h3>✨ エグゼクティブ・サマリー</h3>
                    <p className="admin-summary-text">{summary}</p>
                </div>

                {/* 強みの解説テーブル */}
                <div className="admin-detail-card" style={{ marginBottom: 'var(--space-6)' }}>
                    <h3>💪 強みの解説</h3>
                    <table className="admin-report-table">
                        <thead>
                            <tr>
                                <th>属性</th>
                                <th>スコア</th>
                                <th>レベル</th>
                                <th>解説（利用者に表示された内容）</th>
                            </tr>
                        </thead>
                        <tbody>
                            {strengths.map(s => (
                                <tr key={s.attributeId} className={userDetail.contradictions?.includes(s.attributeId) ? 'is-flagged' : ''}>
                                    <td className="report-attr-name">{s.name}</td>
                                    <td className="report-score">
                                        <span className={`report-score-badge level-${s.level === '高い' ? 'high' : s.level === '中くらい' ? 'mid' : 'low'}`}>
                                            {s.normalizedScore}/5
                                        </span>
                                    </td>
                                    <td className="report-level">{s.level}</td>
                                    <td className="report-desc">{s.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 適職 TOP5 */}
                <div className="admin-detail-card" style={{ marginBottom: 'var(--space-6)' }}>
                    <h3>🎯 推奨職種 TOP5</h3>
                    <table className="admin-report-table">
                        <thead>
                            <tr>
                                <th>順位</th>
                                <th>職種名</th>
                                <th>カテゴリー</th>
                                <th>マッチ度</th>
                                <th>分類</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recommendations.bestMatches.map((match, i) => (
                                <tr key={match.job.id} className="is-best-match">
                                    <td className="report-rank rank-best">{i + 1}</td>
                                    <td className="report-job-name">{match.job.name}</td>
                                    <td>{match.job.categoryIcon} {match.job.categoryName}</td>
                                    <td className="report-match-score">{match.matchScore}%</td>
                                    <td><span className="tag tag-strength">ベストマッチ</span></td>
                                </tr>
                            ))}
                            {recommendations.possibilities.map((match, i) => (
                                <tr key={match.job.id}>
                                    <td className="report-rank">{i + 4}</td>
                                    <td className="report-job-name">{match.job.name}</td>
                                    <td>{match.job.categoryIcon} {match.job.categoryName}</td>
                                    <td className="report-match-score">{match.matchScore}%</td>
                                    <td><span className="tag tag-confidence-mid">可能性</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 環境への処方箋 */}
                {accommodations.length > 0 && (
                    <div className="admin-detail-card" style={{ marginBottom: 'var(--space-6)', borderLeft: '4px solid var(--color-accent-400)' }}>
                        <h3>💊 環境への処方箋（合理的配慮の案）</h3>
                        <p className="admin-accommodations-intro">低スコア属性に基づき、企業へ伝えるべき配慮事項の案です。</p>
                        <table className="admin-report-table">
                            <thead>
                                <tr>
                                    <th>属性</th>
                                    <th>提案内容</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accommodations.map(item => (
                                    <tr key={item.attributeId}>
                                        <td className="report-attr-name">{item.name}</td>
                                        <td>{item.suggestion}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* アクションプラン（控えめ表示） */}
                <div className="admin-action-plan-subtle">
                    <details>
                        <summary>🚀 利用者に表示されたアクションプラン</summary>
                        <p className="admin-action-plan-text">{actionPlan}</p>
                    </details>
                </div>
            </div>
        )
    }
}

// ヘルパー
function getConfidenceClass(level) {
    if (level === '高い') return 'high'
    if (level === '中') return 'mid'
    return 'low'
}

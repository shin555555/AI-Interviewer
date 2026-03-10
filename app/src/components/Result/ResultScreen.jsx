import { useMemo, useRef, useCallback, useState, useEffect } from 'react'
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import { calculateAttributeScores } from '../../utils/scoreCalculator'
import { calculateJobMatches, getTopRecommendations, calculateExperienceScores } from '../../utils/jobMatcher'
import { generateStrengthDescriptions, generateExecutiveSummary, generateAccommodations, generateActionPlan } from '../../utils/strengthDescriptions'
import { generatePDF } from '../../utils/pdfGenerator'
import { saveUserResult } from '../../utils/spreadsheetAPI'
import './ResultScreen.css'

// Chart.js の登録
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

/**
 * ResultScreen - インタビュー完了後の結果表示画面
 * 
 * - エグゼクティブ・サマリー（3行要約）
 * - ダブル・レーダーチャート（仕事の進め方 / 心の持ち方）
 * - 強みの言語化（やさしい日本語）
 * - 推奨職種 TOP5（ベストマッチ3 + 可能性2）
 * - メタデータ（回答時間、確信度等）
 */
export default function ResultScreen({ answers, userName = '', onBack }) {
    // 保存ステータス
    const [saveStatus, setSaveStatus] = useState('saving') // 'saving' | 'saved' | 'error'
    // 全ての解析を実行
    const analysis = useMemo(() => {
        const attrResult = calculateAttributeScores(answers)
        const experienceScores = calculateExperienceScores(answers)
        const jobMatches = calculateJobMatches(attrResult.scores, experienceScores)
        const recommendations = getTopRecommendations(jobMatches)
        const strengths = generateStrengthDescriptions(attrResult.scores)
        const summary = generateExecutiveSummary(attrResult.scores)
        const accommodations = generateAccommodations(attrResult.scores)
        const actionPlan = generateActionPlan(attrResult.scores, recommendations)

        return {
            ...attrResult,
            jobMatches,
            recommendations,
            strengths,
            summary,
            accommodations,
            actionPlan,
        }
    }, [answers])

    // --- GASへの自動保存 ---
    const hasSaved = useRef(false)

    const saveData = useCallback(async () => {
        if (!analysis) return
        // 二重送信防止
        if (hasSaved.current && saveStatus !== 'error') return
        hasSaved.current = true

        setSaveStatus('saving')

        const sessionData = localStorage.getItem('wp_session')
        let sessionKey = ''
        try {
            const parsed = JSON.parse(sessionData || '{}')
            sessionKey = parsed.sessionCode || ''
        } catch (e) { /* ignore */ }

        // 推奨職種TOP1の情報を取得
        const top1 = analysis.recommendations.bestMatches[0]

        // カテゴリートレンドを計算（最もマッチ度の高いカテゴリー）
        const categoryCount = {}
        analysis.recommendations.bestMatches.forEach(m => {
            const cat = m.job.categoryName
            categoryCount[cat] = (categoryCount[cat] || 0) + 1
        })
        const topCategory = Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || ''

        const userData = {
            userId: userName || sessionKey,
            userName: userName,
            sessionKey: sessionKey,
            scores: analysis.scores,
            metadata: analysis.metadata,
            contradictions: analysis.contradictions,
            answers: answers,
            topJob: top1?.job.name || '',
            topMatchScore: top1?.matchScore || 0,
            categoryTrend: topCategory,
        }

        try {
            const res = await saveUserResult(userData)
            if (res.success || res.id) {
                setSaveStatus('saved')
                localStorage.removeItem('wp_session')
            } else {
                console.warn('保存結果:', res)
                setSaveStatus('saved')
            }
        } catch (err) {
            console.error('データの保存に失敗しました:', err)
            hasSaved.current = false  // エラー時はリトライ可能にする
            setSaveStatus('error')
        }
    }, [analysis, answers, userName, saveStatus])

    useEffect(() => {
        saveData()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // --- レーダーチャートデータ ---
    const workStyleChartData = {
        labels: analysis.workStyleScores.map(s => s.name),
        datasets: [{
            label: '仕事の進め方',
            data: analysis.workStyleScores.map(s => s.normalized),
            backgroundColor: 'rgba(33, 150, 243, 0.15)',
            borderColor: 'rgba(33, 150, 243, 0.8)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(33, 150, 243, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
        }],
    }

    const mindsetChartData = {
        labels: analysis.mindsetScores.map(s => s.name),
        datasets: [{
            label: '心の持ち方',
            data: analysis.mindsetScores.map(s => s.normalized),
            backgroundColor: 'rgba(0, 178, 95, 0.15)',
            borderColor: 'rgba(0, 178, 95, 0.8)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(0, 178, 95, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
        }],
    }

    const radarOptions = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            r: {
                min: 0,
                max: 5,
                ticks: {
                    stepSize: 1,
                    font: { size: 11 },
                    backdropColor: 'transparent',
                },
                pointLabels: {
                    font: { size: 13, weight: '600' },
                    color: '#495057',
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.06)',
                },
                angleLines: {
                    color: 'rgba(0, 0, 0, 0.06)',
                },
            },
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.label}: ${context.raw}/5`,
                },
            },
        },
    }

    // 矛盾のある属性IDセット
    const contradictionIds = new Set(analysis.contradictions.map(c => c.attributeId))

    // PDF生成
    const pdfContentRef = useRef(null)
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

    const handleDownloadPDF = useCallback(async () => {
        if (!pdfContentRef.current) return
        setIsGeneratingPDF(true)
        try {
            await generatePDF(pdfContentRef.current, 'ワーク・プロファイル')
        } catch (err) {
            console.error('PDF生成に失敗しました:', err)
            alert('PDF生成に失敗しました。もう一度お試しください。')
        } finally {
            setIsGeneratingPDF(false)
        }
    }, [])

    return (
        <div className="result-screen">
            {/* ヘッダー */}
            <header className="result-header">
                <h1>あなたのプロフィール</h1>
                <p>AIワーク・プロファイル 診断結果</p>
                <button
                    className="pdf-download-btn"
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    id="pdf-download-btn"
                >
                    {isGeneratingPDF ? '⏳ 作成中...' : '📄 PDFをダウンロード'}
                </button>
                {/* 保存ステータス表示 */}
                {saveStatus === 'saving' && (
                    <span className="save-status is-saving">📡 データを保存しています...</span>
                )}
                {saveStatus === 'saved' && (
                    <span className="save-status is-saved">✅ 保存しました</span>
                )}
                {saveStatus === 'error' && (
                    <div className="save-status is-error">
                        <span>⚠️ データの保存に失敗しました</span>
                        <button className="retry-btn" onClick={saveData} id="retry-save-btn">
                            🔄 もう一度保存する
                        </button>
                    </div>
                )}
            </header>

            <div className="result-content" id="pdf-content" ref={pdfContentRef}>
                {/* エグゼクティブ・サマリー */}
                <div className="result-summary-card" id="executive-summary">
                    <div className="summary-icon">✨</div>
                    <h2>あなたの強み</h2>
                    <p className="summary-text">{analysis.summary}</p>
                </div>

                {/* ダブル・レーダーチャート */}
                <h2 className="result-section-title">
                    <span className="section-icon">📊</span>
                    あなたの特性
                </h2>
                <div className="radar-charts-container" id="radar-charts">
                    <div className="radar-chart-card">
                        <h3>🔧 仕事の進め方（Work Style）</h3>
                        <div className="radar-chart-wrapper">
                            <Radar data={workStyleChartData} options={radarOptions} />
                        </div>
                    </div>
                    <div className="radar-chart-card">
                        <h3>💭 心の持ち方（Mindset）</h3>
                        <div className="radar-chart-wrapper">
                            <Radar data={mindsetChartData} options={radarOptions} />
                        </div>
                    </div>
                </div>

                {/* 強みの解説 */}
                <h2 className="result-section-title">
                    <span className="section-icon">💪</span>
                    あなたの力
                </h2>
                <div className="strengths-grid" id="strengths">
                    {analysis.strengths.map(strength => (
                        <div
                            key={strength.attributeId}
                            className={`strength-card ${contradictionIds.has(strength.attributeId) ? 'is-contradiction' : ''}`}
                        >
                            <div className="strength-card-header">
                                <span className="strength-name">{strength.name}</span>
                                <span className="strength-score-badge">
                                    {strength.normalizedScore}/5
                                </span>
                            </div>
                            <p className="strength-description">{strength.description}</p>
                            {contradictionIds.has(strength.attributeId) && (
                                <span className="contradiction-badge">
                                    ⚡ 場面によって変わることがあります
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* 推奨職種 TOP5 */}
                <h2 className="result-section-title">
                    <span className="section-icon">🎯</span>
                    あなたに合った仕事
                </h2>
                <div className="job-recommendations" id="job-recommendations">
                    {/* ベストマッチ（1〜3位） */}
                    <h3 className="job-group-title">⭐ ベストマッチ</h3>
                    {analysis.recommendations.bestMatches.map((match, i) => (
                        <div key={match.job.id} className="job-card">
                            <div className={`job-rank rank-${i + 1}`}>{i + 1}</div>
                            <div className="job-info">
                                <div className="job-name">{match.job.name}</div>
                                <div className="job-category-label">
                                    {match.job.categoryIcon} {match.job.categoryName}
                                </div>
                            </div>
                            <div className="job-score">
                                <div className="job-score-value">{match.matchScore}</div>
                                <div className="job-score-label">マッチ度</div>
                            </div>
                        </div>
                    ))}

                    {/* 可能性の広がり（4〜5位） */}
                    {analysis.recommendations.possibilities.length > 0 && (
                        <>
                            <h3 className="job-group-title is-possibility" style={{ marginTop: 'var(--space-6)' }}>
                                🌱 可能性の広がり
                            </h3>
                            {analysis.recommendations.possibilities.map((match, i) => (
                                <div key={match.job.id} className="job-card">
                                    <div className={`job-rank rank-${i + 4}`}>{i + 4}</div>
                                    <div className="job-info">
                                        <div className="job-name">{match.job.name}</div>
                                        <div className="job-category-label">
                                            {match.job.categoryIcon} {match.job.categoryName}
                                        </div>
                                    </div>
                                    <div className="job-score">
                                        <div className="job-score-value">{match.matchScore}</div>
                                        <div className="job-score-label">マッチ度</div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {/* メタデータ */}
                <h2 className="result-section-title">
                    <span className="section-icon">📋</span>
                    回答の概要
                </h2>
                <div className="metadata-card" id="metadata">
                    <div className="metadata-grid">
                        <div className="metadata-item">
                            <div className="metadata-value">{analysis.metadata.totalTimeFormatted}</div>
                            <div className="metadata-label">合計時間</div>
                        </div>
                        <div className="metadata-item">
                            <div className="metadata-value">{analysis.metadata.confidenceLevel}</div>
                            <div className="metadata-label">確信度</div>
                        </div>
                        <div className="metadata-item">
                            <div className="metadata-value">{analysis.metadata.intuitiveCount}問</div>
                            <div className="metadata-label">直感的な回答</div>
                        </div>
                        <div className="metadata-item">
                            <div className="metadata-value">{analysis.contradictions.length}項目</div>
                            <div className="metadata-label">場面による変動</div>
                        </div>
                    </div>
                </div>

                {/* 環境への処方箋 */}
                {analysis.accommodations.length > 0 && (
                    <>
                        <h2 className="result-section-title">
                            <span className="section-icon">💊</span>
                            企業に伝えたい配慮のポイント
                        </h2>
                        <div className="accommodations-card" id="accommodations">
                            <p className="accommodations-intro">
                                あなたが安心して働くために、企業にお願いできることの例です。
                            </p>
                            <ul className="accommodations-list">
                                {analysis.accommodations.map(item => (
                                    <li key={item.attributeId} className="accommodation-item">
                                        <span className="accommodation-attr">{item.name}</span>
                                        <span className="accommodation-text">{item.suggestion}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                )}

                {/* アクションプラン */}
                <h2 className="result-section-title">
                    <span className="section-icon">🚀</span>
                    次のステップ
                </h2>
                <div className="action-plan-card" id="action-plan">
                    <p className="action-plan-text">{analysis.actionPlan}</p>
                </div>

                {/* 終了ボタン */}
                <div className="result-end-actions" id="result-end-actions">
                    {onBack && (
                        <button
                            className="btn-end-back"
                            onClick={onBack}
                            id="end-back-btn"
                        >
                            🏠 トップに戻る
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

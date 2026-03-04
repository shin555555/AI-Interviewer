import { useMemo } from 'react'
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
import { calculateJobMatches, getTopRecommendations } from '../../utils/jobMatcher'
import { generateStrengthDescriptions, generateExecutiveSummary } from '../../utils/strengthDescriptions'
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
export default function ResultScreen({ answers }) {
    // 全ての解析を実行
    const analysis = useMemo(() => {
        const attrResult = calculateAttributeScores(answers)
        const jobMatches = calculateJobMatches(attrResult.scores)
        const recommendations = getTopRecommendations(jobMatches)
        const strengths = generateStrengthDescriptions(attrResult.scores)
        const summary = generateExecutiveSummary(attrResult.scores)

        return {
            ...attrResult,
            jobMatches,
            recommendations,
            strengths,
            summary,
        }
    }, [answers])

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

    return (
        <div className="result-screen">
            {/* ヘッダー */}
            <header className="result-header">
                <h1>あなたのプロフィール</h1>
                <p>AIワーク・プロファイル 診断結果</p>
            </header>

            <div className="result-content">
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
            </div>
        </div>
    )
}

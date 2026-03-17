import { useRef, useState } from 'react'
import { TAGS } from '../../data/deepDiveData'
import { generatePDF } from '../../utils/pdfGenerator'
import './DeepDiveResultScreen.css'

/**
 * DeepDiveResultScreen - 深掘り対話モードの結果画面
 *
 * 「私のトリセツ」「強みの見つけ方カード」「支援員さんへのお願いシート」を表示する。
 */
export default function DeepDiveResultScreen({ data, onBack }) {
    const {
        userName, torisetsu, advocacyCards, reframings, accumulatedTags,
        deepAnalysis, profileNarrative, values, tensions, copingStrategies,
    } = data
    const pdfContentRef = useRef(null)
    const [isPdfGenerating, setIsPdfGenerating] = useState(false)

    // タグの出現頻度から上位の強みタグを算出
    const tagCounts = {}
    accumulatedTags.forEach(t => {
        tagCounts[t] = (tagCounts[t] || 0) + 1
    })
    const topTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tagId]) => TAGS[tagId])
        .filter(Boolean)

    // PDF生成ハンドラ
    const handleDownloadPDF = async () => {
        if (!pdfContentRef.current || isPdfGenerating) return
        setIsPdfGenerating(true)
        try {
            await generatePDF(pdfContentRef.current, `${userName}_対話レポート`)
        } finally {
            setIsPdfGenerating(false)
        }
    }

    return (
        <div className="ddresult-screen">
            <header className="ddresult-header">
                <h1 className="ddresult-title">{userName}さんの対話レポート</h1>
                <p className="ddresult-subtitle">対話を通じて見えてきた、あなたの特徴と強み</p>
            </header>

            {/* PDF化対象エリア */}
            <main className="ddresult-main" id="pdf-content" ref={pdfContentRef}>
                {/* セクション1: あなたの特徴 */}
                <section className="ddresult-section ddresult-tags-section">
                    <h2 className="ddresult-section-title">あなたの特徴</h2>
                    <div className="ddresult-tag-chips">
                        {topTags.map((tag) => (
                            <span
                                key={tag.id}
                                className={`ddresult-tag-chip ddresult-tag-${tag.category}`}
                            >
                                {tag.label}
                            </span>
                        ))}
                    </div>
                </section>

                {/* セクション2: 深層分析（対話から見えた深い傾向） */}
                {deepAnalysis && deepAnalysis.length > 0 && (
                    <section className="ddresult-section ddresult-deep-analysis">
                        <h2 className="ddresult-section-title">対話から見えてきた、あなたの深い傾向</h2>
                        <p className="ddresult-deep-analysis-intro">
                            回答の組み合わせを分析し、表面的な回答だけでは見えない{userName}さんの傾向をまとめました。
                        </p>
                        <div className="ddresult-deep-analysis-cards">
                            {deepAnalysis.map((pattern, i) => (
                                <div key={i} className="ddresult-deep-analysis-card">
                                    <h3 className="ddresult-deep-analysis-title">{pattern.title}</h3>
                                    <p className="ddresult-deep-analysis-insight">{pattern.insight}</p>
                                    <div className="ddresult-deep-analysis-deeper">
                                        <span className="ddresult-deeper-label">その奥にあるもの</span>
                                        <p className="ddresult-deeper-text">{pattern.deeperMeaning}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* セクション3: 動機・価値観 */}
                {values && values.length > 0 && (
                    <section className="ddresult-section ddresult-values">
                        <h2 className="ddresult-section-title">{userName}さんを動かしているもの</h2>
                        <p className="ddresult-values-intro">
                            回答パターンから推定された、{userName}さんの根底にある動機と価値観です。
                        </p>
                        <div className="ddresult-values-cards">
                            {values.map((v, i) => (
                                <div key={i} className="ddresult-value-card">
                                    <h3 className="ddresult-value-name">{v.name}</h3>
                                    <p className="ddresult-value-description">{v.description}</p>
                                    <div className="ddresult-value-psych">
                                        <span className="ddresult-psych-label">心理学の知見</span>
                                        <p className="ddresult-psych-note">{v.psychNote}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* セクション4: 内的な葛藤（あなたの中の対話） */}
                {tensions && tensions.length > 0 && (
                    <section className="ddresult-section ddresult-tensions">
                        <h2 className="ddresult-section-title">あなたの中にある「二つの声」</h2>
                        <p className="ddresult-tensions-intro">
                            一見矛盾するように見える二つの傾向が見つかりました。これは弱さではなく、{userName}さんの心の「奥行き」を示しています。
                        </p>
                        <div className="ddresult-tensions-cards">
                            {tensions.map((t, i) => (
                                <div key={i} className="ddresult-tension-card">
                                    <h3 className="ddresult-tension-title">{t.title}</h3>
                                    <p className="ddresult-tension-analysis">{t.analysis}</p>
                                    <div className="ddresult-tension-advice">
                                        <strong>この葛藤との付き合い方:</strong>
                                        <p>{t.advice}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* セクション5: 私のトリセツ */}
                <section className="ddresult-section ddresult-torisetsu">
                    <h2 className="ddresult-section-title">私のトリセツ（取りあつかい説明書）</h2>

                    {torisetsu.strengths?.items?.length > 0 && (
                        <div className="ddresult-torisetsu-block">
                            <h3 className="ddresult-block-title">{torisetsu.strengths.title}</h3>
                            <ul className="ddresult-block-list">
                                {torisetsu.strengths.items.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {torisetsu.comfortZone?.items?.length > 0 && (
                        <div className="ddresult-torisetsu-block">
                            <h3 className="ddresult-block-title">{torisetsu.comfortZone.title}</h3>
                            <ul className="ddresult-block-list">
                                {torisetsu.comfortZone.items.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {torisetsu.challenges?.items?.length > 0 && (
                        <div className="ddresult-torisetsu-block">
                            <h3 className="ddresult-block-title">{torisetsu.challenges.title}</h3>
                            <ul className="ddresult-block-list">
                                {torisetsu.challenges.items.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>

                {/* セクション6: 対処法アドバイス */}
                {copingStrategies && copingStrategies.length > 0 && (
                    <section className="ddresult-section ddresult-coping">
                        <h2 className="ddresult-section-title">つらいときの対処法ガイド</h2>
                        <p className="ddresult-coping-intro">
                            {userName}さんの特徴に合わせた、心理学にもとづく具体的な対処法です。
                        </p>
                        <div className="ddresult-coping-cards">
                            {copingStrategies.map((s, i) => (
                                <div key={i} className="ddresult-coping-card">
                                    <h3 className="ddresult-coping-technique">{s.technique}</h3>
                                    <p className="ddresult-coping-when">
                                        <strong>こんなときに:</strong> {s.whenToUse}
                                    </p>
                                    <p className="ddresult-coping-description">{s.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* セクション7: あなたのプロファイル */}
                {profileNarrative && (
                    <section className="ddresult-section ddresult-narrative">
                        <h2 className="ddresult-section-title">{userName}さんの全体像</h2>
                        <div className="ddresult-narrative-text">
                            {profileNarrative.split('\n\n').map((paragraph, i) => (
                                <p key={i}>{paragraph}</p>
                            ))}
                        </div>
                    </section>
                )}

                {/* セクション8: 強みの見つけ方カード */}
                {reframings.length > 0 && (
                    <section className="ddresult-section ddresult-reframing">
                        <h2 className="ddresult-section-title">「苦手」を「強み」に変えるカード</h2>
                        <div className="ddresult-reframing-cards">
                            {reframings.map((r, i) => (
                                <div key={i} className="ddresult-reframing-card">
                                    <div className="ddresult-reframing-negative">
                                        「{r.negative}」
                                    </div>
                                    <div className="ddresult-reframing-arrow">
                                        ↓ 見方を変えると…
                                    </div>
                                    <div className="ddresult-reframing-positive">
                                        「{r.positive}」
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* セクション9: 支援員さんへのお願いシート */}
                {advocacyCards.length > 0 && (
                    <section className="ddresult-section ddresult-advocacy">
                        <h2 className="ddresult-section-title">支援員さんへのお願いシート</h2>
                        <p className="ddresult-advocacy-intro">
                            この内容を支援員さんに見せると、{userName}さんのことをもっと分かってもらえます。
                        </p>
                        <div className="ddresult-advocacy-cards">
                            {advocacyCards.map((card, i) => (
                                <div key={i} className="ddresult-advocacy-card">
                                    <h4 className="ddresult-advocacy-title">{card.title}</h4>
                                    <p className="ddresult-advocacy-staff">{card.forStaff}</p>
                                    <div className="ddresult-advocacy-suggestion">
                                        <strong>おすすめの関わり方:</strong> {card.suggestion}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* フッター */}
            <footer className="ddresult-footer">
                <button
                    className="ddresult-pdf-btn"
                    onClick={handleDownloadPDF}
                    disabled={isPdfGenerating}
                >
                    {isPdfGenerating ? 'PDF作成中...' : 'PDFをダウンロード'}
                </button>
                <button className="ddresult-back-btn" onClick={onBack}>
                    トップに戻る
                </button>
            </footer>
        </div>
    )
}

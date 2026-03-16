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
    const { userName, torisetsu, advocacyCards, reframings, accumulatedTags } = data
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

                {/* セクション2: 私のトリセツ */}
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

                {/* セクション3: 強みの見つけ方カード */}
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

                {/* セクション4: 支援員さんへのお願いシート */}
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

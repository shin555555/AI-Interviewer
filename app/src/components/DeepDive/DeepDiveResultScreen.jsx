import { TAGS } from '../../data/deepDiveData'
import './DeepDiveResultScreen.css'

/**
 * DeepDiveResultScreen - 深掘り対話モードの結果画面
 *
 * 「私のトリセツ」「リフレーミングカード」「代弁シート」を表示する。
 */
export default function DeepDiveResultScreen({ data, onBack }) {
    const { userName, torisetsu, advocacyCards, reframings, accumulatedTags } = data

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

    return (
        <div className="ddresult-screen">
            <header className="ddresult-header">
                <h1 className="ddresult-title">{userName}さんの対話レポート</h1>
                <p className="ddresult-subtitle">深掘り対話を通じて見えてきた、あなたの特徴と強み</p>
            </header>

            <main className="ddresult-main">
                {/* セクション1: タグサマリー */}
                <section className="ddresult-section ddresult-tags-section">
                    <h2 className="ddresult-section-title">あなたの特徴</h2>
                    <div className="ddresult-tag-chips">
                        {topTags.map((tag, i) => (
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
                    <h2 className="ddresult-section-title">私のトリセツ（取扱説明書）</h2>

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

                {/* セクション3: リフレーミングカード */}
                {reframings.length > 0 && (
                    <section className="ddresult-section ddresult-reframing">
                        <h2 className="ddresult-section-title">ネガティブのポジティブ変換カード</h2>
                        <div className="ddresult-reframing-cards">
                            {reframings.map((r, i) => (
                                <div key={i} className="ddresult-reframing-card">
                                    <div className="ddresult-reframing-negative">
                                        「{r.negative}」
                                    </div>
                                    <div className="ddresult-reframing-arrow">
                                        ↓
                                    </div>
                                    <div className="ddresult-reframing-positive">
                                        「{r.positive}」
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* セクション4: 支援員への代弁カード */}
                {advocacyCards.length > 0 && (
                    <section className="ddresult-section ddresult-advocacy">
                        <h2 className="ddresult-section-title">支援員さんへの代弁シート</h2>
                        <p className="ddresult-advocacy-intro">
                            以下の内容を支援員さんに見せることで、{userName}さんのことをより理解してもらえます。
                        </p>
                        <div className="ddresult-advocacy-cards">
                            {advocacyCards.map((card, i) => (
                                <div key={i} className="ddresult-advocacy-card">
                                    <h4 className="ddresult-advocacy-title">{card.title}</h4>
                                    <p className="ddresult-advocacy-staff">{card.forStaff}</p>
                                    <div className="ddresult-advocacy-suggestion">
                                        <strong>おすすめの対応:</strong> {card.suggestion}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* フッター */}
            <footer className="ddresult-footer">
                <button className="ddresult-back-btn" onClick={onBack}>
                    トップに戻る
                </button>
            </footer>
        </div>
    )
}

import { useState, useEffect, useRef, useCallback } from 'react'
import ChatBubble from '../Interview/ChatBubble'
import ChoiceButtons from '../Interview/ChoiceButtons'
import {
    ROUTES,
    PHASES,
    TAGS,
    selectQuestion,
    findBestBlock,
    fillTemplate,
    generateTorisetsu,
    generateAdvocacyCards,
    findReframings,
    getPhaseForTurn,
} from '../../data/deepDiveData'
import './DeepDiveScreen.css'

/**
 * DeepDiveScreen - 深掘り対話モードのメイン画面
 *
 * チャット形式のUI。約10ターンの対話を通じて
 * 利用者の強みを発見し、「私のトリセツ」を生成する。
 */
export default function DeepDiveScreen({ userName, onComplete, onBack }) {
    // --- 状態管理 ---
    const [routeId, setRouteId] = useState(null)           // 選択されたルートID
    const [actualRouteId, setActualRouteId] = useState(null) // お任せ時の実ルートID
    const [turn, setTurn] = useState(0)                     // 現在のターン番号（0=ルート選択前）
    const [messages, setMessages] = useState([])             // チャット履歴
    const [currentQuestion, setCurrentQuestion] = useState(null)
    const [accumulatedTags, setAccumulatedTags] = useState([])
    const [keywords, setKeywords] = useState([])             // ユーザーキーワード履歴
    const [usedQuestionIds, setUsedQuestionIds] = useState([])
    const [freetextValue, setFreetextValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)          // AI入力中アニメーション
    const [showFreetext, setShowFreetext] = useState(false)
    const [sessionComplete, setSessionComplete] = useState(false)

    const chatEndRef = useRef(null)
    const freetextRef = useRef(null)

    // --- 自動スクロール ---
    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping, scrollToBottom])

    // --- AIメッセージの追加（タイピングアニメーション付き） ---
    const addAIMessage = useCallback((text, delay = 800) => {
        return new Promise((resolve) => {
            setIsTyping(true)
            setTimeout(() => {
                setIsTyping(false)
                setMessages(prev => [...prev, { type: 'system', text }])
                resolve()
            }, delay)
        })
    }, [])

    // --- ユーザーメッセージの追加 ---
    const addUserMessage = useCallback((text) => {
        setMessages(prev => [...prev, { type: 'user', text }])
    }, [])

    // --- ルート選択画面の初期メッセージ ---
    useEffect(() => {
        if (messages.length === 0) {
            addAIMessage(
                `${userName}さん、こんにちは。\n今日はどんなテーマでお話ししましょうか？\n下のカードから選んでください。`,
                500
            )
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // --- ルート選択ハンドラ ---
    const handleRouteSelect = async (route) => {
        addUserMessage(route.label)
        setRouteId(route.id)

        // お任せの場合はランダムにルートを選ぶ
        const resolvedRoute = route.id === 'omakase'
            ? ['moyamoya', 'dekitakoto', 'torisetsu'][Math.floor(Math.random() * 3)]
            : route.id
        setActualRouteId(resolvedRoute)

        if (route.id === 'omakase') {
            const routeLabels = {
                moyamoya: 'モヤモヤを話してみる',
                dekitakoto: 'できたことを見つける',
                torisetsu: '自分のトリセツを作る',
            }
            await addAIMessage(`いいですね。今日は「${routeLabels[resolvedRoute]}」をテーマにしましょう。`, 600)
        }

        // ターン1の質問を開始
        startTurn(1, resolvedRoute)
    }

    // --- 新しいターンを開始 ---
    const startTurn = useCallback((turnNum, rId = null) => {
        const route = rId || actualRouteId
        const phase = getPhaseForTurn(turnNum)
        const question = selectQuestion(route, phase.id, usedQuestionIds)

        if (!question) {
            // 質問が見つからない場合はサマリーフェーズへ
            finishSession(route)
            return
        }

        setTurn(turnNum)
        setUsedQuestionIds(prev => [...prev, question.id])
        setCurrentQuestion(question)
        setShowFreetext(false)
        setFreetextValue('')

        // テンプレート変数を解決してAIメッセージを追加
        const latestKeyword = keywords.length > 0 ? keywords[keywords.length - 1] : 'そのこと'
        const topStrength = findTopStrength()

        const text = fillTemplate(question.text, {
            userName,
            keyword: latestKeyword,
            strengthLabel: topStrength,
        })

        addAIMessage(text, turnNum === 1 ? 1200 : 900)
    }, [actualRouteId, usedQuestionIds, keywords, userName, addAIMessage]) // eslint-disable-line react-hooks/exhaustive-deps

    // --- 蓄積タグから最も多い強みラベルを取得 ---
    const findTopStrength = () => {
        const strengthTags = accumulatedTags.filter(t => TAGS[t]?.category === 'strength')
        if (strengthTags.length === 0) return '前向きに取り組む力'
        const counts = {}
        strengthTags.forEach(t => { counts[t] = (counts[t] || 0) + 1 })
        const topTag = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
        return TAGS[topTag]?.label || '前向きに取り組む力'
    }

    // --- 選択肢の確定ハンドラ ---
    const handleChoiceConfirm = async (choiceIndex) => {
        if (!currentQuestion) return

        const choice = currentQuestion.choices[choiceIndex]
        addUserMessage(choice.label)

        // タグ蓄積
        const newTags = [...accumulatedTags, ...(choice.tags || [])]
        setAccumulatedTags(newTags)

        // キーワード記録
        setKeywords(prev => [...prev, choice.label])

        // 自由記述を表示
        if (currentQuestion.freetext) {
            setShowFreetext(true)
            return
        }

        // 次のターンへ進む
        proceedToNextTurn(newTags)
    }

    // --- 自由記述の送信ハンドラ ---
    const handleFreetextSubmit = () => {
        if (freetextValue.trim()) {
            addUserMessage(freetextValue.trim())
            setKeywords(prev => [...prev, freetextValue.trim()])
        }
        setShowFreetext(false)
        setFreetextValue('')
        proceedToNextTurn(accumulatedTags)
    }

    // --- 自由記述をスキップ ---
    const handleFreetextSkip = () => {
        setShowFreetext(false)
        setFreetextValue('')
        proceedToNextTurn(accumulatedTags)
    }

    // --- 次のターンへの遷移 ---
    const proceedToNextTurn = async (currentTags) => {
        const nextTurn = turn + 1
        const currentPhase = getPhaseForTurn(turn)
        const nextPhase = getPhaseForTurn(nextTurn)

        // フェーズが変わるときにテンプレートブロック（共感・課題・リフレーミング）を挿入
        if (currentPhase.id !== nextPhase.id) {
            await insertTransitionBlock(currentPhase, nextPhase, currentTags)
        }

        if (nextTurn > 10) {
            finishSession(actualRouteId)
        } else {
            startTurn(nextTurn)
        }
    }

    // --- フェーズ遷移時のテンプレートブロック挿入 ---
    const insertTransitionBlock = async (fromPhase, toPhase, tags) => {
        let blockType = null

        if (fromPhase.id === 'phase2_explore') {
            // 探索→深掘り: 共感ブロック挿入
            blockType = 'empathy'
        } else if (fromPhase.id === 'phase3_deepdive') {
            // 深掘り→リフレーミング: 課題ブロック（外在化）挿入
            blockType = 'challenge'
        } else if (fromPhase.id === 'phase4_reframe') {
            // リフレーミング→まとめ: リフレーミングブロック挿入
            blockType = 'reframing'
        }

        if (blockType) {
            const block = findBestBlock(blockType, tags)
            if (block) {
                const latestKeyword = keywords.length > 0 ? keywords[keywords.length - 1] : 'そのこと'
                const text = fillTemplate(block.text, {
                    userName,
                    keyword: latestKeyword,
                })
                await addAIMessage(text, 1000)
            }
        }
    }

    // --- セッション完了 ---
    const finishSession = async (route) => {
        setCurrentQuestion(null)
        setShowFreetext(false)

        // サマリーフェーズの質問を表示
        const summaryQ = selectQuestion(route, 'phase5_summary', [])
        if (summaryQ) {
            const text = fillTemplate(summaryQ.text, { userName })
            await addAIMessage(text, 1200)
            setCurrentQuestion(summaryQ)
        }

        setSessionComplete(true)
    }

    // --- 結果画面への遷移 ---
    const handleViewResults = (choiceIndex) => {
        if (currentQuestion) {
            const choice = currentQuestion.choices[choiceIndex]
            addUserMessage(choice.label)
        }

        // トリセツ・代弁カード・リフレーミングの生成
        const vars = { userName }
        const torisetsu = generateTorisetsu(accumulatedTags, vars)
        const advocacyCards = generateAdvocacyCards(accumulatedTags, vars)
        const reframings = findReframings(accumulatedTags)

        onComplete({
            userName,
            routeId: actualRouteId,
            accumulatedTags,
            keywords,
            messages,
            torisetsu,
            advocacyCards,
            reframings,
        })
    }

    // --- 現在のフェーズ情報 ---
    const currentPhase = turn > 0 ? getPhaseForTurn(turn) : null
    const progress = turn > 0 ? Math.min((turn / 10) * 100, 100) : 0

    // --- レンダリング ---
    return (
        <div className="deepdive-screen">
            {/* ヘッダー */}
            <header className="deepdive-header">
                <button className="deepdive-back-btn" onClick={onBack}>
                    戻る
                </button>
                <div className="deepdive-header-center">
                    <h2 className="deepdive-title">深掘り対話</h2>
                    {currentPhase && (
                        <span className="deepdive-phase-label">{currentPhase.label}</span>
                    )}
                </div>
                <div className="deepdive-turn-indicator">
                    {turn > 0 && `${turn}/10`}
                </div>
            </header>

            {/* プログレスバー */}
            {turn > 0 && (
                <div className="deepdive-progress-bar">
                    <div
                        className="deepdive-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                    <div className="deepdive-progress-phases">
                        {PHASES.map(p => (
                            <span
                                key={p.id}
                                className={`deepdive-progress-dot ${
                                    currentPhase && PHASES.indexOf(currentPhase) >= PHASES.indexOf(p)
                                        ? 'active'
                                        : ''
                                }`}
                                title={p.label}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* チャットエリア */}
            <div className="deepdive-chat-area">
                <div className="deepdive-chat-messages">
                    {messages.map((msg, i) => (
                        <ChatBubble key={i} type={msg.type} text={msg.text} />
                    ))}

                    {/* タイピングインジケーター */}
                    {isTyping && (
                        <div className="bubble-row bubble-row-system">
                            <div className="bubble-avatar">🤖</div>
                            <div className="bubble bubble-system deepdive-typing">
                                <span className="typing-dot" />
                                <span className="typing-dot" />
                                <span className="typing-dot" />
                            </div>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>
            </div>

            {/* 入力エリア */}
            <div className="deepdive-input-area">
                {/* ルート選択画面 */}
                {!routeId && !isTyping && messages.length > 0 && (
                    <div className="deepdive-route-select">
                        {ROUTES.map(route => (
                            <button
                                key={route.id}
                                className="deepdive-route-card"
                                onClick={() => handleRouteSelect(route)}
                                style={{ borderColor: route.color }}
                            >
                                <span className="deepdive-route-icon">{route.icon}</span>
                                <span className="deepdive-route-label">{route.label}</span>
                                <span className="deepdive-route-desc">{route.description}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* 選択肢ボタン */}
                {currentQuestion && !isTyping && !showFreetext && !sessionComplete && (
                    <div className="deepdive-choices-wrapper">
                        <ChoiceButtons
                            choices={currentQuestion.choices}
                            onConfirm={handleChoiceConfirm}
                        />
                    </div>
                )}

                {/* セッション完了時の選択肢 */}
                {sessionComplete && currentQuestion && !isTyping && !showFreetext && (
                    <div className="deepdive-choices-wrapper">
                        <ChoiceButtons
                            choices={currentQuestion.choices}
                            onConfirm={handleViewResults}
                        />
                    </div>
                )}

                {/* 自由記述エリア */}
                {showFreetext && !isTyping && (
                    <div className={`deepdive-freetext-area ${currentQuestion?.featureUI ? 'deepdive-freetext-featured' : ''}`}>
                        {currentQuestion?.featureUI && (
                            <div className="deepdive-freetext-spotlight">
                                自分の言葉で書いてみてください
                            </div>
                        )}
                        <p className="deepdive-freetext-prompt">
                            {currentQuestion?.freetext}
                        </p>
                        <textarea
                            ref={freetextRef}
                            className="deepdive-freetext-input"
                            value={freetextValue}
                            onChange={(e) => setFreetextValue(e.target.value)}
                            placeholder="ここに自由に書いてください..."
                            rows={currentQuestion?.featureUI ? 4 : 2}
                            autoFocus
                        />
                        <div className="deepdive-freetext-actions">
                            <button
                                className="deepdive-freetext-skip"
                                onClick={handleFreetextSkip}
                            >
                                スキップ
                            </button>
                            <button
                                className="deepdive-freetext-submit"
                                onClick={handleFreetextSubmit}
                                disabled={!freetextValue.trim()}
                            >
                                送る
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

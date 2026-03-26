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
    getReframingText,
    getPhaseForTurn,
    generateDeepAnalysis,
    generateProfileNarrative,
    inferValues,
    detectTensions,
    matchCopingStrategies,
} from '../../data/deepDiveData'
import './DeepDiveScreen.css'

/**
 * DeepDiveScreen - 深掘り対話モードのメイン画面
 *
 * チャット形式のUI。約10ターンの対話を通じて
 * 利用者の強みを発見し、「私のトリセツ」を生成する。
 */
const STORAGE_KEY = 'deepdive_session'

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
    const keywordsRef = useRef([])           // stale closure回避用
    const accumulatedTagsRef = useRef([])    // stale closure回避用
    const usedQuestionIdsRef = useRef([])    // stale closure回避用

    // state更新時にrefを同期
    useEffect(() => { keywordsRef.current = keywords }, [keywords])
    useEffect(() => { accumulatedTagsRef.current = accumulatedTags }, [accumulatedTags])
    useEffect(() => { usedQuestionIdsRef.current = usedQuestionIds }, [usedQuestionIds])

    // --- LocalStorageからのセッション復元 ---
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (!saved) return
            const s = JSON.parse(saved)
            if (s.userName !== userName) {
                localStorage.removeItem(STORAGE_KEY)
                return
            }
            setRouteId(s.routeId)
            setActualRouteId(s.actualRouteId)
            setTurn(s.turn)
            setMessages(s.messages)
            setAccumulatedTags(s.accumulatedTags)
            accumulatedTagsRef.current = s.accumulatedTags
            setKeywords(s.keywords)
            keywordsRef.current = s.keywords
            setUsedQuestionIds(s.usedQuestionIds)
            usedQuestionIdsRef.current = s.usedQuestionIds
            if (s.sessionComplete) {
                setSessionComplete(true)
                // 復元時にサマリー質問を再設定
                const summaryQ = selectQuestion(s.actualRouteId, 'phase5_summary', [])
                if (summaryQ) setCurrentQuestion(summaryQ)
            } else if (s.turn > 0) {
                // 次のターンの質問を再設定
                const phase = getPhaseForTurn(s.turn)
                const q = selectQuestion(s.actualRouteId, phase.id, s.usedQuestionIds)
                if (q) setCurrentQuestion(q)
            }
        } catch { /* 破損データは無視 */ }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // --- セッション状態をLocalStorageに保存 ---
    useEffect(() => {
        if (turn === 0 && messages.length <= 1) return // 初期状態は保存しない
        const session = {
            userName, routeId, actualRouteId, turn, messages,
            accumulatedTags, keywords, usedQuestionIds, sessionComplete,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    }, [userName, routeId, actualRouteId, turn, messages, accumulatedTags, keywords, usedQuestionIds, sessionComplete])

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

        // ルート別の自然な遷移メッセージ
        const transitions = {
            moyamoya: 'いいですね。最近のモヤモヤについて、一緒に整理していきましょう。',
            dekitakoto: 'いいですね。最近の「できたこと」を一緒に見つけていきましょう。',
            torisetsu: 'いいですね。自分のトリセツ、一緒に作っていきましょう。',
        }

        if (route.id === 'omakase') {
            const routeLabels = {
                moyamoya: 'モヤモヤを話してみる',
                dekitakoto: 'できたことを見つける',
                torisetsu: '自分のトリセツを作る',
            }
            await addAIMessage(`いいですね。今日は「${routeLabels[resolvedRoute]}」をテーマにしましょう。`, 600)
        } else {
            await addAIMessage(transitions[resolvedRoute], 600)
        }

        // ターン1の質問を開始
        startTurn(1, resolvedRoute)
    }

    // --- 蓄積タグから最も多い強みラベルを取得（ref使用） ---
    const findTopStrength = useCallback(() => {
        const tags = accumulatedTagsRef.current
        const strengthTags = tags.filter(t => TAGS[t]?.category === 'strength')
        if (strengthTags.length === 0) return '前向きに取り組む力'
        const counts = {}
        strengthTags.forEach(t => { counts[t] = (counts[t] || 0) + 1 })
        const topTag = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
        return TAGS[topTag]?.label || '前向きに取り組む力'
    }, [])

    // --- 新しいターンを開始 ---
    // ref を参照することで、stale closure による1ターン遅れを防ぐ
    const startTurn = useCallback((turnNum, rId = null) => {
        const route = rId || actualRouteId
        const phase = getPhaseForTurn(turnNum)
        const question = selectQuestion(route, phase.id, usedQuestionIdsRef.current)

        if (!question) {
            finishSession(route)
            return
        }

        setTurn(turnNum)
        setUsedQuestionIds(prev => [...prev, question.id])
        usedQuestionIdsRef.current = [...usedQuestionIdsRef.current, question.id]
        setCurrentQuestion(question)
        setShowFreetext(false)
        setFreetextValue('')

        const kw = keywordsRef.current
        const latestKeyword = kw.length > 0 ? kw[kw.length - 1] : 'そのこと'
        const topStrength = findTopStrength()
        const reframingText = getReframingText(accumulatedTagsRef.current)

        const text = fillTemplate(question.text, {
            userName,
            keyword: latestKeyword,
            strengthLabel: topStrength,
            reframing: reframingText,
        })

        addAIMessage(text, turnNum === 1 ? 1200 : 900)
    }, [actualRouteId, userName, addAIMessage, findTopStrength]) // eslint-disable-line react-hooks/exhaustive-deps

    // --- 選択肢の確定ハンドラ ---
    const handleChoiceConfirm = async (choiceIndex) => {
        if (!currentQuestion) return

        const choice = currentQuestion.choices[choiceIndex]
        addUserMessage(choice.label)

        // タグ蓄積（refも即時更新してstale closure回避）
        const newTags = [...accumulatedTagsRef.current, ...(choice.tags || [])]
        setAccumulatedTags(newTags)
        accumulatedTagsRef.current = newTags

        // キーワード記録（refも即時更新してstale closure回避）
        const newKeyword = choice.label
        setKeywords(prev => [...prev, newKeyword])
        keywordsRef.current = [...keywordsRef.current, newKeyword]

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
            const newKeyword = freetextValue.trim()
            addUserMessage(newKeyword)
            setKeywords(prev => [...prev, newKeyword])
            keywordsRef.current = [...keywordsRef.current, newKeyword]
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
                const kw = keywordsRef.current
                const latestKeyword = kw.length > 0 ? kw[kw.length - 1] : 'そのこと'
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

        // セッションデータをクリア
        localStorage.removeItem(STORAGE_KEY)

        // トリセツ・代弁カード・リフレーミング・深層分析の生成
        const vars = { userName }
        const torisetsu = generateTorisetsu(accumulatedTags, vars)
        const advocacyCards = generateAdvocacyCards(accumulatedTags, vars)
        const reframings = findReframings(accumulatedTags)
        const deepAnalysis = generateDeepAnalysis(accumulatedTags, keywords, vars)
        const profileNarrative = generateProfileNarrative(accumulatedTags, keywords, vars)
        const values = inferValues(accumulatedTags)
        const tensions = detectTensions(accumulatedTags)
        const copingStrategies = matchCopingStrategies(accumulatedTags)

        onComplete({
            userName,
            routeId: actualRouteId,
            accumulatedTags,
            keywords,
            messages,
            torisetsu,
            advocacyCards,
            reframings,
            deepAnalysis,
            profileNarrative,
            values,
            tensions,
            copingStrategies,
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
                <button className="deepdive-back-btn" onClick={() => {
                    if (turn === 0 || window.confirm('対話の内容が失われますが、よろしいですか？')) {
                        localStorage.removeItem(STORAGE_KEY)
                        onBack()
                    }
                }}>
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
                <div className="deepdive-progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="対話の進み具合">
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
            <div className="deepdive-chat-area" role="log" aria-label="対話履歴" aria-live="polite">
                <div className="deepdive-chat-messages">
                    {messages.map((msg, i) => (
                        <ChatBubble key={i} type={msg.type} text={msg.text} />
                    ))}

                    {/* タイピングインジケーター */}
                    {isTyping && (
                        <div className="bubble-row bubble-row-system">
                            <div className="bubble-avatar">🤖</div>
                            <div className="bubble bubble-system deepdive-typing" aria-label="入力中">
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

                {/* セッション完了時：1クリックで結果画面へ */}
                {sessionComplete && !isTyping && (
                    <div className="deepdive-choices-wrapper">
                        <button
                            className="btn btn-primary deepdive-result-btn"
                            onClick={() => handleViewResults(0)}
                            id="view-result-btn"
                        >
                            結果を見る
                        </button>
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

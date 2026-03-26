import { useState, useEffect, useRef, useCallback } from 'react'
import { selectRandomQuestions, pickAIResponse, generateSessionCode } from '../../data/questionPool'
import { selectRandomExperienceQuestions } from '../../data/experiencePool'
import ChatBubble from './ChatBubble'
import ChoiceButtons from './ChoiceButtons'
import './InterviewScreen.css'

/** セッションデータをLocalStorageに保存するキー */
const LS_KEY = 'wp_session'

/** 第1部の問題数 */
const PART1_COUNT = 30

/**
 * InterviewScreen - チャット型インタビューのメイン画面
 *
 * 第1部（性格テスト30問）と第2部（経験テスト10問）を
 * チャットUI内でシームレスに出題する。
 */
export default function InterviewScreen({ onComplete, userName = '' }) {
    // --- ランダム出題：第1部30問 + 第2部10問 ---
    // state にすることで、再開時に保存済みの質問セットを復元可能にする
    const [QUESTIONS, setQuestions] = useState(() => {
        const part1 = selectRandomQuestions(3)
        const part2 = selectRandomExperienceQuestions(2)
        return [...part1, ...part2]
    })

    // --- State ---
    const [sessionCode, setSessionCode] = useState('')
    const [started, setStarted] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [messages, setMessages] = useState([])
    const [answers, setAnswers] = useState([])          // { questionId, choiceIndex, score, responseTimeMs, toggleCount, freeText }
    const [waitingForChoice, setWaitingForChoice] = useState(false)
    const [supplementText, setSupplementText] = useState('')
    const [fontScale, setFontScale] = useState('normal')
    const [isTyping, setIsTyping] = useState(false)
    const [waitingForPart2Start, setWaitingForPart2Start] = useState(false)

    // メタデータ計測用
    const questionShownAt = useRef(null)
    const toggleCountRef = useRef(0)
    const selectedChoiceRef = useRef(null)

    const chatEndRef = useRef(null)
    const inputRef = useRef(null)

    // --- 現在のパートを判定 ---
    const currentPart = currentIndex < PART1_COUNT ? 1 : 2

    // --- 自動スクロール ---
    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    }, [])

    // --- LocalStorage復元 ---
    // 自動復元は行わない。再開は「再開コード入力」経由のみ。
    // LS にはデータを保持し続け、再開コード入力時に復元する。
    useEffect(() => {
        // 完了済み or 別ユーザーのデータだけ掃除する
        const saved = localStorage.getItem(LS_KEY)
        if (saved) {
            try {
                const data = JSON.parse(saved)
                if (!data.sessionCode || (data.currentIndex || 0) >= (data.totalQuestions || 40)) {
                    localStorage.removeItem(LS_KEY)
                }
            } catch (e) {
                localStorage.removeItem(LS_KEY)
            }
        }
    }, [])

    // --- LocalStorage保存 ---
    useEffect(() => {
        if (sessionCode) {
            const data = {
                sessionCode, started, currentIndex, messages, answers,
                userName, waitingForPart2Start,
                questions: QUESTIONS,           // 再開時に同じ質問セットを使う
                totalQuestions: QUESTIONS.length,
            }
            localStorage.setItem(LS_KEY, JSON.stringify(data))
        }
    }, [sessionCode, started, currentIndex, messages, answers, userName, waitingForPart2Start])

    // --- セッション開始（初回） ---
    const handleStart = useCallback(() => {
        const code = generateSessionCode()
        setSessionCode(code)

        const greeting = userName
            ? `${userName}さん、こんにちは。これからあなたのことを教えていただきたいです。`
            : `こんにちは。これからあなたのことを教えていただきたいです。`

        const initMessages = [
            {
                type: 'system',
                text: `${greeting}\n\n途中で休む時のために、再開コードを発行しました。\nメモしておいてください。`,
            },
            {
                type: 'system',
                text: `あなたの再開コードは【 ${code} 】です。`,
                isCode: true,
            },
            {
                type: 'system',
                text: '準備ができたら「はじめる」を押してください。',
            },
        ]
        setMessages(initMessages)
        scrollToBottom()
    }, [scrollToBottom])

    // --- 初回メッセージ表示（セッションコードがまだない場合） ---
    useEffect(() => {
        if (!sessionCode && messages.length === 0) {
            handleStart()
        }
    }, [sessionCode, messages.length, handleStart])

    // --- 再開コード入力画面 ---
    const [showResumeInput, setShowResumeInput] = useState(false)
    const [resumeCode, setResumeCode] = useState('')

    const handleResume = useCallback(() => {
        const saved = localStorage.getItem(LS_KEY)
        if (saved) {
            try {
                const data = JSON.parse(saved)
                if (data.sessionCode === resumeCode) {
                    // 保存済みの質問セットを復元（questionId の整合性を保つ）
                    if (data.questions && data.questions.length > 0) {
                        setQuestions(data.questions)
                    }
                    setSessionCode(data.sessionCode)
                    setStarted(data.started || false)
                    setCurrentIndex(data.currentIndex || 0)
                    setMessages(data.messages || [])
                    setAnswers(data.answers || [])
                    setShowResumeInput(false)
                    setWaitingForPart2Start(data.waitingForPart2Start || false)
                    const totalQ = data.questions?.length || QUESTIONS.length
                    if (data.started && !data.waitingForPart2Start && (data.currentIndex || 0) < totalQ) {
                        setWaitingForChoice(true)
                    }
                    return
                }
            } catch (e) { /* ignore */ }
        }
        alert('再開コードが見つかりませんでした。新しく始めてください。')
    }, [resumeCode])

    // --- 「はじめる」ボタン押下 ---
    const handleBegin = useCallback(() => {
        setStarted(true)
        setMessages(prev => [
            ...prev,
            { type: 'user', text: 'はじめる' },
        ])

        // 最初の質問を表示
        setIsTyping(true)
        setTimeout(() => {
            setIsTyping(false)
            const q = QUESTIONS[0]
            setMessages(prev => [
                ...prev,
                { type: 'system', text: q.text, questionId: q.id },
            ])
            setWaitingForChoice(true)
            questionShownAt.current = Date.now()
            toggleCountRef.current = 0
            selectedChoiceRef.current = null
            scrollToBottom()
        }, 800)

        scrollToBottom()
    }, [scrollToBottom])

    // --- 第2部開始ボタン押下 ---
    const handleStartPart2 = useCallback(() => {
        setWaitingForPart2Start(false)
        setMessages(prev => [
            ...prev,
            { type: 'user', text: '続ける' },
        ])

        // 第2部の最初の質問を表示
        setIsTyping(true)
        setTimeout(() => {
            setIsTyping(false)
            const q = QUESTIONS[PART1_COUNT]
            setMessages(prev => [
                ...prev,
                { type: 'system', text: q.text, questionId: q.id },
            ])
            setWaitingForChoice(true)
            questionShownAt.current = Date.now()
            toggleCountRef.current = 0
            selectedChoiceRef.current = null
            scrollToBottom()
        }, 800)

        scrollToBottom()
    }, [scrollToBottom])

    // --- 選択肢をクリック ---
    const handleChoiceSelect = useCallback((choiceIndex) => {
        if (selectedChoiceRef.current !== null && selectedChoiceRef.current !== choiceIndex) {
            toggleCountRef.current += 1
        }
        selectedChoiceRef.current = choiceIndex
    }, [])

    // --- 次の質問を表示する共通処理 ---
    const showNextQuestion = useCallback((nextIndex, newAnswers) => {
        // 第1部最終問 → 第2部トランジション
        if (nextIndex === PART1_COUNT) {
            setIsTyping(true)
            setTimeout(() => {
                setMessages(prev => [
                    ...prev,
                    { type: 'system', text: '前半のテストが終了しました。ここまでお疲れさまでした。' },
                ])
                scrollToBottom()

                setTimeout(() => {
                    setIsTyping(false)
                    setMessages(prev => [
                        ...prev,
                        { type: 'system', text: 'ここからは、これまでの経験や趣味について10問だけ質問させてください。\n気軽に答えていただければ大丈夫です。' },
                    ])
                    setCurrentIndex(nextIndex)
                    setWaitingForPart2Start(true)
                    scrollToBottom()
                }, 1000)
            }, 800)
            return
        }

        // 全問完了（第2部終了）
        if (nextIndex >= QUESTIONS.length) {
            setIsTyping(true)
            setTimeout(() => {
                setIsTyping(false)
                setMessages(prev => [
                    ...prev,
                    { type: 'system', text: 'すべての質問に答えていただき、ありがとうございました。\nあなたの結果をまとめています...' },
                ])
                setCurrentIndex(nextIndex)
                scrollToBottom()
                setTimeout(() => {
                    localStorage.removeItem(LS_KEY)
                    if (onComplete) onComplete(newAnswers, userName)
                }, 1500)
            }, 1000)
            return
        }

        // 通常の次の質問
        setIsTyping(true)
        const aiResponse = pickAIResponse(currentIndex, QUESTIONS.length)
        setTimeout(() => {
            setMessages(prev => [...prev, { type: 'system', text: aiResponse }])
            scrollToBottom()

            setTimeout(() => {
                setIsTyping(false)
                const nextQ = QUESTIONS[nextIndex]
                setMessages(prev => [
                    ...prev,
                    { type: 'system', text: nextQ.text, questionId: nextQ.id },
                ])
                setCurrentIndex(nextIndex)
                setWaitingForChoice(true)
                questionShownAt.current = Date.now()
                toggleCountRef.current = 0
                selectedChoiceRef.current = null
                scrollToBottom()
            }, 600)
        }, 800)
    }, [scrollToBottom, onComplete, userName])

    // --- 回答を確定 ---
    const handleChoiceConfirm = useCallback((choiceIndex) => {
        const q = QUESTIONS[currentIndex]
        const choice = q.choices[choiceIndex]
        const responseTimeMs = questionShownAt.current ? (Date.now() - questionShownAt.current) : 0

        // 回答データを記録
        const answerData = {
            questionId: q.id,
            attributeId: q.attributeId || null,
            categoryId: q.categoryId || null,
            choiceIndex,
            score: choice.score,
            responseTimeMs,
            toggleCount: toggleCountRef.current,
            freeText: supplementText.trim() || null,
        }

        const newAnswers = [...answers, answerData]
        setAnswers(newAnswers)

        // ユーザーの吹き出しを追加
        const userMessages = [{ type: 'user', text: choice.label }]
        if (supplementText.trim()) {
            userMessages.push({ type: 'user', text: supplementText.trim(), isSupplement: true })
        }
        setMessages(prev => [...prev, ...userMessages])
        setWaitingForChoice(false)
        setSupplementText('')

        scrollToBottom()

        showNextQuestion(currentIndex + 1, newAnswers)
    }, [currentIndex, answers, supplementText, scrollToBottom, showNextQuestion])

    // --- 自由記述のみでスキップ（選択肢を回答せずに次へ） ---
    const handleSkipWithText = useCallback(() => {
        const q = QUESTIONS[currentIndex]
        const responseTimeMs = questionShownAt.current ? (Date.now() - questionShownAt.current) : 0

        const answerData = {
            questionId: q.id,
            attributeId: q.attributeId || null,
            categoryId: q.categoryId || null,
            choiceIndex: -1,
            score: q.choices.length === 5 ? 3 : 2,  // 5択の場合は中間値3、3択の場合は2
            responseTimeMs,
            toggleCount: 0,
            freeText: supplementText.trim(),
        }

        const newAnswers = [...answers, answerData]
        setAnswers(newAnswers)

        setMessages(prev => [...prev, { type: 'user', text: supplementText.trim(), isSupplement: true }])
        setWaitingForChoice(false)
        setSupplementText('')
        scrollToBottom()

        showNextQuestion(currentIndex + 1, newAnswers)
    }, [currentIndex, answers, supplementText, scrollToBottom, showNextQuestion])

    // --- 1つ前の質問に戻る ---
    const handleGoBack = useCallback(() => {
        if (isTyping) return

        let targetIndex
        if (waitingForPart2Start) {
            // 第2部トランジションから第1部最終問へ戻る
            targetIndex = PART1_COUNT - 1
        } else if (waitingForChoice && currentIndex > 0) {
            targetIndex = currentIndex - 1
        } else {
            return
        }

        const targetQ = QUESTIONS[targetIndex]

        // 戻り先の質問メッセージを messages 内から逆順で探す
        let targetMsgIdx = -1
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].questionId === targetQ.id) {
                targetMsgIdx = i
                break
            }
        }
        if (targetMsgIdx === -1) return

        // メッセージを質問メッセージまで切り詰め（質問自体は残す）
        setMessages(messages.slice(0, targetMsgIdx + 1))

        // 最後の回答データを削除（レポート整合性の維持）
        setAnswers(prev => prev.slice(0, -1))

        // 状態を戻す
        setCurrentIndex(targetIndex)
        setWaitingForChoice(true)
        setWaitingForPart2Start(false)
        setSupplementText('')

        // メタデータをリセット
        questionShownAt.current = Date.now()
        toggleCountRef.current = 0
        selectedChoiceRef.current = null

        scrollToBottom()
    }, [currentIndex, messages, isTyping, waitingForChoice, waitingForPart2Start, scrollToBottom])

    // 「戻る」ボタンの表示条件
    const canGoBack = !isTyping && (
        (waitingForChoice && currentIndex > 0) || waitingForPart2Start
    )

    // --- 中断ボタン ---
    const handlePause = useCallback(() => {
        const data = { sessionCode, started, currentIndex, messages, answers, waitingForPart2Start }
        localStorage.setItem(LS_KEY, JSON.stringify(data))
        alert(`中断しました。再開コード【 ${sessionCode} 】を使って、いつでも続きから始められます。`)
    }, [sessionCode, started, currentIndex, messages, answers, waitingForPart2Start])

    // --- 文字サイズ切り替え ---
    const cycleFontScale = useCallback(() => {
        setFontScale(prev => {
            if (prev === 'normal') return 'large'
            if (prev === 'large') return 'x-large'
            return 'normal'
        })
    }, [])

    // --- 進捗計算 ---
    const progress = Math.round((currentIndex / QUESTIONS.length) * 100)
    const partLabel = currentPart === 1
        ? `第1部 ${Math.min(currentIndex, PART1_COUNT)}/${PART1_COUNT}`
        : `第2部 ${currentIndex - PART1_COUNT}/${QUESTIONS.length - PART1_COUNT}`

    return (
        <div
            className="interview-screen"
            data-font-scale={fontScale}
        >
            {/* ヘッダー */}
            <header className="interview-header">
                <div className="interview-header-left">
                    <h1 className="interview-title">AI ワーク・プロファイル</h1>
                    <span className="interview-subtitle">自己理解サポーター</span>
                </div>
                <div className="interview-header-right">
                    <button
                        className="header-btn"
                        onClick={cycleFontScale}
                        title="文字サイズの変更"
                        id="font-size-btn"
                    >
                        文字を{fontScale === 'normal' ? '大きく' : fontScale === 'large' ? 'もっと大きく' : '元に戻'}す
                    </button>
                    {started && (
                        <button
                            className="header-btn header-btn-pause"
                            onClick={handlePause}
                            id="pause-btn"
                        >
                            中断して休む
                        </button>
                    )}
                </div>
            </header>

            {/* プログレスバー */}
            {started && (
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}>
                        <span className="progress-label">{partLabel}</span>
                    </div>
                </div>
            )}

            {/* チャットエリア */}
            <main className="chat-area">
                <div className="chat-messages">
                    {messages.map((msg, i) => (
                        <ChatBubble
                            key={i}
                            type={msg.type}
                            text={msg.text}
                            isCode={msg.isCode}
                            isSupplement={msg.isSupplement}
                        />
                    ))}
                    {isTyping && (
                        <div className="typing-indicator animate-fade-in">
                            <span></span><span></span><span></span>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
            </main>

            {/* アクションエリア（下部固定） */}
            <footer className="action-area">
                {!started && !showResumeInput && messages.length > 0 && (
                    <div className="action-buttons animate-fade-in-up">
                        <button
                            className="btn btn-primary btn-action"
                            onClick={handleBegin}
                            id="begin-btn"
                        >
                            はじめる
                        </button>
                        <button
                            className="btn btn-secondary btn-action"
                            onClick={() => setShowResumeInput(true)}
                            id="resume-toggle-btn"
                        >
                            再開コードで続きから
                        </button>
                    </div>
                )}

                {showResumeInput && (
                    <div className="resume-input-area animate-fade-in-up">
                        <p className="resume-label">再開コード（4桁の数字）を入力してください</p>
                        <div className="resume-input-row">
                            <input
                                type="text"
                                className="resume-code-input"
                                maxLength={4}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={resumeCode}
                                onChange={(e) => setResumeCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="0000"
                                id="resume-code-input"
                            />
                            <button className="btn btn-primary" onClick={handleResume} id="resume-btn">再開する</button>
                            <button className="btn btn-secondary" onClick={() => setShowResumeInput(false)}>戻る</button>
                        </div>
                    </div>
                )}

                {/* 第2部トランジション：「続ける」ボタン */}
                {waitingForPart2Start && (
                    <div className="action-buttons animate-fade-in-up">
                        <button
                            className="btn btn-primary btn-action"
                            onClick={handleStartPart2}
                            id="start-part2-btn"
                        >
                            続ける
                        </button>
                    </div>
                )}

                {waitingForChoice && (
                    <div className="choice-area animate-fade-in-up">
                        <ChoiceButtons
                            choices={QUESTIONS[currentIndex].choices}
                            onSelect={handleChoiceSelect}
                            onConfirm={handleChoiceConfirm}
                        />
                        <div className="supplement-row">
                            <input
                                ref={inputRef}
                                type="text"
                                className="supplement-input"
                                placeholder="補足や今の気持ちがあれば入力してください...（任意）"
                                value={supplementText}
                                onChange={(e) => setSupplementText(e.target.value)}
                                id="supplement-input"
                            />
                            {supplementText.trim() && (
                                <button
                                    className="btn btn-skip-with-text"
                                    onClick={handleSkipWithText}
                                    id="skip-with-text-btn"
                                >
                                    記述のみで次へ →
                                </button>
                            )}
                        </div>
                        {canGoBack && (
                            <button
                                className="btn-go-back"
                                onClick={handleGoBack}
                                id="go-back-btn"
                            >
                                ← 前の質問に戻る
                            </button>
                        )}
                    </div>
                )}

                {/* 第2部トランジション中の戻るボタン */}
                {waitingForPart2Start && canGoBack && (
                    <button
                        className="btn-go-back"
                        onClick={handleGoBack}
                        id="go-back-part2-btn"
                        style={{ marginTop: 'var(--space-3)' }}
                    >
                        ← 前の質問に戻る
                    </button>
                )}
            </footer>
        </div>
    )
}

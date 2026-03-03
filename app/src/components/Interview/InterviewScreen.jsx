import { useState, useEffect, useRef, useCallback } from 'react'
import { QUESTIONS, AI_RESPONSES, generateSessionCode } from '../../data/questions'
import ChatBubble from './ChatBubble'
import ChoiceButtons from './ChoiceButtons'
import './InterviewScreen.css'

/** セッションデータをLocalStorageに保存するキー */
const LS_KEY = 'wp_session'

/**
 * InterviewScreen - チャット型インタビューのメイン画面
 * 
 * PCファーストの対話型UIで30問を順番に出題し、
 * 選択肢ボタンと任意のテキスト入力で回答を受け付ける。
 */
export default function InterviewScreen({ onComplete }) {
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

    // メタデータ計測用
    const questionShownAt = useRef(null)
    const toggleCountRef = useRef(0)
    const selectedChoiceRef = useRef(null)

    const chatEndRef = useRef(null)
    const inputRef = useRef(null)

    // --- 自動スクロール ---
    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    }, [])

    // --- LocalStorage復元 ---
    useEffect(() => {
        const saved = localStorage.getItem(LS_KEY)
        if (saved) {
            try {
                const data = JSON.parse(saved)
                if (data.sessionCode) {
                    setSessionCode(data.sessionCode)
                    setStarted(data.started || false)
                    setCurrentIndex(data.currentIndex || 0)
                    setMessages(data.messages || [])
                    setAnswers(data.answers || [])
                    if (data.started && data.currentIndex < QUESTIONS.length) {
                        setWaitingForChoice(true)
                    }
                }
            } catch (e) {
                console.warn('セッションデータの復元に失敗しました。', e)
            }
        }
    }, [])

    // --- LocalStorage保存 ---
    useEffect(() => {
        if (sessionCode) {
            const data = { sessionCode, started, currentIndex, messages, answers }
            localStorage.setItem(LS_KEY, JSON.stringify(data))
        }
    }, [sessionCode, started, currentIndex, messages, answers])

    // --- セッション開始（初回） ---
    const handleStart = useCallback(() => {
        const code = generateSessionCode()
        setSessionCode(code)

        const initMessages = [
            {
                type: 'system',
                text: `こんにちは。これからあなたのことを教えていただきたいです。\n\n途中で休む時のために、再開コードを発行しました。\nメモしておいてください。`,
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
                    setSessionCode(data.sessionCode)
                    setStarted(data.started || false)
                    setCurrentIndex(data.currentIndex || 0)
                    setMessages(data.messages || [])
                    setAnswers(data.answers || [])
                    setShowResumeInput(false)
                    if (data.started && data.currentIndex < QUESTIONS.length) {
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

    // --- 選択肢をクリック ---
    const handleChoiceSelect = useCallback((choiceIndex) => {
        if (selectedChoiceRef.current !== null && selectedChoiceRef.current !== choiceIndex) {
            toggleCountRef.current += 1
        }
        selectedChoiceRef.current = choiceIndex
    }, [])

    // --- 回答を確定 ---
    const handleChoiceConfirm = useCallback((choiceIndex) => {
        const q = QUESTIONS[currentIndex]
        const choice = q.choices[choiceIndex]
        const responseTimeMs = Date.now() - questionShownAt.current

        // 回答データを記録
        const answerData = {
            questionId: q.id,
            attributeId: q.attributeId,
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

        // 次の質問、または完了
        const nextIndex = currentIndex + 1
        if (nextIndex >= QUESTIONS.length) {
            // 全問完了
            setIsTyping(true)
            setTimeout(() => {
                setIsTyping(false)
                setMessages(prev => [
                    ...prev,
                    { type: 'system', text: 'すべての質問に答えていただき、ありがとうございました。\nあなたの結果をまとめています...' },
                ])
                setCurrentIndex(nextIndex)
                scrollToBottom()
                // 完了コールバック
                setTimeout(() => {
                    if (onComplete) onComplete(newAnswers)
                }, 1500)
            }, 1000)
        } else {
            // 相槌 + 次の質問
            setIsTyping(true)
            const aiResponse = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)]
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
        }
    }, [currentIndex, answers, supplementText, scrollToBottom, onComplete])

    // --- 中断ボタン ---
    const handlePause = useCallback(() => {
        const data = { sessionCode, started, currentIndex, messages, answers }
        localStorage.setItem(LS_KEY, JSON.stringify(data))
        alert(`中断しました。再開コード【 ${sessionCode} 】を使って、いつでも続きから始められます。`)
    }, [sessionCode, started, currentIndex, messages, answers])

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
                        <span className="progress-label">{currentIndex}/{QUESTIONS.length}</span>
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
                        </div>
                    </div>
                )}
            </footer>
        </div>
    )
}

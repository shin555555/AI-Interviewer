import { useState } from 'react'
import InterviewScreen from './components/Interview/InterviewScreen'
import './App.css'

/**
 * App - ルートコンポーネント
 * 画面の状態を管理し、インタビュー画面と結果画面を切り替える。
 */
function App() {
  const [screen, setScreen] = useState('welcome') // 'welcome' | 'interview' | 'complete'
  const [results, setResults] = useState(null)

  const handleStartInterview = () => {
    setScreen('interview')
  }

  const handleInterviewComplete = (answers) => {
    setResults(answers)
    setScreen('complete')
  }

  // --- インタビュー画面 ---
  if (screen === 'interview') {
    return <InterviewScreen onComplete={handleInterviewComplete} />
  }

  // --- 完了画面（仮） ---
  if (screen === 'complete') {
    return (
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">AI ワーク・プロファイル</h1>
          <p className="app-subtitle">自己理解サポーター</p>
        </header>
        <main className="app-main">
          <div className="welcome-card">
            <div className="welcome-icon">🎉</div>
            <h2 className="welcome-heading">おつかれさまでした</h2>
            <p className="welcome-text">
              すべての質問に回答していただきました。<br />
              結果の分析機能は次のステップで実装されます。
            </p>
            <p className="welcome-text" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)' }}>
              回答データ: {results ? `${results.length}問分を記録済み` : ''}
            </p>
          </div>
        </main>
      </div>
    )
  }

  // --- ウェルカム画面 ---
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">AI ワーク・プロファイル</h1>
        <p className="app-subtitle">自己理解サポーター</p>
      </header>
      <main className="app-main">
        <div className="welcome-card">
          <div className="welcome-icon">🤝</div>
          <h2 className="welcome-heading">ようこそ</h2>
          <p className="welcome-text">
            AIとの対話を通じて、あなたの強みを発見しましょう。
          </p>
          <button
            className="btn btn-primary"
            onClick={handleStartInterview}
            id="start-interview-btn"
          >
            インタビューをはじめる
          </button>
        </div>
      </main>
    </div>
  )
}

export default App

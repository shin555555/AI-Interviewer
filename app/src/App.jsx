import { useState } from 'react'
import InterviewScreen from './components/Interview/InterviewScreen'
import ResultScreen from './components/Result/ResultScreen'
import AdminDashboard from './components/Admin/AdminDashboard'
import './App.css'

/**
 * App - ルートコンポーネント
 * 画面の状態を管理し、各画面を切り替える。
 * 'welcome' | 'interview' | 'complete' | 'admin'
 */
function App() {
  const [screen, setScreen] = useState('welcome')
  const [results, setResults] = useState(null)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [showNameInput, setShowNameInput] = useState(false)
  const [userName, setUserName] = useState('')
  const [nameError, setNameError] = useState(false)

  const handleStartInterview = () => {
    setShowNameInput(true)
  }

  const handleNameSubmit = () => {
    if (userName.trim().length === 0) {
      setNameError(true)
      return
    }
    setScreen('interview')
    setShowNameInput(false)
    setNameError(false)
  }

  const handleInterviewComplete = (answers, completedUserName) => {
    setResults(answers)
    // InterviewScreenからuserNameが渡された場合は更新
    if (completedUserName) setUserName(completedUserName)
    setScreen('complete')
  }

  const handleAdminLogin = () => {
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin1234'
    if (password === adminPassword) {
      setScreen('admin')
      setShowAdminLogin(false)
      setPassword('')
      setPasswordError(false)
    } else {
      setPasswordError(true)
    }
  }

  // --- インタビュー画面 ---
  if (screen === 'interview') {
    return <InterviewScreen onComplete={handleInterviewComplete} userName={userName.trim()} />
  }

  // --- 結果画面 ---
  if (screen === 'complete' && results) {
    return <ResultScreen answers={results} userName={userName.trim()} />
  }

  // --- 管理ダッシュボード ---
  if (screen === 'admin') {
    return <AdminDashboard onBack={() => setScreen('welcome')} />
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

          {showNameInput && (
            <div className="admin-login-overlay" onClick={() => setShowNameInput(false)}>
              <div className="admin-login-modal" onClick={(e) => e.stopPropagation()}>
                <h3>📝 お名前の入力</h3>
                <p>あなたの結果を正確に記録するために使います。<br />ニックネームや事業所から渡されたIDでも大丈夫です。</p>
                <input
                  type="text"
                  className={`admin-password-input ${nameError ? 'is-error' : ''}`}
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value)
                    setNameError(false)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNameSubmit()
                  }}
                  placeholder="お名前またはID"
                  autoFocus
                  style={{ letterSpacing: 'normal', textAlign: 'left' }}
                />
                {nameError && (
                  <div className="admin-login-error">❗ お名前を入力してください</div>
                )}
                <div className="admin-login-actions">
                  <button
                    className="admin-login-cancel"
                    onClick={() => {
                      setShowNameInput(false)
                      setUserName('')
                      setNameError(false)
                    }}
                  >
                    キャンセル
                  </button>
                  <button className="admin-login-submit" onClick={handleNameSubmit}>
                    はじめる
                  </button>
                </div>
              </div>
            </div>
          )}
          <button
            className="btn btn-admin"
            onClick={() => setShowAdminLogin(true)}
            id="admin-btn"
          >
            🔒 管理者画面
          </button>

          {showAdminLogin && (
            <div className="admin-login-overlay" onClick={() => setShowAdminLogin(false)}>
              <div className="admin-login-modal" onClick={(e) => e.stopPropagation()}>
                <h3>🔒 管理者ログイン</h3>
                <p>パスワードを入力してください。</p>
                <input
                  type="password"
                  className={`admin-password-input ${passwordError ? 'is-error' : ''}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordError(false)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdminLogin()
                  }}
                  placeholder="パスワード"
                  autoFocus
                />
                {passwordError && (
                  <div className="admin-login-error">🚫 パスワードが間違っています</div>
                )}
                <div className="admin-login-actions">
                  <button
                    className="admin-login-cancel"
                    onClick={() => {
                      setShowAdminLogin(false)
                      setPassword('')
                      setPasswordError(false)
                    }}
                  >
                    キャンセル
                  </button>
                  <button className="admin-login-submit" onClick={handleAdminLogin}>
                    ログイン
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App


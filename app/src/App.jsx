import { useState } from 'react'
import './App.css'

/**
 * App - ルートコンポーネント
 * 利用者向けインタビュー画面と管理者ダッシュボードのルーティングを管理する。
 * 現時点では仮のランディング画面を表示。
 */
function App() {
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
          <button className="btn btn-primary" id="start-interview-btn">
            インタビューをはじめる
          </button>
        </div>
      </main>
    </div>
  )
}

export default App

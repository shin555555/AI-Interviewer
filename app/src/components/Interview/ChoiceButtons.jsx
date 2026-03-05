import { useState } from 'react'
import './ChoiceButtons.css'

/**
 * ChoiceButtons - 選択肢ボタンコンポーネント
 * 
 * マウスでクリックしやすい大きなボタンをPC画面幅で横並びに配置。
 * 一度選択すると「確定する」ボタンが表示される（誤タップ防止）。
 */
export default function ChoiceButtons({ choices, onSelect, onConfirm }) {
    const [selected, setSelected] = useState(null)

    const handleClick = (index) => {
        setSelected(index)
        if (onSelect) onSelect(index)
    }

    const handleConfirm = () => {
        if (selected !== null) {
            onConfirm(selected)
            setSelected(null)
        }
    }

    const colors = ['choice-a', 'choice-b', 'choice-c', 'choice-d', 'choice-e']

    return (
        <div className="choice-buttons">
            <div className="choice-grid">
                {choices.map((choice, i) => (
                    <button
                        key={i}
                        className={`choice-btn ${colors[i] || ''} ${selected === i ? 'choice-selected' : ''}`}
                        onClick={() => handleClick(i)}
                        id={`choice-btn-${i}`}
                    >
                        {choice.label}
                    </button>
                ))}
            </div>
            {selected !== null && (
                <button
                    className="btn btn-confirm animate-fade-in"
                    onClick={handleConfirm}
                    id="confirm-choice-btn"
                >
                    この回答で決定する
                </button>
            )}
        </div>
    )
}

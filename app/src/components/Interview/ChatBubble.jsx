import './ChatBubble.css'

/**
 * ChatBubble - チャットの吹き出しコンポーネント
 * type: 'system' (左側・グレー) | 'user' (右側・青)
 */
export default function ChatBubble({ type, text, isCode, isSupplement }) {
    const isSystem = type === 'system'

    return (
        <div className={`bubble-row ${isSystem ? 'bubble-row-system' : 'bubble-row-user'}`}>
            {isSystem && <div className="bubble-avatar">🤖</div>}
            <div
                className={`bubble ${isSystem ? 'bubble-system' : 'bubble-user'} ${isCode ? 'bubble-code' : ''} ${isSupplement ? 'bubble-supplement' : ''}`}
            >
                {text.split('\n').map((line, i) => (
                    <span key={i}>
                        {line}
                        {i < text.split('\n').length - 1 && <br />}
                    </span>
                ))}
            </div>
            {!isSystem && <div className="bubble-avatar bubble-avatar-user">👤</div>}
        </div>
    )
}

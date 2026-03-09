/**
 * jobsDatabase.js
 * 
 * 40職種マスターデータ（初期値）
 * 各職種の10属性に対する要求スコア（1〜5の5段階）。
 * 
 * 最終的にはGoogleスプレッドシート上の『職種マスター』シートで管理し、
 * API経由で動的に読み込む設計。
 * 現段階では静的データとして保持する。
 * 
 * 属性順序: [P1(正確性), P2(持続力), P3(体力管理), P4(IT道具), P5(報連相),
 *           I1(集中力), I2(感情制御), I3(規律性), I4(柔軟性), I5(自己発信)]
 * 
 * ※I4(柔軟性)は適性評価時に反転計算される。
 *   ルーティンワークはあえて低い値（1や2）が設定されている。
 */

export const JOB_CATEGORIES = [
    { id: 'office_it', name: '事務・IT', icon: '💻' },
    { id: 'logistics', name: '物流・軽作業', icon: '📦' },
    { id: 'cleaning', name: '清掃・施設管理', icon: '🧹' },
    { id: 'cooking', name: '調理補助・サービス', icon: '🍳' },
    { id: 'specialist', name: '専門・その他', icon: '🔧' },
]

/**
 * 属性キーの順序（スコア配列のインデックスに対応）
 */
export const ATTRIBUTE_KEYS = ['P1', 'P2', 'P3', 'P4', 'P5', 'I1', 'I2', 'I3', 'I4', 'I5']

export const JOBS_DATABASE = [
    // === 事務・IT (10職種) ===
    {
        id: 'job_01', name: 'データ入力', categoryId: 'office_it',
        required: [5, 4, 2, 4, 2, 5, 3, 4, 1, 2]
    },
    {
        id: 'job_02', name: 'デバッグ', categoryId: 'office_it',
        required: [5, 4, 2, 5, 3, 5, 3, 4, 2, 3]
    },
    {
        id: 'job_03', name: '一般事務', categoryId: 'office_it',
        required: [4, 3, 2, 3, 4, 4, 4, 4, 2, 3]
    },
    {
        id: 'job_04', name: '経理補助', categoryId: 'office_it',
        required: [5, 4, 2, 3, 3, 4, 4, 5, 2, 2]
    },
    {
        id: 'job_05', name: 'ユーザーサポート（メール）', categoryId: 'office_it',
        required: [4, 3, 2, 4, 4, 4, 4, 4, 3, 4]
    },
    {
        id: 'job_06', name: 'データクレンジング', categoryId: 'office_it',
        required: [5, 5, 2, 4, 2, 5, 3, 4, 1, 1]
    },
    {
        id: 'job_07', name: 'Webページ更新', categoryId: 'office_it',
        required: [4, 3, 2, 4, 3, 4, 3, 3, 2, 2]
    },
    {
        id: 'job_08', name: '給与計算補助', categoryId: 'office_it',
        required: [5, 4, 2, 3, 4, 4, 3, 5, 2, 2]
    },
    {
        id: 'job_09', name: '書類スキャン・電子化', categoryId: 'office_it',
        required: [4, 5, 3, 3, 2, 4, 2, 4, 1, 1]
    },
    {
        id: 'job_10', name: '文字起こし', categoryId: 'office_it',
        required: [5, 5, 2, 3, 2, 5, 3, 4, 1, 1]
    },

    // === 物流・軽作業 (10職種) ===
    {
        id: 'job_11', name: '検品', categoryId: 'logistics',
        required: [5, 4, 3, 2, 3, 5, 3, 5, 1, 2]
    },
    {
        id: 'job_12', name: '梱包', categoryId: 'logistics',
        required: [3, 5, 4, 1, 2, 4, 3, 4, 1, 1]
    },
    {
        id: 'job_13', name: 'ピッキング', categoryId: 'logistics',
        required: [4, 4, 4, 2, 3, 4, 3, 4, 2, 2]
    },
    {
        id: 'job_14', name: '仕分け', categoryId: 'logistics',
        required: [3, 4, 4, 1, 2, 3, 3, 3, 2, 1]
    },
    {
        id: 'job_15', name: 'シール貼り', categoryId: 'logistics',
        required: [4, 5, 3, 1, 1, 5, 2, 4, 1, 1]
    },
    {
        id: 'job_16', name: '在庫カウント', categoryId: 'logistics',
        required: [5, 4, 3, 2, 3, 4, 3, 4, 2, 2]
    },
    {
        id: 'job_17', name: 'DM封入', categoryId: 'logistics',
        required: [3, 5, 2, 1, 1, 4, 2, 4, 1, 1]
    },
    {
        id: 'job_18', name: 'パレット運搬', categoryId: 'logistics',
        required: [3, 3, 5, 1, 3, 3, 3, 3, 2, 2]
    },
    {
        id: 'job_19', name: '荷物積み下ろし', categoryId: 'logistics',
        required: [2, 3, 5, 1, 3, 2, 3, 3, 2, 2]
    },
    {
        id: 'job_20', name: '解体・分別作業', categoryId: 'logistics',
        required: [3, 4, 4, 1, 2, 3, 3, 4, 2, 1]
    },

    // === 清掃・施設管理 (10職種) ===
    {
        id: 'job_21', name: 'ビル清掃', categoryId: 'cleaning',
        required: [3, 4, 5, 1, 3, 3, 3, 5, 2, 2]
    },
    {
        id: 'job_22', name: 'ハウスクリーニング補助', categoryId: 'cleaning',
        required: [4, 3, 4, 1, 4, 3, 3, 4, 3, 3]
    },
    {
        id: 'job_23', name: 'リネンサプライ', categoryId: 'cleaning',
        required: [3, 4, 4, 1, 2, 3, 3, 4, 2, 1]
    },
    {
        id: 'job_24', name: '公園・緑地清掃', categoryId: 'cleaning',
        required: [2, 3, 4, 1, 2, 2, 3, 3, 2, 1]
    },
    {
        id: 'job_25', name: 'ゴミ回収補助', categoryId: 'cleaning',
        required: [3, 3, 4, 1, 3, 3, 3, 4, 2, 2]
    },
    {
        id: 'job_26', name: '病院内清掃', categoryId: 'cleaning',
        required: [4, 4, 4, 1, 4, 3, 4, 5, 2, 2]
    },
    {
        id: 'job_27', name: 'ホテル客室清掃', categoryId: 'cleaning',
        required: [4, 3, 4, 1, 3, 4, 3, 4, 2, 2]
    },
    {
        id: 'job_28', name: 'マンション管理人(清掃)', categoryId: 'cleaning',
        required: [3, 3, 3, 1, 4, 3, 4, 4, 3, 3]
    },
    {
        id: 'job_29', name: 'コインランドリー清掃', categoryId: 'cleaning',
        required: [3, 3, 3, 1, 2, 3, 3, 4, 2, 1]
    },
    {
        id: 'job_30', name: '浴場清掃', categoryId: 'cleaning',
        required: [3, 4, 4, 1, 2, 3, 3, 4, 2, 1]
    },

    // === 調理補助・サービス (5職種) ===
    {
        id: 'job_31', name: '調理補助', categoryId: 'cooking',
        required: [4, 4, 4, 1, 2, 4, 3, 4, 1, 1]
    },
    {
        id: 'job_32', name: '洗い場', categoryId: 'cooking',
        required: [3, 5, 4, 1, 1, 4, 2, 4, 1, 1]
    },
    {
        id: 'job_33', name: '配膳・下膳', categoryId: 'cooking',
        required: [3, 3, 4, 1, 3, 3, 3, 3, 2, 2]
    },
    {
        id: 'job_34', name: 'バックヤード品出し', categoryId: 'cooking',
        required: [3, 4, 4, 1, 2, 3, 3, 4, 2, 1]
    },
    {
        id: 'job_35', name: 'クリーニング受付補助', categoryId: 'cooking',
        required: [4, 3, 3, 2, 4, 3, 3, 4, 3, 3]
    },

    // === 専門・その他 (5職種) ===
    {
        id: 'job_36', name: '農作業', categoryId: 'specialist',
        required: [3, 4, 5, 1, 2, 3, 3, 4, 2, 1]
    },
    {
        id: 'job_37', name: 'データラベリング・画像加工', categoryId: 'specialist',
        required: [5, 5, 2, 4, 2, 5, 3, 4, 1, 1]
    },
    {
        id: 'job_38', name: 'Webライティング補助', categoryId: 'specialist',
        required: [4, 4, 2, 3, 3, 4, 3, 4, 3, 3]
    },
    {
        id: 'job_39', name: 'ハンドメイド製作', categoryId: 'specialist',
        required: [4, 5, 3, 1, 1, 5, 3, 4, 2, 1]
    },
    {
        id: 'job_40', name: 'デザイン業務補助', categoryId: 'specialist',
        required: [4, 4, 2, 4, 3, 4, 3, 4, 3, 3]
    },

    // === 【フェーズ13追加】IT・オフィス関連 ===
    {
        id: 'job_41', name: 'プログラミング補助', categoryId: 'office_it',
        required: [5, 5, 2, 5, 3, 5, 3, 5, 2, 3]
    },
    {
        id: 'job_42', name: 'サーバー監視', categoryId: 'office_it',
        required: [5, 5, 2, 5, 4, 5, 4, 5, 1, 3]
    },
    {
        id: 'job_43', name: '経理（仕訳入力）', categoryId: 'office_it',
        required: [5, 4, 1, 4, 3, 5, 3, 5, 1, 2]
    },
    {
        id: 'job_44', name: 'Webデザイン補助', categoryId: 'office_it',
        required: [4, 4, 2, 5, 4, 4, 3, 3, 3, 4]
    },
    {
        id: 'job_45', name: 'SNS運用代行', categoryId: 'office_it',
        required: [4, 4, 1, 5, 4, 4, 4, 3, 4, 5]
    },
    {
        id: 'job_46', name: 'テストエンジニア', categoryId: 'office_it',
        required: [5, 5, 2, 5, 4, 5, 3, 5, 2, 4]
    },

    // === 【フェーズ13追加】クリエイティブ・専門系 ===
    {
        id: 'job_47', name: 'DTPオペレーター', categoryId: 'specialist',
        required: [5, 5, 2, 5, 3, 5, 3, 4, 2, 2]
    },
    {
        id: 'job_48', name: 'CADオペレーター', categoryId: 'specialist',
        required: [5, 5, 2, 5, 4, 5, 3, 5, 1, 3]
    },
    {
        id: 'job_49', name: '翻訳チェッカー', categoryId: 'specialist',
        required: [5, 5, 2, 4, 3, 5, 3, 5, 1, 2]
    },
    {
        id: 'job_50', name: '動画編集補助', categoryId: 'specialist',
        required: [4, 5, 2, 5, 3, 5, 3, 4, 3, 3]
    },
    {
        id: 'job_51', name: 'イラストレーター補助', categoryId: 'specialist',
        required: [3, 5, 2, 5, 4, 5, 3, 3, 3, 4]
    },
    {
        id: 'job_52', name: 'ポップ作成・手書き看板', categoryId: 'specialist',
        required: [4, 4, 2, 1, 3, 5, 3, 3, 3, 3]
    },
    {
        id: 'job_53', name: 'ペットケア補助', categoryId: 'specialist',
        required: [3, 4, 4, 1, 3, 3, 4, 4, 5, 2]
    },

    // === 【フェーズ13追加】接客・サービス・飲食 ===
    {
        id: 'job_54', name: 'カフェスタッフ', categoryId: 'cooking',
        required: [3, 3, 4, 2, 4, 3, 4, 4, 4, 4]
    },
    {
        id: 'job_55', name: 'ファミレスホール', categoryId: 'cooking',
        required: [3, 3, 5, 2, 4, 3, 5, 4, 4, 4]
    },
    {
        id: 'job_56', name: 'キッチン・仕込み専従', categoryId: 'cooking',
        required: [4, 4, 4, 1, 2, 4, 3, 4, 2, 1]
    },
    {
        id: 'job_57', name: '弁当盛り付け', categoryId: 'cooking',
        required: [4, 4, 3, 1, 1, 5, 2, 4, 1, 1]
    },
    {
        id: 'job_58', name: 'レジ打ち専従', categoryId: 'cooking',
        required: [5, 4, 4, 3, 3, 4, 5, 4, 2, 2]
    },
    {
        id: 'job_59', name: 'ホテルフロント補助', categoryId: 'cooking',
        required: [4, 3, 3, 4, 5, 4, 5, 5, 4, 4]
    },

    // === 【フェーズ13追加】物流・軽作業・清掃・その他 ===
    {
        id: 'job_60', name: '郵便物仕分け', categoryId: 'logistics',
        required: [4, 4, 3, 1, 2, 4, 2, 4, 1, 1]
    },
    {
        id: 'job_61', name: '出前・デリバリー', categoryId: 'logistics',
        required: [3, 3, 5, 4, 4, 3, 4, 4, 4, 3]
    },
    {
        id: 'job_62', name: 'ポスティング', categoryId: 'logistics',
        required: [3, 5, 5, 1, 2, 3, 3, 4, 3, 1]
    },
    {
        id: 'job_63', name: '倉庫内フォークリフト', categoryId: 'logistics',
        required: [5, 4, 4, 2, 4, 5, 3, 5, 2, 3]
    },
    {
        id: 'job_64', name: '商品補充・品出し', categoryId: 'logistics',
        required: [3, 4, 4, 2, 3, 3, 3, 4, 2, 2]
    },
    {
        id: 'job_65', name: '窓拭き清掃', categoryId: 'cleaning',
        required: [4, 4, 4, 1, 2, 4, 3, 4, 2, 1]
    },
    {
        id: 'job_66', name: '駐車場管理・誘導', categoryId: 'cleaning',
        required: [3, 4, 5, 1, 4, 3, 4, 4, 3, 3]
    },
    {
        id: 'job_67', name: '施設警備', categoryId: 'cleaning',
        required: [4, 4, 4, 2, 5, 4, 4, 5, 3, 3]
    },
    {
        id: 'job_68', name: '農業（収穫作業）', categoryId: 'specialist',
        required: [3, 5, 5, 1, 2, 4, 3, 4, 2, 1]
    }
]

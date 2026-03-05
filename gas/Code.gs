/**
 * ============================================================
 * AI自己理解サポーター「ワーク・プロファイル」
 * Google Apps Script (GAS) バックエンド
 * ============================================================
 *
 * このスクリプトをGoogleスプレッドシートにバインドし、
 * 「ウェブアプリ」としてデプロイすることで、
 * フロントエンドからのデータ保存・取得APIとして機能する。
 *
 * シート構成:
 *   - 「回答データ」: 利用者の診断結果を1行1件で蓄積
 *   - 「職種マスター」: 40職種の要求スコア（施設側で微調整可能）
 *   - 「設定」: システム全体の設定値
 */

// ============================================================
// 定数・設定
// ============================================================

const SHEET_RESPONSES = '回答データ';
const SHEET_JOBS_MASTER = '職種マスター';
const SHEET_SETTINGS = '設定';

const ATTR_KEYS = ['P1', 'P2', 'P3', 'P4', 'P5', 'I1', 'I2', 'I3', 'I4', 'I5'];
const ATTR_NAMES = {
  P1: '正確性', P2: '持続力', P3: '体力管理', P4: 'IT道具', P5: '報連相',
  I1: '集中力', I2: '感情制御', I3: '規律性', I4: '柔軟性', I5: '自己発信',
};

// ============================================================
// Web API エントリーポイント
// ============================================================

/**
 * GET リクエストハンドラ
 * クエリパラメータ action に応じてデータを返す。
 *
 * ?action=getUsers       → 利用者一覧
 * ?action=getUserDetail&userId=xxx → 利用者詳細（時系列含む）
 * ?action=getJobsMaster  → 職種マスターデータ
 */
function doGet(e) {
  try {
    const action = e.parameter.action;

    let result;
    switch (action) {
      case 'getUsers':
        result = handleGetUsers();
        break;
      case 'getUserDetail':
        result = handleGetUserDetail(e.parameter.userId);
        break;
      case 'getJobsMaster':
        result = handleGetJobsMaster();
        break;
      default:
        result = { error: '不明なアクション: ' + action };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * POST リクエストハンドラ
 * リクエストボディの action に応じてデータを書き込む。
 *
 * action=saveResult → 診断結果の保存
 */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    let result;
    switch (action) {
      case 'saveResult':
        result = handleSaveResult(body.data);
        break;
      default:
        result = { error: '不明なアクション: ' + action };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================
// ハンドラー: 利用者一覧取得
// ============================================================

function handleGetUsers() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_RESPONSES);
  if (!sheet) return { users: [] };

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { users: [] }; // ヘッダー行のみ

  const headers = data[0];
  const users = [];
  // ユーザーIDごとに最新の回答だけをまとめる（時系列用に全件保持するのはgetUserDetailで）
  const latestByUser = {};

  for (let i = 1; i < data.length; i++) {
    const row = rowToObject(headers, data[i]);
    const key = row.userId || row.userName || ('row_' + i);

    // 最新のものを保持（タイムスタンプで比較）
    if (!latestByUser[key] || new Date(row.timestamp) > new Date(latestByUser[key].timestamp)) {
      latestByUser[key] = row;
    }
  }

  Object.entries(latestByUser).forEach(([key, row]) => {
    users.push(formatUserSummary(row));
  });

  return { users };
}

// ============================================================
// ハンドラー: 利用者詳細取得（時系列データ含む）
// ============================================================

function handleGetUserDetail(userId) {
  if (!userId) return { user: null };

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_RESPONSES);
  if (!sheet) return { user: null };

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { user: null };

  const headers = data[0];

  // 該当ユーザーの全回答を取得（時系列用）
  const userRows = [];
  for (let i = 1; i < data.length; i++) {
    const row = rowToObject(headers, data[i]);
    if (row.userId === userId || row.userName === userId) {
      userRows.push(row);
    }
  }

  if (userRows.length === 0) return { user: null };

  // タイムスタンプ昇順でソート
  userRows.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // 最新のデータをベースに
  const latest = userRows[userRows.length - 1];
  const userDetail = formatUserSummary(latest);

  // 時系列データを構築
  userDetail.history = userRows.map(row => ({
    date: row.timestamp ? new Date(row.timestamp).toISOString().split('T')[0] : '',
    scores: extractScores(row),
  }));

  return { user: userDetail };
}

// ============================================================
// ハンドラー: 診断結果保存
// ============================================================

function handleSaveResult(userData) {
  if (!userData) return { success: false, error: 'データが空です' };

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_RESPONSES);
  if (!sheet) return { success: false, error: '"回答データ" シートが見つかりません' };

  // ヘッダーが無ければ作成
  if (sheet.getLastRow() === 0) {
    initResponseHeaders(sheet);
  }

  // 行データを構築
  const rowData = buildResponseRow(userData);
  sheet.appendRow(rowData);

  // ユーザーIDを返す
  const id = userData.userId || userData.userName || ('user_' + new Date().getTime());

  // スプレッドシート上のダッシュボードグラフを更新
  try {
    updateDashboardCharts();
  } catch (chartErr) {
    Logger.log('グラフ更新エラー（保存自体は成功）: ' + chartErr.message);
  }

  return { success: true, id: id };
}

// ============================================================
// ハンドラー: 職種マスター取得
// ============================================================

function handleGetJobsMaster() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_JOBS_MASTER);
  if (!sheet) return { jobs: [] };

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { jobs: [] };

  const headers = data[0];
  const jobs = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    jobs.push({
      id: row[0],          // A: ID
      name: row[1],        // B: 職種名
      categoryId: row[2],  // C: カテゴリーID
      categoryName: row[3],// D: カテゴリー名
      required: [
        Number(row[4]),  // E: P1 正確性
        Number(row[5]),  // F: P2 持続力
        Number(row[6]),  // G: P3 体力管理
        Number(row[7]),  // H: P4 IT道具
        Number(row[8]),  // I: P5 報連相
        Number(row[9]),  // J: I1 集中力
        Number(row[10]), // K: I2 感情制御
        Number(row[11]), // L: I3 規律性
        Number(row[12]), // M: I4 柔軟性
        Number(row[13]), // N: I5 自己発信
      ],
    });
  }

  return { jobs };
}

// ============================================================
// ヘルパー: 回答データシートのヘッダー初期化
// ============================================================

function initResponseHeaders(sheet) {
  const headers = [
    'タイムスタンプ',       // A
    '利用者ID',            // B
    '利用者名',            // C
    '再開キー',            // D
    // 10属性の生スコア (E〜N)
    'P1_正確性_raw', 'P2_持続力_raw', 'P3_体力管理_raw', 'P4_IT道具_raw', 'P5_報連相_raw',
    'I1_集中力_raw', 'I2_感情制御_raw', 'I3_規律性_raw', 'I4_柔軟性_raw', 'I5_自己発信_raw',
    // 10属性の正規化スコア (O〜X)
    'P1_正規化', 'P2_正規化', 'P3_正規化', 'P4_正規化', 'P5_正規化',
    'I1_正規化', 'I2_正規化', 'I3_正規化', 'I4_正規化', 'I5_正規化',
    // メタデータ (Y〜)
    '合計回答時間(ms)',     // Y
    '確信度',              // Z
    '修正(トグル)回数',    // AA
    '矛盾フラグ属性',      // AB
    '最強み',              // AC
    '最課題',              // AD
    '推奨職種1位',         // AE
    'マッチスコア1位',     // AF
    '適合カテゴリー',      // AG
    '自由記述テキスト',    // AH
    // 30問の個別回答データ (AI〜)
    ...generateQuestionHeaders(),
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // ヘッダー行を固定
  sheet.setFrozenRows(1);
  // ヘッダーの書式
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#4A90D9')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold');
}

/**
 * 30問分のヘッダーを生成
 * 各問: Q{ID}_選択, Q{ID}_スコア, Q{ID}_回答時間ms, Q{ID}_トグル数, Q{ID}_自由記述
 */
function generateQuestionHeaders() {
  const questionIds = [];
  const prefixes = ['P1', 'P2', 'P3', 'P4', 'P5', 'I1', 'I2', 'I3', 'I4', 'I5'];
  prefixes.forEach(p => {
    for (let q = 1; q <= 3; q++) {
      questionIds.push(`${p}-${q}`);
    }
  });

  const headers = [];
  questionIds.forEach(qid => {
    headers.push(`Q_${qid}_選択`);
    headers.push(`Q_${qid}_スコア`);
    headers.push(`Q_${qid}_回答時間ms`);
    headers.push(`Q_${qid}_トグル数`);
    headers.push(`Q_${qid}_自由記述`);
  });

  return headers;
}

// ============================================================
// ヘルパー: 診断結果を行データに変換
// ============================================================

function buildResponseRow(userData) {
  const scores = userData.scores || {};
  const metadata = userData.metadata || {};
  const answers = userData.answers || [];

  // 最強みと最課題を特定
  let topStrength = '', topWeakness = '';
  let maxScore = -1, minScore = 999;
  ATTR_KEYS.forEach(key => {
    const norm = scores[key]?.normalized || 0;
    if (norm > maxScore) { maxScore = norm; topStrength = ATTR_NAMES[key]; }
    if (norm < minScore) { minScore = norm; topWeakness = ATTR_NAMES[key]; }
  });

  // 矛盾フラグの属性をカンマ区切りで
  const contradictions = (userData.contradictions || []).map(c => c.attributeId || c).join(', ');

  // 自由記述をまとめる
  const freeTexts = (metadata.freeTexts || []).map(ft => ft.text || ft).join(' | ');

  // 推奨職種情報
  const topJob = userData.topJob || '';
  const topMatchScore = userData.topMatchScore || '';
  const categoryTrend = userData.categoryTrend || '';

  const row = [
    new Date().toISOString(),                   // A: タイムスタンプ
    userData.userId || '',                       // B: 利用者ID
    userData.userName || '',                     // C: 利用者名
    userData.sessionKey || '',                   // D: 再開キー
    // 生スコア (E〜N)
    ...ATTR_KEYS.map(key => scores[key]?.raw || 0),
    // 正規化スコア (O〜X)
    ...ATTR_KEYS.map(key => scores[key]?.normalized || 0),
    // メタデータ (Y〜)
    metadata.totalTimeMs || 0,                  // Y: 合計回答時間
    metadata.confidenceLevel || '',             // Z: 確信度
    metadata.totalToggles || 0,                 // AA: トグル回数
    contradictions,                             // AB: 矛盾フラグ
    topStrength,                                // AC: 最強み
    topWeakness,                                // AD: 最課題
    topJob,                                     // AE: 推奨職種1位
    topMatchScore,                              // AF: マッチスコア
    categoryTrend,                              // AG: 適合カテゴリー
    freeTexts,                                  // AH: 自由記述
  ];

  // 30問の個別データ (AI〜)
  const questionIds = [];
  const prefixes = ['P1', 'P2', 'P3', 'P4', 'P5', 'I1', 'I2', 'I3', 'I4', 'I5'];
  prefixes.forEach(p => {
    for (let q = 1; q <= 3; q++) {
      questionIds.push(`${p}-${q}`);
    }
  });

  questionIds.forEach(qid => {
    const answer = answers.find(a => a.questionId === qid);
    if (answer) {
      row.push(answer.choiceIndex ?? '');     // 選択
      row.push(answer.score ?? '');           // スコア
      row.push(answer.responseTimeMs ?? '');  // 回答時間
      row.push(answer.toggleCount ?? 0);      // トグル数
      row.push(answer.freeText ?? '');        // 自由記述
    } else {
      row.push('', '', '', 0, '');
    }
  });

  return row;
}

// ============================================================
// ヘルパー: 行データからユーザーサマリーを構築
// ============================================================

function formatUserSummary(row) {
  const scores = extractScores(row);

  // 最強み・最課題を計算
  let topStrength = row.topStrength || '';
  let topWeakness = row.topWeakness || '';
  if (!topStrength) {
    let maxScore = -1;
    ATTR_KEYS.forEach(key => {
      const norm = scores[key]?.normalized || 0;
      if (norm > maxScore) { maxScore = norm; topStrength = ATTR_NAMES[key]; }
    });
  }
  if (!topWeakness) {
    let minScore = 999;
    ATTR_KEYS.forEach(key => {
      const norm = scores[key]?.normalized || 0;
      if (norm < minScore) { minScore = norm; topWeakness = ATTR_NAMES[key]; }
    });
  }

  return {
    id: row.userId || row.userName || '',
    name: row.userName || row.userId || '',
    createdAt: row.timestamp || '',
    scores: scores,
    topStrength: topStrength,
    topWeakness: topWeakness,
    confidenceLevel: row.confidenceLevel || '',
    totalTime: safeTotalTime(row.totalTimeMs),
    freeTexts: row.freeTexts ? row.freeTexts.split(' | ').filter(t => t) : [],
    contradictions: row.contradictions ? row.contradictions.split(', ').filter(c => c) : [],
    topJob: row.topJob || '',
    matchScore: row.topMatchScore ? Number(row.topMatchScore) : 0,
    categoryTrend: row.categoryTrend || '',
  };
}

/**
 * 行データからスコア部分を抽出
 */
function extractScores(row) {
  const scores = {};
  ATTR_KEYS.forEach(key => {
    const rawKey = key + '_raw';
    const normKey = key + '_normalized';
    // rowToObject で変換された列名に対応
    const raw = Number(row[rawKey] || row[`${key}_${ATTR_NAMES[key]}_raw`] || 0);
    const normalized = Number(row[normKey] || row[`${key}_正規化`] || 0);
    scores[key] = { raw, normalized };
  });
  return scores;
}

/**
 * 安全に回答時間をフォーマットする。
 * Googleスプレッドシートが大きな数値を日付型に自動変換してしまう
 * ケースがあるため、Date型のチェックと実用的な範囲の検証を行う。
 */
function safeTotalTime(val) {
  if (!val && val !== 0) return '';

  // スプレッドシートが日付型に変換してしまった場合
  if (val instanceof Date) {
    // 日付型になった = もう元のms値は失われている → 表示不可
    return '';
  }

  var ms = Number(val);
  if (isNaN(ms) || ms < 0) return '';

  // 86400000ms = 24時間。それを超える値は異常とみなす
  if (ms > 86400000) return '';

  return formatTime(ms);
}

/**
 * ミリ秒を読みやすい形式にフォーマット
 */
function formatTime(ms) {
  const totalSec = Math.round(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return sec + '秒';
  return min + '分' + sec + '秒';
}

/**
 * 行データ配列をオブジェクトに変換
 */
function rowToObject(headers, rowData) {
  const obj = {};

  // ヘッダーから列名を解析してマッピング
  headers.forEach((header, i) => {
    const val = rowData[i];

    // 特殊な列名のマッピング
    if (header === 'タイムスタンプ') obj.timestamp = val;
    else if (header === '利用者ID') obj.userId = val;
    else if (header === '利用者名') obj.userName = val;
    else if (header === '再開キー') obj.sessionKey = val;
    else if (header === '合計回答時間(ms)') obj.totalTimeMs = val;
    else if (header === '確信度') obj.confidenceLevel = val;
    else if (header === '修正(トグル)回数') obj.totalToggles = val;
    else if (header === '矛盾フラグ属性') obj.contradictions = val;
    else if (header === '最強み') obj.topStrength = val;
    else if (header === '最課題') obj.topWeakness = val;
    else if (header === '推奨職種1位') obj.topJob = val;
    else if (header === 'マッチスコア1位') obj.topMatchScore = val;
    else if (header === '適合カテゴリー') obj.categoryTrend = val;
    else if (header === '自由記述テキスト') obj.freeTexts = val;
    // 属性スコア列: "P1_正確性_raw" → "P1_raw", "P1_正規化" → "P1_normalized"
    else {
      const rawMatch = header.match(/^([PI]\d)_.+_raw$/);
      if (rawMatch) {
        obj[rawMatch[1] + '_raw'] = val;
      }
      const normMatch = header.match(/^([PI]\d)_正規化$/);
      if (normMatch) {
        obj[normMatch[1] + '_normalized'] = val;
      }
    }
  });

  return obj;
}

// ============================================================
// 初期セットアップ: 職種マスターシートの初期データ投入
// ============================================================

/**
 * 職種マスターシートを初期化する。
 * GASのスクリプトエディタからこの関数を手動で1度だけ実行する。
 */
function setupJobsMasterSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_JOBS_MASTER);

  // シートがなければ作成
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_JOBS_MASTER);
  } else {
    // 既存データをクリア
    sheet.clear();
  }

  // ヘッダー
  const headers = [
    'ID', '職種名', 'カテゴリーID', 'カテゴリー名',
    'P1(正確性)', 'P2(持続力)', 'P3(体力管理)', 'P4(IT道具)', 'P5(報連相)',
    'I1(集中力)', 'I2(感情制御)', 'I3(規律性)', 'I4(柔軟性)', 'I5(自己発信)',
  ];

  // 40職種の初期データ
  const jobsData = [
    // 事務・IT (10職種)
    ['job_01', 'データ入力', 'office_it', '事務・IT', 5,4,2,4,2,5,3,4,1,2],
    ['job_02', 'デバッグ', 'office_it', '事務・IT', 5,4,2,5,3,5,3,4,2,3],
    ['job_03', '一般事務', 'office_it', '事務・IT', 4,3,2,3,4,4,4,4,2,3],
    ['job_04', '経理補助', 'office_it', '事務・IT', 5,4,2,3,3,4,4,5,2,2],
    ['job_05', 'ユーザーサポート（メール）', 'office_it', '事務・IT', 4,3,2,4,4,4,4,4,3,4],
    ['job_06', 'データクレンジング', 'office_it', '事務・IT', 5,5,2,4,2,5,3,4,1,1],
    ['job_07', 'Webページ更新', 'office_it', '事務・IT', 4,3,2,4,3,4,3,3,2,2],
    ['job_08', '給与計算補助', 'office_it', '事務・IT', 5,4,2,3,4,4,3,5,2,2],
    ['job_09', '書類スキャン・電子化', 'office_it', '事務・IT', 4,5,3,3,2,4,2,4,1,1],
    ['job_10', '文字起こし', 'office_it', '事務・IT', 5,5,2,3,2,5,3,4,1,1],
    // 物流・軽作業 (10職種)
    ['job_11', '検品', 'logistics', '物流・軽作業', 5,4,3,2,3,5,3,5,1,2],
    ['job_12', '梱包', 'logistics', '物流・軽作業', 3,5,4,1,2,4,3,4,1,1],
    ['job_13', 'ピッキング', 'logistics', '物流・軽作業', 4,4,4,2,3,4,3,4,2,2],
    ['job_14', '仕分け', 'logistics', '物流・軽作業', 3,4,4,1,2,3,3,3,2,1],
    ['job_15', 'シール貼り', 'logistics', '物流・軽作業', 4,5,3,1,1,5,2,4,1,1],
    ['job_16', '在庫カウント', 'logistics', '物流・軽作業', 5,4,3,2,3,4,3,4,2,2],
    ['job_17', 'DM封入', 'logistics', '物流・軽作業', 3,5,2,1,1,4,2,4,1,1],
    ['job_18', 'パレット運搬', 'logistics', '物流・軽作業', 3,3,5,1,3,3,3,3,2,2],
    ['job_19', '荷物積み下ろし', 'logistics', '物流・軽作業', 2,3,5,1,3,2,3,3,2,2],
    ['job_20', '解体・分別作業', 'logistics', '物流・軽作業', 3,4,4,1,2,3,3,4,2,1],
    // 清掃・施設管理 (10職種)
    ['job_21', 'ビル清掃', 'cleaning', '清掃・施設管理', 3,4,5,1,3,3,3,5,2,2],
    ['job_22', 'ハウスクリーニング補助', 'cleaning', '清掃・施設管理', 4,3,4,1,4,3,3,4,3,3],
    ['job_23', 'リネンサプライ', 'cleaning', '清掃・施設管理', 3,4,4,1,2,3,3,4,2,1],
    ['job_24', '公園・緑地清掃', 'cleaning', '清掃・施設管理', 2,3,4,1,2,2,3,3,2,1],
    ['job_25', 'ゴミ回収補助', 'cleaning', '清掃・施設管理', 3,3,4,1,3,3,3,4,2,2],
    ['job_26', '病院内清掃', 'cleaning', '清掃・施設管理', 4,4,4,1,4,3,4,5,2,2],
    ['job_27', 'ホテル客室清掃', 'cleaning', '清掃・施設管理', 4,3,4,1,3,4,3,4,2,2],
    ['job_28', 'マンション管理人(清掃)', 'cleaning', '清掃・施設管理', 3,3,3,1,4,3,4,4,3,3],
    ['job_29', 'コインランドリー清掃', 'cleaning', '清掃・施設管理', 3,3,3,1,2,3,3,4,2,1],
    ['job_30', '浴場清掃', 'cleaning', '清掃・施設管理', 3,4,4,1,2,3,3,4,2,1],
    // 調理補助・サービス (5職種)
    ['job_31', '調理補助', 'cooking', '調理補助・サービス', 4,4,4,1,2,4,3,4,1,1],
    ['job_32', '洗い場', 'cooking', '調理補助・サービス', 3,5,4,1,1,4,2,4,1,1],
    ['job_33', '配膳・下膳', 'cooking', '調理補助・サービス', 3,3,4,1,3,3,3,3,2,2],
    ['job_34', 'バックヤード品出し', 'cooking', '調理補助・サービス', 3,4,4,1,2,3,3,4,2,1],
    ['job_35', 'クリーニング受付補助', 'cooking', '調理補助・サービス', 4,3,3,2,4,3,3,4,3,3],
    // 専門・その他 (5職種)
    ['job_36', '農作業', 'specialist', '専門・その他', 3,4,5,1,2,3,3,4,2,1],
    ['job_37', 'データラベリング・画像加工', 'specialist', '専門・その他', 5,5,2,4,2,5,3,4,1,1],
    ['job_38', 'Webライティング補助', 'specialist', '専門・その他', 4,4,2,3,3,4,3,4,3,3],
    ['job_39', 'ハンドメイド製作', 'specialist', '専門・その他', 4,5,3,1,1,5,3,4,2,1],
    ['job_40', 'デザイン業務補助', 'specialist', '専門・その他', 4,4,2,4,3,4,3,4,3,3],
  ];

  // 書き込み
  const allData = [headers, ...jobsData];
  sheet.getRange(1, 1, allData.length, headers.length).setValues(allData);

  // ヘッダー書式
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#2E7D32')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold');

  // 列幅調整
  sheet.setColumnWidth(1, 80);   // ID
  sheet.setColumnWidth(2, 200);  // 職種名
  sheet.setColumnWidth(3, 100);  // カテゴリーID
  sheet.setColumnWidth(4, 150);  // カテゴリー名

  // 固定行
  sheet.setFrozenRows(1);

  Logger.log('✅ 職種マスターシートを初期化しました（40職種）');
}

// ============================================================
// 初期セットアップ: 回答データシートの作成
// ============================================================

/**
 * 回答データシートを初期化する。
 * GASのスクリプトエディタからこの関数を手動で1度だけ実行する。
 */
function setupResponseSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_RESPONSES);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_RESPONSES);
  } else {
    sheet.clear();
  }

  initResponseHeaders(sheet);
  Logger.log('✅ 回答データシートを初期化しました');
}

// ============================================================
// 初期セットアップ: 設定シートの作成
// ============================================================

/**
 * 設定シートを初期化する。
 * GASのスクリプトエディタからこの関数を手動で1度だけ実行する。
 */
function setupSettingsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_SETTINGS);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_SETTINGS);
  } else {
    sheet.clear();
  }

  const data = [
    ['設定項目', '値', '説明'],
    ['管理者パスワード', 'admin1234', '管理ダッシュボードのログインパスワード'],
    ['事業所名', 'サンプル事業所', '表示に使用する事業所名'],
    ['バージョン', '1.0.0', 'システムバージョン'],
  ];

  sheet.getRange(1, 1, data.length, 3).setValues(data);

  // ヘッダー書式
  sheet.getRange(1, 1, 1, 3)
    .setBackground('#E65100')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold');

  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 250);
  sheet.setColumnWidth(3, 400);
  sheet.setFrozenRows(1);

  Logger.log('✅ 設定シートを初期化しました');
}

// ============================================================
// まとめてセットアップ（全シート一括初期化）
// ============================================================

/**
 * 全シートを一括で初期化する。
 * 最初に一度だけ実行してください。
 */
function setupAll() {
  setupJobsMasterSheet();
  setupResponseSheet();
  setupSettingsSheet();
  setupDashboardSheet();
  Logger.log('🎉 全シートの初期セットアップが完了しました！');
}

// ============================================================
// ダッシュボードシート: スプレッドシート上のグラフ自動生成
// ============================================================

const SHEET_DASHBOARD = 'ダッシュボード';

/**
 * ダッシュボードシートを初期化する。
 */
function setupDashboardSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_DASHBOARD);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_DASHBOARD);
  } else {
    sheet.clear();
    // 既存のグラフも削除
    var charts = sheet.getCharts();
    for (var i = 0; i < charts.length; i++) {
      sheet.removeChart(charts[i]);
    }
  }

  // タイトル行
  sheet.getRange('A1').setValue('📊 事業所ダッシュボード（自動更新）');
  sheet.getRange('A1').setFontSize(14).setFontWeight('bold');
  sheet.getRange('A2').setValue('※ このシートは自動で更新されます。手動で編集しないでください。');
  sheet.getRange('A2').setFontColor('#999999');

  Logger.log('✅ ダッシュボードシートを初期化しました');
}

/**
 * 回答データを集計し、ダッシュボードシートに表とグラフを自動描画する。
 * handleSaveResultから自動呼び出される。
 */
function updateDashboardCharts() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 回答データを取得
  var respSheet = ss.getSheetByName(SHEET_RESPONSES);
  if (!respSheet || respSheet.getLastRow() <= 1) return;

  var data = respSheet.getDataRange().getValues();
  var headers = data[0];

  // ヘッダーから列インデックスを取得
  var colMap = {};
  for (var h = 0; h < headers.length; h++) {
    colMap[headers[h]] = h;
  }

  // 全利用者の正規化スコアを集計
  var attrKeys = ['P1', 'P2', 'P3', 'P4', 'P5', 'I1', 'I2', 'I3', 'I4', 'I5'];
  var attrNames = {'P1':'正確性','P2':'持続力','P3':'体力管理','P4':'IT道具','P5':'報連相','I1':'集中力','I2':'感情制御','I3':'規律性','I4':'柔軟性','I5':'自己発信'};
  var sums = {};
  var count = 0;
  var categoryCount = {};

  for (var k = 0; k < attrKeys.length; k++) {
    sums[attrKeys[k]] = 0;
  }

  for (var i = 1; i < data.length; i++) {
    count++;
    for (var j = 0; j < attrKeys.length; j++) {
      var normCol = colMap[attrKeys[j] + '_正規化'];
      if (normCol !== undefined) {
        sums[attrKeys[j]] += Number(data[i][normCol]) || 0;
      }
    }
    // カテゴリー集計
    var catCol = colMap['適合カテゴリー'];
    if (catCol !== undefined) {
      var cat = data[i][catCol] || '不明';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    }
  }

  if (count === 0) return;

  // --- ダッシュボードシートを更新 ---
  var dashSheet = ss.getSheetByName(SHEET_DASHBOARD);
  if (!dashSheet) {
    dashSheet = ss.insertSheet(SHEET_DASHBOARD);
  }

  // 既存のグラフを削除
  var oldCharts = dashSheet.getCharts();
  for (var c = 0; c < oldCharts.length; c++) {
    dashSheet.removeChart(oldCharts[c]);
  }

  // データクリア（タイトル行だけ残す）
  if (dashSheet.getLastRow() > 2) {
    dashSheet.getRange(3, 1, dashSheet.getLastRow() - 2, dashSheet.getLastColumn() || 1).clear();
  }
  dashSheet.getRange('A1').setValue('📊 事業所ダッシュボード（自動更新）');
  dashSheet.getRange('A1').setFontSize(14).setFontWeight('bold');
  dashSheet.getRange('A2').setValue('最終更新: ' + new Date().toLocaleString('ja-JP') + ' ｜ 診断完了人数: ' + count + '人');
  dashSheet.getRange('A2').setFontColor('#666666');

  // --- 1. 特性分布テーブル (A4から) ---
  dashSheet.getRange('A4').setValue('◆ 利用者全体の平均スコア');
  dashSheet.getRange('A4').setFontWeight('bold').setFontSize(11);
  dashSheet.getRange('A5').setValue('属性');
  dashSheet.getRange('B5').setValue('平均スコア');
  dashSheet.getRange('A5:B5').setBackground('#4A90D9').setFontColor('#FFFFFF').setFontWeight('bold');

  for (var m = 0; m < attrKeys.length; m++) {
    var avg = Math.round((sums[attrKeys[m]] / count) * 10) / 10;
    dashSheet.getRange(6 + m, 1).setValue(attrNames[attrKeys[m]]);
    dashSheet.getRange(6 + m, 2).setValue(avg);
  }

  // 特性分布棒グラフ
  var barChart = dashSheet.newChart()
    .setChartType(Charts.ChartType.BAR)
    .addRange(dashSheet.getRange('A5:B15'))
    .setPosition(4, 4, 0, 0)
    .setOption('title', '事業所全体の特性分布（平均スコア）')
    .setOption('hAxis.minValue', 0)
    .setOption('hAxis.maxValue', 5)
    .setOption('legend.position', 'none')
    .setOption('colors', ['#4A90D9'])
    .setOption('width', 500)
    .setOption('height', 350)
    .build();
  dashSheet.insertChart(barChart);

  // --- 2. カテゴリー分布テーブル (A18から) ---
  dashSheet.getRange('A18').setValue('◆ 適合職種カテゴリー分布');
  dashSheet.getRange('A18').setFontWeight('bold').setFontSize(11);
  dashSheet.getRange('A19').setValue('カテゴリー');
  dashSheet.getRange('B19').setValue('人数');
  dashSheet.getRange('A19:B19').setBackground('#2E7D32').setFontColor('#FFFFFF').setFontWeight('bold');

  var catEntries = Object.keys(categoryCount);
  for (var p = 0; p < catEntries.length; p++) {
    dashSheet.getRange(20 + p, 1).setValue(catEntries[p]);
    dashSheet.getRange(20 + p, 2).setValue(categoryCount[catEntries[p]]);
  }
  var catEndRow = 20 + catEntries.length - 1;
  if (catEndRow < 20) catEndRow = 20;

  // カテゴリー分布円グラフ
  var pieChart = dashSheet.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(dashSheet.getRange('A19:B' + (catEndRow + 1)))
    .setPosition(18, 4, 0, 0)
    .setOption('title', '適合職種カテゴリー分布')
    .setOption('pieHole', 0.4)
    .setOption('width', 500)
    .setOption('height', 350)
    .build();
  dashSheet.insertChart(pieChart);

  // --- 3. 低スコア項目TOP3テーブル (Aの下の方) ---
  var lowStartRow = catEndRow + 4;
  dashSheet.getRange(lowStartRow, 1).setValue('◆ 優先すべき訓練プログラム（低スコアTOP3）');
  dashSheet.getRange(lowStartRow, 1).setFontWeight('bold').setFontSize(11);

  var avgList = [];
  for (var n = 0; n < attrKeys.length; n++) {
    avgList.push({ name: attrNames[attrKeys[n]], avg: Math.round((sums[attrKeys[n]] / count) * 10) / 10 });
  }
  avgList.sort(function(a, b) { return a.avg - b.avg; });

  dashSheet.getRange(lowStartRow + 1, 1).setValue('順位');
  dashSheet.getRange(lowStartRow + 1, 2).setValue('属性');
  dashSheet.getRange(lowStartRow + 1, 3).setValue('平均スコア');
  dashSheet.getRange(lowStartRow + 1, 1, 1, 3).setBackground('#E65100').setFontColor('#FFFFFF').setFontWeight('bold');

  for (var q = 0; q < 3 && q < avgList.length; q++) {
    dashSheet.getRange(lowStartRow + 2 + q, 1).setValue(q + 1);
    dashSheet.getRange(lowStartRow + 2 + q, 2).setValue(avgList[q].name);
    dashSheet.getRange(lowStartRow + 2 + q, 3).setValue(avgList[q].avg);
  }

  // 列幅調整
  dashSheet.setColumnWidth(1, 180);
  dashSheet.setColumnWidth(2, 120);
  dashSheet.setColumnWidth(3, 120);

  Logger.log('✅ ダッシュボードグラフを更新しました（利用者数: ' + count + '）');
}

// ============================================================
// スプレッドシートのカスタムメニュー
// ============================================================

/**
 * スプレッドシートを開いた時に自動実行される。
 * メニューバーに「管理者メニュー」を追加する。
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🛠 管理者メニュー')
    .addItem('📊 ダッシュボードを今すぐ更新', 'updateDashboardCharts')
    .addSeparator()
    .addItem('⚙️ 全シートの初期セットアップ', 'setupAll')
    .addItem('📋 ダッシュボードシートの初期化', 'setupDashboardSheet')
    .addToUi();
}

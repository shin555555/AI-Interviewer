---
description: ["プロジェクトの仕様と現在の進捗を読み込み、AIのコンテキスト（記憶）を完全に復元する"]
---

# コマンド概要
`/onboard` コマンドは、新しいセッション（会話）が始まった際にAIが自ら実行すべきワークフローです。
このコマンドを実行することで、AIはプロジェクトの目的から具体的な画面設計、ロジック、直近の進行状況までを完全に把握し、ユーザーに前提条件を再説明させる手間を省きます。

# 実行手順

1. 以下のファイルを `view_file` ツールを用いて**必ずすべて読み込む**こと。
   - `c:\Users\user\Desktop\AI-Interviewer\CLAUDE.md` (開発基本ルール)
   - `c:\Users\user\Desktop\AI-Interviewer\要件定義書.md` (ビジネス要件とドメイン知識)
   - `c:\Users\user\Desktop\AI-Interviewer\docs\status.md` (現在の進捗とTODOリスト)
   - `c:\Users\user\Desktop\AI-Interviewer\docs\architecture\logic_spec.md` (アルゴリズムとロジック)
   - `c:\Users\user\Desktop\AI-Interviewer\docs\specs\ui_wireframe.md` (画面設計図)
   - `c:\Users\user\Desktop\AI-Interviewer\docs\specs\questions.md` (30問の質問マスターデータ)

2. すべての読み込みが完了したら、ユーザーに対して以下のように報告すること。
   - 「プロジェクトの要件と現在の進捗を完全に把握しました。」
   - 現在の `docs/status.md` に基づき、「次に着手すべき最も優先度の高いタスク（未チェックの最初の項目）」を一つ提案し、「ここから再開してよろしいでしょうか？」と尋ねること。

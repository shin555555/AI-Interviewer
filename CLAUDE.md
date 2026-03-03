# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AI自己理解サポーター「ワーク・プロファイル」** - An AI-powered self-understanding support system for employment transition support facilities (就労継続支援A型・B型).

### Core Features
1. **User Interview**: 30-question camouflaged assessment to extract user characteristics
2. **Professional Portfolio**: Output document for job hunting
3. **Facility Dashboard**: User response management and statistical analysis

## Language & Tone Requirements

All user-facing text must follow **やさしい日本語** (Easy Japanese):
- Use middle-school level vocabulary
- Avoid complex kanji compounds (NG: 保有, 遂行, 規範, 適応)
- Use polite です・ます form - never casual (〜だね) or condescending language
- Treat users as professionals, not children

## Technical Architecture

### Interview Engine
- 30 questions measuring 10 attributes (3 questions each):
  - Work Style (P): 正確性, 持続力, 体力管理, IT道具, 報連相
  - Mindset (I): 集中力, 感情制御, 規律性, 柔軟性, 自己発信
- Each question has 3 choices with High/Medium/Low scoring

### Metadata Analysis
- Response time tracking (milliseconds): <3s = intuitive, >15s = deliberate
- Choice toggle detection for self-awareness fluctuation
- Variance detection within attribute (3 questions) for "environmental variability" flag

### Job Matching Algorithm
```
MatchScore = 100 - (Σ|User_i - Required_i| × weight)
```
**Critical**: 柔軟性 (Flexibility) uses inverse logic - low flexibility score = high match for routine jobs (data entry, etc.)

### Job Database
40 jobs across 5 categories:
- 事務・IT (10): Data entry, debugging, etc.
- 物流・軽作業 (10): Inspection, packing, etc.
- 清掃・施設管理 (10): Building cleaning, etc.
- 調理補助・サービス (5): Cooking assistance, etc.
- 専門・その他 (5): Agriculture, writing, image processing

## Accessibility Requirements

- One question per screen (step-by-step format)
- 3-4 choices displayed as buttons
- LocalStorage for session persistence (pause/resume)
- Font size adjustment support
- Support staff proxy input capability

## Output: Professional Portfolio (PDF/A4)

1. Executive Summary (3 lines, AI-generated)
2. Double Radar Chart (Work Style + Mindset)
3. Strength descriptions in やさしい日本語
4. Top 5 recommended jobs (Top 3 as "Best Match", 4-5 as "Possibilities")
5. Accommodation suggestions for employers
6. Action plan with support staff consultation prompt

## Facility Dashboard Features

- Aggregate characteristic distribution (radar chart)
- Training program recommendations based on low-score areas
- Job category trend analysis
- Individual time-series growth comparison
- Metadata display (response confidence)
- Bulk PDF export

## Development Guidelines

- **開発前の参照**: コードを書く前に必ず docs を確認してください
- **完了時の更新**: タスクが終了したら、進捗管理ファイル（チケット）にチェックを入れてください


/**
 * pdfGenerator.js
 * 
 * A4形式のPDFポートフォリオを生成する。
 * html2canvas でDOMをキャプチャし、jsPDF で複数ページのPDFに変換する。
 * 
 * 仕様:
 * - A4サイズ（210mm × 297mm）
 * - CSS印刷用スタイルを適用した専用DOM要素をキャプチャ
 */

import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

/**
 * 指定されたDOM要素をA4 PDFとしてダウンロードする
 * 
 * @param {HTMLElement} element - PDFに変換するDOM要素（#pdf-content）
 * @param {string} filename - ファイル名（拡張子なし）
 */
export async function generatePDF(element, filename = 'ワーク・プロファイル') {
    if (!element) {
        console.error('PDF生成対象の要素が見つかりません')
        return
    }

    // A4サイズ (mm)
    const A4_WIDTH_MM = 210
    const A4_HEIGHT_MM = 297

    // 余白 (mm)
    const MARGIN_MM = 12

    // コンテンツエリア (mm)
    const CONTENT_WIDTH_MM = A4_WIDTH_MM - MARGIN_MM * 2
    const CONTENT_HEIGHT_MM = A4_HEIGHT_MM - MARGIN_MM * 2

    // Chart.js の canvas にアニメーション完了を待つ小さなディレイ
    await new Promise(resolve => setTimeout(resolve, 300))

    // 高解像度でキャプチャ
    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        // Chart.jsのcanvasをレンダリングするためoncloneでアニメーションを無効化
        onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.getElementById('pdf-content')
            if (clonedElement) {
                clonedElement.style.width = '800px'
                // アニメーションを無効化
                clonedElement.style.animation = 'none'
                const animatedElements = clonedElement.querySelectorAll('*')
                animatedElements.forEach(el => {
                    el.style.animation = 'none'
                    el.style.transition = 'none'
                })
            }
        },
    })

    const imgWidth = canvas.width
    const imgHeight = canvas.height

    // PDF上でのコンテンツ幅に合わせた比率計算
    const ratio = CONTENT_WIDTH_MM / imgWidth
    const scaledHeight = imgHeight * ratio

    // PDF生成
    const pdf = new jsPDF('p', 'mm', 'a4')

    // 複数ページ対応: コンテンツが1ページに収まらない場合
    let remainingHeight = scaledHeight
    let sourceY = 0

    while (remainingHeight > 0) {
        if (sourceY > 0) {
            pdf.addPage()
        }

        // 現在のページで描画する高さ
        const drawHeight = Math.min(remainingHeight, CONTENT_HEIGHT_MM)

        // ソース画像から切り取り描画
        const sourceHeightPx = drawHeight / ratio

        // 一時canvasでクリップ
        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = imgWidth
        pageCanvas.height = Math.ceil(sourceHeightPx)
        const ctx = pageCanvas.getContext('2d')
        ctx.drawImage(
            canvas,
            0, Math.floor(sourceY),              // source x, y
            imgWidth, Math.ceil(sourceHeightPx),  // source width, height
            0, 0,                                 // dest x, y
            imgWidth, Math.ceil(sourceHeightPx),  // dest width, height
        )

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.85)
        pdf.addImage(
            pageImgData,
            'JPEG',
            MARGIN_MM,
            MARGIN_MM,
            CONTENT_WIDTH_MM,
            drawHeight,
            undefined,
            'FAST'
        )

        sourceY += sourceHeightPx
        remainingHeight -= drawHeight
    }

    // ダウンロード
    pdf.save(`${filename}.pdf`)
}

/**
 * 管理者画面から特定ユーザーのレポートをPDFダウンロードする
 * レポート詳細エリア全体をキャプチャしてPDF化する
 * 
 * @param {HTMLElement} element - キャプチャ対象のDOM要素
 * @param {string} userName - 利用者の名前（ファイル名に使用）
 */
export async function generateUserReportPDF(element, userName = '利用者') {
    if (!element) {
        console.error('PDF生成対象の要素が見つかりません')
        return
    }

    const filename = `${userName}_レポート`
    await generatePDF(element, filename)
}

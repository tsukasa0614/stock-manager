import QRCode from 'qrcode';
import * as XLSX from 'xlsx';
import type { InventoryItem } from '../api/client';

// QRコード印刷用のサイズ設定
export interface PrintSize {
  id: string;
  name: string;
  width: number;  // mm
  height: number; // mm
  qrSize: number; // ピクセル
  fontSize: number; // pt
  margin: number; // mm
}

export const PRINT_SIZES: PrintSize[] = [
  {
    id: 'small',
    name: '小 (30×20mm)',
    width: 30,
    height: 20,
    qrSize: 80,
    fontSize: 8,
    margin: 2
  },
  {
    id: 'medium',
    name: '中 (50×30mm)',
    width: 50,
    height: 30,
    qrSize: 120,
    fontSize: 10,
    margin: 3
  },
  {
    id: 'large',
    name: '大 (70×40mm)',
    width: 70,
    height: 40,
    qrSize: 160,
    fontSize: 12,
    margin: 4
  },
  {
    id: 'extra_large',
    name: '特大 (100×60mm)',
    width: 100,
    height: 60,
    qrSize: 200,
    fontSize: 14,
    margin: 5
  }
];

// QRコードを生成する
export const generateQRCode = async (text: string, size: number = 200): Promise<string> => {
  try {
    const qrDataURL = await QRCode.toDataURL(text, {
      width: size,
      height: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrDataURL;
  } catch (error) {
    console.error('QRコード生成エラー:', error);
    throw new Error('QRコードの生成に失敗しました');
  }
};

// Base64画像をバイナリデータに変換
const dataURLtoBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

// Excelファイルに画像を挿入するためのヘルパー関数
const addImageToWorksheet = (worksheet: XLSX.WorkSheet, qrDataURL: string, cell: string, size: PrintSize) => {
  // Excel.jsを使わずにシンプルな実装
  // 実際の画像挿入はExcelで手動で行う必要があります
  // ここではQRコードのテキストを記録しておきます
  const qrText = qrDataURL.split(',')[1]; // Base64部分を取得
  worksheet[cell + '_QR'] = { v: qrText, t: 's' };
};

// QRコード印刷用Excelファイルを生成
export const exportQRLabelsToExcel = async (
  items: InventoryItem[],
  printSize: PrintSize,
  includeLocationNumber: boolean = true
): Promise<void> => {
  try {
    const workbook = XLSX.utils.book_new();
    
    // ラベル印刷用のデータを準備
    const labelData = [];
    
    for (const item of items) {
      // QRコードに埋め込むデータ（商品コード）
      const qrData = item.item_code;
      
      // QRコード生成
      const qrDataURL = await generateQRCode(qrData, printSize.qrSize);
      
      // 場所ナンバーの生成（工場名 + 保管場所）
      const locationNumber = includeLocationNumber 
        ? `${item.factory_name || 'F0'}-${item.storing_place || 'L0'}`
        : '';
      
      labelData.push({
        '場所ナンバー': locationNumber,
        '商品コード': item.item_code,
        '商品名': item.product_name,
        'カテゴリ': item.category,
        '現在在庫': `${item.stock_quantity}${item.unit}`,
        'QRデータ': qrData,
        'QRコードURL': qrDataURL,
        'サイズ': `${printSize.width}×${printSize.height}mm`,
        '備考': item.memo || ''
      });
    }
    
    // ワークシート作成
    const worksheet = XLSX.utils.json_to_sheet(labelData);
    
    // 列幅を設定
    const columnWidths = [
      { wch: 15 }, // 場所ナンバー
      { wch: 15 }, // 商品コード
      { wch: 25 }, // 商品名
      { wch: 12 }, // カテゴリ
      { wch: 12 }, // 現在在庫
      { wch: 15 }, // QRデータ
      { wch: 20 }, // QRコードURL
      { wch: 15 }, // サイズ
      { wch: 20 }  // 備考
    ];
    worksheet['!cols'] = columnWidths;
    
    // 印刷設定情報を別シートに追加
    const settingsData = [
      { '設定項目': 'ラベルサイズ', '値': printSize.name },
      { '設定項目': '幅', '値': `${printSize.width}mm` },
      { '設定項目': '高さ', '値': `${printSize.height}mm` },
      { '設定項目': 'QRコードサイズ', '値': `${printSize.qrSize}px` },
      { '設定項目': 'フォントサイズ', '値': `${printSize.fontSize}pt` },
      { '設定項目': '余白', '値': `${printSize.margin}mm` },
      { '設定項目': '生成日時', '値': new Date().toLocaleString('ja-JP') },
      { '設定項目': '商品数', '値': `${items.length}件` }
    ];
    
    const settingsWorksheet = XLSX.utils.json_to_sheet(settingsData);
    settingsWorksheet['!cols'] = [{ wch: 20 }, { wch: 20 }];
    
    // ワークブックにシートを追加
    XLSX.utils.book_append_sheet(workbook, worksheet, 'QRラベル一覧');
    XLSX.utils.book_append_sheet(workbook, settingsWorksheet, '印刷設定');
    
    // レイアウト指示を追加
    const instructionData = [
      { '手順': 1, '内容': 'QRラベル一覧シートのQRコードURLをコピーしてください' },
      { '手順': 2, '内容': 'オンラインQRコード生成サイトでQRコードを生成してください' },
      { '手順': 3, '内容': '生成されたQRコード画像をExcelに貼り付けてください' },
      { '手順': 4, '内容': `各ラベルのサイズを${printSize.width}×${printSize.height}mmに調整してください` },
      { '手順': 5, '内容': 'ラベル用紙に印刷してください' },
      { '手順': '', '内容': '' },
      { '手順': '推奨レイアウト', '内容': '場所ナンバー（上部）' },
      { '手順': '', '内容': 'QRコード（中央左）+ 商品名（中央右）' },
      { '手順': '', '内容': '商品コード（下部）' }
    ];
    
    const instructionWorksheet = XLSX.utils.json_to_sheet(instructionData);
    instructionWorksheet['!cols'] = [{ wch: 15 }, { wch: 50 }];
    
    XLSX.utils.book_append_sheet(workbook, instructionWorksheet, '印刷手順');
    
    // ファイル名を生成
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `QRラベル印刷用_${printSize.id}_${timestamp}.xlsx`;
    
    // ファイルをダウンロード
    XLSX.writeFile(workbook, filename);
    
    console.log(`QRラベル印刷用Excelファイルを生成しました: ${filename}`);
  } catch (error) {
    console.error('Excel生成エラー:', error);
    throw new Error('Excelファイルの生成に失敗しました');
  }
};

// 選択された商品のQRラベルを生成
export const generateQRLabelsForSelectedItems = async (
  selectedItems: InventoryItem[],
  printSize: PrintSize,
  includeLocationNumber: boolean = true
): Promise<void> => {
  if (selectedItems.length === 0) {
    throw new Error('印刷する商品が選択されていません');
  }
  
  await exportQRLabelsToExcel(selectedItems, printSize, includeLocationNumber);
};

// 全商品のQRラベルを生成
export const generateQRLabelsForAllItems = async (
  allItems: InventoryItem[],
  printSize: PrintSize,
  includeLocationNumber: boolean = true
): Promise<void> => {
  if (allItems.length === 0) {
    throw new Error('印刷する商品がありません');
  }
  
  await exportQRLabelsToExcel(allItems, printSize, includeLocationNumber);
};

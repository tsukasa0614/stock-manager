import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FaQrcode, FaPrint, FaTimes, FaFileExcel, FaCheck } from 'react-icons/fa';
import type { InventoryItem } from '../../api/client';
import { PRINT_SIZES, type PrintSize, generateQRLabelsForSelectedItems } from '../../utils/qrExport';

interface QRLabelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: InventoryItem[];
  allItems: InventoryItem[];
}

export const QRLabelDialog: React.FC<QRLabelDialogProps> = ({
  isOpen,
  onClose,
  selectedItems,
  allItems
}) => {
  const [selectedSize, setSelectedSize] = useState<PrintSize>(PRINT_SIZES[1]); // デフォルトは中サイズ
  const [includeLocationNumber, setIncludeLocationNumber] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetItems, setTargetItems] = useState<'selected' | 'all'>('selected');

  if (!isOpen) return null;

  const itemsToProcess = targetItems === 'selected' ? selectedItems : allItems;

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      await generateQRLabelsForSelectedItems(
        itemsToProcess,
        selectedSize,
        includeLocationNumber
      );
      
      alert(`✅ QRラベル印刷用Excelファイルを生成しました！\n対象商品: ${itemsToProcess.length}件\nサイズ: ${selectedSize.name}`);
      onClose();
    } catch (error) {
      console.error('QRラベル生成エラー:', error);
      alert(`❌ QRラベルの生成に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FaQrcode className="text-white text-xl" />
              </div>
              <div>
                <CardTitle className="text-blue-900 text-xl">QRラベル印刷</CardTitle>
                <p className="text-blue-700 text-sm">商品のQRコードラベルを生成します</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <FaTimes />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* 対象商品選択 */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">印刷対象</h3>
            <div className="flex gap-4">
              <Button
                onClick={() => setTargetItems('selected')}
                className={`${
                  targetItems === 'selected' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                } hover:bg-blue-700`}
              >
                <FaCheck className="mr-2" />
                選択商品 ({selectedItems.length}件)
              </Button>
              <Button
                onClick={() => setTargetItems('all')}
                className={`${
                  targetItems === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                } hover:bg-blue-700`}
              >
                <FaCheck className="mr-2" />
                全商品 ({allItems.length}件)
              </Button>
            </div>
          </div>

          {/* ラベルサイズ選択 */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">ラベルサイズ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PRINT_SIZES.map((size) => (
                <div
                  key={size.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedSize.id === size.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedSize(size)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{size.name}</h4>
                      <p className="text-sm text-gray-600">
                        QR: {size.qrSize}px, フォント: {size.fontSize}pt
                      </p>
                    </div>
                    {selectedSize.id === size.id && (
                      <div className="p-1 bg-blue-600 rounded-full">
                        <FaCheck className="text-white text-xs" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* オプション設定 */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">印刷オプション</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLocationNumber}
                  onChange={(e) => setIncludeLocationNumber(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">場所ナンバーを含める</span>
              </label>
              <p className="text-sm text-gray-500 ml-7">
                工場名と保管場所から場所ナンバーを自動生成します
              </p>
            </div>
          </div>

          {/* プレビュー情報 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-lg font-bold text-gray-900 mb-3">印刷プレビュー</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">対象商品数:</span>
                <span className="font-medium">{itemsToProcess.length}件</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ラベルサイズ:</span>
                <span className="font-medium">{selectedSize.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">場所ナンバー:</span>
                <span className="font-medium">{includeLocationNumber ? '含める' : '含めない'}</span>
              </div>
            </div>
            
            {/* サンプル商品表示 */}
            {itemsToProcess.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">印刷対象商品（最初の3件）:</h4>
                <div className="space-y-1">
                  {itemsToProcess.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-xs">
                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                        {item.item_code}
                      </Badge>
                      <span className="text-gray-700">{item.product_name}</span>
                      {includeLocationNumber && (
                        <span className="text-gray-500">
                          [{item.factory_name || 'F0'}-{item.storing_place || 'L0'}]
                        </span>
                      )}
                    </div>
                  ))}
                  {itemsToProcess.length > 3 && (
                    <p className="text-xs text-gray-500">...他 {itemsToProcess.length - 3}件</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 生成ボタン */}
          <div className="flex gap-4">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || itemsToProcess.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
            >
              {isGenerating ? (
                <>処理中...</>
              ) : (
                <>
                  <FaFileExcel className="mr-2" />
                  Excel生成 ({itemsToProcess.length}件)
                </>
              )}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={isGenerating}
            >
              キャンセル
            </Button>
          </div>

          {/* 使用方法 */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">📋 使用方法</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Excelファイルがダウンロードされます</li>
              <li>「QRラベル一覧」シートのQRコードURLを使用してQRコードを生成</li>
              <li>QRコードをExcelに貼り付け</li>
              <li>指定サイズでラベル用紙に印刷</li>
              <li>棚に貼り付け</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

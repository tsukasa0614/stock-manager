import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { AlertBanner } from '../components/alerts/AlertBanner';
import {
  FaBoxOpen,
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaHistory,
  FaChartLine,
  FaTag,
  FaDollarSign,
  FaCalendar,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
  FaImage,
  FaMapMarkerAlt,
  FaIndustry
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { apiClient, type InventoryItem, type StockMovement } from '../api/client';
import { getInventoryStatus } from '../utils/filterUtils';

// 在庫ステータス用の型定義
type StockStatus = "normal" | "low" | "out" | "high";

// ステータス設定
const STATUS_CONFIG: Record<StockStatus, { color: string; textColor: string; label: string; icon: React.ReactNode }> = {
  normal: { 
    color: 'bg-emerald-100', 
    textColor: 'text-emerald-700', 
    label: '適正在庫',
    icon: <FaCheckCircle className="text-emerald-500" />
  },
  low: { 
    color: 'bg-yellow-100', 
    textColor: 'text-yellow-700', 
    label: '在庫少',
    icon: <FaExclamationTriangle className="text-yellow-500" />
  },
  out: { 
    color: 'bg-red-100', 
    textColor: 'text-red-700', 
    label: '在庫切れ',
    icon: <FaExclamationTriangle className="text-red-500" />
  },
  high: { 
    color: 'bg-blue-100', 
    textColor: 'text-blue-700', 
    label: '在庫過多',
    icon: <FaArrowUp className="text-blue-500" />
  }
};

const ProductDetail: React.FC = () => {
  const { itemCode } = useParams<{ itemCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMountedRef = useRef(true);

  const [product, setProduct] = useState<InventoryItem | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  // 商品データと履歴を取得
  useEffect(() => {
    const fetchProductData = async () => {
      if (!itemCode) {
        if (isMountedRef.current) {
          setError("商品コードが指定されていません");
          setLoading(false);
        }
        return;
      }

      try {
        if (isMountedRef.current) {
          setLoading(true);
        }
        
        // 在庫一覧から該当商品を検索
        const inventoriesRes = await apiClient.getInventories();
        let foundProduct: InventoryItem | null = null;
        
        if (inventoriesRes.data && Array.isArray(inventoriesRes.data)) {
          foundProduct = inventoriesRes.data.find(item => item.item_code === itemCode) || null;
        }

        if (!foundProduct) {
          if (isMountedRef.current) {
            setError("指定された商品が見つかりません");
            setLoading(false);
          }
          return;
        }

        if (isMountedRef.current) {
          setProduct(foundProduct);
        }

        // 在庫移動履歴を取得
        const movementsRes = await apiClient.getStockMovements();
        if (movementsRes.data && Array.isArray(movementsRes.data)) {
          // 該当商品の履歴のみフィルタリング
          const productMovements = movementsRes.data.filter(
            movement => movement.item_code === itemCode
          );
          if (isMountedRef.current) {
            setMovements(productMovements);
          }
        }
        
      } catch (err) {
        console.error("商品詳細データの取得に失敗しました:", err);
        if (isMountedRef.current) {
          setError("データの取得に失敗しました");
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchProductData();

    return () => {
      isMountedRef.current = false;
    };
  }, [itemCode]);

  // 商品削除処理
  const handleDeleteProduct = async () => {
    if (!product) return;

    const confirmMessage = `本当に商品「${product.product_name}」を削除しますか？\nこの操作は取り消せません。`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      if (isMountedRef.current) {
        setLoading(true);
      }
      
      const response = await apiClient.deleteInventory(product.id.toString());
      
      if (response) {
        alert(`✅ 商品「${product.product_name}」を正常に削除しました。`);
        navigate('/inventory');
      } else {
        alert("❌ 商品の削除に失敗しました");
      }
    } catch (err) {
      console.error("商品削除エラー:", err);
      alert("❌ 削除処理中にエラーが発生しました");
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // 在庫ステータスを取得
  const getProductStatus = (): StockStatus => {
    if (!product) return 'normal';
    return getInventoryStatus(product) as StockStatus;
  };

  // 在庫価値を計算
  const getInventoryValue = (): number => {
    if (!product) return 0;
    return product.stock_quantity * parseFloat(product.unit_price);
  };

  // 在庫推移の簡易分析
  const getStockTrend = () => {
    if (movements.length < 2) {
      return { trend: 'stable', message: 'データ不足' };
    }

    const recentMovements = movements.slice(-10); // 最近10件
    const inbound = recentMovements.filter(m => m.movement_type === 'in').length;
    const outbound = recentMovements.filter(m => m.movement_type === 'out').length;

    if (inbound > outbound) {
      return { trend: 'increasing', message: '在庫増加傾向', color: 'text-green-600' };
    } else if (outbound > inbound) {
      return { trend: 'decreasing', message: '在庫減少傾向', color: 'text-red-600' };
    } else {
      return { trend: 'stable', message: '安定', color: 'text-blue-600' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="shadow-xl bg-white border-0">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">商品詳細を読み込み中...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="shadow-xl bg-white border-0">
            <CardContent className="p-8 text-center">
              <div className="text-red-500 text-6xl mb-4">
                <FaExclamationTriangle />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">エラーが発生しました</h2>
              <p className="text-red-600 mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/inventory')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FaArrowLeft className="mr-2" />
                  在庫一覧に戻る
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-gray-300 text-gray-700"
                >
                  再読み込み
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const stockStatus = getProductStatus();
  const stockTrend = getStockTrend();
  const inventoryValue = getInventoryValue();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate('/inventory')}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <FaArrowLeft className="mr-2" />
              在庫一覧に戻る
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.product_name}</h1>
              <p className="text-gray-600">商品詳細 - {product.item_code}</p>
            </div>
          </div>
          
          {/* アクションボタン（管理者のみ） */}
          {isAdmin && (
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate(`/inventory/register?edit=${product.item_code}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <FaEdit className="mr-2" />
                編集
              </Button>
              <Button 
                onClick={handleDeleteProduct}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={loading}
              >
                <FaTrash className="mr-2" />
                削除
              </Button>
            </div>
          )}
        </div>

        {/* アラート通知バナー */}
        <div className="mb-6">
          <AlertBanner maxVisible={2} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左カラム: 基本情報と画像 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 商品画像 */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaImage className="text-blue-600" />
                  商品画像
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <FaImage className="text-6xl mx-auto mb-2" />
                        <p>画像なし</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 基本情報 */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaTag className="text-green-600" />
                  基本情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">商品コード:</span>
                    <span className="font-mono text-gray-900">{product.item_code}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">カテゴリ:</span>
                    <Badge className="bg-blue-100 text-blue-800">{product.category}</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">規格:</span>
                    <span className="text-gray-900">{product.standard || '未設定'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">単位:</span>
                    <span className="text-gray-900">{product.unit}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">単価:</span>
                    <span className="font-bold text-gray-900">¥{parseFloat(product.unit_price).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">保管場所:</span>
                    <span className="text-gray-900 flex items-center">
                      <FaMapMarkerAlt className="mr-1 text-gray-500" />
                      {product.storing_place || '未設定'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">工場:</span>
                    <span className="text-gray-900 flex items-center">
                      <FaIndustry className="mr-1 text-gray-500" />
                      {product.factory_name || '未設定'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-2">
                    <span className="font-medium text-gray-700">メモ:</span>
                    <span className="text-gray-900 text-right max-w-xs">
                      {product.memo || '未入力'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右カラム: 在庫情報と履歴 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 在庫ステータス */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 現在在庫 */}
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">現在在庫</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {product.stock_quantity}
                        <span className="text-lg text-gray-600 ml-1">{product.unit}</span>
                      </p>
                    </div>
                    <FaBoxOpen className="text-4xl text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              {/* 在庫ステータス */}
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">ステータス</p>
                      <div className="flex items-center gap-2 mt-2">
                        {STATUS_CONFIG[stockStatus].icon}
                        <Badge className={`${STATUS_CONFIG[stockStatus].color} ${STATUS_CONFIG[stockStatus].textColor}`}>
                          {STATUS_CONFIG[stockStatus].label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 在庫価値 */}
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">在庫価値</p>
                      <p className="text-2xl font-bold text-green-600">
                        ¥{inventoryValue.toLocaleString()}
                      </p>
                    </div>
                    <FaDollarSign className="text-4xl text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 在庫詳細情報 */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaChartLine className="text-purple-600" />
                  在庫詳細情報
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-700">最低在庫数:</span>
                      <span className="font-bold text-orange-600">
                        {product.lowest_stock}{product.unit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-700">不足数:</span>
                      <span className={`font-bold ${product.stock_quantity <= product.lowest_stock ? 'text-red-600' : 'text-green-600'}`}>
                        {product.stock_quantity <= product.lowest_stock 
                          ? `${product.lowest_stock - product.stock_quantity}${product.unit}` 
                          : '不足なし'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium text-gray-700">在庫推移:</span>
                      <span className={`font-bold ${stockTrend.color}`}>
                        {stockTrend.message}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-700">登録日:</span>
                      <span className="text-gray-900">
                        {new Date(product.created_at).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-700">最終更新:</span>
                      <span className="text-gray-900">
                        {new Date(product.updated_at).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium text-gray-700">移動記録:</span>
                      <span className="font-bold text-blue-600">
                        {movements.length}件
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 在庫移動履歴 */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaHistory className="text-indigo-600" />
                  在庫移動履歴
                  <Badge className="bg-indigo-100 text-indigo-700">
                    {movements.length}件
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {movements.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-indigo-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日時</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">種別</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">理由</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">実行者</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {movements.map((movement, index) => (
                          <tr key={movement.id} className={`hover:bg-indigo-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                <FaCalendar className="mr-2 text-gray-400" />
                                {new Date(movement.created_at).toLocaleString('ja-JP')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {movement.movement_type === 'in' ? (
                                  <FaArrowDown className="mr-2 text-green-500" />
                                ) : (
                                  <FaArrowUp className="mr-2 text-red-500" />
                                )}
                                <Badge className={movement.movement_type === 'in' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                                  {movement.movement_type === 'in' ? '入荷' : '出荷'}
                                </Badge>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                              {movement.movement_type === 'in' ? '+' : '-'}{movement.quantity}{product.unit}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {movement.reason || '未入力'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {movement.user_name || '不明'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <FaHistory className="text-4xl mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">移動履歴がありません</p>
                    <p className="text-sm">この商品はまだ入出荷されていません</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 
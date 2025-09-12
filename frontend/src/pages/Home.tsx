import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent } from "../components/ui/card";
import { FaBoxOpen, FaClipboardList, FaWarehouse, FaChartBar, FaTachometerAlt, FaArrowDown, FaArrowUp } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";
import { apiClient, type InventoryItem, type StockMovement, type Factory } from "../api/client";

const Home: React.FC = () => {
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [selectedFactoryId, setSelectedFactoryId] = useState<number | 'all'>('all');
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { generateAlertsFromInventory } = useAlert();
  const isMountedRef = useRef(true);

  

  // 初期データ取得（在庫・入出庫・工場）
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [invRes, movRes, facRes] = await Promise.all([
          apiClient.getInventories(),
          apiClient.getStockMovements(),
          apiClient.getFactories(),
        ]);
        if (isMountedRef.current) {
          const inventories = invRes.data ?? [];
          const movementList = movRes.data ?? [];
          const factoryList = facRes.data ?? [];
          setInventoryList(inventories);
          setMovements(movementList);
          setFactories(factoryList);
          generateAlertsFromInventory(inventories);
        }
      } catch (error) {
        console.error('初期データの取得に失敗しました:', error);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchAll();
    return () => {
      isMountedRef.current = false;
    };
  }, [generateAlertsFromInventory]);

  // フィルタ適用
  const filteredInventories = useMemo(() => {
    if (selectedFactoryId === 'all') return inventoryList;
    return inventoryList.filter(i => i.factory === selectedFactoryId);
  }, [inventoryList, selectedFactoryId]);

  const periodStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - (periodDays - 1));
    d.setHours(0, 0, 0, 0);
    return d;
  }, [periodDays]);

  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      const d = new Date(m.created_at);
      const afterStart = d >= periodStart;
      const matchFactory = selectedFactoryId === 'all' ? true : m.factory_id === selectedFactoryId;
      return afterStart && matchFactory;
    });
  }, [movements, periodStart, selectedFactoryId]);

  const selectedFactoryName = useMemo(() => {
    if (selectedFactoryId === 'all') return '全工場';
    const f = factories.find(f => f.id === selectedFactoryId);
    return f?.factory_name || '工場';
  }, [selectedFactoryId, factories]);

  // 基本統計を計算
  const stats = {
    totalItems: filteredInventories.length,
    totalQuantity: filteredInventories.reduce((sum, item) => sum + item.stock_quantity, 0),
    totalValue: filteredInventories.reduce((sum, item) => sum + (item.stock_quantity * parseFloat(item.unit_price)), 0),
    lowStockItems: filteredInventories.filter(item => item.stock_quantity <= item.lowest_stock).length,
    outOfStockItems: filteredInventories.filter(item => item.stock_quantity === 0).length,
    todayIn: filteredMovements.filter(m => m.movement_type === 'in' && new Date(m.created_at).toDateString() === new Date().toDateString()).reduce((s, m) => s + m.quantity, 0),
    todayOut: filteredMovements.filter(m => m.movement_type === 'out' && new Date(m.created_at).toDateString() === new Date().toDateString()).reduce((s, m) => s + m.quantity, 0),
  };

  const lowStockList = useMemo(() => {
    return filteredInventories
      .filter(item => item.stock_quantity <= item.lowest_stock)
      .sort((a, b) => (a.stock_quantity - a.lowest_stock) - (b.stock_quantity - b.lowest_stock))
      .slice(0, 8);
  }, [filteredInventories]);

  const recentMovements = useMemo(() => {
    return [...filteredMovements]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 12);
  }, [filteredMovements]);

  type TrendPoint = { date: string; inQty: number; outQty: number };
  const trendData: TrendPoint[] = useMemo(() => {
    const map = new Map<string, TrendPoint>();
    // 期間の全日を初期化
    for (let i = 0; i < periodDays; i++) {
      const d = new Date(periodStart);
      d.setDate(periodStart.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, { date: key, inQty: 0, outQty: 0 });
    }
    filteredMovements.forEach(m => {
      const key = new Date(m.created_at).toISOString().slice(0, 10);
      const row = map.get(key);
      if (!row) return;
      if (m.movement_type === 'in') row.inQty += m.quantity;
      else row.outQty += m.quantity;
    });
    return Array.from(map.values());
  }, [filteredMovements, periodDays, periodStart]);

  const maxTrend = useMemo(() => {
    return trendData.reduce((mx, p) => Math.max(mx, p.inQty, p.outQty), 0) || 1;
  }, [trendData]);

  // 機能カードは非表示にするため定義を削除

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200">
      <div className="container mx-auto py-6 space-y-6">
        <div className="bg-gradient-to-br from-yellow-50 via-white to-yellow-100 rounded-2xl shadow-2xl border border-yellow-100 p-6 md:p-8">
          {/* ヘッダー */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                <FaTachometerAlt className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-yellow-700 tracking-tight">ダッシュボード</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">{selectedFactoryName}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-white text-gray-700 border border-gray-200">期間 {periodDays}日</span>
                </div>
              </div>
            </div>
            {/* フィルタ */}
            <div className="flex items-center gap-3">
              <select
                className="border border-yellow-200 rounded-full px-4 py-2 bg-white text-gray-700 shadow-sm"
                value={selectedFactoryId}
                onChange={(e) => setSelectedFactoryId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              >
                <option value="all">全工場</option>
                {factories.map(f => (
                  <option key={f.id} value={f.id}>{f.factory_name}</option>
                ))}
              </select>
              <select
                className="border border-yellow-200 rounded-full px-4 py-2 bg-white text-gray-700 shadow-sm"
                value={periodDays}
                onChange={(e) => setPeriodDays(Number(e.target.value))}
              >
                <option value={7}>7日</option>
                <option value={30}>30日</option>
                <option value={90}>90日</option>
              </select>
            </div>
          </div>

          {/* アラート表示 削除 */}

          {/* 基本統計 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="bg-white border-0 shadow-xl border-t-4 border-yellow-400">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">総商品数</p>
                    <p className="text-2xl font-extrabold text-gray-900">{stats.totalItems.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <FaBoxOpen className="text-yellow-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-xl border-t-4 border-yellow-400">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">総在庫数</p>
                    <p className="text-2xl font-extrabold text-gray-900">{stats.totalQuantity.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <FaWarehouse className="text-yellow-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-xl border-t-4 border-yellow-400">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">総在庫価値</p>
                    <p className="text-2xl font-extrabold text-gray-900">¥{stats.totalValue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <FaChartBar className="text-yellow-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-xl border-t-4 border-yellow-400">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">在庫不足</p>
                    <p className="text-2xl font-extrabold text-gray-900">{stats.lowStockItems.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <FaClipboardList className="text-yellow-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 本日 入庫/出庫 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-emerald-50 border border-emerald-200 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">本日入庫</p>
                    <p className="text-3xl font-extrabold text-emerald-700">{stats.todayIn.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-full">
                    <FaArrowDown className="text-emerald-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-rose-50 border border-rose-200 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">本日出庫</p>
                    <p className="text-3xl font-extrabold text-rose-700">{stats.todayOut.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-rose-100 rounded-full">
                    <FaArrowUp className="text-rose-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 機能カード 削除 */}

          {/* 下段：低在庫一覧 / 最近の入出庫 / トレンド */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* 低在庫 */}
            <Card className="bg-white border-0 shadow-xl col-span-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">最低在庫割れ</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">{lowStockList.length} 件</span>
                </div>
                <div className="space-y-4">
                  {lowStockList.length === 0 && (
                    <p className="text-sm text-gray-500">該当なし</p>
                  )}
                  {lowStockList.map(item => {
                    const ratio = Math.max(0, Math.min(100, Math.round((item.stock_quantity / (item.lowest_stock || 1)) * 100)));
                    const isOut = item.stock_quantity === 0;
                    return (
                      <div key={item.id} className="">
                        <div className="flex items-center justify-between mb-1">
                          <div className="min-w-0 pr-2">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.product_name}</p>
                            <p className="text-[11px] text-gray-500 truncate">{item.item_code}{item.factory_name ? ` ・ ${item.factory_name}` : ''}</p>
                          </div>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full ${isOut ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                            {isOut ? '在庫切れ' : '要補充'}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`${isOut ? 'bg-red-500' : 'bg-yellow-500'} h-full`}
                            style={{ width: `${ratio}%` }}
                            title={`現在 ${item.stock_quantity}${item.unit} / 最低 ${item.lowest_stock}${item.unit}`}
                          />
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-gray-600">
                          <span>現在 {item.stock_quantity}{item.unit}</span>
                          <span>最低 {item.lowest_stock}{item.unit}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 最近の入出庫 */}
            <Card className="bg-white border-0 shadow-xl col-span-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">最近の入出庫</h3>
                  <span className="text-sm text-gray-500">直近 {recentMovements.length} 件</span>
                </div>
                <div className="divide-y divide-yellow-50">
                  {recentMovements.length === 0 && (
                    <p className="text-sm text-gray-500">履歴なし</p>
                  )}
                  {recentMovements.map(m => (
                    <div key={m.id} className="py-3 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{m.item_name || m.item_code || 'アイテム'}</p>
                        <p className="text-xs text-gray-500 truncate">{new Date(m.created_at).toLocaleString()}</p>
                      </div>
                      <div className={`text-sm font-semibold ${m.movement_type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                        {m.movement_type === 'in' ? '+' : '-'}{m.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 入出庫トレンド（視覚化強化） */}
            <Card className="bg-white border-0 shadow-xl col-span-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">入出庫トレンド（{periodDays}日）</h3>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 inline-block rounded-sm" /> 入庫</span>
                    <span className="inline-flex items-center gap-1"><span className="w-3 h-3 bg-yellow-700 inline-block rounded-sm" /> 出庫</span>
                  </div>
                </div>
                <div className="relative h-48">
                  {/* グリッドライン */}
                  <div className="absolute inset-0 flex flex-col">
                    {[0,25,50,75,100].map((pct) => (
                      <div key={pct} className="flex-0 border-t border-gray-100" style={{ height: pct === 100 ? '0%' : '20%' }} />
                    ))}
                  </div>
                  {/* 縦軸目盛り */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-400">
                    <span>{maxTrend}</span>
                    <span>{Math.ceil(maxTrend/2)}</span>
                    <span>0</span>
                  </div>
                  {/* 棒グラフ */}
                  <div className="absolute inset-0 pl-6 pr-1 flex items-end gap-1">
                    {trendData.map((p, idx) => {
                      const inH = Math.round((p.inQty / maxTrend) * 100);
                      const outH = Math.round((p.outQty / maxTrend) * 100);
                      return (
                        <div key={p.date} className="flex-1 flex items-end gap-0.5">
                          <div title={`${p.date} 入庫 +${p.inQty}`} className="w-1/2 bg-yellow-500/80 rounded-sm" style={{ height: `${inH}%` }} />
                          <div title={`${p.date} 出庫 -${p.outQty}`} className="w-1/2 bg-yellow-700/80 rounded-sm" style={{ height: `${outH}%` }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* X軸ラベル（先頭/中間/末尾） */}
                <div className="mt-2 text-[10px] text-gray-500 flex justify-between pl-6 pr-1">
                  <span>{trendData[0]?.date || ''}</span>
                  <span>{trendData[Math.floor(trendData.length/2)]?.date || ''}</span>
                  <span>{trendData[trendData.length-1]?.date || ''}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 
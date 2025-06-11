import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { FaBell, FaHistory, FaArrowDown, FaArrowUp } from "react-icons/fa";
import { UserModeSwitch } from "../components/common/UserModeSwitch";

const kpiData = [
  { title: "アラート", value: "3", change: "+1", color: "bg-red-100 text-red-700", icon: <FaBell className="text-red-400" /> },
  { title: "操作履歴", value: "12", change: "+2", color: "bg-blue-100 text-blue-700", icon: <FaHistory className="text-blue-400" /> },
  { title: "入荷情報", value: "856", change: "+23", color: "bg-green-100 text-green-700", icon: <FaArrowDown className="text-green-400" /> },
  { title: "出荷情報", value: "543", change: "-5", color: "bg-orange-100 text-orange-700", icon: <FaArrowUp className="text-orange-400" /> },
];

const dummyAlerts = [
  { id: 1, message: "商品Aの在庫が不足しています", status: "未対応", time: "10分前" },
  { id: 2, message: "商品Bの在庫が残り僅かです", status: "対応中", time: "30分前" },
  { id: 3, message: "商品Cの在庫が不足しています", status: "未対応", time: "1時間前" },
  { id: 4, message: "商品Dの在庫が残り僅かです", status: "対応中", time: "2時間前" },
  { id: 5, message: "商品Eの在庫が不足しています", status: "未対応", time: "3時間前" },
  { id: 6, message: "商品Fの在庫が残り僅かです", status: "対応中", time: "4時間前" },
];

const dummyActivities = [
  { id: 1, user: "山田太郎", action: "商品Aを50個入荷", time: "10分前" },
  { id: 2, user: "佐藤花子", action: "商品Bを20個出荷", time: "30分前" },
  { id: 3, user: "鈴木一郎", action: "新商品「商品C」を登録", time: "1時間前" },
  { id: 4, user: "高橋次郎", action: "倉庫Aの棚卸を完了", time: "2時間前" },
  { id: 5, user: "田中美咲", action: "商品Dを30個入荷", time: "3時間前" },
  { id: 6, user: "佐々木健", action: "商品Eを10個出荷", time: "4時間前" },
];

const Home: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 本番では削除: 開発用のユーザー切り替え機能 */}
      <UserModeSwitch />

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <div className="p-4 sm:p-8 space-y-10 max-w-7xl mx-auto">
          {/* ヘッダー */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">ホーム画面</h1>
              <p className="text-muted-foreground">リアルタイムの在庫状況と分析情報を確認できます。</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">更新</Button>
              <Button>レポート出力</Button>
            </div>
          </div>

          {/* KPIカード */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {kpiData.map((kpi) => (
              <Card key={kpi.title} className={`shadow-md border-0 ${kpi.color} flex flex-col items-center py-6`}> 
                <div className="flex items-center gap-3 mb-2">{kpi.icon}<span className="font-semibold text-lg">{kpi.title}</span></div>
                <div className="text-3xl font-bold mb-1">{kpi.value}</div>
                <Badge variant="outline" className="bg-white/80 border-0 text-base px-3 py-1">{kpi.change}</Badge>
              </Card>
            ))}
          </div>

          {/* アラート履歴・最近の活動 */}
          <div className="grid gap-6 lg:grid-cols-2 mt-6">
            {/* アラート履歴 */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>アラート履歴</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-gray-200">
                  {dummyAlerts.slice(0, 5).map(alert => (
                    <li key={alert.id} className="flex items-center justify-between py-2">
                      <span>{alert.message}</span>
                      <Badge variant="outline" className="bg-red-100 text-red-700 border-0">{alert.status}</Badge>
                      <span className="text-xs text-muted-foreground">{alert.time}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            {/* 最近の活動 */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>最近の活動</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-gray-200">
                  {dummyActivities.slice(0, 5).map(act => (
                    <li key={act.id} className="flex items-center justify-between py-2">
                      <span className="font-semibold text-blue-700">{act.user}</span>
                      <span>{act.action}</span>
                      <span className="text-xs text-muted-foreground">{act.time}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* グラフ（ダミー）一番下 */}
          <div className="mt-8">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>在庫推移グラフ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56 flex items-center justify-center text-muted-foreground bg-gray-50 rounded-lg">グラフ（ダミー）</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 
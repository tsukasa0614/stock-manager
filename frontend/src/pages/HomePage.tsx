//rafc

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Package, Truck, PackageMinus, AlertTriangle, BarChart3, LineChart, PieChart, Bell, Clock } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Pie, Cell } from 'recharts'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

// サンプルデータ
const data = [
  { month: '1月', 原材料: 400, 仕掛品: 240, 完成品: 320 },
  { month: '2月', 原材料: 300, 仕掛品: 139, 完成品: 280 },
  { month: '3月', 原材料: 200, 仕掛品: 980, 完成品: 420 },
  { month: '4月', 原材料: 278, 仕掛品: 390, 完成品: 380 },
  { month: '5月', 原材料: 189, 仕掛品: 480, 完成品: 360 },
  { month: '6月', 原材料: 239, 仕掛品: 380, 完成品: 400 },
]

// カテゴリー別データ
const categoryData = [
  { name: '原材料', value: 400, color: '#8884d8' },
  { name: '仕掛品', value: 300, color: '#82ca9d' },
  { name: '完成品', value: 300, color: '#ffc658' },
]

const COLORS = ['#8884d8', '#82ca9d', '#ffc658']

// アラート履歴データ
const alertHistoryData = [
  {
    id: 1,
    type: 'critical',
    message: '商品A の在庫が不足しています',
    timestamp: '10分前',
    details: '現在庫: 5個 (最小在庫: 20個)',
    status: '未対応'
  },
  {
    id: 2,
    type: 'warning',
    message: '商品B の在庫が残り僅かです',
    timestamp: '30分前',
    details: '現在庫: 25個 (最小在庫: 30個)',
    status: '対応中'
  },
  {
    id: 3,
    type: 'info',
    message: '倉庫A の空き容量が残り僅かです',
    timestamp: '1時間前',
    details: '使用率: 85% (警告閾値: 80%)',
    status: '対応済み'
  }
]

// 最近の活動データ
const recentActivitiesData = [
  {
    id: 1,
    user: { name: '山田太郎', avatar: '/placeholder.svg?height=32&width=32' },
    action: '商品Aを50個入荷しました',
    timestamp: '10分前'
  },
  {
    id: 2,
    user: { name: '佐藤花子', avatar: '/placeholder.svg?height=32&width=32' },
    action: '商品Bを20個出荷しました',
    timestamp: '30分前'
  },
  {
    id: 3,
    user: { name: '鈴木一郎', avatar: '/placeholder.svg?height=32&width=32' },
    action: '新商品「商品C」を登録しました',
    timestamp: '1時間前'
  },
  {
    id: 4,
    user: { name: '高橋次郎', avatar: '/placeholder.svg?height=32&width=32' },
    action: '倉庫Aの棚卸を完了しました',
    timestamp: '2時間前'
  }
]

// 分析用のサンプルデータ
const analysisData = [
  { category: '原材料', current: 400, previous: 350, change: '+14.3%' },
  { category: '仕掛品', current: 300, previous: 280, change: '+7.1%' },
  { category: '完成品', current: 500, previous: 450, change: '+11.1%' },
  { category: '包装資材', current: 200, previous: 180, change: '+11.1%' },
]

// 予測用のサンプルデータ
const forecastData = [
  { date: '2/1', actual: 100, forecast: 105 },
  { date: '2/2', actual: 120, forecast: 115 },
  { date: '2/3', actual: 130, forecast: 125 },
  { date: '2/4', actual: 110, forecast: 120 },
  { date: '2/5', actual: 140, forecast: 135 },
  { date: '2/6', actual: null, forecast: 145 },
  { date: '2/7', actual: null, forecast: 150 },
]

// 予測カテゴリー別データ
const forecastCategoryData = [
  { category: '原材料', current: 400, forecast: 450, change: '+12.5%' },
  { category: '仕掛品', current: 300, forecast: 320, change: '+6.7%' },
  { category: '完成品', current: 500, forecast: 480, change: '-4.0%' },
  { category: '包装資材', current: 200, forecast: 220, change: '+10.0%' },
]

export const HomePage = () => {
  const [graphType, setGraphType] = useState('bar')

  const renderGraph = () => {
    switch (graphType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="原材料" fill="#8884d8" />
              <Bar dataKey="仕掛品" fill="#82ca9d" />
              <Bar dataKey="完成品" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        )
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="原材料" stackId="1" stroke="#8884d8" fill="#8884d8" />
              <Area type="monotone" dataKey="仕掛品" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
              <Area type="monotone" dataKey="完成品" stackId="1" stroke="#ffc658" fill="#ffc658" />
            </AreaChart>
          </ResponsiveContainer>
        )
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 md:space-y-8 md:p-8">
      {/* ヘッダー */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">トップページ</h1>
          <p className="text-sm text-muted-foreground sm:text-base">リアルタイムの在庫状況と分析情報を確認できます。</p>
        </div>
      </div>

      {/* KPIカード */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総在庫数</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12.3% 先月比</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今月の入荷数</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">856</div>
            <p className="text-xs text-muted-foreground">+23.1% 先月比</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今月の出荷数</CardTitle>
            <PackageMinus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">543</div>
            <p className="text-xs text-muted-foreground">-5.2% 先月比</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アラート件数</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">-2 先週比</p>
          </CardContent>
        </Card>
      </div>

      {/* タブとグラフ */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview" className="flex-1 sm:flex-none">概要</TabsTrigger>
          <TabsTrigger value="analysis" className="flex-1 sm:flex-none">分析</TabsTrigger>
          <TabsTrigger value="forecast" className="flex-1 sm:flex-none">予測</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* アラート履歴と最近の活動 */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* アラート履歴 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base sm:text-lg">アラート履歴</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">最近のアラートと対応状況</CardDescription>
                </div>
                <Badge>{alertHistoryData.length}</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[250px] sm:h-[300px]">
                  <div className="divide-y divide-gray-100">
                    {alertHistoryData.map((alert) => (
                      <div key={alert.id} className="flex items-start gap-4 p-4 hover:bg-gray-50">
                        <div className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${
                          alert.type === 'critical' ? 'bg-red-500' :
                          alert.type === 'warning' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{alert.message}</p>
                            <Badge variant={
                              alert.status === '未対応' ? 'destructive' :
                              alert.status === '対応中' ? 'outline' :
                              'default'
                            }>
                              {alert.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">{alert.timestamp}</p>
                          <p className="mt-1 text-xs text-gray-500">{alert.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="border-t p-3 sm:p-4">
                <Button variant="outline" className="w-full text-sm sm:text-base">
                  <Bell className="mr-2 h-4 w-4" />
                  すべてのアラートを表示
                </Button>
              </CardFooter>
            </Card>

            {/* 最近の活動 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base sm:text-lg">最近の活動</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">システム上の最近のアクティビティ</CardDescription>
                </div>
                <Clock className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[250px] sm:h-[300px]">
                  <div className="divide-y divide-gray-100">
                    {recentActivitiesData.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-gray-50">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                          <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm font-medium">{activity.user.name}</p>
                            <p className="text-xs text-gray-500">{activity.timestamp}</p>
                          </div>
                          <p className="mt-1 text-sm">{activity.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="border-t p-3 sm:p-4">
                <Button variant="outline" className="w-full text-sm sm:text-base">
                  <Clock className="mr-2 h-4 w-4" />
                  すべての活動を表示
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* 在庫推移グラフ */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg">在庫推移</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">カテゴリー別の在庫推移を表示します</CardDescription>
                </div>
                <Select value={graphType} onValueChange={setGraphType}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="グラフの種類を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">
                      <div className="flex items-center">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        棒グラフ
                      </div>
                    </SelectItem>
                    <SelectItem value="line">
                      <div className="flex items-center">
                        <LineChart className="mr-2 h-4 w-4" />
                        折れ線グラフ
                      </div>
                    </SelectItem>
                    <SelectItem value="pie">
                      <div className="flex items-center">
                        <PieChart className="mr-2 h-4 w-4" />
                        円グラフ
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] sm:h-[400px]">
                {renderGraph()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {/* 在庫分析 */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg">在庫分析</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">カテゴリー別の在庫推移を分析します</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    棒グラフ
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                    <LineChart className="mr-2 h-4 w-4" />
                    折れ線グラフ
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                    <PieChart className="mr-2 h-4 w-4" />
                    円グラフ
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysisData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="current" fill="#8884d8" name="現在" />
                    <Bar dataKey="previous" fill="#82ca9d" name="前期" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* カテゴリー別分析 */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {analysisData.map((item) => (
              <Card key={item.category}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{item.category}</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{item.current}</div>
                  <div className="flex items-center gap-2">
                    <span className={item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                      {item.change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs 前期</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          {/* 在庫予測 */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg">在庫予測</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">AIによる在庫水準の予測を表示します</CardDescription>
                </div>
                <Badge variant="outline" className="bg-blue-50">
                  AI予測
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="actual"
                      name="実績"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="forecast"
                      name="予測"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.3}
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* カテゴリー別予測 */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {forecastCategoryData.map((item) => (
              <Card key={item.category}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{item.category}</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{item.forecast}</div>
                  <div className="flex items-center gap-2">
                    <span className={item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                      {item.change}
                    </span>
                    <span className="text-xs text-muted-foreground">予測増減</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    現在: {item.current}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

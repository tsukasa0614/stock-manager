import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Package, Search, Filter } from 'lucide-react'

// 型定義
type StockStatus = 'normal' | 'warning' | 'critical'

interface StockItem {
  id: number
  name: string
  location: string
  category: string
  quantity: number
  unit: string
  status: StockStatus
  lastUpdated: string
}

// サンプルデータ
const stockData: StockItem[] = [
  {
    id: 1,
    name: '商品A',
    location: '倉庫A-1',
    category: '原材料',
    quantity: 100,
    unit: '個',
    status: 'normal',
    lastUpdated: '2024-02-20'
  },
  {
    id: 2,
    name: '商品B',
    location: '倉庫B-2',
    category: '完成品',
    quantity: 50,
    unit: '箱',
    status: 'warning',
    lastUpdated: '2024-02-19'
  },
  {
    id: 3,
    name: '商品C',
    location: '倉庫A-3',
    category: '仕掛品',
    quantity: 200,
    unit: '個',
    status: 'critical',
    lastUpdated: '2024-02-18'
  },
  // 他のサンプルデータ...
]

export const ListPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<StockStatus | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState('all')

  // 検索とフィルタリングのロジック
  const filteredData = stockData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || item.status === filterType
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory
    return matchesSearch && matchesType && matchesCategory
  })

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 md:space-y-8 md:p-8">
      {/* ヘッダー */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">在庫一覧</h1>
          <p className="text-sm text-muted-foreground sm:text-base">在庫の検索と管理を行います</p>
        </div>
      </div>

      {/* 検索とフィルター */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">検索条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="商品名または場所で検索..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="状態で絞り込み" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="normal">通常</SelectItem>
                  <SelectItem value="warning">注意</SelectItem>
                  <SelectItem value="critical">危険</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="カテゴリー" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="原材料">原材料</SelectItem>
                  <SelectItem value="仕掛品">仕掛品</SelectItem>
                  <SelectItem value="完成品">完成品</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 在庫一覧テーブル */}
      <Card>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>商品名</TableHead>
                  <TableHead>場所</TableHead>
                  <TableHead>カテゴリー</TableHead>
                  <TableHead>数量</TableHead>
                  <TableHead>状態</TableHead>
                  <TableHead>最終更新</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{`${item.quantity} ${item.unit}`}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === 'normal' ? 'default' :
                          item.status === 'warning' ? 'secondary' :
                          'destructive'
                        }
                      >
                        {item.status === 'normal' ? '通常' :
                         item.status === 'warning' ? '注意' :
                         '危険'}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.lastUpdated}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

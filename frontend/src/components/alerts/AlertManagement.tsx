import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ResponsiveTable } from '../ui/responsive-table';
import { 
  FaBell, 
  FaExclamationTriangle, 
  FaExclamationCircle, 
  FaInfoCircle,
  FaTimes,
  FaCheck,
  FaFilter,
  FaSearch,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaClock,
  FaChartBar
} from 'react-icons/fa';
import { useAlert } from '../../contexts/AlertContext';
import { ALERT_SEVERITY_COLORS } from '../../types/notifications';
import type { StockAlert } from '../../types/notifications';

interface AlertManagementProps {
  className?: string;
}

export const AlertManagement: React.FC<AlertManagementProps> = ({ 
  className = "" 
}) => {
  const { 
    alerts, 
    unreadCount, 
    criticalCount, 
    markAsRead, 
    markAsAcknowledged, 
    dismissAlert,
    clearAllAlerts
  } = useAlert();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);

  // フィルタリングされたアラート
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'unread' && !alert.isRead) ||
                         (statusFilter === 'read' && alert.isRead) ||
                         (statusFilter === 'acknowledged' && alert.isAcknowledged) ||
                         (statusFilter === 'unacknowledged' && !alert.isAcknowledged);
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  // 統計情報
  const stats = {
    total: alerts.length,
    unread: unreadCount,
    critical: criticalCount,
    acknowledged: alerts.filter(a => a.isAcknowledged).length,
    today: alerts.filter(a => {
      const alertDate = new Date(a.createdAt);
      const today = new Date();
      return alertDate.toDateString() === today.toDateString();
    }).length
  };

  // アラートアイコンの取得
  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'high':
        return <FaExclamationCircle className="text-orange-500" />;
      case 'medium':
        return <FaExclamationCircle className="text-yellow-500" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  // 選択されたアラートの管理
  const handleSelectAlert = (alertId: string) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };

  const handleSelectAll = () => {
    setSelectedAlerts(
      selectedAlerts.length === filteredAlerts.length 
        ? [] 
        : filteredAlerts.map(alert => alert.id)
    );
  };

  // 一括アクション
  const handleBulkAction = (action: string) => {
    selectedAlerts.forEach(alertId => {
      switch (action) {
        case 'read':
          markAsRead(alertId);
          break;
        case 'acknowledge':
          markAsAcknowledged(alertId, 'User');
          break;
        case 'delete':
          dismissAlert(alertId);
          break;
      }
    });
    setSelectedAlerts([]);
  };

  // テーブルの列定義
  const columns = [
    {
      key: 'select',
      label: '',
      render: (_value: any, row: StockAlert) => (
        <input
          type="checkbox"
          checked={selectedAlerts.includes(row.id)}
          onChange={() => handleSelectAlert(row.id)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      )
    },
    {
      key: 'severity',
      label: '重要度',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {getAlertIcon(value)}
          <Badge className={ALERT_SEVERITY_COLORS[value]?.bg}>
            {value === 'critical' ? '緊急' : 
             value === 'high' ? '重要' : 
             value === 'medium' ? '注意' : '情報'}
          </Badge>
        </div>
      )
    },
    {
      key: 'title',
      label: 'タイトル',
      render: (value: string, row: StockAlert) => (
        <div>
          <div className="font-semibold text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.type}</div>
        </div>
      )
    },
    {
      key: 'itemName',
      label: '商品情報',
      render: (value: string, row: StockAlert) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.itemCode}</div>
          <div className="text-xs text-gray-400">{row.category}</div>
        </div>
      )
    },
    {
      key: 'currentStock',
      label: '在庫状況',
      render: (value: number, row: StockAlert) => (
        <div className="text-sm">
          <div className="font-medium">現在: {value}</div>
          <div className="text-gray-500">最低: {row.minimumStock}</div>
          <div className="text-red-600">不足: {row.shortage}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'ステータス',
      render: (_value: any, row: StockAlert) => (
        <div className="space-y-1">
          {!row.isRead && (
            <Badge className="bg-red-100 text-red-700">未読</Badge>
          )}
          {row.isAcknowledged && (
            <Badge className="bg-green-100 text-green-700">確認済み</Badge>
          )}
        </div>
      )
    },
    {
      key: 'createdAt',
      label: '作成日時',
      render: (value: string) => (
        <div className="text-sm text-gray-600">
          {new Date(value).toLocaleString('ja-JP')}
        </div>
      )
    }
  ];

  // アクション定義
  const actions = [
    {
      icon: <FaEye />,
      label: '詳細',
      onClick: (row: StockAlert) => {
        alert(`アラート詳細\n\n${row.title}\n${row.message}\n\n商品: ${row.itemName} (${row.itemCode})\nカテゴリ: ${row.category}\n場所: ${row.location}\n工場: ${row.factoryName}`);
      },
      className: 'border-blue-300 text-blue-700 hover:bg-blue-50'
    },
    {
      icon: <FaCheck />,
      label: '既読',
      onClick: (row: StockAlert) => markAsRead(row.id),
      className: 'border-green-300 text-green-700 hover:bg-green-50',
      show: (row: StockAlert) => !row.isRead
    },
    {
      icon: <FaCheckCircle />,
      label: '確認済み',
      onClick: (row: StockAlert) => markAsAcknowledged(row.id, 'User'),
      className: 'border-purple-300 text-purple-700 hover:bg-purple-50',
      show: (row: StockAlert) => !row.isAcknowledged
    },
    {
      icon: <FaTimes />,
      label: '削除',
      onClick: (row: StockAlert) => dismissAlert(row.id),
      className: 'border-red-300 text-red-700 hover:bg-red-50'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">総アラート数</p>
                <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
              </div>
              <FaBell className="text-2xl text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">未読</p>
                <p className="text-2xl font-bold text-red-800">{stats.unread}</p>
              </div>
              <FaEye className="text-2xl text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">緊急</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.critical}</p>
              </div>
              <FaExclamationTriangle className="text-2xl text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">確認済み</p>
                <p className="text-2xl font-bold text-green-800">{stats.acknowledged}</p>
              </div>
              <FaCheckCircle className="text-2xl text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">本日</p>
                <p className="text-2xl font-bold text-purple-800">{stats.today}</p>
              </div>
              <FaClock className="text-2xl text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* フィルターと検索 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaFilter className="text-indigo-600" />
            フィルター・検索
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaSearch className="inline mr-2" />
                検索
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="タイトル、商品名、商品コードで検索..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                重要度
              </label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">すべて</option>
                <option value="critical">緊急</option>
                <option value="high">重要</option>
                <option value="medium">注意</option>
                <option value="low">情報</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">すべて</option>
                <option value="unread">未読</option>
                <option value="read">既読</option>
                <option value="acknowledged">確認済み</option>
                <option value="unacknowledged">未確認</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSeverityFilter('all');
                  setStatusFilter('all');
                }}
                variant="outline"
                className="w-full"
              >
                リセット
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 一括アクション */}
      {selectedAlerts.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 font-medium">
                  {selectedAlerts.length}件のアラートを選択中
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleBulkAction('read')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <FaCheck className="mr-2" />
                  一括既読
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleBulkAction('acknowledge')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <FaCheckCircle className="mr-2" />
                  一括確認
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <FaTrash className="mr-2" />
                  一括削除
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* アラート一覧テーブル */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FaBell className="text-indigo-600" />
              アラート一覧 ({filteredAlerts.length}件)
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="border-gray-300"
              >
                {selectedAlerts.length === filteredAlerts.length ? '選択解除' : '全選択'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllAlerts}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <FaTrash className="mr-2" />
                すべて削除
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ResponsiveTable
            data={filteredAlerts}
            columns={columns}
            actions={actions}
            keyField="id"
            mobileCardTitle={(row) => row.title}
            mobileCardSubtitle={(row) => `${row.itemName} (${row.itemCode})`}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertManagement; 
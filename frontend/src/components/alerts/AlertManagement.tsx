import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  FaBell, 
  FaExclamationTriangle, 
  FaExclamationCircle, 
  FaInfoCircle,
  FaTimes,
  FaCheck,
  FaCog
} from 'react-icons/fa';
import { useAlert } from '../../contexts/AlertContext';
import { ALERT_SEVERITY_COLORS } from '../../types/notifications';

interface AlertManagementProps {
  className?: string;
}

const AlertManagement: React.FC<AlertManagementProps> = ({ className = "" }) => {
  const { alerts, markAsRead, markAsAcknowledged, dismissAlert } = useAlert();

  // 統計情報
  const stats = {
    total: alerts.length,
    unread: alerts.filter(a => !a.isRead).length,
    acknowledged: alerts.filter(a => a.isAcknowledged).length,
    today: alerts.filter(a => {
      const today = new Date().toDateString();
      return new Date(a.createdAt).toDateString() === today;
    }).length
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'high':
        return <FaExclamationCircle className="text-orange-500" />;
      case 'medium':
        return <FaInfoCircle className="text-yellow-500" />;
      case 'low':
        return <FaCheck className="text-blue-500" />;
      default:
        return <FaInfoCircle className="text-gray-500" />;
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '緊急';
      case 'high':
        return '重要';
      case 'medium':
        return '注意';
      case 'low':
        return '情報';
      default:
        return '不明';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総アラート数</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <FaBell className="text-2xl text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">未読</p>
                <p className="text-2xl font-bold text-red-800">{stats.unread}</p>
              </div>
              <FaExclamationCircle className="text-2xl text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">確認済み</p>
                <p className="text-2xl font-bold text-green-800">{stats.acknowledged}</p>
              </div>
              <FaCheck className="text-2xl text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">今日</p>
                <p className="text-2xl font-bold text-purple-800">{stats.today}</p>
              </div>
              <FaCog className="text-2xl text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* アラート一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaBell />
            アラート一覧
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => {
              const colorConfig = ALERT_SEVERITY_COLORS[alert.severity];
              
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${colorConfig.border} ${colorConfig.bg}`}
                >
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className={`font-semibold ${colorConfig.text}`}>
                          {alert.title}
                        </h4>
                        <Badge variant="outline" className={`${colorConfig.border} ${colorConfig.text}`}>
                          {getSeverityLabel(alert.severity)}
                        </Badge>
                        {!alert.isRead && (
                          <Badge className="bg-red-500 text-white">未読</Badge>
                        )}
                      </div>
                      
                      <p className={`text-sm ${colorConfig.text} mb-2`}>
                        {alert.message}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span>商品: {alert.itemName} ({alert.itemCode})</span>
                        <span>カテゴリ: {alert.category}</span>
                        <span>場所: {alert.location}</span>
                        <span>
                          {new Date(alert.createdAt).toLocaleString('ja-JP')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!alert.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsRead(alert.id)}
                          className="text-xs"
                        >
                          <FaCheck className="w-3 h-3" />
                        </Button>
                      )}
                      
                      {!alert.isAcknowledged && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsAcknowledged(alert.id, 'User')}
                          className="text-xs"
                        >
                          <FaBell className="w-3 h-3" />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dismissAlert(alert.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        <FaTimes className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertManagement; 
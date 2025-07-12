import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  FaBell, 
  FaExclamationTriangle, 
  FaExclamationCircle, 
  FaInfoCircle,
  FaTimes,
  FaCheck
} from 'react-icons/fa';
import { useAlert } from '../../contexts/AlertContext';
import { ALERT_SEVERITY_COLORS } from '../../types/notifications';
import type { StockAlert } from '../../types/notifications';

interface AlertBannerProps {
  className?: string;
  maxVisible?: number;
  showActions?: boolean;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ 
  className = "", 
  maxVisible = 3,
  showActions = true 
}) => {
  const { alerts, markAsRead, markAsAcknowledged, dismissAlert } = useAlert();

  // 未読の重要アラートを優先的に表示
  const displayAlerts = alerts
    .filter(alert => !alert.isRead || alert.severity === 'critical')
    .slice(0, maxVisible);

  if (displayAlerts.length === 0) {
    return null;
  }

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

  return (
    <div className={`space-y-2 ${className}`}>
      {displayAlerts.map((alert) => {
        const colorConfig = ALERT_SEVERITY_COLORS[alert.severity];
        
        return (
          <Card 
            key={alert.id} 
            className={`${colorConfig.border} ${colorConfig.bg} shadow-lg animate-pulse`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* アラートアイコン */}
                <div className="flex-shrink-0 mt-1">
                  {getAlertIcon(alert.severity)}
                </div>

                {/* アラート内容 */}
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className={`font-semibold ${colorConfig.text}`}>
                      {alert.title}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={`${colorConfig.border} ${colorConfig.text}`}
                    >
                      {alert.severity === 'critical' ? '緊急' : 
                       alert.severity === 'high' ? '重要' : 
                       alert.severity === 'medium' ? '注意' : '情報'}
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

                {/* アクションボタン */}
                {showActions && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!alert.isRead && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsRead(alert.id)}
                        className="text-xs"
                        title="既読にする"
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
                        title="確認済みにする"
                      >
                        <FaBell className="w-3 h-3" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => dismissAlert(alert.id)}
                      className="text-xs text-red-600 hover:text-red-700"
                      title="削除"
                    >
                      <FaTimes className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AlertBanner; 
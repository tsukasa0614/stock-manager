import React, { useEffect } from 'react';
import { useAlert } from '../../contexts/AlertContext';
import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

interface AlertBannerProps {
  maxVisible?: number;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ 
  maxVisible = 5, 
  autoHide = false, 
  autoHideDelay = 10000 
}) => {
  const { alerts, markAsRead, dismissAlert } = useAlert();

  // 表示するアラートを取得（最新のものから指定数まで）
  const displayedAlerts = alerts.slice(0, maxVisible);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        alerts.forEach(alert => markAsRead(alert.id));
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [alerts, autoHide, autoHideDelay, markAsRead]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'high':
        return <FaExclamationTriangle className="text-orange-500" />;
      case 'medium':
        return <FaInfoCircle className="text-yellow-500" />;
      case 'low':
        return <FaCheckCircle className="text-blue-500" />;
      default:
        return <FaInfoCircle className="text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (displayedAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {displayedAlerts.map(alert => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} ${
            !alert.isRead ? 'ring-2 ring-blue-200' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            {getSeverityIcon(alert.severity)}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">{alert.title}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{alert.createdAt}</span>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
              {alert.itemCode && (
                <p className="text-xs text-gray-500 mt-2">
                  商品コード: {alert.itemCode} | 場所: {alert.location}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 
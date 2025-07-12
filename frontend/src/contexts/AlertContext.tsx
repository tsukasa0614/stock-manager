import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { StockAlert, NotificationSettings } from '../types/notifications';
import { defaultNotificationSettings } from '../types/notifications';
import type { InventoryItem } from '../api/client';

interface AlertContextType {
  alerts: StockAlert[];
  unreadCount: number;
  criticalCount: number;
  settings: NotificationSettings;
  addAlert: (alert: Omit<StockAlert, 'id' | 'createdAt' | 'isRead' | 'isAcknowledged'>) => void;
  markAsRead: (alertId: string) => void;
  markAsAcknowledged: (alertId: string, acknowledgedBy?: string) => void;
  dismissAlert: (alertId: string) => void;
  clearAllAlerts: () => void;
  updateSettings: (settings: NotificationSettings) => void;
  generateAlertsFromInventory: (inventory: InventoryItem[]) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(defaultNotificationSettings);

  // ローカルストレージから設定を読み込む
  useEffect(() => {
    const savedSettings = localStorage.getItem('alertSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    const savedAlerts = localStorage.getItem('stockAlerts');
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }
  }, []);

  // 設定やアラートの変更をローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('alertSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('stockAlerts', JSON.stringify(alerts));
  }, [alerts]);

  // アラートの追加
  const addAlert = (alertData: Omit<StockAlert, 'id' | 'createdAt' | 'isRead' | 'isAcknowledged'>) => {
    const newAlert: StockAlert = {
      ...alertData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      isRead: false,
      isAcknowledged: false
    };

    setAlerts(prev => [newAlert, ...prev]);

    // 通知設定が有効で、通知時間内であれば通知を表示
    if (settings.enabled && isWithinNotificationHours()) {
      showNotification(newAlert);
    }
  };

  // 通知時間内かどうかを判定
  const isWithinNotificationHours = (): boolean => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return currentTime >= settings.notificationHours.start && currentTime <= settings.notificationHours.end;
  };

  // ブラウザ通知を表示
  const showNotification = (alert: StockAlert) => {
    if (!settings.pushNotifications) return;

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(alert.title, {
          body: alert.message,
          icon: '/favicon.ico',
          tag: alert.id
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(alert.title, {
              body: alert.message,
              icon: '/favicon.ico',
              tag: alert.id
            });
          }
        });
      }
    }
  };

  // アラートを既読にする
  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  // アラートを確認済みにする
  const markAsAcknowledged = (alertId: string, acknowledgedBy?: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { 
        ...alert, 
        isAcknowledged: true, 
        acknowledgedAt: new Date().toISOString(),
        acknowledgedBy: acknowledgedBy || 'Unknown'
      } : alert
    ));
  };

  // アラートを削除
  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  // すべてのアラートをクリア
  const clearAllAlerts = () => {
    setAlerts([]);
  };

  // 設定を更新
  const updateSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
  };

  // 在庫データからアラートを生成
  const generateAlertsFromInventory = (inventory: InventoryItem[]) => {
    if (!settings.enabled) return;

    const currentTime = new Date();
    const alertsToday = alerts.filter(alert => {
      const alertDate = new Date(alert.createdAt);
      return alertDate.toDateString() === currentTime.toDateString();
    });

    if (alertsToday.length >= settings.maxAlertsPerDay) {
      return; // 1日の最大アラート数に達している
    }

    inventory.forEach(item => {
      // カテゴリフィルターのチェック
      if (settings.notificationCategories.length > 0 && 
          !settings.notificationCategories.includes(item.category)) {
        return;
      }

      // 既存のアラートをチェック（重複を避ける）
      const existingAlert = alerts.find(alert => 
        alert.itemId === item.id && 
        !alert.isAcknowledged &&
        (alert.type === 'low_stock' || alert.type === 'out_of_stock')
      );

      if (existingAlert) return;

      // 在庫切れアラート
      if (item.stock_quantity <= settings.criticalStockThreshold) {
        addAlert({
          type: 'out_of_stock',
          severity: 'critical',
          title: '在庫切れ警告',
          message: `${item.product_name} (${item.item_code}) の在庫が切れています。`,
          itemId: item.id,
          itemCode: item.item_code,
          itemName: item.product_name,
          currentStock: item.stock_quantity,
          minimumStock: item.lowest_stock,
          shortage: item.lowest_stock - item.stock_quantity,
          category: item.category,
          location: item.storing_place || '未設定',
          factoryName: item.factory_name || '未設定'
        });
      }
      // 在庫少警告
      else if (item.stock_quantity <= (item.lowest_stock * settings.lowStockThreshold / 100)) {
        const severity = item.stock_quantity <= item.lowest_stock * 0.5 ? 'high' : 'medium';
        addAlert({
          type: 'low_stock',
          severity,
          title: '在庫少警告',
          message: `${item.product_name} (${item.item_code}) の在庫が少なくなっています。現在: ${item.stock_quantity}${item.unit}, 最低: ${item.lowest_stock}${item.unit}`,
          itemId: item.id,
          itemCode: item.item_code,
          itemName: item.product_name,
          currentStock: item.stock_quantity,
          minimumStock: item.lowest_stock,
          shortage: item.lowest_stock - item.stock_quantity,
          category: item.category,
          location: item.storing_place || '未設定',
          factoryName: item.factory_name || '未設定'
        });
      }
    });
  };

  // 未読アラート数を計算
  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  // 重要アラート数を計算
  const criticalCount = alerts.filter(alert => 
    alert.severity === 'critical' && !alert.isAcknowledged
  ).length;

  const value: AlertContextType = {
    alerts,
    unreadCount,
    criticalCount,
    settings,
    addAlert,
    markAsRead,
    markAsAcknowledged,
    dismissAlert,
    clearAllAlerts,
    updateSettings,
    generateAlertsFromInventory
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertProvider; 
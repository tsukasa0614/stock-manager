// アラート通知システムの型定義

export interface StockAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'expiry_warning' | 'reorder_point';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  itemId: number;
  itemCode: string;
  itemName: string;
  currentStock: number;
  minimumStock: number;
  shortage: number;
  category: string;
  location: string;
  factoryName: string;
  isRead: boolean;
  isAcknowledged: boolean;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  lowStockThreshold: number; // 最低在庫の何%で警告するか
  criticalStockThreshold: number; // 在庫切れ警告の閾値
  emailNotifications: boolean;
  pushNotifications: boolean;
  notificationCategories: string[]; // 通知対象のカテゴリ
  notificationHours: {
    start: string; // 通知開始時間 (HH:mm)
    end: string;   // 通知終了時間 (HH:mm)
  };
  maxAlertsPerDay: number;
}

export const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  lowStockThreshold: 100, // 最低在庫の100%（つまり最低在庫数と同じ）で警告
  criticalStockThreshold: 0, // 在庫切れで警告
  emailNotifications: false,
  pushNotifications: true,
  notificationCategories: [],
  notificationHours: {
    start: '09:00',
    end: '18:00'
  },
  maxAlertsPerDay: 50
};

export type AlertSeverityColor = {
  bg: string;
  text: string;
  border: string;
  icon: string;
};

export const ALERT_SEVERITY_COLORS: Record<string, AlertSeverityColor> = {
  low: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: 'text-blue-500'
  },
  medium: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    icon: 'text-yellow-500'
  },
  high: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: 'text-orange-500'
  },
  critical: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: 'text-red-500'
  }
}; 
import React, { useMemo, useState } from 'react';
import { useAlert } from '../contexts/AlertContext';
import { Card, CardContent } from '../components/ui/card';
import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaTrash, FaCheck, FaEye } from 'react-icons/fa';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type StatusFilter = 'all' | 'unread' | 'acknowledged' | 'pending';

const severityOrder: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export default function AlertsPage() {
  const { alerts, unreadCount, criticalCount, markAsRead, markAsAcknowledged, dismissAlert, clearAllAlerts } = useAlert();
  const [severity, setSeverity] = useState<'all' | Severity>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return alerts
      .filter(a => (severity === 'all' ? true : a.severity === severity))
      .filter(a => {
        if (status === 'all') return true;
        if (status === 'unread') return !a.isRead;
        if (status === 'acknowledged') return !!a.isAcknowledged;
        if (status === 'pending') return !a.isAcknowledged;
        return true;
      })
      .filter(a => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
          a.title.toLowerCase().includes(q) ||
          a.message.toLowerCase().includes(q) ||
          (a.itemCode?.toLowerCase().includes(q) ?? false) ||
          (a.itemName?.toLowerCase().includes(q) ?? false)
        );
      })
      .sort((a, b) => {
        // 重要度 → 新しい順
        const s = severityOrder[a.severity as Severity] - severityOrder[b.severity as Severity];
        if (s !== 0) return s;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [alerts, severity, status, query]);

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case 'critical':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'high':
        return <FaExclamationTriangle className="text-orange-500" />;
      case 'medium':
        return <FaInfoCircle className="text-yellow-600" />;
      case 'low':
        return <FaCheckCircle className="text-blue-500" />;
      default:
        return <FaInfoCircle className="text-gray-500" />;
    }
  };

  const getRowClasses = (sev: string, isRead: boolean) => {
    const base = 'rounded-lg border p-4';
    const bySeverity =
      sev === 'critical' ? 'bg-red-50 border-red-200' :
      sev === 'high' ? 'bg-orange-50 border-orange-200' :
      sev === 'medium' ? 'bg-yellow-50 border-yellow-200' :
      'bg-blue-50 border-blue-200';
    const ring = isRead ? '' : ' ring-2 ring-blue-200';
    return `${base} ${bySeverity}${ring}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-indigo-100 to-white">
      <div className="container mx-auto py-6 space-y-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-indigo-100 p-8">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-indigo-800 tracking-tight">アラート一覧</h1>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200">重要 {criticalCount}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">未読 {unreadCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearAllAlerts}
                className="px-3 py-2 text-sm bg-white border border-indigo-200 rounded-lg text-gray-700 hover:bg-indigo-50"
              >
                すべてクリア
              </button>
            </div>
          </div>

          {/* フィルタ */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="キーワード（商品名/コード/本文）"
              className="px-3 py-2 bg-white border border-indigo-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              className="px-3 py-2 bg-white border border-indigo-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="all">すべての重要度</option>
              <option value="critical">重大</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className="px-3 py-2 bg-white border border-indigo-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="all">すべての状態</option>
              <option value="unread">未読</option>
              <option value="pending">未確認</option>
              <option value="acknowledged">確認済み</option>
            </select>
          </div>

          {/* 一覧 */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <Card className="bg-white border-0 shadow-xl">
                <CardContent className="p-6 text-sm text-gray-500">アラートはありません</CardContent>
              </Card>
            )}

            {filtered.map(alert => (
              <div key={alert.id} className={getRowClasses(alert.severity, !!alert.isRead)}>
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getSeverityIcon(alert.severity)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{alert.title}</p>
                        <p className="text-sm text-gray-700 mt-1 break-words">{alert.message}</p>
                        <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-3">
                          <span>発生: {new Date(alert.createdAt).toLocaleString()}</span>
                          {alert.itemCode && <span>コード: {alert.itemCode}</span>}
                          {alert.location && <span>場所: {alert.location}</span>}
                          {alert.factoryName && <span>工場: {alert.factoryName}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!alert.isRead && (
                          <button
                            onClick={() => markAsRead(alert.id)}
                            className="px-3 py-2 text-xs bg-white border border-indigo-200 rounded-lg text-gray-700 hover:bg-indigo-50 flex items-center gap-1"
                            title="既読にする"
                          >
                            <FaEye /> 既読
                          </button>
                        )}
                        {!alert.isAcknowledged && (
                          <button
                            onClick={() => markAsAcknowledged(alert.id)}
                            className="px-3 py-2 text-xs bg-white border border-indigo-200 rounded-lg text-gray-700 hover:bg-indigo-50 flex items-center gap-1"
                            title="確認済みにする"
                          >
                            <FaCheck /> 確認
                          </button>
                        )}
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="px-3 py-2 text-xs bg-white border border-indigo-200 rounded-lg text-gray-700 hover:bg-indigo-50 flex items-center gap-1"
                          title="削除"
                        >
                          <FaTrash /> 削除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



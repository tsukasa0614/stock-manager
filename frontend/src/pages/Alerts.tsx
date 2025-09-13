import React, { useMemo, useState } from 'react';
import { useAlert } from '../contexts/AlertContext';
import { Card, CardContent } from '../components/ui/card';
import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaTrash, FaCheck, FaEye, FaDownload, FaChevronLeft, FaChevronRight, FaCalendar } from 'react-icons/fa';

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
  const [factory, setFactory] = useState<string>('all');
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'severity'>('newest');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showTable, setShowTable] = useState<boolean>(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'out_of_stock' | 'low_stock' | 'on_order'>('all');

  const factories = useMemo(() => {
    const set = new Set<string>();
    alerts.forEach(a => { if (a.factoryName) set.add(a.factoryName); });
    return Array.from(set).sort();
  }, [alerts]);

  const periodStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - (periodDays - 1));
    d.setHours(0, 0, 0, 0);
    return d;
  }, [periodDays]);

  const filteredSorted = useMemo(() => {
    return alerts
      .filter(a => (severity === 'all' ? true : a.severity === severity))
      .filter(a => (typeFilter === 'all' ? true : a.type === typeFilter))
      .filter(a => {
        if (status === 'all') return true;
        if (status === 'unread') return !a.isRead;
        if (status === 'acknowledged') return !!a.isAcknowledged;
        if (status === 'pending') return !a.isAcknowledged;
        return true;
      })
      .filter(a => {
        if (factory === 'all') return true;
        return (a.factoryName || '') === factory;
      })
      .filter(a => {
        if (!a.createdAt) return true;
        const d = new Date(a.createdAt);
        return d >= periodStart;
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
        if (sortBy === 'severity') {
          const s = severityOrder[a.severity as Severity] - severityOrder[b.severity as Severity];
          if (s !== 0) return s;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        // newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [alerts, severity, status, query, factory, periodStart, sortBy, typeFilter]);

  const totalCount = filteredSorted.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, currentPage, pageSize]);

  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return alerts.filter(a => new Date(a.createdAt).toDateString() === today).length;
  }, [alerts]);

  const criticalTotal = useMemo(() => alerts.filter(a => a.severity === 'critical').length, [alerts]);
  const highTotal = useMemo(() => alerts.filter(a => a.severity === 'high').length, [alerts]);
  const mediumTotal = useMemo(() => alerts.filter(a => a.severity === 'medium').length, [alerts]);
  const lowTotal = useMemo(() => alerts.filter(a => a.severity === 'low').length, [alerts]);
  const pendingTotal = useMemo(() => alerts.filter(a => !a.isAcknowledged).length, [alerts]);
  const acknowledgedTotal = useMemo(() => alerts.filter(a => !!a.isAcknowledged).length, [alerts]);
  const outOfStockTotal = useMemo(() => alerts.filter(a => a.type === 'out_of_stock').length, [alerts]);
  const lowStockTotal = useMemo(() => alerts.filter(a => a.type === 'low_stock').length, [alerts]);
  const onOrderTotal = useMemo(() => alerts.filter(a => a.type === 'on_order').length, [alerts]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkMarkRead = () => {
    selectedIds.forEach(id => markAsRead(id));
    clearSelection();
  };
  const bulkAcknowledge = () => {
    selectedIds.forEach(id => markAsAcknowledged(id));
    clearSelection();
  };
  const bulkDelete = () => {
    selectedIds.forEach(id => dismissAlert(id));
    clearSelection();
  };

  const exportCsv = () => {
    const rows = (selectedIds.size > 0 ? alerts.filter(a => selectedIds.has(a.id)) : filteredSorted).map(a => ({
      createdAt: a.createdAt,
      severity: a.severity,
      type: a.type,
      title: a.title,
      message: a.message,
      itemCode: a.itemCode || '',
      itemName: a.itemName || '',
      currentStock: (a as any).currentStock ?? '',
      minimumStock: (a as any).minimumStock ?? '',
      shortage: (a as any).shortage ?? '',
      category: a.category || '',
      location: a.location || '',
      factoryName: a.factoryName || '',
      isRead: a.isRead ? 'yes' : 'no',
      isAcknowledged: a.isAcknowledged ? 'yes' : 'no',
    }));
    const headers = Object.keys(rows[0] || { createdAt: '', severity: '', title: '', message: '' });
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${String((r as any)[h]).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
    link.download = `alerts-${ts}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportOutOfStockCsv = () => {
    // 在庫切れアラートのみをフィルタリング
    const outOfStockAlerts = alerts.filter(a => a.type === 'out_of_stock');
    
    const rows = outOfStockAlerts.map(a => ({
      '発生日時': new Date(a.createdAt).toLocaleString('ja-JP'),
      '重要度': a.severity === 'critical' ? '重大' : a.severity === 'high' ? '高' : a.severity === 'medium' ? '中' : '低',
      '商品コード': a.itemCode || '',
      '商品名': a.itemName || '',
      'カテゴリ': a.category || '',
      '現在在庫': (a as any).currentStock ?? '',
      '最低在庫': (a as any).minimumStock ?? '',
      '不足数': (a as any).shortage ?? '',
      '保管場所': a.location || '',
      '工場名': a.factoryName || '',
      'ステータス': a.isAcknowledged ? '確認済' : '未確認',
      '読み取り状況': a.isRead ? '既読' : '未読',
      'メッセージ': a.message
    }));

    if (rows.length === 0) {
      alert('在庫切れアラートがありません');
      return;
    }

    const headers = Object.keys(rows[0]);
    const bom = '\uFEFF'; // BOM for Excel UTF-8 support
    const csv = bom + [headers.join(','), ...rows.map(r => headers.map(h => `"${String((r as any)[h]).replace(/"/g, '""')}"`).join(','))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const ts = new Date().toISOString().split('T')[0];
    link.download = `在庫切れアラート一覧_${ts}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCardClick = (preset: 'out_of_stock'|'low_stock'|'on_order'|'unread'|'pending'|'ack'|'today'|'all') => {
    if (preset === 'unread') {
      setStatus('unread');
      setSeverity('all');
      setTypeFilter('all');
    } else if (preset === 'pending') {
      setStatus('pending');
      setSeverity('all');
      setTypeFilter('all');
    } else if (preset === 'ack') {
      setStatus('acknowledged');
      setSeverity('all');
      setTypeFilter('all');
    } else if (preset === 'today') {
      setPeriodDays(1);
      setSeverity('all');
      setStatus('all');
      setTypeFilter('all');
    } else {
      if (preset === 'all') {
        setSeverity('all');
        setStatus('all');
        setFactory('all');
        setPeriodDays(30);
        setQuery('');
        setTypeFilter('all');
      } else {
        // out_of_stock / low_stock / on_order
        setTypeFilter(preset);
        setSeverity('all');
        setStatus('all');
      }
    }
    setPage(1);
    setShowTable(true);
  };

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
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">本日 {todayCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportOutOfStockCsv}
                className="px-3 py-2 text-sm bg-red-500 text-white border border-red-600 rounded-lg hover:bg-red-600 flex items-center gap-2"
                title="在庫切れアラートをCSV出力"
              >
                <FaDownload /> 在庫切れ
              </button>
              <button
                onClick={exportCsv}
                className="px-3 py-2 text-sm bg-white border border-indigo-200 rounded-lg text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                title={selectedIds.size > 0 ? '選択中のみCSV出力' : '表示中（フィルタ適用後）をCSV出力'}
              >
                <FaDownload /> 全CSV
              </button>
              <button
                onClick={clearAllAlerts}
                className="px-3 py-2 text-sm bg-white border border-indigo-200 rounded-lg text-gray-700 hover:bg-indigo-50"
              >
                すべてクリア
              </button>
            </div>
          </div>

          {/* ステータスカード（3種） */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <button onClick={() => handleCardClick('out_of_stock')} className="bg-white border border-rose-200 rounded-xl p-4 text-left hover:bg-rose-50 transition">
              <p className="text-xs text-gray-500">在庫切れ</p>
              <p className="text-2xl font-extrabold text-rose-700">{outOfStockTotal}</p>
            </button>
            <button onClick={() => handleCardClick('low_stock')} className="bg-white border border-orange-200 rounded-xl p-4 text-left hover:bg-orange-50 transition">
              <p className="text-xs text-gray-500">在庫少</p>
              <p className="text-2xl font-extrabold text-orange-700">{lowStockTotal}</p>
            </button>
            <button onClick={() => handleCardClick('on_order')} className="bg-white border border-blue-200 rounded-xl p-4 text-left hover:bg-blue-50 transition">
              <p className="text-xs text-gray-500">発注中</p>
              <p className="text-2xl font-extrabold text-blue-700">{onOrderTotal}</p>
            </button>
          </div>

          {/* フィルタ */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
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
            <select
              value={factory}
              onChange={(e) => setFactory(e.target.value)}
              className="px-3 py-2 bg-white border border-indigo-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="all">すべての工場</option>
              {factories.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <select
              value={periodDays}
              onChange={(e) => setPeriodDays(Number(e.target.value))}
              className="px-3 py-2 bg-white border border-indigo-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value={7}>7日</option>
              <option value={30}>30日</option>
              <option value={90}>90日</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-white border border-indigo-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="newest">新しい順</option>
              <option value="oldest">古い順</option>
              <option value="severity">重要度順</option>
            </select>
          </div>

          {/* 一括操作バー */}
          {selectedIds.size > 0 && (
            <div className="mb-4 flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg p-2 text-sm">
              <span className="px-2 py-0.5 bg-white rounded border border-indigo-200">{selectedIds.size} 件選択中</span>
              <button onClick={bulkMarkRead} className="px-2 py-1 bg-white border border-indigo-200 rounded hover:bg-indigo-50 flex items-center gap-1"><FaEye /> 既読</button>
              <button onClick={bulkAcknowledge} className="px-2 py-1 bg-white border border-indigo-200 rounded hover:bg-indigo-50 flex items-center gap-1"><FaCheck /> 確認</button>
              <button onClick={bulkDelete} className="px-2 py-1 bg-white border border-rose-200 text-rose-700 rounded hover:bg-rose-50 flex items-center gap-1"><FaTrash /> 削除</button>
              <button onClick={clearSelection} className="ml-auto px-2 py-1 text-gray-600 hover:underline">選択解除</button>
            </div>
          )}

          {/* 一覧（カードまたは表） */}
          <div className="space-y-3">
            {paged.length === 0 && (
              <Card className="bg-white border-0 shadow-xl">
                <CardContent className="p-6 text-sm text-gray-500">アラートはありません</CardContent>
              </Card>
            )}

            {/* 表レイアウト */}
            {showTable ? (
              <div className="overflow-x-auto bg-white border border-indigo-100 rounded-xl shadow">
                <table className="min-w-full text-sm">
                  <thead className="bg-indigo-50 text-indigo-800">
                    <tr>
                      <th className="px-3 py-2 text-left w-10"></th>
                      <th className="px-3 py-2 text-left">重要度</th>
                      <th className="px-3 py-2 text-left">タイトル</th>
                      <th className="px-3 py-2 text-left">メッセージ</th>
                      <th className="px-3 py-2 text-left">商品</th>
                      <th className="px-3 py-2 text-left">工場</th>
                      <th className="px-3 py-2 text-left">発生</th>
                      <th className="px-3 py-2 text-left">状態</th>
                      <th className="px-3 py-2 text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map(alert => (
                      <tr key={alert.id} className="border-t border-gray-100 hover:bg-indigo-50/40">
                        <td className="px-3 py-2 align-top">
                          <input type="checkbox" checked={selectedIds.has(alert.id)} onChange={() => toggleSelect(alert.id)} />
                        </td>
                        <td className="px-3 py-2 align-top">{getSeverityIcon(alert.severity)}</td>
                        <td className="px-3 py-2 align-top font-semibold text-gray-900">{alert.title}</td>
                        <td className="px-3 py-2 align-top text-gray-700">{alert.message}</td>
                        <td className="px-3 py-2 align-top">
                          <div className="text-gray-900">{alert.itemName || '-'}</div>
                          <div className="text-gray-500 text-xs">{alert.itemCode || ''}</div>
                        </td>
                        <td className="px-3 py-2 align-top text-gray-700">{alert.factoryName || '-'}</td>
                        <td className="px-3 py-2 align-top text-gray-700">{new Date(alert.createdAt).toLocaleString()}</td>
                        <td className="px-3 py-2 align-top">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${alert.isAcknowledged ? 'bg-gray-100 text-gray-700' : 'bg-indigo-100 text-indigo-700'}`}>{alert.isAcknowledged ? '確認済' : '未確認'}</span>
                          {!alert.isRead && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">未読</span>}
                        </td>
                        <td className="px-3 py-2 align-top">
                          <div className="flex items-center gap-2">
                            {!alert.isRead && (
                              <button onClick={() => markAsRead(alert.id)} className="px-2 py-1 text-xs bg-white border border-indigo-200 rounded hover:bg-indigo-50 flex items-center gap-1"><FaEye /> 既読</button>
                            )}
                            {!alert.isAcknowledged && (
                              <button onClick={() => markAsAcknowledged(alert.id)} className="px-2 py-1 text-xs bg-white border border-indigo-200 rounded hover:bg-indigo-50 flex items-center gap-1"><FaCheck /> 確認</button>
                            )}
                            <button onClick={() => dismissAlert(alert.id)} className="px-2 py-1 text-xs bg-white border border-rose-200 text-rose-700 rounded hover:bg-rose-50 flex items-center gap-1"><FaTrash /> 削除</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // 旧カード型（視認性改善済）
              paged.map(alert => (
                <div key={alert.id} className={getRowClasses(alert.severity, !!alert.isRead)}>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <input type="checkbox" className="mr-2 align-middle" checked={selectedIds.has(alert.id)} onChange={() => toggleSelect(alert.id)} />
                    </div>
                    <div className="mt-1">{getSeverityIcon(alert.severity)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{alert.title}</p>
                          <p className="text-sm text-gray-700 mt-1 break-words">{alert.message}</p>
                          <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-3">
                            <span className="inline-flex items-center gap-1"><FaCalendar className="text-gray-400" /> {new Date(alert.createdAt).toLocaleString()}</span>
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
              ))
            )}
          </div>

          {/* ページネーション */}
          <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>表示件数</span>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="px-2 py-1 bg-white border border-indigo-200 rounded">
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>全 {totalCount} 件</span>
            </div>
            <div className="flex items-center gap-2">
              <button disabled={currentPage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className={`px-3 py-1 border rounded flex items-center gap-1 ${currentPage <= 1 ? 'text-gray-300 border-gray-200' : 'border-indigo-200 hover:bg-indigo-50'}`}>
                <FaChevronLeft /> 前へ
              </button>
              <span>{currentPage} / {pageCount}</span>
              <button disabled={currentPage >= pageCount} onClick={() => setPage(p => Math.min(pageCount, p + 1))} className={`px-3 py-1 border rounded flex items-center gap-1 ${currentPage >= pageCount ? 'text-gray-300 border-gray-200' : 'border-indigo-200 hover:bg-indigo-50'}`}>
                次へ <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



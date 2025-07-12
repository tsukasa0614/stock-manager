import React from 'react';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { FaBoxOpen, FaEye, FaHistory, FaEdit } from 'react-icons/fa';

interface ResponsiveTableProps {
  data: any[];
  columns: {
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
    className?: string;
  }[];
  actions?: {
    icon: React.ReactNode;
    label: string;
    onClick: (row: any) => void;
    className?: string;
    show?: (row: any) => boolean;
  }[];
  onRowClick?: (row: any) => void;
  keyField?: string;
  mobileCardTitle?: (row: any) => string;
  mobileCardSubtitle?: (row: any) => string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  data,
  columns,
  actions = [],
  onRowClick,
  keyField = 'id',
  mobileCardTitle,
  mobileCardSubtitle
}) => {
  // デスクトップ用テーブル表示
  const renderDesktopTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
            {actions.length > 0 && (
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr
              key={row[keyField]}
              className={`hover:bg-blue-50 transition-colors cursor-pointer ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
              }`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-6 py-4 whitespace-nowrap ${column.className || ''}`}
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    {actions.map((action, actionIndex) => {
                      if (action.show && !action.show(row)) return null;
                      return (
                        <Button
                          key={actionIndex}
                          size="sm"
                          variant="outline"
                          className={action.className || "border-blue-300 text-blue-700 hover:bg-blue-50"}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(row);
                          }}
                        >
                          {action.icon}
                          <span className="ml-1 hidden sm:inline">{action.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // モバイル用カード表示
  const renderMobileCards = () => (
    <div className="space-y-4">
      {data.map((row) => (
        <Card
          key={row[keyField]}
          className="shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
          onClick={() => onRowClick?.(row)}
        >
          <CardContent className="p-4">
            {/* カードヘッダー */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaBoxOpen className="text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {mobileCardTitle ? mobileCardTitle(row) : row[columns[0]?.key] || ''}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {mobileCardSubtitle ? mobileCardSubtitle(row) : row[columns[1]?.key] || ''}
                  </p>
                </div>
              </div>
              {actions.length > 0 && (
                <div className="flex gap-1">
                  {actions.slice(0, 2).map((action, actionIndex) => {
                    if (action.show && !action.show(row)) return null;
                    return (
                      <Button
                        key={actionIndex}
                        size="sm"
                        variant="outline"
                        className={`p-2 ${action.className || "border-blue-300 text-blue-700 hover:bg-blue-50"}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick(row);
                        }}
                      >
                        {action.icon}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* カード内容 */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {columns.slice(2).map((column) => (
                <div key={column.key} className="flex flex-col">
                  <span className="text-gray-500 text-xs font-medium">{column.label}</span>
                  <span className="text-gray-900 font-medium">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </span>
                </div>
              ))}
            </div>

            {/* 追加のアクション（3つ目以降）*/}
            {actions.length > 2 && (
              <div className="flex gap-2 mt-3 pt-3 border-t">
                {actions.slice(2).map((action, actionIndex) => {
                  if (action.show && !action.show(row)) return null;
                  return (
                    <Button
                      key={actionIndex}
                      size="sm"
                      variant="outline"
                      className={`flex-1 text-xs ${action.className || "border-blue-300 text-blue-700 hover:bg-blue-50"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick(row);
                      }}
                    >
                      {action.icon}
                      <span className="ml-1">{action.label}</span>
                    </Button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div>
      {/* デスクトップ表示（768px以上）*/}
      <div className="hidden md:block">
        {renderDesktopTable()}
      </div>

      {/* モバイル・タブレット表示（768px未満）*/}
      <div className="md:hidden">
        {renderMobileCards()}
      </div>
    </div>
  );
};

export default ResponsiveTable; 
import React from 'react';
import { Card, CardContent } from './card';
import { Button } from './button';
import { FaBoxOpen } from 'react-icons/fa';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
}

interface Action {
  icon: React.ReactNode;
  label: string;
  onClick: (row: any) => void;
  className?: string;
  show?: (row: any) => boolean;
}

interface ResponsiveTableProps {
  data: any[];
  columns: Column[];
  actions?: Action[];
  keyField?: string;
  className?: string;
  mobileCardTitle?: (row: any) => string;
  mobileCardSubtitle?: (row: any) => string;
  emptyMessage?: string;
  loading?: boolean;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  data,
  columns,
  actions = [],
  keyField = 'id',
  className = '',
  mobileCardTitle,
  mobileCardSubtitle,
  emptyMessage = 'データがありません',
  loading = false
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FaBoxOpen className="mx-auto mb-4 text-4xl" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row) => (
              <tr key={row[keyField]} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ''}`}
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {actions.map((action, index) => {
                        if (action.show && !action.show(row)) return null;
                        return (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => action.onClick(row)}
                            className={`${action.className || ''}`}
                            title={action.label}
                          >
                            {action.icon}
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data.map((row) => (
          <Card key={row[keyField]} className="p-4">
            <CardContent className="p-0">
              <div className="space-y-2">
                {mobileCardTitle && (
                  <h3 className="font-medium text-gray-900">{mobileCardTitle(row)}</h3>
                )}
                {mobileCardSubtitle && (
                  <p className="text-sm text-gray-600">{mobileCardSubtitle(row)}</p>
                )}
                {columns.map((column) => (
                  <div key={column.key} className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">{column.label}:</span>
                    <span className="text-sm text-gray-900">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </span>
                  </div>
                ))}
                {actions.length > 0 && (
                  <div className="flex space-x-2 mt-4">
                    {actions.map((action, index) => {
                      if (action.show && !action.show(row)) return null;
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => action.onClick(row)}
                          className={`${action.className || ''}`}
                        >
                          {action.icon}
                          <span className="ml-1">{action.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}; 
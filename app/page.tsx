'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/formatters';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  AlertCircle,
  Wallet,
  FileText,
} from 'lucide-react';

interface DashboardStats {
  sales: {
    totalRevenue: number;
    monthRevenue: number;
    totalOrders: number;
    monthOrders: number;
  };
  payments: {
    monthTotal: number;
    monthCount: number;
  };
  outstanding: {
    total: number;
    customerCount: number;
  };
  expenses: {
    monthTotal: number;
    monthCount: number;
  };
  inventory: {
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  taxes: {
    unpaidCount: number;
    totalDue: number;
  };
  profitability: {
    monthGrossProfit: number;
    monthNetProfit: number;
    profitMargin: number;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/dashboard')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data);
        }
      })
      .catch((error) => console.error('Error fetching dashboard stats:', error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome to PAT-ANI GRAINS LIMITED Warehouse Management System
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.sales.totalRevenue)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(stats.sales.monthRevenue)} this month
            </p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            <ShoppingCart className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sales.totalOrders.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">{stats.sales.monthOrders} this month</p>
          </CardContent>
        </Card>

        {/* Outstanding Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Outstanding</CardTitle>
            <Users className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.outstanding.total)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.outstanding.customerCount} customers
            </p>
          </CardContent>
        </Card>

        {/* Inventory Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Inventory Value</CardTitle>
            <Package className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.inventory.totalValue)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.inventory.lowStockCount} low stock items
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Profitability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              Profitability (This Month)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Gross Profit:</span>
              <span className="font-semibold">{formatCurrency(stats.profitability.monthGrossProfit)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Expenses:</span>
              <span className="font-semibold text-red-600">
                -{formatCurrency(stats.expenses.monthTotal)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium">Net Profit:</span>
              <span className="font-bold text-lg">{formatCurrency(stats.profitability.monthNetProfit)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Profit Margin:</span>
              <span className="font-semibold">{stats.profitability.profitMargin.toFixed(2)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <Package className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-sm text-gray-700">Low Stock Items</span>
              </div>
              <span className="font-semibold text-yellow-700">{stats.inventory.lowStockCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <Package className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-sm text-gray-700">Out of Stock</span>
              </div>
              <span className="font-semibold text-red-700">{stats.inventory.outOfStockCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm text-gray-700">Unpaid Taxes</span>
              </div>
              <span className="font-semibold text-blue-700">{stats.taxes.unpaidCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <Wallet className="h-4 w-4 text-purple-600 mr-2" />
                <span className="text-sm text-gray-700">Tax Amount Due</span>
              </div>
              <span className="font-semibold text-purple-700">{formatCurrency(stats.taxes.totalDue)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

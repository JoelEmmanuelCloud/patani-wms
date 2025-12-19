'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Search, CreditCard } from 'lucide-react';

interface Payment {
  _id: string;
  paymentNumber: string;
  customer: {
    _id: string;
    name: string;
    phone: string;
  };
  order?: {
    _id: string;
    orderNumber: string;
  };
  amount: number;
  paymentMethod: string;
  paymentDate: Date;
  referenceNumber?: string;
  bankName?: string;
  notes?: string;
  status: string;
  receivedBy: string;
  createdAt: Date;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPayments = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (methodFilter) params.append('method', methodFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/payments?${params}`);
      const data = await res.json();
      if (data.success) {
        setPayments(data.data.payments);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [search, methodFilter, statusFilter]);

  const getPaymentMethodBadgeColor = (method: string) => {
    const colors: Record<string, string> = {
      'Cash': 'bg-green-100 text-green-800',
      'Bank Transfer': 'bg-blue-100 text-blue-800',
      'POS': 'bg-purple-100 text-purple-800',
      'Mobile Money': 'bg-orange-100 text-orange-800',
      'Cheque': 'bg-gray-100 text-gray-800',
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="mt-2 text-sm text-gray-600">Track and manage customer payments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(payments.filter(p => p.status === 'Confirmed').reduce((sum, p) => sum + p.amount, 0))}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0))}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by payment number, customer or reference..."
                  className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <Select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full sm:w-48"
            >
              <option value="">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="POS">POS</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Cheque">Cheque</option>
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48"
            >
              <option value="">All Status</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading payments...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No payments found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell className="font-medium">{payment.paymentNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div>{payment.customer.name}</div>
                        <div className="text-sm text-gray-500">{payment.customer.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {payment.order ? (
                        <span className="text-sm font-medium text-primary-600">
                          {payment.order.orderNumber}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentMethodBadgeColor(payment.paymentMethod)}`}>
                        {payment.paymentMethod}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>
                      {payment.referenceNumber ? (
                        <div>
                          <div className="text-sm font-mono">{payment.referenceNumber}</div>
                          {payment.bankName && (
                            <div className="text-xs text-gray-500">{payment.bankName}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge status={payment.status} />
                    </TableCell>
                    <TableCell className="text-sm">{payment.receivedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

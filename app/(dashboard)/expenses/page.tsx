'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils/formatters';
import { Plus, Search, Edit, Trash2, TrendingDown, FileText } from 'lucide-react';
import { downloadExpenseReport } from '@/lib/utils/pdf-client-handlers';

interface Expense {
  _id: string;
  expenseNumber: string;
  category: string;
  description: string;
  amount: number;
  vendor: {
    name: string;
    contact: string;
  };
  paymentMethod: string;
  expenseDate: Date;
  referenceNumber?: string;
  invoiceNumber?: string;
  status: string;
  taxDeductible: boolean;
  notes?: string;
  recordedBy: string;
  createdAt: Date;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const [formData, setFormData] = useState({
    category: 'Transportation',
    description: '',
    amount: '' as any,
    vendor: {
      name: '',
      contact: '',
    },
    paymentMethod: 'Cash',
    expenseDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    invoiceNumber: '',
    status: 'Paid',
    taxDeductible: false,
    notes: '',
  });

  const categories = [
    'Transportation',
    'Utilities',
    'Salaries',
    'Rent',
    'Maintenance',
    'Marketing',
    'Office Supplies',
    'Insurance',
    'Professional Services',
    'Fuel',
    'Loading/Offloading',
    'Security',
    'Other',
  ];

  const fetchExpenses = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/expenses?${params}`);
      const data = await res.json();
      if (data.success) {
        setExpenses(data.data.expenses);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [search, categoryFilter, statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingExpense ? `/api/expenses/${editingExpense._id}` : '/api/expenses';
      const method = editingExpense ? 'PUT' : 'POST';

      // Convert formatted string to number
      const submitData = {
        ...formData,
        amount: typeof formData.amount === 'string'
          ? Number(formData.amount.replace(/,/g, ''))
          : formData.amount,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setEditingExpense(null);
        resetForm();
        fetchExpenses();
      } else {
        alert(data.message || 'Failed to save expense');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchExpenses();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleDownloadExpensePDF = async () => {
    setIsDownloadingPDF(true);
    try {
      await downloadExpenseReport();
    } catch (error) {
      alert('Failed to generate expense report. Please try again.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'Transportation',
      description: '',
      amount: '' as any,
      vendor: {
        name: '',
        contact: '',
      },
      paymentMethod: 'Cash',
      expenseDate: new Date().toISOString().split('T')[0],
      referenceNumber: '',
      invoiceNumber: '',
      status: 'Paid',
      taxDeductible: false,
      notes: '',
    });
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: formatNumber(expense.amount) as any,
      vendor: expense.vendor,
      paymentMethod: expense.paymentMethod,
      expenseDate: new Date(expense.expenseDate).toISOString().split('T')[0],
      referenceNumber: expense.referenceNumber || '',
      invoiceNumber: expense.invoiceNumber || '',
      status: expense.status,
      taxDeductible: expense.taxDeductible,
      notes: expense.notes || '',
    });
    setShowForm(true);
  };

  // Format number with thousand separators
  const formatNumberInput = (value: string): string => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';

    // Add thousand separators
    return Number(numbers).toLocaleString('en-US');
  };

  // Handle numeric input change with formatting
  const handleAmountChange = (value: string) => {
    const formatted = formatNumberInput(value);
    setFormData({ ...formData, amount: formatted });
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const paidExpenses = expenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'Pending').reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expense Management</h1>
          <p className="mt-2 text-sm text-gray-600">Track and manage business expenses</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleDownloadExpensePDF}
            isLoading={isDownloadingPDF}
            disabled={isDownloadingPDF}
          >
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={() => { resetForm(); setShowForm(true); setEditingExpense(null); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(paidExpenses)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(pendingExpenses)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingExpense ? 'Edit' : 'Add'} Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Select>
                <Input
                  label="Amount (₦)"
                  type="text"
                  required
                  value={formData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="e.g., 10,000"
                />
                <Input
                  label="Description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="md:col-span-2"
                />
                <Input
                  label="Vendor Name"
                  required
                  value={formData.vendor.name}
                  onChange={(e) => setFormData({ ...formData, vendor: { ...formData.vendor, name: e.target.value } })}
                />
                <Input
                  label="Vendor Contact"
                  required
                  value={formData.vendor.contact}
                  onChange={(e) => setFormData({ ...formData, vendor: { ...formData.vendor, contact: e.target.value } })}
                />
                <Select
                  label="Payment Method"
                  required
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="POS">POS</option>
                  <option value="Mobile Money">Mobile Money</option>
                </Select>
                <Input
                  label="Expense Date"
                  type="date"
                  required
                  value={formData.expenseDate}
                  onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                />
                <Input
                  label="Reference Number"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                />
                <Input
                  label="Invoice Number"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                />
                <Select
                  label="Status"
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Paid">Paid</option>
                  <option value="Rejected">Rejected</option>
                </Select>
                <div className="flex items-center gap-2 md:col-span-2">
                  <input
                    type="checkbox"
                    id="taxDeductible"
                    checked={formData.taxDeductible}
                    onChange={(e) => setFormData({ ...formData, taxDeductible: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="taxDeductible" className="text-sm font-medium text-gray-700">
                    Tax Deductible
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" isLoading={loading}>
                  {editingExpense ? 'Update' : 'Add'} Expense
                </Button>
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setEditingExpense(null); resetForm(); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by description or vendor..."
                  className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-48"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Paid">Paid</option>
              <option value="Rejected">Rejected</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12">
              <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No expenses found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expense #</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense._id}>
                    <TableCell className="font-medium">{expense.expenseNumber}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{expense.description}</div>
                        {expense.taxDeductible && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            Tax Deductible
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{expense.vendor.name}</div>
                        <div className="text-xs text-gray-500">{expense.vendor.contact}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-red-600">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(expense.expenseDate)}</TableCell>
                    <TableCell>
                      <Badge status={expense.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(expense)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(expense._id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
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

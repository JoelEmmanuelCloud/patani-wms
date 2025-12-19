'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils/formatters';
import { Plus, Search, Edit, Trash2, FileText } from 'lucide-react';

interface Tax {
  _id: string;
  taxNumber: string;
  taxType: string;
  taxPeriod: {
    month?: number;
    quarter?: number;
    year: number;
  };
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  dueDate: Date;
  paymentDate?: Date;
  status: string;
  paymentReference?: string;
  paymentMethod?: string;
  receiptNumber?: string;
  filingReference?: string;
  notes?: string;
  recordedBy: string;
  createdAt: Date;
}

export default function TaxesPage() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);

  const [formData, setFormData] = useState({
    taxType: 'VAT',
    taxPeriod: {
      month: undefined as number | undefined,
      quarter: undefined as number | undefined,
      year: new Date().getFullYear(),
    } as { month?: number; quarter?: number; year: number },
    taxableAmount: '' as any,
    taxRate: '' as any,
    dueDate: new Date().toISOString().split('T')[0],
    paymentDate: '',
    paymentReference: '',
    paymentMethod: '',
    receiptNumber: '',
    filingReference: '',
    notes: '',
  });

  const taxTypes = [
    'VAT',
    'Company Income Tax',
    'WHT',
    'Personal Income Tax',
    'Import Duty',
    'Export Levy',
    'Business Premises Tax',
    'Education Tax',
    'Other',
  ];

  const fetchTaxes = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/taxes?${params}`);
      const data = await res.json();
      if (data.success) {
        setTaxes(data.data.taxes);
      }
    } catch (error) {
      console.error('Error fetching taxes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, [search, typeFilter, statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert formatted strings to numbers
      const taxableAmount = typeof formData.taxableAmount === 'string'
        ? Number(formData.taxableAmount.replace(/,/g, ''))
        : formData.taxableAmount;
      const taxRate = typeof formData.taxRate === 'string'
        ? Number(formData.taxRate.replace(/,/g, ''))
        : formData.taxRate;

      const taxAmount = (taxableAmount * taxRate) / 100;
      const url = editingTax ? `/api/taxes/${editingTax._id}` : '/api/taxes';
      const method = editingTax ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          taxableAmount,
          taxRate,
          taxAmount,
          status: formData.paymentDate ? 'Paid' : 'Pending',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setEditingTax(null);
        resetForm();
        fetchTaxes();
      } else {
        alert(data.message || 'Failed to save tax');
      }
    } catch (error) {
      console.error('Error saving tax:', error);
      alert('Failed to save tax');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tax record?')) return;

    try {
      const res = await fetch(`/api/taxes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchTaxes();
      }
    } catch (error) {
      console.error('Error deleting tax:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      taxType: 'VAT',
      taxPeriod: {
        month: undefined,
        quarter: undefined,
        year: new Date().getFullYear(),
      } as { month?: number; quarter?: number; year: number },
      taxableAmount: '' as any,
      taxRate: '' as any,
      dueDate: new Date().toISOString().split('T')[0],
      paymentDate: '',
      paymentReference: '',
      paymentMethod: '',
      receiptNumber: '',
      filingReference: '',
      notes: '',
    });
  };

  const handleEdit = (tax: Tax) => {
    setEditingTax(tax);
    setFormData({
      taxType: tax.taxType,
      taxPeriod: tax.taxPeriod,
      taxableAmount: formatNumber(tax.taxableAmount) as any,
      taxRate: tax.taxRate.toString() as any,
      dueDate: new Date(tax.dueDate).toISOString().split('T')[0],
      paymentDate: tax.paymentDate ? new Date(tax.paymentDate).toISOString().split('T')[0] : '',
      paymentReference: tax.paymentReference || '',
      paymentMethod: tax.paymentMethod || '',
      receiptNumber: tax.receiptNumber || '',
      filingReference: tax.filingReference || '',
      notes: tax.notes || '',
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

  // Format decimal number (for tax rate)
  const formatDecimalInput = (value: string): string => {
    // Allow digits and one decimal point
    const cleaned = value.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return cleaned;
  };

  // Handle taxable amount change with formatting
  const handleTaxableAmountChange = (value: string) => {
    const formatted = formatNumberInput(value);
    setFormData({ ...formData, taxableAmount: formatted });
  };

  // Handle tax rate change
  const handleTaxRateChange = (value: string) => {
    const formatted = formatDecimalInput(value);
    setFormData({ ...formData, taxRate: formatted });
  };

  const getTaxPeriodDisplay = (tax: Tax) => {
    if (tax.taxPeriod.month) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[tax.taxPeriod.month - 1]} ${tax.taxPeriod.year}`;
    } else if (tax.taxPeriod.quarter) {
      return `Q${tax.taxPeriod.quarter} ${tax.taxPeriod.year}`;
    }
    return tax.taxPeriod.year.toString();
  };

  const totalTaxes = taxes.reduce((sum, t) => sum + t.taxAmount, 0);
  const paidTaxes = taxes.filter(t => t.status === 'Paid').reduce((sum, t) => sum + t.taxAmount, 0);
  const pendingTaxes = taxes.filter(t => t.status === 'Pending').reduce((sum, t) => sum + t.taxAmount, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tax Management</h1>
          <p className="mt-2 text-sm text-gray-600">Track and manage tax obligations</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); setEditingTax(null); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Tax Record
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Taxes</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalTaxes)}</p>
              </div>
              <FileText className="h-8 w-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(paidTaxes)}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(pendingTaxes)}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingTax ? 'Edit' : 'Add'} Tax Record</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Tax Type"
                  required
                  value={formData.taxType}
                  onChange={(e) => setFormData({ ...formData, taxType: e.target.value })}
                >
                  {taxTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
                <Input
                  label="Year"
                  type="number"
                  required
                  value={formData.taxPeriod.year}
                  onChange={(e) => setFormData({ ...formData, taxPeriod: { ...formData.taxPeriod, year: Number(e.target.value) } })}
                />
                <Input
                  label="Month (Optional)"
                  type="number"
                  min="1"
                  max="12"
                  value={formData.taxPeriod.month || ''}
                  onChange={(e) => setFormData({ ...formData, taxPeriod: { ...formData.taxPeriod, month: e.target.value ? Number(e.target.value) : undefined } })}
                />
                <Input
                  label="Quarter (Optional)"
                  type="number"
                  min="1"
                  max="4"
                  value={formData.taxPeriod.quarter || ''}
                  onChange={(e) => setFormData({ ...formData, taxPeriod: { ...formData.taxPeriod, quarter: e.target.value ? Number(e.target.value) : undefined } })}
                />
                <Input
                  label="Taxable Amount (₦)"
                  type="text"
                  required
                  value={formData.taxableAmount}
                  onChange={(e) => handleTaxableAmountChange(e.target.value)}
                  placeholder="e.g., 1,000,000"
                />
                <Input
                  label="Tax Rate (%)"
                  type="text"
                  required
                  value={formData.taxRate}
                  onChange={(e) => handleTaxRateChange(e.target.value)}
                  placeholder="e.g., 7.5"
                />
                <Input
                  label="Tax Amount (Auto-calculated)"
                  type="text"
                  disabled
                  value={(() => {
                    const taxableAmount = typeof formData.taxableAmount === 'string'
                      ? Number(formData.taxableAmount.replace(/,/g, ''))
                      : formData.taxableAmount;
                    const taxRate = typeof formData.taxRate === 'string'
                      ? Number(formData.taxRate.replace(/,/g, ''))
                      : formData.taxRate;
                    const taxAmount = (taxableAmount * taxRate) / 100;
                    return isNaN(taxAmount) ? '' : formatNumber(taxAmount);
                  })()}
                />
                <Input
                  label="Due Date"
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
                <Input
                  label="Payment Date (Optional)"
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                />
                <Select
                  label="Payment Method (Optional)"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  <option value="">Select Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Online Payment">Online Payment</option>
                </Select>
                <Input
                  label="Payment Reference"
                  value={formData.paymentReference}
                  onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                />
                <Input
                  label="Receipt Number"
                  value={formData.receiptNumber}
                  onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                />
                <Input
                  label="Filing Reference"
                  value={formData.filingReference}
                  onChange={(e) => setFormData({ ...formData, filingReference: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" isLoading={loading}>
                  {editingTax ? 'Update' : 'Add'} Tax Record
                </Button>
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setEditingTax(null); resetForm(); }}>
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
                  placeholder="Search by tax number or reference..."
                  className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full sm:w-48"
            >
              <option value="">All Types</option>
              {taxTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Partially Paid">Partially Paid</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading taxes...</p>
            </div>
          ) : taxes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No tax records found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tax #</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Taxable Amount</TableHead>
                  <TableHead>Tax Rate</TableHead>
                  <TableHead>Tax Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxes.map((tax) => (
                  <TableRow key={tax._id}>
                    <TableCell className="font-medium">{tax.taxNumber}</TableCell>
                    <TableCell>{tax.taxType}</TableCell>
                    <TableCell>{getTaxPeriodDisplay(tax)}</TableCell>
                    <TableCell>{formatCurrency(tax.taxableAmount)}</TableCell>
                    <TableCell>{tax.taxRate}%</TableCell>
                    <TableCell className="font-medium text-red-600">
                      {formatCurrency(tax.taxAmount)}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{formatDate(tax.dueDate)}</div>
                      {tax.paymentDate && (
                        <div className="text-xs text-green-600">
                          Paid: {formatDate(tax.paymentDate)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge status={tax.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(tax)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(tax._id)}>
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

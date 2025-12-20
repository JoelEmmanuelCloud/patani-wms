'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input, Select } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { formatCurrency, formatNumber } from '../../../lib/utils/formatters';
import { Plus, Search, Edit, Trash2, Users, Eye } from 'lucide-react';

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
  businessName?: string;
  customerType: string;
  balance: number;
  oldBalance: number;
  creditLimit: number;
  status: string;
  totalOrders: number;
  totalPurchases: number;
  lastOrderDate?: Date;
  notes?: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Nigeria',
    },
    businessName: '',
    customerType: 'Retail',
    oldBalance: '' as string | number,
    notes: '',
  });

  const fetchCustomers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/customers?${params}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data.customers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, typeFilter, statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer._id}` : '/api/customers';
      const method = editingCustomer ? 'PUT' : 'POST';

      // Convert empty oldBalance to 0 and parse formatted value (remove commas)
      const oldBalanceValue = formData.oldBalance === ''
        ? 0
        : Number(typeof formData.oldBalance === 'string' ? formData.oldBalance.replace(/,/g, '') : formData.oldBalance);

      const submitData = {
        ...formData,
        oldBalance: oldBalanceValue,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setEditingCustomer(null);
        resetForm();
        fetchCustomers();
      } else {
        alert(data.message || 'Failed to save customer');
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchCustomers();
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: 'Nigeria',
      },
      businessName: '',
      customerType: 'Retail',
      oldBalance: '',
      notes: '',
    });
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address,
      businessName: customer.businessName || '',
      customerType: customer.customerType,
      oldBalance: customer.oldBalance ? formatNumberWithCommas(customer.oldBalance) : '',
      notes: customer.notes || '',
    });
    setShowForm(true);
  };

  const formatNumberWithCommas = (value: number | string): string => {
    if (!value) return '';
    const numValue = typeof value === 'string' ? value.replace(/,/g, '') : value.toString();
    const number = parseFloat(numValue);
    if (isNaN(number)) return '';
    return number.toLocaleString('en-US');
  };

  const handleOldBalanceChange = (value: string) => {
    // Remove all non-digit characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, '');

    // Format with commas
    if (cleanValue === '') {
      setFormData({ ...formData, oldBalance: '' });
    } else {
      const formatted = formatNumberWithCommas(cleanValue);
      setFormData({ ...formData, oldBalance: formatted });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="mt-2 text-sm text-gray-600">Manage your customer relationships</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); setEditingCustomer(null); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingCustomer ? 'Edit' : 'Add'} Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Customer Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., John Doe"
                />
                <Input
                  label="Phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g., 08012345678"
                />
                <Input
                  label="Email (Optional)"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g., customer@example.com"
                />
                <Input
                  label="Business Name (Optional)"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="e.g., ABC Trading Ltd"
                />
                <Select
                  label="Customer Type"
                  required
                  value={formData.customerType}
                  onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                >
                  <option value="Retail">Retail</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Individual">Individual</option>
                </Select>
                <Input
                  label="Old Balance (₦)"
                  type="text"
                  value={formData.oldBalance}
                  onChange={(e) => handleOldBalanceChange(e.target.value)}
                  placeholder="Previous balance before system"
                />
                <Input
                  label="Street Address"
                  required
                  value={formData.address.street}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                  placeholder="e.g., 123 Main Street"
                />
                <Input
                  label="City"
                  required
                  value={formData.address.city}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                  placeholder="e.g., Lagos"
                />
                <Input
                  label="State"
                  required
                  value={formData.address.state}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                  placeholder="e.g., Lagos"
                />
                <Input
                  label="Country"
                  required
                  value={formData.address.country}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })}
                />
              </div>
              <div className="col-span-2">
                <Input
                  label="Notes (Optional)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional information..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" isLoading={loading}>
                  {editingCustomer ? 'Update' : 'Add'} Customer
                </Button>
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setEditingCustomer(null); resetForm(); }}>
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
                  placeholder="Search by name, phone or business..."
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
              <option value="Retail">Retail</option>
              <option value="Wholesale">Wholesale</option>
              <option value="Distributor">Distributor</option>
              <option value="Individual">Individual</option>
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading customers...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No customers found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell>
                      <Link
                        href={`/customers/${customer._id}`}
                        className="block cursor-pointer hover:text-primary-600 transition-colors"
                      >
                        <div className="font-medium">{customer.name}</div>
                        {customer.businessName && (
                          <div className="text-sm text-gray-500">{customer.businessName}</div>
                        )}
                      </Link>
                    </TableCell>
                    <TableCell>{customer.customerType}</TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{customer.phone}</div>
                        {customer.email && (
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {customer.address.city}, {customer.address.state}
                      </div>
                    </TableCell>
                    <TableCell className={customer.balance > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                      {formatCurrency(customer.balance)}
                    </TableCell>
                    <TableCell>{formatNumber(customer.totalOrders)}</TableCell>
                    <TableCell>
                      <Badge status={customer.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/customers/${customer._id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            type="button"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(customer)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(customer._id)}>
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

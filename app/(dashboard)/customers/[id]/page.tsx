'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils/formatters';
import { ArrowLeft, Download, FileText, Phone, Mail, MapPin, Building, Plus, CreditCard, Printer, Edit, Trash2 } from 'lucide-react';
import { downloadCustomerStatement, downloadOrderInvoice } from '@/lib/utils/pdf-client-handlers';

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

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: Date;
  items: any[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  balance: number;
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  deliveryAddress?: string;
  notes?: string;
}

interface Payment {
  _id: string;
  paymentNumber: string;
  paymentDate: Date;
  amount: number;
  paymentMethod: string;
  status: string;
  referenceNumber?: string;
  bankName?: string;
  notes?: string;
}

interface CustomerStats {
  totalOrders: number;
  totalOrderValue: number;
  totalPayments: number;
  currentBalance: number;
  oldBalance: number;
  totalDebt: number;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showEditOrderForm, setShowEditOrderForm] = useState(false);

  // Order form state
  const [orderItems, setOrderItems] = useState<any[]>([{ inventory: '', quantity: '', unitPrice: 0 }]);
  const [orderFormData, setOrderFormData] = useState({
    amountPaid: '' as string | number,
    deliveryAddress: '',
    notes: '',
  });

  // Payment form state
  const [paymentFormData, setPaymentFormData] = useState({
    amount: '' as string | number,
    paymentMethod: 'Cash',
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    bankName: '',
    notes: '',
    receivedBy: 'Admin',
  });

  // Edit order form state
  const [editOrderFormData, setEditOrderFormData] = useState({
    status: 'Pending',
    deliveryStatus: 'Not Dispatched',
    deliveryAddress: '',
    notes: '',
  });

  // Format number with thousand separators
  const formatNumberWithCommas = (value: number | string): string => {
    if (!value) return '';
    const numValue = typeof value === 'string' ? value.replace(/,/g, '') : value.toString();
    const number = parseFloat(numValue);
    if (isNaN(number)) return '';
    return number.toLocaleString('en-US');
  };

  // Handle payment amount change with formatting
  const handlePaymentAmountChange = (value: string) => {
    // Remove all non-digit characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, '');

    // Format with commas
    if (cleanValue === '') {
      setPaymentFormData({ ...paymentFormData, amount: '' });
    } else {
      const formatted = formatNumberWithCommas(cleanValue);
      setPaymentFormData({ ...paymentFormData, amount: formatted });
    }
  };

  // Handle order amount paid change with formatting
  const handleOrderAmountPaidChange = (value: string) => {
    // Remove all non-digit characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, '');

    // Format with commas
    if (cleanValue === '') {
      setOrderFormData({ ...orderFormData, amountPaid: '' });
    } else {
      const formatted = formatNumberWithCommas(cleanValue);
      setOrderFormData({ ...orderFormData, amountPaid: formatted });
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, [customerId]);

  useEffect(() => {
    if (showOrderForm) {
      fetchInventoryItems();
    }
  }, [showOrderForm]);

  const fetchInventoryItems = async () => {
    try {
      const response = await fetch('/api/inventory?limit=1000');
      const result = await response.json();
      if (result.success) {
        setInventoryItems(result.data.items);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/customers/${customerId}`);
      const result = await response.json();

      if (result.success) {
        setCustomer(result.data.customer);
        setOrders(result.data.orders);
        setPayments(result.data.payments);
        setStats(result.data.stats);
      } else {
        alert('Failed to fetch customer details');
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      alert('Error loading customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadStatement = async () => {
    setIsDownloadingPDF(true);
    try {
      await downloadCustomerStatement(customerId);
    } catch (error) {
      alert('Failed to generate statement PDF. Please try again.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleDownloadOrderInvoice = async (orderId: string) => {
    setDownloadingOrderId(orderId);
    try {
      await downloadOrderInvoice(orderId);
    } catch (error) {
      alert('Failed to generate invoice PDF. Please try again.');
    } finally {
      setDownloadingOrderId(null);
    }
  };

  const handleEditOrder = (order: Order) => {
    console.log('Edit order clicked:', order.orderNumber);

    // Close other forms first
    setShowOrderForm(false);
    setShowPaymentForm(false);

    // Set the editing order and form data
    setEditingOrder(order);
    setEditOrderFormData({
      status: order.status,
      deliveryStatus: order.deliveryStatus,
      deliveryAddress: order.deliveryAddress || '',
      notes: order.notes || '',
    });

    // Show the edit form
    setShowEditOrderForm(true);

    // Scroll to top to see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${editingOrder._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editOrderFormData),
      });

      const result = await response.json();

      if (result.success) {
        alert('Order updated successfully!');
        setShowEditOrderForm(false);
        setEditingOrder(null);
        fetchCustomerDetails();
      } else {
        alert(result.message || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    console.log('Delete order clicked:', order.orderNumber);

    const confirmMessage = `Are you sure you want to PERMANENTLY DELETE order ${order.orderNumber}?\n\nThis will:\n- DELETE the order completely\n- Restore ${order.items.length} item(s) to inventory\n- Remove all associated payments\n- Adjust customer balance accordingly\n\nThis action CANNOT be undone!`;

    if (!confirm(confirmMessage)) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${order._id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        alert(`Order deleted successfully!\n\nRestored ${result.data.restoredItems} items to inventory\nDeleted ${result.data.deletedPayments} associated payment(s)`);
        fetchCustomerDetails();
      } else {
        alert(result.message || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare order items with full details
      const items = orderItems
        .filter(item => {
          const qty = Number(item.quantity);
          return item.inventory && qty > 0;
        })
        .map(item => {
          const inventoryItem = inventoryItems.find(inv => inv._id === item.inventory);
          const quantity = Number(item.quantity);
          return {
            inventory: item.inventory,
            itemName: inventoryItem?.itemName || '',
            brand: inventoryItem?.brand || '',
            unit: inventoryItem?.unit || '',
            quantity: quantity,
            unitPrice: item.unitPrice || inventoryItem?.unitPrice || 0,
            totalPrice: quantity * (item.unitPrice || inventoryItem?.unitPrice || 0),
          };
        });

      if (items.length === 0) {
        alert('Please add at least one item to the order');
        setLoading(false);
        return;
      }

      // Parse the formatted amountPaid (remove commas)
      const amountPaidValue = orderFormData.amountPaid === ''
        ? 0
        : Number(typeof orderFormData.amountPaid === 'string' ? orderFormData.amountPaid.replace(/,/g, '') : orderFormData.amountPaid);

      const orderData = {
        customer: customerId,
        items,
        discount: 0,
        amountPaid: amountPaidValue,
        deliveryAddress: orderFormData.deliveryAddress || customer?.address.street,
        notes: orderFormData.notes,
        createdBy: 'Admin',
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        alert('Order created successfully!');
        setShowOrderForm(false);
        setOrderItems([{ inventory: '', quantity: '', unitPrice: 0 }]);
        setOrderFormData({ amountPaid: '', deliveryAddress: '', notes: '' });
        fetchCustomerDetails();
      } else {
        alert(result.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse the formatted amount (remove commas)
      const amountValue = paymentFormData.amount === ''
        ? 0
        : Number(typeof paymentFormData.amount === 'string' ? paymentFormData.amount.replace(/,/g, '') : paymentFormData.amount);

      if (amountValue <= 0) {
        alert('Please enter a valid payment amount');
        setLoading(false);
        return;
      }

      const paymentData = {
        customer: customerId,
        amount: amountValue,
        paymentMethod: paymentFormData.paymentMethod,
        paymentDate: paymentFormData.paymentDate,
        referenceNumber: paymentFormData.referenceNumber,
        bankName: paymentFormData.bankName,
        notes: paymentFormData.notes,
        receivedBy: paymentFormData.receivedBy,
        status: 'Confirmed',
      };

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (result.success) {
        alert('Payment recorded successfully!');
        setShowPaymentForm(false);
        setPaymentFormData({
          amount: '',
          paymentMethod: 'Cash',
          paymentDate: new Date().toISOString().split('T')[0],
          referenceNumber: '',
          bankName: '',
          notes: '',
          receivedBy: 'Admin',
        });
        fetchCustomerDetails();
      } else {
        alert(result.message || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { inventory: '', quantity: '', unitPrice: 0 }]);
  };

  const removeOrderItem = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-populate price when inventory item is selected
    if (field === 'inventory') {
      const selectedItem = inventoryItems.find(item => item._id === value);
      if (selectedItem) {
        newItems[index].unitPrice = selectedItem.unitPrice;
      }
    }

    setOrderItems(newItems);
  };

  const calculateOrderTotal = () => {
    const subtotal = orderItems.reduce((sum, item) => {
      const price = item.unitPrice || inventoryItems.find(inv => inv._id === item.inventory)?.unitPrice || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + (quantity * price);
    }, 0);
    const total = subtotal;
    return { subtotal, total };
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Partial': return 'bg-yellow-100 text-yellow-800';
      case 'Unpaid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'Cash': return 'bg-green-100 text-green-800';
      case 'Bank Transfer': return 'bg-blue-100 text-blue-800';
      case 'POS': return 'bg-purple-100 text-purple-800';
      case 'Mobile Money': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">Loading customer details...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-lg text-gray-600 mb-4">Customer not found</div>
        <Button onClick={() => router.push('/customers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/customers')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
            {customer.businessName && (
              <p className="text-gray-600 mt-1">{customer.businessName}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowOrderForm(!showOrderForm)}
            variant="secondary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
          <Button
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            variant="secondary"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
          <Button
            onClick={handleDownloadStatement}
            isLoading={isDownloadingPDF}
            disabled={isDownloadingPDF}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Statement
          </Button>
        </div>
      </div>

      {/* Create Order Form */}
      {showOrderForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Order</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              {orderItems.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {orderItems.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => removeOrderItem(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Select
                      label="Product"
                      required
                      value={item.inventory}
                      onChange={(e) => updateOrderItem(index, 'inventory', e.target.value)}
                    >
                      <option value="">Select product...</option>
                      {inventoryItems.map(inv => (
                        <option key={inv._id} value={inv._id}>
                          {inv.brand} {inv.itemName} ({inv.quantity} {inv.unit} available)
                        </option>
                      ))}
                    </Select>
                    <Input
                      label="Quantity"
                      type="text"
                      required
                      value={item.quantity}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '');
                        updateOrderItem(index, 'quantity', value);
                      }}
                      placeholder="Enter quantity"
                    />
                    <Input
                      label="Unit Price (₦)"
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateOrderItem(index, 'unitPrice', Number(e.target.value))}
                    />
                  </div>
                </div>
              ))}

              <Button type="button" variant="secondary" onClick={addOrderItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                <Input
                  label="Amount Paid Now (₦)"
                  type="text"
                  value={orderFormData.amountPaid}
                  onChange={(e) => handleOrderAmountPaidChange(e.target.value)}
                  placeholder="Enter amount paid"
                />
                <Input
                  label="Delivery Address"
                  value={orderFormData.deliveryAddress}
                  onChange={(e) => setOrderFormData({ ...orderFormData, deliveryAddress: e.target.value })}
                  placeholder={customer.address.street}
                />
                <Input
                  label="Notes"
                  value={orderFormData.notes}
                  onChange={(e) => setOrderFormData({ ...orderFormData, notes: e.target.value })}
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(calculateOrderTotal().subtotal)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(calculateOrderTotal().total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" isLoading={loading}>
                  Create Order
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowOrderForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Record Payment Form */}
      {showPaymentForm && (
        <Card>
          <CardHeader>
            <CardTitle>Record Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Amount (₦)"
                  type="text"
                  required
                  value={paymentFormData.amount}
                  onChange={(e) => handlePaymentAmountChange(e.target.value)}
                  placeholder="Enter payment amount"
                />
                <Select
                  label="Payment Method"
                  required
                  value={paymentFormData.paymentMethod}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value })}
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="POS">POS</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Cheque">Cheque</option>
                </Select>
                <Input
                  label="Payment Date"
                  type="date"
                  required
                  value={paymentFormData.paymentDate}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentDate: e.target.value })}
                />
                <Input
                  label="Reference Number"
                  value={paymentFormData.referenceNumber}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, referenceNumber: e.target.value })}
                  placeholder="e.g., TXN123456"
                />
                {(paymentFormData.paymentMethod === 'Bank Transfer' || paymentFormData.paymentMethod === 'Cheque') && (
                  <Input
                    label="Bank Name"
                    value={paymentFormData.bankName}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, bankName: e.target.value })}
                    placeholder="e.g., First Bank"
                  />
                )}
                <Input
                  label="Received By"
                  required
                  value={paymentFormData.receivedBy}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, receivedBy: e.target.value })}
                />
                <Input
                  label="Notes"
                  value={paymentFormData.notes}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Customer Total Debt:</strong> {formatCurrency(stats?.totalDebt || 0)}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  This payment will be deducted from the customer&apos;s total outstanding balance.
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" isLoading={loading}>
                  Record Payment
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowPaymentForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Edit Order Form */}
      {showEditOrderForm && editingOrder && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Order - {editingOrder.orderNumber}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateOrder} className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-2">Order Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Items:</span>
                    <span className="ml-2 font-medium">{editingOrder.items.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total:</span>
                    <span className="ml-2 font-medium">{formatCurrency(editingOrder.total)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Paid:</span>
                    <span className="ml-2 font-medium text-green-600">{formatCurrency(editingOrder.amountPaid)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Balance:</span>
                    <span className={`ml-2 font-medium ${editingOrder.balance > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {formatCurrency(editingOrder.balance)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Order Status"
                  required
                  value={editOrderFormData.status}
                  onChange={(e) => setEditOrderFormData({ ...editOrderFormData, status: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </Select>

                <Select
                  label="Delivery Status"
                  required
                  value={editOrderFormData.deliveryStatus}
                  onChange={(e) => setEditOrderFormData({ ...editOrderFormData, deliveryStatus: e.target.value })}
                >
                  <option value="Not Dispatched">Not Dispatched</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                </Select>

                <Input
                  label="Delivery Address"
                  value={editOrderFormData.deliveryAddress}
                  onChange={(e) => setEditOrderFormData({ ...editOrderFormData, deliveryAddress: e.target.value })}
                  placeholder="Update delivery address"
                />

                <Input
                  label="Notes"
                  value={editOrderFormData.notes}
                  onChange={(e) => setEditOrderFormData({ ...editOrderFormData, notes: e.target.value })}
                  placeholder="Add or update notes"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> You can only update the order status, delivery status, delivery address, and notes.
                  To modify items or amounts, please delete this order and create a new one.
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" isLoading={loading}>
                  Update Order
                </Button>
                <Button type="button" variant="secondary" onClick={() => { setShowEditOrderForm(false); setEditingOrder(null); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="font-medium">{customer.phone}</div>
                </div>
              </div>
              {customer.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{customer.email}</div>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Customer Type</div>
                  <div className="font-medium">{customer.customerType}</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Address</div>
                  <div className="font-medium">
                    {customer.address.street && <div>{customer.address.street}</div>}
                    <div>
                      {customer.address.city && `${customer.address.city}, `}
                      {customer.address.state}
                    </div>
                    <div>{customer.address.country}</div>
                  </div>
                </div>
              </div>
              {customer.oldBalance > 0 && (
                <div>
                  <div className="text-sm text-gray-500">Old Balance (Pre-System)</div>
                  <div className="text-xl font-bold text-red-600">
                    {formatCurrency(customer.oldBalance)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Old Balance</div>
              <div className={`text-lg font-bold ${customer.oldBalance > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatCurrency(customer.oldBalance)}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Current Balance</div>
              <div className={`text-lg font-bold ${customer.balance > 0 ? 'text-red-600' : customer.balance < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                {formatCurrency(customer.balance)}
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
              <div className="text-sm text-red-700 mb-1 font-medium">Total Debt</div>
              <div className="text-xl font-bold text-red-600">
                {formatCurrency(stats?.totalDebt || 0)}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Total Orders</div>
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(stats?.totalOrderValue || 0)}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Total Payments</div>
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(stats?.totalPayments || 0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Section */}
      <Card>
        <CardHeader>
          <CardTitle>Order History ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No orders found for this customer</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Order Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>{order.items.length} items</TableCell>
                      <TableCell>{formatCurrency(order.total)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(order.amountPaid)}</TableCell>
                      <TableCell className={order.balance > 0 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                        {formatCurrency(order.balance)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getOrderStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadOrderInvoice(order._id)}
                            isLoading={downloadingOrderId === order._id}
                            disabled={downloadingOrderId === order._id}
                            title="Print Invoice"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditOrder(order)}
                            title="Edit Order"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteOrder(order)}
                            title="Delete Order"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payments Section */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History ({payments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No payments found for this customer</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell className="font-medium">{payment.paymentNumber}</TableCell>
                      <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                      <TableCell>
                        <Badge className={getPaymentMethodColor(payment.paymentMethod)}>
                          {payment.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={payment.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {payment.referenceNumber || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

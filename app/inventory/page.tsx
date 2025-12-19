'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';
import { Plus, Search, Edit, Trash2, Package, FileText } from 'lucide-react';
import { downloadInventoryReport } from '@/lib/utils/pdf-client-handlers';

interface InventoryItem {
  _id: string;
  itemName: string;
  brand: string;
  category: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  reorderLevel: number;
  location: string;
  supplier: {
    name: string;
    contact: string;
  };
  status: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const [formData, setFormData] = useState({
    itemName: '',
    brand: '',
    category: 'Rice',
    unit: 'Bag',
    quantity: 0,
    unitPrice: 0,
    reorderLevel: 10,
    location: '',
    supplier: {
      name: '',
      contact: '',
    },
  });

  const fetchItems = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);

      const res = await fetch(`/api/inventory?${params}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data.items);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [search, categoryFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingItem ? `/api/inventory/${editingItem._id}` : '/api/inventory';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setEditingItem(null);
        resetForm();
        fetchItems();
      } else {
        alert(data.message || 'Failed to save item');
      }
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchItems();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleDownloadInventoryPDF = async () => {
    setIsDownloadingPDF(true);
    try {
      await downloadInventoryReport();
    } catch (error) {
      alert('Failed to generate inventory report. Please try again.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const resetForm = () => {
    setFormData({
      itemName: '',
      brand: '',
      category: 'Rice',
      unit: 'Bag',
      quantity: 0,
      unitPrice: 0,
      reorderLevel: 10,
      location: '',
      supplier: { name: '', contact: '' },
    });
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName,
      brand: item.brand,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      reorderLevel: item.reorderLevel,
      location: item.location,
      supplier: item.supplier,
    });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="mt-2 text-sm text-gray-600">Manage your warehouse inventory</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleDownloadInventoryPDF}
            isLoading={isDownloadingPDF}
            disabled={isDownloadingPDF}
          >
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={() => { resetForm(); setShowForm(true); setEditingItem(null); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingItem ? 'Edit' : 'Add'} Inventory Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Item Name"
                  required
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  placeholder="e.g., Rice"
                />
                <Input
                  label="Brand"
                  required
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g., Golden"
                />
                <Select
                  label="Category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Rice">Rice</option>
                  <option value="Spaghetti">Spaghetti</option>
                  <option value="Oil">Oil</option>
                  <option value="Beans">Beans</option>
                  <option value="Indomie">Indomie</option>
                  <option value="Other">Other</option>
                </Select>
                <Select
                  label="Unit"
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  <option value="Bag">Bag</option>
                  <option value="Carton">Carton</option>
                  <option value="Gallon">Gallon</option>
                  <option value="Kg">Kg</option>
                  <option value="Pieces">Pieces</option>
                  <option value="Crate">Crate</option>
                  <option value="Pack">Pack</option>
                  <option value="Other">Other</option>
                </Select>
                <Input
                  label="Quantity"
                  type="number"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                />
                <Input
                  label="Unit Price (₦)"
                  type="number"
                  required
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                />
                <Input
                  label="Reorder Level"
                  type="number"
                  required
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                />
                <Input
                  label="Location"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Warehouse A, Section 1"
                />
                <Input
                  label="Supplier Name"
                  required
                  value={formData.supplier.name}
                  onChange={(e) => setFormData({ ...formData, supplier: { ...formData.supplier, name: e.target.value } })}
                />
                <Input
                  label="Supplier Contact"
                  required
                  value={formData.supplier.contact}
                  onChange={(e) => setFormData({ ...formData, supplier: { ...formData.supplier, contact: e.target.value } })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" isLoading={loading}>
                  {editingItem ? 'Update' : 'Add'} Item
                </Button>
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setEditingItem(null); resetForm(); }}>
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
                  placeholder="Search by item name or brand..."
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
              <option value="Rice">Rice</option>
              <option value="Spaghetti">Spaghetti</option>
              <option value="Oil">Oil</option>
              <option value="Beans">Beans</option>
              <option value="Indomie">Indomie</option>
              <option value="Other">Other</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading inventory...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No inventory items found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.brand} {item.itemName}</div>
                        <div className="text-sm text-gray-500">{item.location}</div>
                      </div>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      {formatNumber(item.quantity)} {item.unit}
                    </TableCell>
                    <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </TableCell>
                    <TableCell>
                      <Badge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(item._id)}>
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

'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ApiService } from '@/lib/services/api-service';
import { Category } from '@/lib/types';
import { Plus, Edit, Trash2, Tag, Palette } from 'lucide-react';

const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: DEFAULT_COLORS[0],
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await ApiService.categories.getAll();
      console.log('CategoriesPage: Loaded categories:', data);
      console.log('CategoriesPage: First category structure:', data[0]);
      setCategories(data);
    } catch (err: any) {
      console.error('CategoriesPage: Error loading categories:', err);
      setError(err.message || 'Không thể tải danh mục');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Tên danh mục không được để trống');
      return;
    }

    try {
      if (editingCategory) {
        // Cập nhật danh mục
        await ApiService.categories.update(editingCategory.id, formData);
      } else {
        // Tạo danh mục mới
        await ApiService.categories.create(formData);
      }
      
      await loadCategories();
      setIsDialogOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', color: DEFAULT_COLORS[0] });
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (category: Category) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      return;
    }

    try {
      // Sử dụng id hoặc _id tùy theo cái nào có sẵn
      const categoryId = category.id || (category as any)._id;
      console.log('CategoriesPage: Đang xóa danh mục:', category);
      console.log('CategoriesPage: Category ID:', categoryId);

      if (!categoryId) {
        throw new Error('Không tìm thấy ID của danh mục');
      }

      await ApiService.categories.delete(categoryId);
      console.log('CategoriesPage: Xóa thành công, đang tải lại...');
      await loadCategories();
    } catch (err: any) {
      console.error('CategoriesPage: Lỗi xóa danh mục:', err);
      setError(err.message || 'Không thể xóa danh mục');
    }
  };

  const createDefaultCategories = async () => {
    const defaultCategories = [
      { name: 'Công việc', color: '#3B82F6' },
      { name: 'Học tập', color: '#10B981' },
      { name: 'Cá nhân', color: '#F59E0B' },
      { name: 'Sức khỏe', color: '#EF4444' },
      { name: 'Gia đình', color: '#8B5CF6' },
      { name: 'Giải trí', color: '#06B6D4' },
    ];

    try {
      setIsLoading(true);
      setError('');

      console.log('CategoriesPage: Tạo danh mục mặc định...');

      for (const [index, category] of defaultCategories.entries()) {
        try {
          console.log(`CategoriesPage: Tạo danh mục ${index + 1}/${defaultCategories.length}: ${category.name}`);
          await ApiService.categories.create(category);
        } catch (err: any) {
          console.error(`CategoriesPage: Lỗi tạo danh mục ${category.name}:`, err);
          // Tiếp tục tạo các danh mục khác
        }
      }

      console.log('CategoriesPage: Hoàn thành tạo danh mục, đang tải lại...');
      await loadCategories();
    } catch (err: any) {
      console.error('CategoriesPage: Lỗi tạo danh mục mặc định:', err);
      setError(err.message || 'Không thể tạo danh mục mặc định');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingCategory(null);
    setFormData({ name: '', color: DEFAULT_COLORS[0] });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Đang tải danh mục...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl py-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Quản lý danh mục</h1>
              <p className="text-muted-foreground">
                Tạo và quản lý danh mục để phân loại công việc
              </p>
            </div>
            <Button onClick={openCreateDialog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Thêm danh mục
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {categories.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chưa có danh mục nào</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Tạo danh mục để phân loại và quản lý công việc hiệu quả hơn
                </p>
                <div className="flex gap-2">
                  <Button onClick={openCreateDialog} variant="outline">
                    Tạo danh mục mới
                  </Button>
                  <Button onClick={createDefaultCategories}>
                    Tạo danh mục mặc định
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category, index) => {
                const categoryId = category.id || (category as any)._id;
                return (
                <Card key={`${categoryId}-${index}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <h3 className="font-semibold">{category.name}</h3>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Badge variant="secondary" style={{ backgroundColor: `${category.color}20`, color: category.color }}>
                      {category.color}
                    </Badge>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}

          {/* Dialog tạo/sửa danh mục */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory
                    ? 'Cập nhật thông tin danh mục của bạn'
                    : 'Tạo danh mục mới để phân loại công việc'
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên danh mục</Label>
                  <Input
                    id="name"
                    placeholder="Nhập tên danh mục"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Màu sắc</Label>
                  <div className="flex gap-2 flex-wrap">
                    {DEFAULT_COLORS.map((color, index) => (
                      <button
                        key={`color-${index}-${color}`}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-foreground' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-20 h-10"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit">
                    {editingCategory ? 'Cập nhật' : 'Tạo mới'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
}

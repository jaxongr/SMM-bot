import { useState, useCallback } from 'react';
import { Card, Tabs, Typography } from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import { CategoriesTable } from './components/CategoriesTable';
import { ServicesTable } from './components/ServicesTable';
import { CategoryFormModal } from './components/CategoryFormModal';
import { ServiceFormModal } from './components/ServiceFormModal';
import {
  useCategories,
  useServices,
  useUpdateCategory,
  useUpdateService,
  useDeleteCategory,
} from './hooks/useServices';
import type { Category, Service, ServiceFiltersParams } from './api/services.api';
import type { Platform } from '@/shared/types';

const { Title } = Typography;

const ServicesPage: React.FC = () => {
  // Category state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Service state
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceFilters, setServiceFilters] = useState<ServiceFiltersParams>({
    page: 1,
    limit: 20,
  });
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [platformFilter, setPlatformFilter] = useState<Platform | undefined>();

  // Queries
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const { data: servicesData, isLoading: servicesLoading } = useServices({
    ...serviceFilters,
    categoryId: categoryFilter,
    platform: platformFilter,
  });

  // Mutations
  const updateCategory = useUpdateCategory();
  const updateService = useUpdateService();
  const deleteCategory = useDeleteCategory();

  // Category handlers
  const handleCreateCategory = useCallback(() => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  }, []);

  const handleEditCategory = useCallback((category: Category) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  }, []);

  const handleDeleteCategory = useCallback(
    (id: string) => {
      deleteCategory.mutate(id);
    },
    [deleteCategory],
  );

  const handleToggleCategoryActive = useCallback(
    (id: string, isActive: boolean) => {
      updateCategory.mutate({ id, data: { isActive } });
    },
    [updateCategory],
  );

  // Service handlers
  const handleCreateService = useCallback(() => {
    setEditingService(null);
    setServiceModalOpen(true);
  }, []);

  const handleEditService = useCallback((service: Service) => {
    setEditingService(service);
    setServiceModalOpen(true);
  }, []);

  const handleToggleServiceActive = useCallback(
    (id: string, isActive: boolean) => {
      updateService.mutate({ id, data: { isActive } });
    },
    [updateService],
  );

  const handleServiceTableChange = useCallback((pagination: TablePaginationConfig) => {
    setServiceFilters((prev) => ({
      ...prev,
      page: pagination.current ?? 1,
      limit: pagination.pageSize ?? 20,
    }));
  }, []);

  const categories = categoriesData?.data ?? [];

  const tabItems = [
    {
      key: 'categories',
      label: 'Kategoriyalar',
      children: (
        <CategoriesTable
          data={categories}
          loading={categoriesLoading}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
          onCreate={handleCreateCategory}
          onToggleActive={handleToggleCategoryActive}
          deleteLoading={deleteCategory.isPending}
        />
      ),
    },
    {
      key: 'services',
      label: 'Xizmatlar',
      children: (
        <ServicesTable
          data={servicesData?.data ?? []}
          loading={servicesLoading}
          categories={categories}
          pagination={{
            current: serviceFilters.page ?? 1,
            pageSize: serviceFilters.limit ?? 20,
            total: servicesData?.meta?.total ?? 0,
          }}
          onTableChange={handleServiceTableChange}
          onEdit={handleEditService}
          onCreate={handleCreateService}
          onToggleActive={handleToggleServiceActive}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          platformFilter={platformFilter}
          onPlatformFilterChange={setPlatformFilter}
        />
      ),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>
        Xizmatlar boshqaruvi
      </Title>

      <Card>
        <Tabs items={tabItems} />
      </Card>

      <CategoryFormModal
        open={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        editingCategory={editingCategory}
      />

      <ServiceFormModal
        open={serviceModalOpen}
        onClose={() => {
          setServiceModalOpen(false);
          setEditingService(null);
        }}
        editingService={editingService}
        categories={categories}
      />
    </div>
  );
};

export { ServicesPage };
export default ServicesPage;

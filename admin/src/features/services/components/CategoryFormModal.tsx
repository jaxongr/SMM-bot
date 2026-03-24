import { Modal, Form, Input, InputNumber, Select, Tabs } from 'antd';
import { useEffect } from 'react';
import { useCreateCategory, useUpdateCategory } from '../hooks/useServices';
import type { Category, CreateCategoryData } from '../api/services.api';
import type { Platform } from '@/shared/types';

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  editingCategory: Category | null;
}

interface CategoryFormValues {
  nameUz: string;
  nameRu: string;
  nameEn: string;
  slug: string;
  platform: Platform;
  icon: string;
  sortOrder: number;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  open,
  onClose,
  editingCategory,
}) => {
  const [form] = Form.useForm<CategoryFormValues>();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const isEditing = !!editingCategory;
  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  useEffect(() => {
    if (editingCategory) {
      form.setFieldsValue({
        nameUz: editingCategory.name.uz ?? '',
        nameRu: editingCategory.name.ru ?? '',
        nameEn: editingCategory.name.en ?? '',
        slug: editingCategory.slug,
        platform: editingCategory.platform,
        icon: editingCategory.icon ?? '',
        sortOrder: editingCategory.sortOrder,
      });
    } else {
      form.resetFields();
    }
  }, [editingCategory, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: CreateCategoryData = {
      name: {
        uz: values.nameUz,
        ru: values.nameRu || values.nameUz,
        en: values.nameEn || values.nameUz,
      },
      slug: values.slug,
      platform: values.platform,
      icon: values.icon || undefined,
      sortOrder: values.sortOrder,
    };

    if (isEditing) {
      await updateCategory.mutateAsync({ id: editingCategory.id, data: payload });
    } else {
      await createCategory.mutateAsync(payload);
    }

    form.resetFields();
    onClose();
  };

  const nameTabItems = [
    {
      key: 'uz',
      label: "O'zbekcha",
      children: (
        <Form.Item
          name="nameUz"
          rules={[{ required: true, message: "O'zbekcha nomni kiriting" }]}
        >
          <Input placeholder="Kategoriya nomi (UZ)" />
        </Form.Item>
      ),
    },
    {
      key: 'ru',
      label: 'Ruscha',
      children: (
        <Form.Item name="nameRu">
          <Input placeholder="Kategoriya nomi (RU)" />
        </Form.Item>
      ),
    },
    {
      key: 'en',
      label: 'English',
      children: (
        <Form.Item name="nameEn">
          <Input placeholder="Category name (EN)" />
        </Form.Item>
      ),
    },
  ];

  return (
    <Modal
      title={isEditing ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
      open={open}
      onOk={handleSubmit}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      confirmLoading={isSubmitting}
      okText="Saqlash"
      cancelText="Bekor qilish"
      width={520}
    >
      <Form form={form} layout="vertical" initialValues={{ sortOrder: 0 }}>
        <Tabs items={nameTabItems} size="small" />

        <Form.Item
          name="slug"
          label="Slug"
          rules={[
            { required: true, message: 'Slug kiriting' },
            {
              pattern: /^[a-z0-9-]+$/,
              message: 'Faqat kichik harf, raqam va tire',
            },
          ]}
        >
          <Input placeholder="masalan: telegram-subscribers" />
        </Form.Item>

        <Form.Item
          name="platform"
          label="Platforma"
          rules={[{ required: true, message: 'Platformani tanlang' }]}
        >
          <Select
            placeholder="Platformani tanlang"
            options={[
              { label: 'Telegram', value: 'TELEGRAM' },
              { label: 'Instagram', value: 'INSTAGRAM' },
              { label: 'YouTube', value: 'YOUTUBE' },
              { label: 'TikTok', value: 'TIKTOK' },
            ]}
          />
        </Form.Item>

        <Form.Item name="icon" label="Ikonka">
          <Input placeholder="Ikonka nomi yoki emoji" />
        </Form.Item>

        <Form.Item name="sortOrder" label="Tartib raqami">
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

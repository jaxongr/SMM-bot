import { Modal, Form, Input, InputNumber, Select, Switch, Tabs } from 'antd';
import { useEffect } from 'react';
import { useCreateService, useUpdateService } from '../hooks/useServices';
import type { Service, Category, CreateServiceData } from '../api/services.api';

interface ServiceFormModalProps {
  open: boolean;
  onClose: () => void;
  editingService: Service | null;
  categories: Category[];
}

interface ServiceFormValues {
  categoryId: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  descriptionUz: string;
  descriptionRu: string;
  descriptionEn: string;
  minQuantity: number;
  maxQuantity: number;
  pricePerUnit: number;
  isAutoService: boolean;
  isDripFeed: boolean;
}

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  open,
  onClose,
  editingService,
  categories,
}) => {
  const [form] = Form.useForm<ServiceFormValues>();
  const createService = useCreateService();
  const updateService = useUpdateService();

  const isEditing = !!editingService;
  const isSubmitting = createService.isPending || updateService.isPending;

  useEffect(() => {
    if (editingService) {
      form.setFieldsValue({
        categoryId: editingService.categoryId,
        nameUz: editingService.name.uz ?? '',
        nameRu: editingService.name.ru ?? '',
        nameEn: editingService.name.en ?? '',
        descriptionUz: editingService.description?.uz ?? '',
        descriptionRu: editingService.description?.ru ?? '',
        descriptionEn: editingService.description?.en ?? '',
        minQuantity: editingService.minQuantity,
        maxQuantity: editingService.maxQuantity,
        pricePerUnit: editingService.pricePerUnit,
        isAutoService: editingService.isAutoService,
        isDripFeed: editingService.isDripFeed,
      });
    } else {
      form.resetFields();
    }
  }, [editingService, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: CreateServiceData = {
      categoryId: values.categoryId,
      name: {
        uz: values.nameUz,
        ru: values.nameRu || values.nameUz,
        en: values.nameEn || values.nameUz,
      },
      description: values.descriptionUz
        ? {
            uz: values.descriptionUz,
            ru: values.descriptionRu || values.descriptionUz,
            en: values.descriptionEn || values.descriptionUz,
          }
        : undefined,
      minQuantity: values.minQuantity,
      maxQuantity: values.maxQuantity,
      pricePerUnit: values.pricePerUnit,
      isAutoService: values.isAutoService,
      isDripFeed: values.isDripFeed,
    };

    if (isEditing) {
      await updateService.mutateAsync({ id: editingService.id, data: payload });
    } else {
      await createService.mutateAsync(payload);
    }

    form.resetFields();
    onClose();
  };

  const nameTabItems = [
    {
      key: 'uz',
      label: "O'zbekcha",
      children: (
        <>
          <Form.Item
            name="nameUz"
            label="Nomi"
            rules={[{ required: true, message: "O'zbekcha nomni kiriting" }]}
          >
            <Input placeholder="Xizmat nomi (UZ)" />
          </Form.Item>
          <Form.Item name="descriptionUz" label="Tavsif">
            <Input.TextArea rows={2} placeholder="Tavsif (UZ)" />
          </Form.Item>
        </>
      ),
    },
    {
      key: 'ru',
      label: 'Ruscha',
      children: (
        <>
          <Form.Item name="nameRu" label="Nomi">
            <Input placeholder="Xizmat nomi (RU)" />
          </Form.Item>
          <Form.Item name="descriptionRu" label="Tavsif">
            <Input.TextArea rows={2} placeholder="Tavsif (RU)" />
          </Form.Item>
        </>
      ),
    },
    {
      key: 'en',
      label: 'English',
      children: (
        <>
          <Form.Item name="nameEn" label="Name">
            <Input placeholder="Service name (EN)" />
          </Form.Item>
          <Form.Item name="descriptionEn" label="Description">
            <Input.TextArea rows={2} placeholder="Description (EN)" />
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <Modal
      title={isEditing ? 'Xizmatni tahrirlash' : 'Yangi xizmat'}
      open={open}
      onOk={handleSubmit}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      confirmLoading={isSubmitting}
      okText="Saqlash"
      cancelText="Bekor qilish"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ isAutoService: false, isDripFeed: false, minQuantity: 100, maxQuantity: 10000 }}
      >
        <Form.Item
          name="categoryId"
          label="Kategoriya"
          rules={[{ required: true, message: 'Kategoriyani tanlang' }]}
        >
          <Select
            placeholder="Kategoriyani tanlang"
            showSearch
            optionFilterProp="label"
            options={categories.map((cat) => ({
              label: `${cat.name.uz ?? cat.slug} (${cat.platform})`,
              value: cat.id,
            }))}
          />
        </Form.Item>

        <Tabs items={nameTabItems} size="small" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item
            name="minQuantity"
            label="Min miqdor"
            rules={[{ required: true, message: 'Min miqdorni kiriting' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="maxQuantity"
            label="Max miqdor"
            rules={[{ required: true, message: 'Max miqdorni kiriting' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <Form.Item
          name="pricePerUnit"
          label="Narx (1000 ta uchun, so'mda)"
          rules={[{ required: true, message: 'Narxni kiriting' }]}
        >
          <InputNumber
            min={0}
            step={100}
            style={{ width: '100%' }}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => Number(value?.replace(/,/g, '') ?? 0)}
          />
        </Form.Item>

        <div style={{ display: 'flex', gap: 32 }}>
          <Form.Item name="isAutoService" label="Avto xizmat" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="isDripFeed" label="Drip Feed" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

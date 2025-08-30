"use client";

import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button, Card, Form, Input, InputNumber, Modal, Select, Space, Table, Tag, message } from 'antd';
import type { TableProps } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import {
  useGetAdminCategories,
  useCreateAdminCategory,
  useUpdateAdminCategory,
  useDeleteAdminCategory,
  getGetAdminCategoriesQueryKey,
} from '@/lib/api/generated';
import {
  type Category,
  type GetAdminCategoriesParams,
  type CreateCategoryRequest,
  type UpdateCategoryRequest,
  GetAdminCategoriesStatus,
} from '@/lib/api/generated/models';
import { useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';

const { confirm } = Modal;
const { Search } = Input;

export default function CategoriesPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<Pick<GetAdminCategoriesParams, 'search' | 'status' | 'parent_id'>>({
    search: '',
    status: undefined,
    parent_id: undefined,
  });

  const [createVisible, setCreateVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [selected, setSelected] = useState<Category | null>(null);

  const [createForm] = Form.useForm<CreateCategoryRequest>();
  const [editForm] = Form.useForm<UpdateCategoryRequest>();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const params: GetAdminCategoriesParams = useMemo(
    () => ({
      page: currentPage,
      per_page: pageSize,
      search: filters.search || undefined,
      status: filters.status || undefined,
      parent_id: filters.parent_id || undefined,
    }),
    [currentPage, pageSize, filters]
  );

  const qc = useQueryClient();

  const categoriesQuery = useGetAdminCategories(params, { query: { placeholderData: keepPreviousData } });
  const categories = categoriesQuery.data?.data ?? [];
  const total = categoriesQuery.data?.meta?.total ?? 0;
  const loading = categoriesQuery.isFetching || categoriesQuery.isLoading;

  const createMutation = useCreateAdminCategory({
    mutation: {
      onSuccess: () => {
        message.success('Category created');
        qc.invalidateQueries({ queryKey: getGetAdminCategoriesQueryKey(params) });
      },
      onError: () => message.error('Failed to create category'),
    },
  });

  const updateMutation = useUpdateAdminCategory({
    mutation: {
      onSuccess: () => {
        message.success('Category updated');
        qc.invalidateQueries({ queryKey: getGetAdminCategoriesQueryKey(params) });
      },
      onError: () => message.error('Failed to update category'),
    },
  });

  const deleteMutation = useDeleteAdminCategory({
    mutation: {
      onSuccess: () => {
        message.success('Category deleted');
        qc.invalidateQueries({ queryKey: getGetAdminCategoriesQueryKey(params) });
      },
      onError: () => message.error('Failed to delete category'),
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  const handleTableChange: NonNullable<TableProps<Category>['onChange']> = (pagination) => {
    if (pagination.current) setCurrentPage(pagination.current);
    if (pagination.pageSize) setPageSize(pagination.pageSize);
  };

  const openCreate = () => {
    createForm.resetFields();
    setCreateVisible(true);
  };

  const onCreate = async (values: CreateCategoryRequest) => {
    try {
      await createMutation.mutateAsync({ data: values });
      setCreateVisible(false);
    } catch (err) {
      console.error(err);
    }
  };

  const onEditOpen = (cat: Category) => {
    setSelected(cat);
    editForm.setFieldsValue({
      name: cat.name,
      description: cat.description ?? undefined,
      sort_order: cat.sort_order,
      parent_id: cat.parent_id ?? undefined,
      image: cat.image ?? undefined,
      status: cat.status as UpdateCategoryRequest['status'],
    });
    setEditVisible(true);
  };

  const onEdit = async (values: UpdateCategoryRequest) => {
    if (!selected) return;
    try {
      await updateMutation.mutateAsync({ pathParams: { id: selected.id }, data: values });
      setEditVisible(false);
    } catch (err) {
      console.error(err);
    }
  };

  const onDelete = (cat: Category) => {
    confirm({
      title: 'Delete this category?',
      icon: <ExclamationCircleOutlined />,
      content: `This will permanently delete ${cat.name}.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync({ pathParams: { id: cat.id } });
        } catch (err) {
          console.error(err);
        }
      },
    });
  };

  if (!isAuthenticated) return null;

  const columns: TableProps<Category>['columns'] = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: Category['status']) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>{status.toUpperCase()}</Tag>
      ),
    },
    { title: 'Items', dataIndex: 'auction_items_count', key: 'auction_items_count' },
    { title: 'Sort', dataIndex: 'sort_order', key: 'sort_order' },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_: unknown, record: Category) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => onEditOpen(record)} />
          <Button danger icon={<DeleteOutlined />} size="small" onClick={() => onDelete(record)} />
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <Card>
          <Space wrap>
            <Search
              placeholder="Search categories"
              onSearch={(v) => setFilters((p) => ({ ...p, search: v }))}
              allowClear
              enterButton
              style={{ width: 320 }}
            />
            <Select
              placeholder="Status"
              allowClear
              style={{ width: 200 }}
              value={filters.status}
              onChange={(v: GetAdminCategoriesStatus | '') =>
                setFilters((p) => ({ ...p, status: (v || undefined) }))
              }
              options={[
                { label: 'All', value: '' },
                { label: 'Active', value: GetAdminCategoriesStatus.active },
                { label: 'Inactive', value: GetAdminCategoriesStatus.inactive },
              ]}
            />
          </Space>
          <div style={{ float: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              New Category
            </Button>
          </div>
        </Card>

        <Card>
          <Table
            rowKey="id"
            loading={loading}
            dataSource={categories}
            columns={columns}
            pagination={{ current: currentPage, pageSize, total, showSizeChanger: true }}
            onChange={handleTableChange}
          />
        </Card>
      </Space>

      {/* Create */}
      <Modal open={createVisible} title="Create Category" onCancel={() => setCreateVisible(false)} onOk={() => createForm.submit()}>
        <Form form={createForm} layout="vertical" onFinish={onCreate}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="sort_order" label="Sort Order">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="parent_id" label="Parent Category">
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="image" label="Image URL">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit */}
      <Modal open={editVisible} title="Edit Category" onCancel={() => setEditVisible(false)} onOk={() => editForm.submit()}>
        <Form form={editForm} layout="vertical" onFinish={onEdit}>
          <Form.Item name="name" label="Name">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="sort_order" label="Sort Order">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="parent_id" label="Parent Category">
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="image" label="Image URL">
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select
              allowClear
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}

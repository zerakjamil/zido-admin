"use client";

import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import type { TableProps } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import {
  useGetAdminPromotionalBanners,
  useCreateAdminPromotionalBanner,
  useUpdateAdminPromotionalBanner,
  useDeleteAdminPromotionalBanner,
  useReorderAdminPromotionalBanners,
  getGetAdminPromotionalBannersQueryKey,
} from '@/lib/api/generated';
import {
  type PromotionalBanner,
  type GetAdminPromotionalBannersParams,
  type CreateBannerRequest,
  GetAdminPromotionalBannersStatus,
  PromotionalBannerPosition,
} from '@/lib/api/generated/models';
import { keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import { formatDateTime, getStatusColor } from '@/lib/utils';

const { RangePicker } = DatePicker;

export default function BannersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<Pick<GetAdminPromotionalBannersParams, 'position' | 'status'>>({
    position: undefined,
    status: undefined,
  });

  const [createVisible, setCreateVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [selected, setSelected] = useState<PromotionalBanner | null>(null);

  const [createForm] = Form.useForm<CreateBannerRequest & { dateRange?: unknown[] }>();
  const [editForm] = Form.useForm<CreateBannerRequest & { dateRange?: unknown[] }>();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const params: GetAdminPromotionalBannersParams = useMemo(
    () => ({
      page: currentPage,
      per_page: pageSize,
      position: filters.position || undefined,
      status: filters.status || undefined,
    }),
    [currentPage, pageSize, filters]
  );

  const qc = useQueryClient();

  const bannersQuery = useGetAdminPromotionalBanners(params, { query: { placeholderData: keepPreviousData } });
  const banners = bannersQuery.data?.data ?? [];
  const total = bannersQuery.data?.pagination.total ?? 0;
  const loading = bannersQuery.isFetching || bannersQuery.isLoading;

  const createMutation = useCreateAdminPromotionalBanner({
    mutation: {
      onSuccess: () => {
        message.success('Banner created');
        qc.invalidateQueries({ queryKey: getGetAdminPromotionalBannersQueryKey(params) });
      },
      onError: () => message.error('Failed to create banner'),
    },
  });

  const updateMutation = useUpdateAdminPromotionalBanner({
    mutation: {
      onSuccess: () => {
        message.success('Banner updated');
        qc.invalidateQueries({ queryKey: getGetAdminPromotionalBannersQueryKey(params) });
      },
      onError: () => message.error('Failed to update banner'),
    },
  });

  const deleteMutation = useDeleteAdminPromotionalBanner({
    mutation: {
      onSuccess: () => {
        message.success('Banner deleted');
        qc.invalidateQueries({ queryKey: getGetAdminPromotionalBannersQueryKey(params) });
      },
      onError: () => message.error('Failed to delete banner'),
    },
  });

  const reorderMutation = useReorderAdminPromotionalBanners({
    mutation: {
      onSuccess: () => {
        message.success('Order saved');
        qc.invalidateQueries({ queryKey: getGetAdminPromotionalBannersQueryKey(params) });
      },
      onError: () => message.error('Failed to save order'),
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  const normalizeDate = (v: unknown): string | undefined => {
    if (!v) return undefined;
    if (typeof v === 'string') return v;
    if (v instanceof Date) return v.toISOString();
    if (typeof v === 'object' && v !== null) {
      const maybe = v as { toDate?: () => Date; $d?: Date };
      if (typeof maybe.toDate === 'function') {
        const d = maybe.toDate();
        if (d instanceof Date) return d.toISOString();
      }
      if (maybe.$d instanceof Date) return maybe.$d.toISOString();
    }
    return undefined;
  };

  const handleTableChange: NonNullable<TableProps<PromotionalBanner>['onChange']> = (pagination) => {
    if (pagination.current) setCurrentPage(pagination.current);
    if (pagination.pageSize) setPageSize(pagination.pageSize);
  };

  const openCreate = () => {
    createForm.resetFields();
    setCreateVisible(true);
  };

  const onCreate = async (values: CreateBannerRequest & { dateRange?: unknown[] }) => {
    const [start, end] = Array.isArray(values.dateRange) ? values.dateRange : [undefined, undefined];
    const payload: CreateBannerRequest = {
      title: values.title,
      description: values.description || undefined,
      image: values.image,
      link_url: values.link_url || undefined,
      position: values.position,
      sort_order: values.sort_order ?? undefined,
      start_date: normalizeDate(start),
      end_date: normalizeDate(end),
    };
    try {
      await createMutation.mutateAsync({ data: payload });
      setCreateVisible(false);
    } catch (err) {
      console.error(err);
      message.error('Failed to create banner');
    }
  };

  const onEditOpen = (b: PromotionalBanner) => {
    setSelected(b);
    editForm.setFieldsValue({
      title: b.title,
      description: b.description ?? undefined,
      image: b.image,
      link_url: b.link_url ?? undefined,
      position: b.position,
      sort_order: b.sort_order,
      dateRange: [b.start_date, b.end_date],
    });
    setEditVisible(true);
  };

  const onEdit = async (values: CreateBannerRequest & { dateRange?: unknown[] }) => {
    if (!selected) return;
    const [start, end] = Array.isArray(values.dateRange) ? values.dateRange : [undefined, undefined];
    const payload: CreateBannerRequest = {
      title: values.title,
      description: values.description || undefined,
      image: values.image,
      link_url: values.link_url || undefined,
      position: values.position,
      sort_order: values.sort_order ?? undefined,
      start_date: normalizeDate(start),
      end_date: normalizeDate(end),
    };
    try {
      await updateMutation.mutateAsync({ pathParams: { id: selected.id }, data: payload });
      setEditVisible(false);
    } catch (err) {
      console.error(err);
      message.error('Failed to update banner');
    }
  };

  const onDelete = async (b: PromotionalBanner) => {
    try {
      await deleteMutation.mutateAsync({ pathParams: { id: b.id } });
    } catch (err) {
      console.error(err);
      message.error('Failed to delete banner');
    }
  };

  const moveRow = async (b: PromotionalBanner, direction: 'up' | 'down') => {
    const ordered = [...banners].sort((a, z) => a.sort_order - z.sort_order);
    const idx = ordered.findIndex((x) => x.id === b.id);
    if (idx < 0) return;
    const swapWith = direction === 'up' ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= ordered.length) return;
    const newOrder = [...ordered];
    const tmp = newOrder[idx];
    newOrder[idx] = newOrder[swapWith];
    newOrder[swapWith] = tmp;
    try {
      await reorderMutation.mutateAsync({ data: { banner_ids: newOrder.map((x) => x.id) } });
    } catch (err) {
      console.error(err);
      message.error('Failed to reorder banners');
    }
  };

  if (!isAuthenticated) return null;

  const columns: TableProps<PromotionalBanner>['columns'] = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (src: string) => (
        <Image src={src} alt="banner" width={80} height={40} style={{ objectFit: 'cover' }} />
      ),
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      render: (p: string) => <Tag>{p}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => <Tag color={getStatusColor(s)}>{s.toUpperCase()}</Tag>,
    },
    { title: 'Sort', dataIndex: 'sort_order', key: 'sort_order', width: 80 },
    {
      title: 'Start',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (d?: string | null) => (d ? formatDateTime(d) : '-'),
    },
    {
      title: 'End',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (d?: string | null) => (d ? formatDateTime(d) : '-'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_: unknown, record: PromotionalBanner) => (
        <Space>
          <Button icon={<ArrowUpOutlined />} size="small" onClick={() => moveRow(record, 'up')} />
          <Button icon={<ArrowDownOutlined />} size="small" onClick={() => moveRow(record, 'down')} />
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
            <Select
              placeholder="Position"
              allowClear
              style={{ width: 220 }}
              value={filters.position}
              onChange={(v: string | undefined) => setFilters((p) => ({ ...p, position: v || undefined }))}
              options={Object.values(PromotionalBannerPosition).map((pos) => ({ label: pos, value: pos }))}
            />
            <Select
              placeholder="Status"
              allowClear
              style={{ width: 200 }}
              value={filters.status}
              onChange={(v: GetAdminPromotionalBannersStatus | '') =>
                setFilters((p) => ({ ...p, status: v ? v : undefined }))
              }
              options={[
                { label: 'All', value: '' },
                { label: 'Active', value: GetAdminPromotionalBannersStatus.active },
                { label: 'Inactive', value: GetAdminPromotionalBannersStatus.inactive },
              ]}
            />
          </Space>
          <div style={{ float: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              New Banner
            </Button>
          </div>
        </Card>

        <Card>
          <Table
            rowKey="id"
            loading={loading}
            dataSource={banners}
            columns={columns}
            pagination={{ current: currentPage, pageSize, total, showSizeChanger: true }}
            onChange={handleTableChange}
          />
        </Card>
      </Space>

      {/* Create */}
      <Modal open={createVisible} title="Create Banner" onCancel={() => setCreateVisible(false)} onOk={() => createForm.submit()}>
        <Form form={createForm} layout="vertical" onFinish={onCreate}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="image" label="Image URL" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="link_url" label="Link URL">
            <Input />
          </Form.Item>
          <Form.Item name="position" label="Position" rules={[{ required: true }]}>
            <Select options={Object.values(PromotionalBannerPosition).map((pos) => ({ label: pos, value: pos }))} />
          </Form.Item>
          <Form.Item name="sort_order" label="Sort Order">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="dateRange" label="Active Dates">
            <RangePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit */}
      <Modal open={editVisible} title="Edit Banner" onCancel={() => setEditVisible(false)} onOk={() => editForm.submit()}>
        <Form form={editForm} layout="vertical" onFinish={onEdit}>
          <Form.Item name="title" label="Title">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="image" label="Image URL">
            <Input />
          </Form.Item>
          <Form.Item name="link_url" label="Link URL">
            <Input />
          </Form.Item>
          <Form.Item name="position" label="Position">
            <Select options={Object.values(PromotionalBannerPosition).map((pos) => ({ label: pos, value: pos }))} />
          </Form.Item>
          <Form.Item name="sort_order" label="Sort Order">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="dateRange" label="Active Dates">
            <RangePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}

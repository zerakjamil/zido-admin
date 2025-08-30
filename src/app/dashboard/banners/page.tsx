"use client";

import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  Button,
  Card,
  Space,
  Table,
  Tag,
  Select,
  Image,
  message,
  type TableProps,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import {
  useGetAdminPromotionalBanners,
  useDeleteAdminPromotionalBanner,
  useReorderAdminPromotionalBanners,
  getGetAdminPromotionalBannersQueryKey,
} from '@/lib/api/generated';
import {
  type PromotionalBanner,
  type GetAdminPromotionalBannersParams,
  GetAdminPromotionalBannersStatus,
  PromotionalBannerPosition,
} from '@/lib/api/generated/models';
import { keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import { formatDateTime, getStatusColor } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BannersPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<Pick<GetAdminPromotionalBannersParams, 'position' | 'status'>>({
    position: undefined,
    status: undefined,
  });

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
  const total = bannersQuery.data?.meta?.total ?? 0;
  const loading = bannersQuery.isFetching || bannersQuery.isLoading;

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
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  const handleTableChange: NonNullable<TableProps<PromotionalBanner>['onChange']> = (pagination) => {
    if (pagination?.current) setCurrentPage(pagination.current);
    if (pagination?.pageSize) setPageSize(pagination.pageSize);
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
      await reorderMutation.mutateAsync({ data: { banners: newOrder.map((x, i) => ({ id: x.id, sort_order: i })) } });
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
      dataIndex: 'image_url',
      key: 'image_url',
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
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => {
        const label = active ? 'ACTIVE' : 'INACTIVE';
        return <Tag color={getStatusColor(active ? 'active' : 'inactive')}>{label}</Tag>;
      },
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
                setFilters((p) => ({ ...p, status: v || undefined }))
              }
              options={[
                { label: 'All', value: '' },
                { label: 'Active', value: GetAdminPromotionalBannersStatus.active },
                { label: 'Inactive', value: GetAdminPromotionalBannersStatus.inactive },
              ]}
            />
          </Space>
          <div style={{ float: 'right' }}>
            <Link href="/dashboard/banners/create">
              <Button type="primary" icon={<PlusOutlined />}>New Banner</Button>
            </Link>
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
    </AdminLayout>
  );
}

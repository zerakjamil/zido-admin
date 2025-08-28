"use client";

import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, DatePicker, InputNumber, Space, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import { useGetAdminBids } from '@/lib/api/generated';
import { type Bid, type GetAdminBidsParams } from '@/lib/api/generated/models';
import { keepPreviousData } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export default function BidsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<Pick<GetAdminBidsParams, 'auction_item_id' | 'bidder_id' | 'start_date' | 'end_date'>>({});

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const params: GetAdminBidsParams = useMemo(
    () => ({
      page: currentPage,
      per_page: pageSize,
      auction_item_id: filters.auction_item_id,
      bidder_id: filters.bidder_id,
      start_date: filters.start_date,
      end_date: filters.end_date,
    }),
    [currentPage, pageSize, filters]
  );

  const bidsQuery = useGetAdminBids(params, { query: { placeholderData: keepPreviousData } });
  const bids = bidsQuery.data?.data ?? [];
  const total = bidsQuery.data?.pagination.total ?? 0;
  const loading = bidsQuery.isFetching || bidsQuery.isLoading;

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  const handleTableChange: NonNullable<TableProps<Bid>['onChange']> = (pagination) => {
    if (pagination.current) setCurrentPage(pagination.current);
    if (pagination.pageSize) setPageSize(pagination.pageSize);
  };

  const columns: TableProps<Bid>['columns'] = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Auction Item', dataIndex: 'auction_item_id', key: 'auction_item_id' },
    { title: 'Bidder', dataIndex: 'bidder_id', key: 'bidder_id' },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (v: number) => formatCurrency(v),
    },
    {
      title: 'Winning',
      dataIndex: 'is_winning',
      key: 'is_winning',
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? 'Yes' : 'No'}</Tag>,
    },
    { title: 'Bid Time', dataIndex: 'bid_time', key: 'bid_time', render: (d: string) => formatDateTime(d) },
  ];

  if (!isAuthenticated) return null;

  return (
    <AdminLayout>
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <Card>
          <Space wrap>
            <InputNumber
              placeholder="Auction Item ID"
              min={1}
              value={filters.auction_item_id}
              onChange={(v) => setFilters((p) => ({ ...p, auction_item_id: v ?? undefined }))}
            />
            <InputNumber
              placeholder="Bidder ID"
              min={1}
              value={filters.bidder_id}
              onChange={(v) => setFilters((p) => ({ ...p, bidder_id: v ?? undefined }))}
            />
            <RangePicker
              showTime
              onChange={(range) =>
                setFilters((p) => ({
                  ...p,
                  start_date: Array.isArray(range) && range[0] ? dayjs(range[0]).toISOString() : undefined,
                  end_date: Array.isArray(range) && range[1] ? dayjs(range[1]).toISOString() : undefined,
                }))
              }
            />
          </Space>
        </Card>

        <Card>
          <Table
            rowKey="id"
            loading={loading}
            dataSource={bids}
            columns={columns}
            pagination={{ current: currentPage, pageSize, total, showSizeChanger: true }}
            onChange={handleTableChange}
          />
        </Card>
      </Space>
    </AdminLayout>
  );
}

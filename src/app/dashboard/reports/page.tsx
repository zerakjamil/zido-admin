'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, DatePicker, Row, Col, Space, Select, Table, Statistic, Tag, Typography, message } from 'antd';
import type { TableProps } from 'antd';
import { keepPreviousData } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  useGetAdminRevenueReport,
  useGetAdminUserActivityReport,
} from '@/lib/api/generated';
import type {
  GetAdminRevenueReportParams,
  GetAdminUserActivityReportParams,
  RevenueReportDailyBreakdownItem,
  RevenueReportTopRevenueCategoriesItem,
  UserActivityReportDailyActivityItem,
  UserActivityReportUserEngagementItem,
} from '@/lib/api/generated/models';
import { useRouter } from 'next/navigation';

const { RangePicker } = DatePicker;
const { Title } = Typography;

export default function ReportsPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  // Filters
  const [period, setPeriod] = useState<GetAdminRevenueReportParams['period']>('daily');
  const [dateRange, setDateRange] = useState<unknown[] | null>(null);

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

  const commonParams = useMemo(() => {
    const [start, end] = Array.isArray(dateRange) ? dateRange : [undefined, undefined];
    return {
      start_date: normalizeDate(start),
      end_date: normalizeDate(end),
      period: period || undefined,
    } satisfies Pick<GetAdminRevenueReportParams, 'start_date' | 'end_date' | 'period'>;
  }, [dateRange, period]);

  // Queries
  const revenueQuery = useGetAdminRevenueReport(commonParams, { query: { placeholderData: keepPreviousData } });
  const activityQuery = useGetAdminUserActivityReport(commonParams as GetAdminUserActivityReportParams, {
    query: { placeholderData: keepPreviousData },
  });

  const revenue = revenueQuery.data;
  const activity = activityQuery.data;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (revenueQuery.error) message.error('Failed to load revenue report');
    if (activityQuery.error) message.error('Failed to load user activity report');
  }, [revenueQuery.error, activityQuery.error]);

  if (!isAuthenticated) return null;

  // Tables definitions
  const revenueDailyColumns: TableProps<RevenueReportDailyBreakdownItem>['columns'] = [
    { title: 'Date', dataIndex: 'date', key: 'date', render: (d: string) => formatDateTime(d) },
    { title: 'Revenue', dataIndex: 'revenue', key: 'revenue', render: (v: number) => formatCurrency(v) },
    { title: 'Transactions', dataIndex: 'transactions', key: 'transactions' },
  ];

  const topCategoriesColumns: TableProps<RevenueReportTopRevenueCategoriesItem>['columns'] = [
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Revenue', dataIndex: 'revenue', key: 'revenue', render: (v: number) => formatCurrency(v) },
    {
      title: 'Share',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (p: number) => {
        let color: 'green' | 'blue' | 'default' = 'default';
        if (p >= 25) color = 'green';
        else if (p >= 10) color = 'blue';
        return <Tag color={color}>{p.toFixed(1)}%</Tag>;
      },
    },
  ];

  const dailyActivityColumns: TableProps<UserActivityReportDailyActivityItem>['columns'] = [
    { title: 'Date', dataIndex: 'date', key: 'date', render: (d: string) => formatDateTime(d) },
    { title: 'Active Users', dataIndex: 'active_users', key: 'active_users' },
    { title: 'Registrations', dataIndex: 'new_registrations', key: 'new_registrations' },
    { title: 'Total Bids', dataIndex: 'total_bids', key: 'total_bids' },
    { title: 'Total Listings', dataIndex: 'total_listings', key: 'total_listings' },
  ];

  const engagementColumns: TableProps<UserActivityReportUserEngagementItem>['columns'] = [
    { title: 'Metric', dataIndex: 'metric', key: 'metric' },
    { title: 'Value', dataIndex: 'value', key: 'value' },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (c: number) => {
        let color: 'green' | 'red' | 'default' = 'default';
        if (c > 0) color = 'green';
        else if (c < 0) color = 'red';
        return <Tag color={color}>{c.toFixed(1)}%</Tag>;
      },
    },
  ];

  return (
    <AdminLayout>
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={10}>
              <RangePicker
                showTime
                style={{ width: '100%' }}
                onChange={(range) => setDateRange(range ? (range as unknown as unknown[]) : null)}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Select
                style={{ width: '100%' }}
                value={period}
                onChange={(v) => setPeriod(v)}
                options={[
                  { label: 'Daily', value: 'daily' },
                  { label: 'Weekly', value: 'weekly' },
                  { label: 'Monthly', value: 'monthly' },
                ]}
                placeholder="Period"
              />
            </Col>
          </Row>
        </Card>

        {/* Revenue Overview */}
        <Card loading={revenueQuery.isLoading}>
          <Title level={4} style={{ marginBottom: 16 }}>Revenue Overview</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={6}>
              <Statistic title="Total Revenue" value={revenue ? formatCurrency(revenue.total_revenue) : '-'} />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic title="Period Revenue" value={revenue ? formatCurrency(revenue.period_revenue) : '-'} />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic title="Listing Fees" value={revenue ? formatCurrency(revenue.listing_fees) : '-'} />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic title="Premium Fees" value={revenue ? formatCurrency(revenue.premium_fees) : '-'} />
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} sm={6}>
              <Statistic title="Commission Revenue" value={revenue ? formatCurrency(revenue.commission_revenue) : '-'} />
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Card title="Daily Revenue Breakdown" loading={revenueQuery.isLoading}>
              <Table
                rowKey={(r) => `${r.date}`}
                dataSource={revenue?.daily_breakdown ?? []}
                columns={revenueDailyColumns}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card title="Top Revenue Categories" loading={revenueQuery.isLoading}>
              <Table
                rowKey={(r) => `${r.category}`}
                dataSource={revenue?.top_revenue_categories ?? []}
                columns={topCategoriesColumns}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>

        {/* User Activity */}
        <Card loading={activityQuery.isLoading}>
          <Title level={4} style={{ marginBottom: 16 }}>User Activity</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={6}>
              <Statistic title="Total Active Users" value={activity?.total_active_users ?? 0} />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic title="Active Bidders" value={activity?.active_bidders ?? 0} />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic title="Active Sellers" value={activity?.active_sellers ?? 0} />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic title="New Registrations" value={activity?.new_registrations ?? 0} />
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Card title="Daily Activity" loading={activityQuery.isLoading}>
              <Table
                rowKey={(r) => `${r.date}`}
                dataSource={activity?.daily_activity ?? []}
                columns={dailyActivityColumns}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card title="Engagement Metrics" loading={activityQuery.isLoading}>
              <Table
                rowKey={(r) => `${r.metric}`}
                dataSource={activity?.user_engagement ?? []}
                columns={engagementColumns}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </Space>
    </AdminLayout>
  );
}

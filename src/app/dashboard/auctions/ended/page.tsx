"use client";

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  Button,
  Card,
  Col,
  Row,
  Space,
  Typography,
  Input,
  Select,
  Table,
  Tag,
  Pagination,
  Empty,
  Spin,
  Statistic,
  DatePicker,
  message,
  Avatar,
  Tooltip,
  Badge,
} from 'antd';
import type { TableProps } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  TrophyOutlined,
  CalendarOutlined,
  DownloadOutlined,
  EyeOutlined,
  StarOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import {
  type AuctionItem,
  type GetAdminAuctionItemsParams,
  GetAdminAuctionItemsStatus,
} from '@/lib/api/generated/models';
import {
  useGetAdminAuctionItems,
  getGetAdminAuctionItemsQueryKey,
} from '@/lib/api/generated';
import { useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface EndedAuctionStats {
  totalSold: number;
  totalRevenue: number;
  averagePrice: number;
  successRate: number;
}

export default function EndedAuctionsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState({
    search: '',
    dateRange: null as [dayjs.Dayjs, dayjs.Dayjs] | null,
    outcome: '', // 'sold', 'unsold', 'cancelled'
    sortBy: 'end_time',
    sortDirection: 'desc' as 'asc' | 'desc',
  });

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const qc = useQueryClient();

  // Build API params
  const params: GetAdminAuctionItemsParams = {
    page: currentPage,
    per_page: pageSize,
    status: GetAdminAuctionItemsStatus.ended,
    search: filters.search || undefined,
    sort_by: filters.sortBy,
    sort_direction: filters.sortDirection,
  };

  const itemsQuery = useGetAdminAuctionItems(params, {
    query: { placeholderData: keepPreviousData },
  });

  const items = itemsQuery.data?.data ?? [];
  const total = itemsQuery.data?.meta?.total ?? 0;
  const loading = itemsQuery.isFetching || itemsQuery.isLoading;

  // Route protection
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  // Calculate statistics
  const calculateStats = (): EndedAuctionStats => {
    const soldItems = items.filter(item => item.current_price && item.current_price > 0);
    const totalSold = soldItems.length;
    const totalRevenue = soldItems.reduce((sum, item) => sum + (item.current_price || 0), 0);
    const averagePrice = totalSold > 0 ? totalRevenue / totalSold : 0;
    const successRate = items.length > 0 ? (totalSold / items.length) * 100 : 0;

    return { totalSold, totalRevenue, averagePrice, successRate };
  };

  const stats = calculateStats();

  // Determine auction outcome
  const getAuctionOutcome = (item: AuctionItem) => {
    if (!item.current_price || item.current_price === 0) {
      return { status: 'unsold', color: 'default', text: 'No Bids' };
    }
    if (item.reserve_price && item.current_price < item.reserve_price) {
      return { status: 'reserve_not_met', color: 'warning', text: 'Reserve Not Met' };
    }
    return { status: 'sold', color: 'success', text: 'Sold' };
  };

  // Calculate profit/loss
  const calculateProfit = (item: AuctionItem) => {
    const soldPrice = item.current_price || 0;
    const retailPrice = item.retail_price || item.starting_price || 0;
    return soldPrice - retailPrice;
  };

  const handleTableChange: NonNullable<TableProps<AuctionItem>['onChange']> = (
    paginationInfo,
    _filters,
    sorter
  ) => {
    if (paginationInfo.current) setCurrentPage(paginationInfo.current);
    if (paginationInfo.pageSize) setPageSize(paginationInfo.pageSize);

    const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    if (currentSorter && 'field' in currentSorter && currentSorter.field) {
      const order = (currentSorter as { order?: 'ascend' | 'descend' | null }).order;
      setFilters(prev => ({
        ...prev,
        sortBy: String(currentSorter.field),
        sortDirection: order === 'ascend' ? 'asc' : 'desc',
      }));
    }
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setCurrentPage(1);
  };

  const handleExport = () => {
    // In a real app, this would trigger data export
    message.success('Export started - you will receive an email when ready');
  };

  const refreshData = () => {
    qc.invalidateQueries({ queryKey: getGetAdminAuctionItemsQueryKey(params) });
    message.success('Data refreshed');
  };

  // Helper function for success rate color
  const getSuccessRateColor = (rate: number) => {
    if (rate >= 70) return '#52c41a';
    if (rate >= 50) return '#faad14';
    return '#ff4d4f';
  };

  if (!isAuthenticated) return null;

  const columns: TableProps<AuctionItem>['columns'] = [
    {
      title: 'Item',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (name: string, record: AuctionItem) => (
        <div className="flex items-center space-x-3">
          <Avatar
            size={40}
            src={record.images?.[0]}
            icon={<TrophyOutlined />}
            className="flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">{name}</div>
            <div className="text-sm text-gray-500">{record.item_code}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Outcome',
      key: 'outcome',
      width: 120,
      render: (_, record: AuctionItem) => {
        const outcome = getAuctionOutcome(record);
        return (
          <Tag 
            color={outcome.color}
            icon={outcome.status === 'sold' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          >
            {outcome.text}
          </Tag>
        );
      },
    },
    {
      title: 'Final Price',
      dataIndex: 'current_price',
      key: 'current_price',
      width: 120,
      sorter: true,
      render: (price: number | null) => (
        <Text strong className={price && price > 0 ? 'text-green-600' : 'text-gray-400'}>
          {price ? formatCurrency(price) : 'No Sale'}
        </Text>
      ),
    },
    {
      title: 'Starting Price',
      dataIndex: 'starting_price',
      key: 'starting_price',
      width: 120,
      render: (price: number) => (
        <Text type="secondary">{formatCurrency(price)}</Text>
      ),
    },
    {
      title: 'Profit/Loss',
      key: 'profit',
      width: 120,
      render: (_, record: AuctionItem) => {
        const profit = calculateProfit(record);
        return (
          <Text className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
            {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
          </Text>
        );
      },
    },
    {
      title: 'Duration',
      key: 'duration',
      width: 100,
      render: (_, record: AuctionItem) => {
        if (!record.start_time || !record.end_time) return '-';
        const duration = dayjs(record.end_time).diff(dayjs(record.start_time), 'day');
        return `${duration} days`;
      },
    },
    {
      title: 'Ended',
      dataIndex: 'end_time',
      key: 'end_time',
      width: 150,
      sorter: true,
      render: (endTime: string) => (
        <div>
          <div>{formatDateTime(endTime)}</div>
          <Text type="secondary" className="text-xs">
            {dayjs(endTime).fromNow()}
          </Text>
        </div>
      ),
    },
    {
      title: 'Featured',
      dataIndex: 'is_featured',
      key: 'is_featured',
      width: 80,
      align: 'center',
      render: (featured: boolean) => 
        featured ? <StarOutlined className="text-yellow-500" /> : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: () => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button icon={<EyeOutlined />} size="small" type="text" />
          </Tooltip>
          <Tooltip title="Relist Item">
            <Button icon={<ClockCircleOutlined />} size="small" type="text" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Title level={2} className="!mb-2">
              <CheckCircleOutlined className="text-green-500 mr-2" />
              Ended Auctions
            </Title>
            <Text type="secondary">
              Historical auction data and performance analytics • {total} completed auctions
            </Text>
          </div>
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              Export Data
            </Button>
            <Button icon={<ClockCircleOutlined />} onClick={refreshData}>
              Refresh
            </Button>
          </Space>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={6}>
            <Card size="small">
              <Statistic
                title="Total Sold"
                value={stats.totalSold}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#52c41a' }}
                suffix={`/ ${items.length}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card size="small">
              <Statistic
                title="Total Revenue"
                value={stats.totalRevenue}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#1890ff' }}
                formatter={(value) => formatCurrency(Number(value))}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card size="small">
              <Statistic
                title="Average Price"
                value={stats.averagePrice}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#722ed1' }}
                formatter={(value) => formatCurrency(Number(value))}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card size="small">
              <Statistic
                title="Success Rate"
                value={stats.successRate}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ 
                  color: getSuccessRateColor(stats.successRate)
                }}
                suffix="%"
                precision={1}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Search
                placeholder="Search ended auctions..."
                onSearch={handleSearch}
                allowClear
                enterButton
              />
            </Col>
            <Col xs={24} md={6}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Start Date', 'End Date']}
                value={filters.dateRange}
                onChange={(dates) => {
                  const normalized = dates && dates[0] && dates[1] ? [dates[0], dates[1]] as [dayjs.Dayjs, dayjs.Dayjs] : null;
                  setFilters(prev => ({ ...prev, dateRange: normalized }));
                }}
              />
            </Col>
            <Col xs={24} md={4}>
              <Select
                placeholder="Outcome"
                style={{ width: '100%' }}
                allowClear
                value={filters.outcome || undefined}
                onChange={(value) => setFilters(prev => ({ ...prev, outcome: value || '' }))}
              >
                <Option value="sold">Sold</Option>
                <Option value="unsold">Unsold</Option>
                <Option value="reserve_not_met">Reserve Not Met</Option>
              </Select>
            </Col>
            <Col xs={24} md={6}>
              <div className="flex justify-end">
                <Badge count={total} showZero color="#52c41a">
                  <Button icon={<CalendarOutlined />}>
                    Total Auctions
                  </Button>
                </Badge>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Data Table */}
        <Card>
          <Spin spinning={loading}>
            {items.length === 0 ? (
              <Empty
                description="No ended auctions found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Table
                rowKey="id"
                dataSource={items}
                columns={columns}
                pagination={false}
                onChange={handleTableChange}
                scroll={{ x: 1200 }}
                size="small"
              />
            )}
          </Spin>
          
          {items.length > 0 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={total}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) => 
                  `${range[0]}-${range[1]} of ${total} auctions`
                }
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size || pageSize);
                }}
              />
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}

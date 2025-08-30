"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
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
  Slider,
  Badge,
  Progress,
  Tag,
  Pagination,
  Empty,
  Spin,
  Statistic,
  Tooltip,
  Switch,
  message,
} from 'antd';
import {
  EyeOutlined,
  HeartOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TrophyOutlined,
  ReloadOutlined,
  PlusOutlined,
  FireOutlined,
  ThunderboltOutlined,
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
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function ActiveAuctionsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priceRange: [0, 10000] as [number, number],
    sortBy: 'ending_soon',
    featured: false,
  });

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const qc = useQueryClient();

  // Helper function to convert sort option to API field
  const getSortBy = (sortBy: string) => {
    switch (sortBy) {
      case 'ending_soon': return 'end_time';
      case 'price_high': return 'current_bid';
      case 'price_low': return 'current_bid';
      case 'newest': return 'created_at';
      case 'most_bids': return 'bid_count';
      default: return 'end_time';
    }
  };

  // Build API params
  const params: GetAdminAuctionItemsParams = {
    page: currentPage,
    per_page: pageSize,
    status: GetAdminAuctionItemsStatus.active,
    search: filters.search || undefined,
    sort_by: getSortBy(filters.sortBy),
    sort_direction: filters.sortBy === 'price_low' ? 'asc' : 'desc',
  };

  const itemsQuery = useGetAdminAuctionItems(params, {
    query: { 
      placeholderData: keepPreviousData,
      refetchInterval: realTimeUpdates ? 30000 : false, // Refresh every 30 seconds
    },
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

  // Calculate time remaining
  const getTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Get urgency color based on time remaining
  const getUrgencyColor = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours <= 1) return '#ff4d4f';
    if (hours <= 6) return '#fa8c16';
    if (hours <= 24) return '#fadb14';
    return '#52c41a';
  };

  // Mock bid activity data (in real app, this would come from API)
  const getBidActivity = (item: AuctionItem) => {
    // Use item.id to generate consistent random data for each auction
    const seed = item.id ? parseInt(item.id.toString()) : 1;
    const bidCount = Math.floor((seed * 7) % 50) + 1;
    const watchers = Math.floor((seed * 13) % 100) + 5;
    return { bidCount, watchers };
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: string | undefined | number[]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const refreshData = () => {
    qc.invalidateQueries({ queryKey: getGetAdminAuctionItemsQueryKey(params) });
    message.success('Data refreshed');
  };

  if (!isAuthenticated) return null;

  const AuctionCard = ({ item }: { item: AuctionItem }) => {
    const timeRemaining = getTimeRemaining(item.end_time || '');
    const urgencyColor = getUrgencyColor(item.end_time || '');
    const { bidCount, watchers } = getBidActivity(item);
    const progress = ((new Date().getTime() - new Date(item.start_time || '').getTime()) / 
                     (new Date(item.end_time || '').getTime() - new Date(item.start_time || '').getTime())) * 100;

    return (
      <Card
        hoverable
        className="h-full"
        cover={
          <div className="relative h-48 bg-gray-100 flex items-center justify-center">
            {item.images && item.images.length > 0 ? (
              <Image 
                src={item.images[0]} 
                alt={item.name || 'Auction item'} 
                width={300}
                height={200}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400 text-4xl">
                <TrophyOutlined />
              </div>
            )}
            {item.is_featured && (
              <Badge.Ribbon text="Featured" color="red" />
            )}
            <div className="absolute top-2 right-2">
              <Tag color={urgencyColor} icon={<ClockCircleOutlined />}>
                {timeRemaining}
              </Tag>
            </div>
          </div>
        }
        actions={[
          <Tooltip title="View Details" key="view">
            <EyeOutlined />
          </Tooltip>,
          <Tooltip title="Add to Watchlist" key="watch">
            <HeartOutlined />
          </Tooltip>,
          <Tooltip title="Quick Bid" key="bid">
            <ThunderboltOutlined />
          </Tooltip>,
        ]}
      >
        <div className="space-y-3">
          <div>
            <Title level={5} className="!mb-1 line-clamp-2">
              {item.name}
            </Title>
            <Text type="secondary" className="text-sm">
              {item.item_code}
            </Text>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Text strong className="text-lg text-green-600">
                {formatCurrency(item.current_price || item.starting_price || 0)}
              </Text>
              <Space size="small">
                <Tooltip title="Total Bids">
                  <Badge count={bidCount} showZero color="#1890ff" />
                </Tooltip>
                <Tooltip title="Watchers">
                  <Space size={4}>
                    <UserOutlined className="text-gray-400" />
                    <Text type="secondary">{watchers}</Text>
                  </Space>
                </Tooltip>
              </Space>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <Text type="secondary">Progress</Text>
                <Text type="secondary">{Math.round(progress)}%</Text>
              </div>
              <Progress 
                percent={Math.min(progress, 100)} 
                size="small" 
                strokeColor={urgencyColor}
                showInfo={false}
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <Text type="secondary">
                Starting: {formatCurrency(item.starting_price || 0)}
              </Text>
              {item.reserve_price && (
                <Text type="secondary">
                  Reserve: {formatCurrency(item.reserve_price)}
                </Text>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Title level={2} className="!mb-2">
              <FireOutlined className="text-red-500 mr-2" />
              Active Auctions
            </Title>
            <Text type="secondary">
              Live auctions with real-time updates • {total} active items
            </Text>
          </div>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={refreshData} 
              loading={loading}
            >
              Refresh
            </Button>
            <Link href="/dashboard/auctions/create">
              <Button type="primary" icon={<PlusOutlined />}>
                Create Auction
              </Button>
            </Link>
          </Space>
        </div>

        {/* Quick Stats */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={6}>
            <Card size="small">
              <Statistic
                title="Active Auctions"
                value={total}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card size="small">
              <Statistic
                title="Ending Soon"
                value={Math.floor(total * 0.15)}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
                suffix="< 6h"
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card size="small">
              <Statistic
                title="Hot Auctions"
                value={Math.floor(total * 0.25)}
                prefix={<FireOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
                suffix="> 10 bids"
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card size="small">
              <Statistic
                title="Featured Items"
                value={items.filter(i => i.is_featured).length}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters and Controls */}
        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Search
                placeholder="Search auctions..."
                onSearch={handleSearch}
                allowClear
                enterButton
              />
            </Col>
            <Col xs={24} md={4}>
              <Select
                placeholder="Sort by"
                style={{ width: '100%' }}
                value={filters.sortBy}
                onChange={(value) => handleFilterChange('sortBy', value)}
              >
                <Option value="ending_soon">Ending Soon</Option>
                <Option value="price_high">Price: High to Low</Option>
                <Option value="price_low">Price: Low to High</Option>
                <Option value="newest">Newest First</Option>
                <Option value="popular">Most Popular</Option>
              </Select>
            </Col>
            <Col xs={24} md={4}>
              <Select
                placeholder="Category"
                style={{ width: '100%' }}
                allowClear
                value={filters.category || undefined}
                onChange={(value) => handleFilterChange('category', value)}
              >
                <Option value="electronics">Electronics</Option>
                <Option value="fashion">Fashion</Option>
                <Option value="home">Home & Garden</Option>
                <Option value="sports">Sports</Option>
                <Option value="collectibles">Collectibles</Option>
              </Select>
            </Col>
            <Col xs={24} md={4}>
              <Space>
                <Text>Real-time:</Text>
                <Switch
                  checked={realTimeUpdates}
                  onChange={setRealTimeUpdates}
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                />
              </Space>
            </Col>
            <Col xs={24} md={4}>
              <div className="flex justify-end">
                <Space.Compact>
                  <Button 
                    type={viewMode === 'grid' ? 'primary' : 'default'}
                    onClick={() => setViewMode('grid')}
                  >
                    Grid
                  </Button>
                  <Button 
                    type={viewMode === 'list' ? 'primary' : 'default'}
                    onClick={() => setViewMode('list')}
                  >
                    List
                  </Button>
                </Space.Compact>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Price Range Filter */}
        <Card size="small">
          <Row align="middle">
            <Col span={4}>
              <Text strong>Price Range:</Text>
            </Col>
            <Col span={16}>
              <Slider
                range
                min={0}
                max={10000}
                step={100}
                value={filters.priceRange}
                onChange={(value) => handleFilterChange('priceRange', value)}
                tooltip={{
                  formatter: (value) => formatCurrency(value || 0),
                }}
              />
            </Col>
            <Col span={4} className="text-right">
              <Text type="secondary">
                {formatCurrency(filters.priceRange[0])} - {formatCurrency(filters.priceRange[1])}
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Auction Grid */}
        <Card>
          <Spin spinning={loading}>
            {items.length === 0 ? (
              <Empty
                description="No active auctions found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Link href="/dashboard/auctions/create">
                  <Button type="primary" icon={<PlusOutlined />}>
                    Create First Auction
                  </Button>
                </Link>
              </Empty>
            ) : (
              <>
                <Row gutter={[16, 16]}>
                  {items.map((item) => (
                    <Col 
                      key={item.id} 
                      xs={24} 
                      sm={12} 
                      md={8} 
                      lg={6}
                      xl={viewMode === 'grid' ? 6 : 24}
                    >
                      <AuctionCard item={item} />
                    </Col>
                  ))}
                </Row>
                
                <div className="mt-6 flex justify-center">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={total}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total, range) => 
                      `${range[0]}-${range[1]} of ${total} items`
                    }
                    onChange={(page, size) => {
                      setCurrentPage(page);
                      setPageSize(size || pageSize);
                    }}
                  />
                </div>
              </>
            )}
          </Spin>
        </Card>
      </div>
    </AdminLayout>
  );
}

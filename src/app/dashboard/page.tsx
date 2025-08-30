"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Typography,
  Statistic,
  Button,
  Progress,
  Avatar,
  List,
  Tag,
  Space,
  Badge,
  Select,
  Tabs,
  Alert
} from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SettingOutlined,
  BellOutlined,
  PictureOutlined,
  FileTextOutlined,
  DashboardOutlined,
  LineChartOutlined,
  BarChartOutlined,
  ReloadOutlined,
  DownloadOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  TeamOutlined,
  RiseOutlined,
  SyncOutlined,
  TrophyOutlined as TrophyIcon
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line
} from 'recharts';
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

export default function DashboardHome() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  // Advanced real-time metrics with WebSocket simulation
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeUsers: 1247,
    currentRevenue: 456789,
    liveBids: 34,
    systemLoad: 45
  });

  // Utility functions for better code organization
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'bid': return <TrophyIcon />;
      case 'auction': return <ShoppingOutlined />;
      case 'user': return <UserOutlined />;
      case 'payment': return <DollarOutlined />;
      default: return <BellOutlined />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'bid': return '#1890ff';
      case 'auction': return '#52c41a';
      case 'user': return '#722ed1';
      case 'payment': return '#fa8c16';
      default: return '#ff4d4f';
    }
  };

  const getProgressStatus = (status: string) => {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'active';
      case 'warning': return 'exception';
      default: return 'normal';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#52c41a';
      case 'good': return '#1890ff';
      case 'warning': return '#faad14';
      default: return '#ff4d4f';
    }
  };

  // Client-side guard (middleware already protects server-side)
  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 1000);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10) - 5,
        currentRevenue: prev.currentRevenue + Math.floor(Math.random() * 1000) - 500,
        liveBids: Math.max(0, prev.liveBids + Math.floor(Math.random() * 6) - 3),
        systemLoad: Math.max(0, Math.min(100, prev.systemLoad + Math.floor(Math.random() * 10) - 5))
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!isAuthenticated) return null;

  // Advanced mock data with more comprehensive metrics
  const advancedStats = {
    totalUsers: 12540,
    activeUsers: 8923,
    newUsersToday: 234,
    activeAuctions: 347,
    totalRevenue: 2845670,
    monthlyRevenue: 456789,
    totalBids: 8962,
    conversionRate: 3.2,
    avgBidValue: 317.50,
    userGrowth: 12.5,
    auctionGrowth: 8.3,
    revenueGrowth: -2.1,
    bidGrowth: 15.7,
    systemUptime: 99.9,
    responseTime: 245,
    errorRate: 0.1,
    activeSessions: 1247
  };

  // Revenue trend data
  const revenueData = [
    { month: 'Jan', revenue: 320000, target: 350000, users: 8500 },
    { month: 'Feb', revenue: 380000, target: 380000, users: 9200 },
    { month: 'Mar', revenue: 420000, target: 400000, users: 10100 },
    { month: 'Apr', revenue: 390000, target: 420000, users: 9800 },
    { month: 'May', revenue: 450000, target: 450000, users: 11200 },
    { month: 'Jun', revenue: 480000, target: 470000, users: 11800 },
    { month: 'Jul', revenue: 520000, target: 500000, users: 12500 },
    { month: 'Aug', revenue: 456789, target: 480000, users: 12200 }
  ];

  // User engagement data
  const engagementData = [
    { day: 'Mon', active: 1200, new: 180, returning: 1020 },
    { day: 'Tue', active: 1350, new: 220, returning: 1130 },
    { day: 'Wed', active: 1180, new: 190, returning: 990 },
    { day: 'Thu', active: 1420, new: 250, returning: 1170 },
    { day: 'Fri', active: 1580, new: 280, returning: 1300 },
    { day: 'Sat', active: 1650, new: 320, returning: 1330 },
    { day: 'Sun', active: 1480, new: 290, returning: 1190 }
  ];

  // Auction performance data
  const auctionData = [
    { category: 'Electronics', value: 35, bids: 1200, revenue: 89000 },
    { category: 'Fashion', value: 28, bids: 950, revenue: 67000 },
    { category: 'Home & Garden', value: 20, bids: 780, revenue: 54000 },
    { category: 'Sports', value: 12, bids: 420, revenue: 31000 },
    { category: 'Collectibles', value: 5, bids: 180, revenue: 15000 }
  ];

  // System health data
  const systemHealth = [
    { metric: 'CPU Usage', value: 45, status: 'good' },
    { metric: 'Memory Usage', value: 68, status: 'warning' },
    { metric: 'Disk Usage', value: 72, status: 'warning' },
    { metric: 'Network I/O', value: 34, status: 'good' },
    { metric: 'Database Load', value: 56, status: 'good' },
    { metric: 'Cache Hit Rate', value: 89, status: 'excellent' }
  ];

  // Real-time activity feed
  const realTimeActivities = [
    { id: 1, type: 'bid', user: 'John Doe', action: 'placed bid of $450', item: 'iPhone 15 Pro', time: '2s ago', amount: 450 },
    { id: 2, type: 'auction', user: 'Sarah Wilson', action: 'created auction', item: 'Designer Watch', time: '15s ago', amount: null },
    { id: 3, type: 'user', user: 'Mike Johnson', action: 'registered account', item: null, time: '1m ago', amount: null },
    { id: 4, type: 'bid', user: 'Emma Davis', action: 'won auction', item: 'MacBook Pro', time: '2m ago', amount: 1200 },
    { id: 5, type: 'payment', user: 'Alex Chen', action: 'completed payment', item: 'Gaming PC', time: '3m ago', amount: 850 }
  ];

  // Top performing items
  const topItems = [
    { id: 1, name: 'iPhone 15 Pro Max', bids: 234, currentBid: 1250, endTime: '2h 15m', image: '/api/placeholder/60/60' },
    { id: 2, name: 'MacBook Pro M3', bids: 189, currentBid: 2100, endTime: '4h 32m', image: '/api/placeholder/60/60' },
    { id: 3, name: 'Rolex Submariner', bids: 156, currentBid: 8500, endTime: '6h 45m', image: '/api/placeholder/60/60' },
    { id: 4, name: 'PS5 Console', bids: 142, currentBid: 450, endTime: '1h 20m', image: '/api/placeholder/60/60' },
    { id: 5, name: 'Nintendo Switch OLED', bids: 98, currentBid: 320, endTime: '8h 10m', image: '/api/placeholder/60/60' }
  ];

  // Geographic data
  const geoData = [
    { country: 'United States', users: 4520, revenue: 125000 },
    { country: 'United Kingdom', users: 2100, revenue: 78000 },
    { country: 'Germany', users: 1800, revenue: 65000 },
    { country: 'France', users: 1500, revenue: 52000 },
    { country: 'Canada', users: 1200, revenue: 38000 },
    { country: 'Australia', users: 950, revenue: 29000 }
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    // In a real app, this would trigger data export
    console.log(`Exporting data in ${format} format...`);
    // Simulate export process
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      // Show success notification
    }, 2000);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Advanced filtering and time range handling
  const getFilteredData = (dataSet: unknown[], range: string) => {
    // In a real app, this would filter based on the time range
    switch (range) {
      case '1h': return dataSet.slice(-1);
      case '24h': return dataSet.slice(-7);
      case '7d': return dataSet;
      case '30d': return [...dataSet, ...dataSet]; // Simulate more data
      case '90d': return [...dataSet, ...dataSet, ...dataSet];
      default: return dataSet;
    }
  };

  const filteredRevenueData = getFilteredData(revenueData, timeRange);
  const filteredEngagementData = getFilteredData(engagementData, timeRange);

  return (
    <AdminLayout>
      {/* Advanced Header */}
      <div className="mb-6">
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            <Space align="center">
              <DashboardOutlined className="text-2xl text-blue-600" />
              <div>
                <Title level={2} className="!mb-1">Advanced Analytics Dashboard</Title>
                <Text type="secondary" className="text-base">
                  Real-time insights and performance metrics • Last updated: {new Date().toLocaleTimeString()}
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Select value={timeRange} onChange={setTimeRange} style={{ width: 120 }}>
                <Option value="1h">Last Hour</Option>
                <Option value="24h">Last 24h</Option>
                <Option value="7d">Last 7 days</Option>
                <Option value="30d">Last 30 days</Option>
                <Option value="90d">Last 90 days</Option>
              </Select>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={refreshing}>
                Refresh
              </Button>
              <Button icon={<DownloadOutlined />} onClick={() => handleExport('csv')}>Export CSV</Button>
              <Button icon={<DownloadOutlined />} onClick={() => handleExport('pdf')}>Export PDF</Button>
              <Button icon={<DownloadOutlined />} onClick={() => handleExport('excel')}>Export Excel</Button>
              <Button icon={<BellOutlined />} />
              <Button icon={<SettingOutlined />} />
            </Space>
          </Col>
        </Row>
      </div>

      {/* Critical Alerts */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24}>
          <Alert
            message="System Alert"
            description="All systems operational. No critical issues detected."
            type="success"
            showIcon
            closable
            className="mb-4"
          />
        </Col>
      </Row>

      {/* Key Performance Indicators */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <Statistic
              title={
                <Space>
                  <UserOutlined />
                  Total Users
                  <Badge count={advancedStats.newUsersToday} style={{ backgroundColor: '#52c41a' }} />
                </Space>
              }
              value={realTimeMetrics.activeUsers.toLocaleString()}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
              suffix={
                <div className="text-sm">
                  <ArrowUpOutlined className="text-green-500" />
                  <span className="text-green-500 ml-1">{advancedStats.userGrowth}%</span>
                </div>
              }
            />
            <div className="mt-2">
              <Text type="secondary" className="text-xs">
                {advancedStats.activeUsers.toLocaleString()} active today
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <Statistic
              title={
                <Space>
                  <DollarOutlined />
                  Monthly Revenue
                </Space>
              }
              value={realTimeMetrics.currentRevenue}
              precision={0}
              valueStyle={{ color: '#52c41a' }}
              prefix="$"
              suffix={
                <div className="text-sm">
                  {advancedStats.revenueGrowth > 0 ? (
                    <ArrowUpOutlined className="text-green-500" />
                  ) : (
                    <ArrowDownOutlined className="text-red-500" />
                  )}
                  <span className={advancedStats.revenueGrowth > 0 ? 'text-green-500 ml-1' : 'text-red-500 ml-1'}>
                    {Math.abs(advancedStats.revenueGrowth)}%
                  </span>
                </div>
              }
            />
            <div className="mt-2">
              <Text type="secondary" className="text-xs">
                Target: ${(advancedStats.monthlyRevenue * 1.1).toLocaleString()}
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <Statistic
              title={
                <Space>
                  <TrophyOutlined />
                  Active Auctions
                </Space>
              }
              value={advancedStats.activeAuctions}
              precision={0}
              valueStyle={{ color: '#722ed1' }}
              suffix={
                <div className="text-sm">
                  <ArrowUpOutlined className="text-green-500" />
                  <span className="text-green-500 ml-1">{advancedStats.auctionGrowth}%</span>
                </div>
              }
            />
            <div className="mt-2">
              <Text type="secondary" className="text-xs">
                {advancedStats.totalBids.toLocaleString()} total bids
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <Statistic
              title={
                <Space>
                  <ThunderboltOutlined />
                  Conversion Rate
                </Space>
              }
              value={advancedStats.conversionRate}
              precision={1}
              valueStyle={{ color: '#fa8c16' }}
              suffix="%"
            />
            <div className="mt-2">
              <Text type="secondary" className="text-xs">
                Avg bid: ${advancedStats.avgBidValue}
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Advanced Analytics Tabs */}
      <Card className="mb-6">
        <Tabs defaultActiveKey="overview" type="card">
          <TabPane
            tab={
              <span>
                <LineChartOutlined />
                Revenue Analytics
              </span>
            }
            key="revenue"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <Card title="Revenue Trend & Performance" className="mb-4">
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={filteredRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <RechartsTooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                      <Line yAxisId="right" type="monotone" dataKey="users" stroke="#82ca9d" name="Users" strokeWidth={3} />
                      <Line yAxisId="left" type="monotone" dataKey="target" stroke="#ff7300" name="Target ($)" strokeDasharray="5 5" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Revenue Breakdown" className="mb-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Electronics', value: 35 },
                          { name: 'Fashion', value: 28 },
                          { name: 'Home & Garden', value: 20 },
                          { name: 'Sports', value: 12 },
                          { name: 'Collectibles', value: 5 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {auctionData.map((entry) => (
                          <Cell key={entry.category} fill={COLORS[auctionData.indexOf(entry) % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
                <Card title="Quick Stats">
                  <Space direction="vertical" className="w-full">
                    <div className="flex justify-between">
                      <Text>Best Month</Text>
                      <Text strong>July ($520K)</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text>Growth Rate</Text>
                      <Text strong className="text-green-600">+8.3%</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text>Avg Order Value</Text>
                      <Text strong>$317.50</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <TeamOutlined />
                User Analytics
              </span>
            }
            key="users"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="User Engagement Trends">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={filteredEngagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Area type="monotone" dataKey="active" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="new" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                      <Area type="monotone" dataKey="returning" stackId="3" stroke="#ffc658" fill="#ffc658" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Geographic Distribution">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={geoData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="country" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="users" fill="#8884d8" name="Users" />
                      <Bar dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <BarChartOutlined />
                Auction Performance
              </span>
            }
            key="auctions"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Card title="Category Performance Analysis">
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={auctionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <RechartsTooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="bids" fill="#8884d8" name="Total Bids" />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#ff7300" name="Revenue ($)" strokeWidth={3} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <GlobalOutlined />
                System Health
              </span>
            }
            key="system"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="System Metrics">
                  <Space direction="vertical" className="w-full" size="large">
                    {systemHealth.map((metric) => (
                      <div key={metric.metric}>
                        <div className="flex justify-between mb-2">
                          <Text>{metric.metric}</Text>
                          <Text strong>{metric.value}%</Text>
                        </div>
                        <Progress
                          percent={metric.value}
                          status={getProgressStatus(metric.status)}
                          strokeColor={getProgressColor(metric.status)}
                        />
                      </div>
                    ))}
                  </Space>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Performance Overview">
                  <Space direction="vertical" className="w-full">
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded">
                      <div>
                        <Text strong>System Uptime</Text>
                        <br />
                        <Text type="secondary">Last 30 days</Text>
                      </div>
                      <Statistic value={advancedStats.systemUptime} suffix="%" valueStyle={{ color: '#1890ff' }} />
                    </div>
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded">
                      <div>
                        <Text strong>Response Time</Text>
                        <br />
                        <Text type="secondary">Average</Text>
                      </div>
                      <Statistic value={advancedStats.responseTime} suffix="ms" valueStyle={{ color: '#52c41a' }} />
                    </div>
                    <div className="flex justify-between items-center p-4 bg-red-50 rounded">
                      <div>
                        <Text strong>Error Rate</Text>
                        <br />
                        <Text type="secondary">Last 24 hours</Text>
                      </div>
                      <Statistic value={advancedStats.errorRate} suffix="%" valueStyle={{ color: '#ff4d4f' }} />
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <FileTextOutlined />
                Detailed Analytics
              </span>
            }
            key="detailed"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Card title="Comprehensive Data Analysis">
                  <div className="mb-4">
                    <Space>
                      <Select defaultValue="all" style={{ width: 120 }}>
                        <Option value="all">All Data</Option>
                        <Option value="revenue">Revenue</Option>
                        <Option value="users">Users</Option>
                        <Option value="auctions">Auctions</Option>
                      </Select>
                      <Button icon={<ReloadOutlined />}>Refresh</Button>
                      <Button icon={<DownloadOutlined />} onClick={() => handleExport('csv')}>Export</Button>
                    </Space>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <Text strong className="text-blue-600">Total Records</Text>
                      <div className="text-2xl font-bold text-blue-700">12,540</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <Text strong className="text-green-600">Success Rate</Text>
                      <div className="text-2xl font-bold text-green-700">94.2%</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <Text strong className="text-orange-600">Avg Response</Text>
                      <div className="text-2xl font-bold text-orange-700">245ms</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <Text strong className="text-purple-600">Data Quality</Text>
                      <div className="text-2xl font-bold text-purple-700">98.7%</div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={filteredRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <RechartsTooltip />
                      <Legend />
                      <Area yAxisId="left" type="monotone" dataKey="revenue" fill="#8884d8" stroke="#8884d8" />
                      <Bar yAxisId="left" dataKey="target" fill="#82ca9d" />
                      <Line yAxisId="right" type="monotone" dataKey="users" stroke="#ff7300" strokeWidth={3} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Advanced Performance Monitor */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24}>
          <Card 
            title={
              <Space>
                <ThunderboltOutlined className="text-green-500" />
                Live System Performance Monitor
                <Badge status="processing" text="Real-time" />
              </Space>
            }
            className="bg-gradient-to-r from-green-50 to-blue-50"
          >
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={6}>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {realTimeMetrics.activeUsers.toLocaleString()}
                  </div>
                  <Text type="secondary">Live Users</Text>
                  <div className="mt-2">
                    <Progress 
                      percent={Math.min(100, (realTimeMetrics.activeUsers / 1500) * 100)} 
                      size="small" 
                      status="active"
                      strokeColor="#52c41a"
                    />
                  </div>
                </div>
              </Col>
              <Col xs={24} md={6}>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    ${realTimeMetrics.currentRevenue.toLocaleString()}
                  </div>
                  <Text type="secondary">Live Revenue</Text>
                  <div className="mt-2">
                    <Progress 
                      percent={Math.min(100, (realTimeMetrics.currentRevenue / 500000) * 100)} 
                      size="small" 
                      status="active"
                      strokeColor="#1890ff"
                    />
                  </div>
                </div>
              </Col>
              <Col xs={24} md={6}>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {realTimeMetrics.liveBids}
                  </div>
                  <Text type="secondary">Active Bids</Text>
                  <div className="mt-2">
                    <Progress 
                      percent={Math.min(100, (realTimeMetrics.liveBids / 50) * 100)} 
                      size="small" 
                      status="active"
                      strokeColor="#722ed1"
                    />
                  </div>
                </div>
              </Col>
              <Col xs={24} md={6}>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {realTimeMetrics.systemLoad}%
                  </div>
                  <Text type="secondary">System Load</Text>
                  <div className="mt-2">
                    <Progress 
                      percent={realTimeMetrics.systemLoad} 
                      size="small" 
                      status={realTimeMetrics.systemLoad > 80 ? "exception" : "active"}
                      strokeColor={realTimeMetrics.systemLoad > 80 ? "#ff4d4f" : "#fa8c16"}
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Real-time Activity & Top Items */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <SyncOutlined spin={refreshing} />
                Real-time Activity Feed
              </Space>
            }
            className="h-full"
          >
            <List
              itemLayout="horizontal"
              dataSource={realTimeActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={getActivityIcon(item.type)}
                        style={{
                          backgroundColor: getActivityColor(item.type)
                        }}
                      />
                    }
                    title={
                      <Space>
                        <Text strong>{item.user}</Text>
                        <Text>{item.action}</Text>
                        {item.amount && <Tag color="green">${item.amount}</Tag>}
                      </Space>
                    }
                    description={
                      <Space>
                        <ClockCircleOutlined />
                        <Text type="secondary">{item.time}</Text>
                        {item.item && <Text type="secondary">• {item.item}</Text>}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top Performing Auctions" className="h-full">
            <List
              itemLayout="horizontal"
              dataSource={topItems}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button key="view" icon={<EyeOutlined />} size="small">View</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={item.image} shape="square" size="large" />}
                    title={
                      <Space>
                        <Text strong>{item.name}</Text>
                        <Tag color="blue">{item.bids} bids</Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text>Current bid: <Text strong className="text-green-600">${item.currentBid}</Text></Text>
                        <Text type="secondary">Ends in: {item.endTime}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions Grid */}
      <Card title="Quick Actions & Management" className="mb-6">
        <Row gutter={[16, 16]}>
          {[
            {
              title: "Create Auction",
              description: "Add new auction item with advanced settings",
              icon: <ShoppingOutlined className="text-2xl text-blue-500" />,
              link: "/dashboard/auctions",
              color: "blue",
              stats: `${advancedStats.activeAuctions} active`
            },
            {
              title: "Create Banner",
              description: "Design promotional banners with analytics",
              icon: <PictureOutlined className="text-2xl text-green-500" />,
              link: "/dashboard/banners/create",
              color: "green",
              stats: "6 active banners"
            },
            {
              title: "User Management",
              description: "Advanced user analytics and moderation",
              icon: <UserOutlined className="text-2xl text-purple-500" />,
              link: "/dashboard/users",
              color: "purple",
              stats: `${advancedStats.totalUsers.toLocaleString()} total`
            },
            {
              title: "Analytics Reports",
              description: "Comprehensive business intelligence",
              icon: <FileTextOutlined className="text-2xl text-orange-500" />,
              link: "/dashboard/reports",
              color: "orange",
              stats: "Real-time data"
            },
            {
              title: "System Settings",
              description: "Configure platform parameters",
              icon: <SettingOutlined className="text-2xl text-gray-500" />,
              link: "/dashboard/settings",
              color: "gray",
              stats: "99.9% uptime"
            },
            {
              title: "Notifications",
              description: "Manage alerts and communications",
              icon: <BellOutlined className="text-2xl text-red-500" />,
              link: "/dashboard/notifications",
              color: "red",
              stats: "3 unread"
            }
          ].map((action) => (
            <Col xs={24} sm={12} lg={8} key={action.title}>
              <Link href={action.link}>
                <Card
                  hoverable
                  className="h-full border-l-4 transition-all duration-300 hover:shadow-lg"
                  style={{ borderLeftColor: `var(--ant-color-${action.color})` }}
                >
                  <Space direction="vertical" size={16} className="w-full">
                    <div className="flex items-center justify-between">
                      {action.icon}
                      <Badge count={action.stats} style={{ backgroundColor: `var(--ant-color-${action.color})` }} />
                    </div>
                    <div>
                      <Title level={4} className="!mb-2">{action.title}</Title>
                      <Text type="secondary">{action.description}</Text>
                    </div>
                    <Button type="primary" className="w-full">
                      Access {action.title}
                    </Button>
                  </Space>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Advanced Footer Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={6}>
                <Statistic
                  title="Active Sessions"
                  value={advancedStats.activeSessions}
                  prefix={<GlobalOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col xs={24} md={6}>
                <Statistic
                  title="Server Response"
                  value={advancedStats.responseTime}
                  suffix="ms"
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col xs={24} md={6}>
                <Statistic
                  title="System Load"
                  value={45}
                  suffix="%"
                  prefix={<RiseOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>
              <Col xs={24} md={6}>
                <div className="text-center">
                  <Text strong className="text-lg">Last Updated</Text>
                  <br />
                  <Text type="secondary">{new Date().toLocaleString()}</Text>
                  <br />
                  <Button
                    type="link"
                    icon={<SyncOutlined spin={refreshing} />}
                    onClick={handleRefresh}
                    size="small"
                  >
                    {refreshing ? 'Refreshing...' : 'Refresh Data'}
                  </Button>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Advanced Alerts and Notifications Dashboard */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={8}>
          <Card title="System Health Alerts" className="h-full">
            <Space direction="vertical" className="w-full">
              <Alert
                message="High Memory Usage"
                description="Server memory usage is at 85%. Consider scaling resources."
                type="warning"
                showIcon
                closable
                className="mb-2"
              />
              <Alert
                message="Database Performance"
                description="Query response time increased by 15% in the last hour."
                type="info"
                showIcon
                closable
                className="mb-2"
              />
              <Alert
                message="All Systems Operational"
                description="No critical issues detected. Performance is optimal."
                type="success"
                showIcon
                className="mb-2"
              />
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Business Intelligence" className="h-full">
            <Space direction="vertical" className="w-full">
              <div className="p-3 bg-blue-50 rounded">
                <Text strong className="text-blue-600">Revenue Insight</Text>
                <br />
                <Text type="secondary">Monthly target: 95% achieved</Text>
                <Progress percent={95} size="small" className="mt-2" />
              </div>
              <div className="p-3 bg-green-50 rounded">
                <Text strong className="text-green-600">User Growth</Text>
                <br />
                <Text type="secondary">+12.5% this month</Text>
                <Progress percent={78} size="small" className="mt-2" strokeColor="#52c41a" />
              </div>
              <div className="p-3 bg-purple-50 rounded">
                <Text strong className="text-purple-600">Conversion Rate</Text>
                <br />
                <Text type="secondary">Above industry average</Text>
                <Progress percent={85} size="small" className="mt-2" strokeColor="#722ed1" />
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Quick Insights" className="h-full">
            <Space direction="vertical" className="w-full">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <Text strong>Peak Hours</Text>
                  <br />
                  <Text type="secondary">6 PM - 9 PM</Text>
                </div>
                <div className="text-2xl">📈</div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <Text strong>Top Category</Text>
                  <br />
                  <Text type="secondary">Electronics</Text>
                </div>
                <div className="text-2xl">💻</div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <Text strong>Avg. Session</Text>
                  <br />
                  <Text type="secondary">8m 32s</Text>
                </div>
                <div className="text-2xl">⏱️</div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </AdminLayout>
  );
}

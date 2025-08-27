'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Card,
  Input,
  Button,
  Space,
  Tag,
  Dropdown,
  Modal,
  Form,
  Select,
  DatePicker,
  message,
  Typography,
  Row,
  Col,
  Statistic,
  Avatar,
  Tooltip,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { userService } from '@/services/zidobid-api';
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils';
import type { User, PaginatedResponse, UpdateUserRequest, SuspendUserRequest } from '@/types/zidobid';
import AdminLayout from '@/components/AdminLayout';

const { Title } = Typography;
const { confirm } = Modal;
const { Search } = Input;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sort_by: 'created_at',
    sort_direction: 'desc' as 'asc' | 'desc',
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [suspendModalVisible, setSuspendModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [suspendForm] = Form.useForm();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response: PaginatedResponse<User> = await userService.getUsers({
        page: currentPage,
        per_page: pageSize,
        search: filters.search || undefined,
        status: filters.status || undefined,
        sort_by: filters.sort_by,
        sort_direction: filters.sort_direction,
      });

      setUsers(response.data);
      setTotal(response.pagination.total);
    } catch (error) {
      message.error('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters.search, filters.status, filters.sort_by, filters.sort_direction]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setFilters(prev => ({ ...prev, status: value }));
    setCurrentPage(1);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTableChange = (paginationInfo: any, _filters: any, sorter: any) => {
    if (paginationInfo.current) {
      setCurrentPage(paginationInfo.current);
    }
    if (paginationInfo.pageSize) {
      setPageSize(paginationInfo.pageSize);
    }

    // Handle both single sorter and array of sorters
    const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    if (currentSorter?.field) {
      setFilters(prev => ({
        ...prev,
        sort_by: String(currentSorter.field),
        sort_direction: currentSorter.order === 'ascend' ? 'asc' : 'desc',
      }));
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    editForm.setFieldsValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values: UpdateUserRequest) => {
    if (!selectedUser) return;

    try {
      await userService.updateUser(selectedUser.id, values);
      message.success('User updated successfully');
      setEditModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('Failed to update user');
      console.error('Error updating user:', error);
    }
  };

  const handleSuspend = (user: User) => {
    setSelectedUser(user);
    suspendForm.resetFields();
    setSuspendModalVisible(true);
  };

  const handleSuspendSubmit = async (values: SuspendUserRequest) => {
    if (!selectedUser) return;

    try {
      await userService.suspendUser(selectedUser.id, values);
      message.success('User suspended successfully');
      setSuspendModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('Failed to suspend user');
      console.error('Error suspending user:', error);
    }
  };

  const handleUnsuspend = async (user: User) => {
    try {
      await userService.unsuspendUser(user.id);
      message.success('User unsuspended successfully');
      fetchUsers();
    } catch (error) {
      message.error('Failed to unsuspend user');
      console.error('Error unsuspending user:', error);
    }
  };

  const handleDelete = (user: User) => {
    confirm({
      title: 'Are you sure you want to delete this user?',
      icon: <ExclamationCircleOutlined />,
      content: `This will permanently delete ${user.name} and all associated data.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await userService.deleteUser(user.id);
          message.success('User deleted successfully');
          fetchUsers();
        } catch (error) {
          message.error('Failed to delete user');
          console.error('Error deleting user:', error);
        }
      },
    });
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setViewModalVisible(true);
  };

  const getActionItems = (user: User) => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'View Details',
      onClick: () => handleView(user),
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit',
      onClick: () => handleEdit(user),
    },
    ...(user.status === 'suspended'
      ? [
          {
            key: 'unsuspend',
            icon: <PlayCircleOutlined />,
            label: 'Unsuspend',
            onClick: () => handleUnsuspend(user),
          },
        ]
      : [
          {
            key: 'suspend',
            icon: <StopOutlined />,
            label: 'Suspend',
            onClick: () => handleSuspend(user),
          },
        ]),
    {
      type: 'divider' as const,
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      danger: true,
      onClick: () => handleDelete(user),
    },
  ];

  const columns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (_: string, record: User) => (
        <Space>
          <Avatar src={record.profile_image} size="small">
            {record.name.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone || '-',
    },
    {
      title: 'Auctions',
      dataIndex: 'total_auctions',
      key: 'total_auctions',
      sorter: true,
      align: 'center' as const,
    },
    {
      title: 'Bids',
      dataIndex: 'total_bids',
      key: 'total_bids',
      sorter: true,
      align: 'center' as const,
    },
    {
      title: 'Winnings',
      dataIndex: 'total_winnings',
      key: 'total_winnings',
      sorter: true,
      align: 'center' as const,
      render: (winnings: number) => formatCurrency(winnings),
    },
    {
      title: 'Joined',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: true,
      render: (date: string) => formatDateTime(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: User) => (
        <Dropdown
          menu={{ items: getActionItems(record) }}
          trigger={['click']}
        >
          <Button type="text" size="small">
            Actions
          </Button>
        </Dropdown>
      ),
    },
  ];

  const stats = users.reduce(
    (acc, user) => {
      acc.total++;
      if (user.status === 'active') acc.active++;
      if (user.status === 'suspended') acc.suspended++;
      if (user.status === 'banned') acc.banned++;
      return acc;
    },
    { total: 0, active: 0, suspended: 0, banned: 0 }
  );

  return (
    <AdminLayout>
      <div>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>Users Management</Title>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Total Users"
                value={total}
                valueStyle={{ color: '#1677ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Active"
                value={stats.active}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Suspended"
                value={stats.suspended}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Banned"
                value={stats.banned}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters and Actions */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <Search
                placeholder="Search users..."
                allowClear
                onSearch={handleSearch}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Select
                placeholder="Filter by status"
                allowClear
                onChange={handleStatusFilter}
                style={{ width: '100%' }}
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Suspended', value: 'suspended' },
                  { label: 'Banned', value: 'banned' },
                ]}
              />
            </Col>
            <Col xs={24} sm={10}>
              <Space style={{ float: 'right' }}>
                <Tooltip title="Refresh">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchUsers}
                    loading={loading}
                  />
                </Tooltip>
                <Button icon={<DownloadOutlined />}>
                  Export
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Users Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} users`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 800 }}
          />
        </Card>

        {/* Edit User Modal */}
        <Modal
          title="Edit User"
          open={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          footer={null}
          width={500}
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditSubmit}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please enter name' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter valid email' },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Phone">
              <Input />
            </Form.Item>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Suspended', value: 'suspended' },
                  { label: 'Banned', value: 'banned' },
                ]}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setEditModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  Update User
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Suspend User Modal */}
        <Modal
          title="Suspend User"
          open={suspendModalVisible}
          onCancel={() => setSuspendModalVisible(false)}
          footer={null}
          width={500}
        >
          <Form
            form={suspendForm}
            layout="vertical"
            onFinish={handleSuspendSubmit}
          >
            <Form.Item
              name="reason"
              label="Suspension Reason"
              rules={[{ required: true, message: 'Please enter reason' }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item name="duration" label="Duration (days)">
              <Input type="number" placeholder="Leave empty for indefinite" />
            </Form.Item>
            <Form.Item name="until" label="Until Date">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setSuspendModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" danger htmlType="submit">
                  Suspend User
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* View User Modal */}
        <Modal
          title="User Details"
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setViewModalVisible(false)}>
              Close
            </Button>,
          ]}
          width={600}
        >
          {selectedUser && (
            <div>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Avatar size={80} src={selectedUser.profile_image}>
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <div style={{ marginTop: 8, fontWeight: 500 }}>
                      {selectedUser.name}
                    </div>
                    <Tag color={getStatusColor(selectedUser.status)}>
                      {selectedUser.status.toUpperCase()}
                    </Tag>
                  </div>
                </Col>
                <Col span={16}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <strong>Email:</strong> {selectedUser.email}
                    </div>
                    <div>
                      <strong>Phone:</strong> {selectedUser.phone || 'Not provided'}
                    </div>
                    <div>
                      <strong>Total Auctions:</strong> {selectedUser.total_auctions}
                    </div>
                    <div>
                      <strong>Total Bids:</strong> {selectedUser.total_bids}
                    </div>
                    <div>
                      <strong>Total Winnings:</strong> {formatCurrency(selectedUser.total_winnings)}
                    </div>
                    <div>
                      <strong>Registration Date:</strong> {formatDateTime(selectedUser.registration_date)}
                    </div>
                    <div>
                      <strong>Last Login:</strong> {formatDateTime(selectedUser.last_login)}
                    </div>
                    {selectedUser.suspension_reason && (
                      <div>
                        <strong>Suspension Reason:</strong> {selectedUser.suspension_reason}
                      </div>
                    )}
                    {selectedUser.suspension_until && (
                      <div>
                        <strong>Suspended Until:</strong> {formatDateTime(selectedUser.suspension_until)}
                      </div>
                    )}
                  </Space>
                </Col>
              </Row>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}

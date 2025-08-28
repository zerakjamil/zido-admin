"use client";

import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  Button,
  Card,
  DatePicker,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  message,
} from 'antd';
import type { TableProps } from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  type AuctionItem,
  type GetAdminAuctionItemsParams,
  type CreateAuctionItemRequest,
  type UpdateAuctionItemRequest,
  GetAdminAuctionItemsStatus,
} from '@/lib/api/generated/models';
import {
  useGetAdminAuctionItems,
  useCreateAdminAuctionItem,
  useUpdateAdminAuctionItem,
  useDeleteAdminAuctionItem,
  useForceEndAdminAuctionItem,
  getGetAdminAuctionItemsQueryKey,
} from '@/lib/api/generated';
import { useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth-store';

const { confirm } = Modal;
const { Search } = Input;

export default function AuctionsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<Pick<
    GetAdminAuctionItemsParams,
    'search' | 'status' | 'sort_by' | 'sort_direction'
  >>({
    search: '',
    status: undefined,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  const [selectedItem, setSelectedItem] = useState<AuctionItem | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [createForm] = Form.useForm<CreateAuctionItemRequest & { start_time?: unknown; end_time?: unknown }>();
  const [editForm] = Form.useForm<UpdateAuctionItemRequest & { start_time?: unknown; end_time?: unknown }>();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const params: GetAdminAuctionItemsParams = useMemo(
    () => ({
      page: currentPage,
      per_page: pageSize,
      search: filters.search || undefined,
      status: filters.status || undefined,
      sort_by: filters.sort_by,
      sort_direction: filters.sort_direction,
    }),
    [currentPage, pageSize, filters]
  );

  const qc = useQueryClient();

  const itemsQuery = useGetAdminAuctionItems(params, {
    query: { placeholderData: keepPreviousData },
  });

  const items = itemsQuery.data?.data ?? [];
  const total = itemsQuery.data?.pagination.total ?? 0;
  const loading = itemsQuery.isFetching || itemsQuery.isLoading;

  const createMutation = useCreateAdminAuctionItem({
    mutation: {
      onSuccess: () => {
        message.success('Auction item created');
        qc.invalidateQueries({ queryKey: getGetAdminAuctionItemsQueryKey(params) });
      },
      onError: () => message.error('Failed to create auction item'),
    },
  });

  const updateMutation = useUpdateAdminAuctionItem({
    mutation: {
      onSuccess: () => {
        message.success('Auction item updated');
        qc.invalidateQueries({ queryKey: getGetAdminAuctionItemsQueryKey(params) });
      },
      onError: () => message.error('Failed to update auction item'),
    },
  });

  const deleteMutation = useDeleteAdminAuctionItem({
    mutation: {
      onSuccess: () => {
        message.success('Auction item deleted');
        qc.invalidateQueries({ queryKey: getGetAdminAuctionItemsQueryKey(params) });
      },
      onError: () => message.error('Failed to delete auction item'),
    },
  });

  const forceEndMutation = useForceEndAdminAuctionItem({
    mutation: {
      onSuccess: () => {
        message.success('Auction forcibly ended');
        qc.invalidateQueries({ queryKey: getGetAdminAuctionItemsQueryKey(params) });
      },
      onError: () => message.error('Failed to force end auction'),
    },
  });

  // Route protection
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  // Normalize possible Dayjs/Date/string from DatePicker to ISO string
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
      setFilters((prev) => ({
        ...prev,
        sort_by: String(currentSorter.field),
        sort_direction: order === 'ascend' ? 'asc' : 'desc',
      }));
    }
  };

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: GetAdminAuctionItemsParams['status'] | '') => {
    setFilters((prev) => ({
      ...prev,
      status: (value || undefined),
    }));
    setCurrentPage(1);
  };

  const openCreateModal = () => {
    createForm.resetFields();
    setCreateModalVisible(true);
  };

  const handleCreateSubmit = async (
    values: CreateAuctionItemRequest & { start_time?: unknown; end_time?: unknown }
  ) => {
    const payload: CreateAuctionItemRequest = {
      ...values,
      featured: values.featured ?? false,
      start_time: normalizeDate(values.start_time) as string,
      end_time: normalizeDate(values.end_time) as string,
      images: values.images ?? [],
    };
    try {
      await createMutation.mutateAsync({ data: payload });
      setCreateModalVisible(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (item: AuctionItem) => {
    setSelectedItem(item);
    editForm.setFieldsValue({
      title: item.title,
      description: item.description ?? undefined,
      category_id: item.category_id,
      starting_bid: item.starting_bid,
      bid_increment: item.bid_increment,
      reserve_price: item.reserve_price ?? undefined,
      shipping_info: item.shipping_info ?? undefined,
      location: item.location ?? undefined,
      featured: item.featured,
      start_time: item.start_time,
      end_time: item.end_time,
      condition: item.condition ?? undefined,
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (
    values: UpdateAuctionItemRequest & { start_time?: unknown; end_time?: unknown }
  ) => {
    if (!selectedItem) return;
    const payload: UpdateAuctionItemRequest = {
      ...values,
      start_time: normalizeDate(values.start_time),
      end_time: normalizeDate(values.end_time),
    };
    try {
      await updateMutation.mutateAsync({ pathParams: { id: selectedItem.id }, data: payload });
      setEditModalVisible(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (item: AuctionItem) => {
    confirm({
      title: 'Delete this auction item?',
      icon: <ExclamationCircleOutlined />,
      content: `This will permanently delete ${item.title}.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync({ pathParams: { id: item.id } });
        } catch (err) {
          console.error(err);
        }
      },
    });
  };

  const handleForceEnd = async (item: AuctionItem) => {
    try {
      await forceEndMutation.mutateAsync({ pathParams: { id: item.id } });
    } catch (err) {
      console.error(err);
    }
  };

  const actionMenu = (item: AuctionItem) => ({
    items: [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'View',
        onClick: () => {
          setSelectedItem(item);
          setViewModalVisible(true);
        },
      },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Edit',
        onClick: () => handleEdit(item),
      },
      { type: 'divider' as const },
      {
        key: 'forceEnd',
        icon: <StopOutlined />,
        label: 'Force End',
        onClick: () => handleForceEnd(item),
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Delete',
        danger: true,
        onClick: () => handleDelete(item),
      },
    ],
  });

  if (!isAuthenticated) return null;

  const columns: TableProps<AuctionItem>['columns'] = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      render: (val: string) => <span style={{ fontWeight: 500 }}>{val}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: (status: string) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>,
    },
    {
      title: 'Current Bid',
      dataIndex: 'current_bid',
      key: 'current_bid',
      sorter: true,
      render: (val: number | undefined) => (val != null ? formatCurrency(val) : '-'),
    },
    {
      title: 'Start',
      dataIndex: 'start_time',
      key: 'start_time',
      sorter: true,
      render: (d: string) => formatDateTime(d),
    },
    {
      title: 'End',
      dataIndex: 'end_time',
      key: 'end_time',
      sorter: true,
      render: (d: string) => formatDateTime(d),
    },
    {
      title: 'Featured',
      dataIndex: 'featured',
      key: 'featured',
      align: 'center',
      render: (v: boolean) => (v ? 'Yes' : 'No'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_: unknown, record: AuctionItem) => (
        <Dropdown menu={actionMenu(record)} trigger={['click']}>
          <Button type="text" size="small">Actions</Button>
        </Dropdown>
      ),
    },
  ];

  return (
    <AdminLayout>
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <Card>
          <Space wrap>
            <Search
              placeholder="Search auctions"
              onSearch={handleSearch}
              allowClear
              enterButton
              style={{ width: 320 }}
            />
            <Select
              placeholder="Status"
              allowClear
              style={{ width: 200 }}
              value={filters.status}
              onChange={handleStatusFilter}
              options={[
                { label: 'All', value: '' },
                { label: 'Draft', value: GetAdminAuctionItemsStatus.draft },
                { label: 'Active', value: GetAdminAuctionItemsStatus.active },
                { label: 'Ended', value: GetAdminAuctionItemsStatus.ended },
                { label: 'Cancelled', value: GetAdminAuctionItemsStatus.cancelled },
              ]}
            />
          </Space>
          <div style={{ float: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              New Auction
            </Button>
          </div>
        </Card>

        <Card>
          <Table
            rowKey="id"
            loading={loading}
            dataSource={items}
            columns={columns}
            pagination={{
              current: currentPage,
              pageSize,
              total,
              showSizeChanger: true,
            }}
            onChange={handleTableChange}
          />
        </Card>
      </Space>

      {/* View Modal */}
      <Modal
        open={viewModalVisible}
        title={selectedItem?.title}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={720}
      >
        {selectedItem && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div><b>Status:</b> <Tag color={getStatusColor(selectedItem.status)}>{selectedItem.status.toUpperCase()}</Tag></div>
            <div><b>Starting Bid:</b> {formatCurrency(selectedItem.starting_bid)}</div>
            <div><b>Bid Increment:</b> {formatCurrency(selectedItem.bid_increment)}</div>
            <div><b>Current Bid:</b> {selectedItem.current_bid != null ? formatCurrency(selectedItem.current_bid) : '-'}</div>
            <div><b>Start:</b> {formatDateTime(selectedItem.start_time)}</div>
            <div><b>End:</b> {formatDateTime(selectedItem.end_time)}</div>
            <div><b>Featured:</b> {selectedItem.featured ? 'Yes' : 'No'}</div>
            <div><b>Description:</b> {selectedItem.description || '-'}</div>
          </Space>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal
        open={createModalVisible}
        title="Create Auction"
        onCancel={() => setCreateModalVisible(false)}
        onOk={() => createForm.submit()}
        okText="Create"
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateSubmit}
          initialValues={{ featured: false }}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="category_id" label="Category ID" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="location" label="Location" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="start_time" label="Start Time" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="end_time" label="End Time" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="starting_bid" label="Starting Bid" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="bid_increment" label="Bid Increment" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="reserve_price" label="Reserve Price">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="shipping_info" label="Shipping Info">
            <Input />
          </Form.Item>
          <Form.Item name="condition" label="Condition">
            <Input />
          </Form.Item>
          <Form.Item name="featured" label="Featured" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editModalVisible}
        title="Edit Auction"
        onCancel={() => setEditModalVisible(false)}
        onOk={() => editForm.submit()}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item name="title" label="Title">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="category_id" label="Category ID">
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="location" label="Location">
            <Input />
          </Form.Item>
          <Form.Item name="start_time" label="Start Time">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="end_time" label="End Time">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="starting_bid" label="Starting Bid">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="bid_increment" label="Bid Increment">
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="reserve_price" label="Reserve Price">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="shipping_info" label="Shipping Info">
            <Input />
          </Form.Item>
          <Form.Item name="condition" label="Condition">
            <Input />
          </Form.Item>
          <Form.Item name="featured" label="Featured" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}

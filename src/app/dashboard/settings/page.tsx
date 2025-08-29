'use client';

import React, { useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, Form, Input, InputNumber, Select, Switch, Button, Space, Typography, message } from 'antd';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

export default function SettingsPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [form] = Form.useForm<{
    site_name: string;
    default_currency: string;
    min_bid_increment: number;
    maintenance_mode: boolean;
  }>();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  // Load saved settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('zido_admin_settings');
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as {
            site_name: string;
            default_currency: string;
            min_bid_increment: number;
            maintenance_mode: boolean;
          };
          form.setFieldsValue(parsed);
        } catch {
          // ignore parse errors
        }
      }
    }
  }, [form]);

  // Don't render until after hooks
  if (!isAuthenticated) return null;

  const onSave = async () => {
    try {
      const values = await form.validateFields();
      // Temporary: persist locally until settings endpoints are available
      if (typeof window !== 'undefined') {
        localStorage.setItem('zido_admin_settings', JSON.stringify(values));
      }
      message.success('Settings saved');
    } catch {
      message.error('Please fix validation errors');
    }
  };

  return (
    <AdminLayout>
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <Card>
          <Title level={3}>Admin Settings</Title>
        </Card>
        <Card title="General">
          <Form
            form={form}
            layout="vertical"
            initialValues={{ site_name: 'ZidoBid', default_currency: 'USD', min_bid_increment: 1, maintenance_mode: false }}
          >
            <Form.Item name="site_name" label="Site Name" rules={[{ required: true }]}> 
              <Input />
            </Form.Item>
            <Form.Item name="default_currency" label="Default Currency" rules={[{ required: true }]}> 
              <Select
                options={[
                  { label: 'USD', value: 'USD' },
                  { label: 'EUR', value: 'EUR' },
                  { label: 'GBP', value: 'GBP' },
                ]}
              />
            </Form.Item>
            <Form.Item name="min_bid_increment" label="Minimum Bid Increment" rules={[{ required: true }]}> 
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="maintenance_mode" label="Maintenance Mode" valuePropName="checked"> 
              <Switch />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={onSave}>Save Settings</Button>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </AdminLayout>
  );
}

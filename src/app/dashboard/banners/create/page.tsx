"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  Select,
  DatePicker,
  Switch,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  Alert,
  Image,
  message,
  InputNumber
} from 'antd';
import {
  ArrowLeftOutlined,
  UploadOutlined,
  EyeOutlined,
  SaveOutlined,
  ClearOutlined,
  InfoCircleOutlined,
  PictureOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import type { Dayjs } from 'dayjs';
import AdminLayout from '@/components/AdminLayout';
import {
  useCreateAdminPromotionalBanner,
  getGetAdminPromotionalBannersQueryKey,
} from '@/lib/api/generated';
import {
  type CreatePromotionalBannerRequest,
  PromotionalBannerPosition,
} from '@/lib/api/generated/models';
import { useQueryClient } from '@tanstack/react-query';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface BannerFormValues {
  title: string;
  description: string;
  image_url: string;
  link_url?: string;
  position: string;
  sort_order: number;
  dateRange?: [Dayjs, Dayjs];
  is_active: boolean;
}

export default function CreateBannerPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isPreview, setIsPreview] = useState(false);

  const createBannerMutation = useCreateAdminPromotionalBanner({
    mutation: {
      onSuccess: () => {
        message.success('Banner created successfully!');
        queryClient.invalidateQueries({ queryKey: getGetAdminPromotionalBannersQueryKey() });
        router.push('/dashboard/banners');
      },
      onError: (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        message.error('Failed to create banner: ' + errorMessage);
      },
    },
  });

  const handleSubmit = async (values: BannerFormValues) => {
    try {
      const bannerData: CreatePromotionalBannerRequest = {
        title: values.title,
        description: values.description,
        image_url: values.image_url,
        link_url: values.link_url,
        position: values.position,
        sort_order: values.sort_order,
        start_date: values.dateRange?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
        end_date: values.dateRange?.[1]?.format('YYYY-MM-DD HH:mm:ss'),
        is_active: values.is_active ?? true,
      };

      await createBannerMutation.mutateAsync({ data: bannerData });
    } catch (error) {
      console.error('Error creating banner:', error);
    }
  };

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!');
        return false;
      }
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Update file list
      setFileList([file]);
      
      // Set image URL in form
      form.setFieldValue('image_url', url);
      
      return false; // Prevent auto upload
    },
    fileList,
    onRemove: () => {
      setFileList([]);
      setPreviewUrl('');
      form.setFieldValue('image_url', '');
    },
  };

  const handlePreview = () => {
    setIsPreview(!isPreview);
  };

  const positionOptions = [
    { label: 'Top', value: PromotionalBannerPosition.top },
    { label: 'Middle', value: PromotionalBannerPosition.middle },
    { label: 'Bottom', value: PromotionalBannerPosition.bottom },
    { label: 'Sidebar', value: PromotionalBannerPosition.sidebar },
  ];

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.back()}
            className="mb-4"
          >
            Back to Banners
          </Button>
          <Title level={2} className="!mb-2">Create New Banner</Title>
          <Text type="secondary">
            Create and configure a new promotional banner for your platform
          </Text>
        </div>

        <Row gutter={24}>
          {/* Form Section */}
          <Col xs={24} lg={16}>
            <Card title="Banner Details" className="mb-4">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  is_active: true,
                  sort_order: 0,
                  position: PromotionalBannerPosition.top
                }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="title"
                      label="Banner Title"
                      rules={[{ required: true, message: 'Please enter banner title' }]}
                    >
                      <Input 
                        placeholder="Enter banner title"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="position"
                      label="Display Position"
                      rules={[{ required: true, message: 'Please select position' }]}
                    >
                      <Select 
                        placeholder="Select position"
                        size="large"
                        options={positionOptions}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="description"
                  label="Description"
                  rules={[{ required: true, message: 'Please enter description' }]}
                >
                  <TextArea 
                    rows={3}
                    placeholder="Describe what this banner is about..."
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="image_url"
                      label="Banner Image"
                      rules={[{ required: true, message: 'Please upload an image' }]}
                    >
                      <Input 
                        placeholder="Upload image or enter URL"
                        size="large"
                        addonAfter={
                          <Upload {...uploadProps} showUploadList={false}>
                            <Button icon={<UploadOutlined />}>Upload</Button>
                          </Upload>
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="link_url"
                      label="Target URL"
                    >
                      <Input 
                        placeholder="https://example.com"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="sort_order"
                      label="Display Order"
                      tooltip="Lower numbers appear first"
                    >
                      <InputNumber 
                        placeholder="0"
                        size="large"
                        min={0}
                        max={999}
                        className="w-full"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="dateRange"
                      label="Active Period"
                      tooltip="Leave empty for permanent banner"
                    >
                      <RangePicker 
                        showTime
                        size="large"
                        className="w-full"
                        placeholder={['Start Date', 'End Date']}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <Row gutter={16} align="middle">
                  <Col flex="auto">
                    <Form.Item
                      name="is_active"
                      label="Status"
                      valuePropName="checked"
                    >
                      <Switch 
                        checkedChildren="Active" 
                        unCheckedChildren="Inactive"
                      />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Space>
                      <Button 
                        icon={<ClearOutlined />}
                        onClick={() => form.resetFields()}
                      >
                        Reset
                      </Button>
                      <Button 
                        type="primary" 
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={createBannerMutation.isPending}
                        size="large"
                      >
                        Create Banner
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>

          {/* Preview Section */}
          <Col xs={24} lg={8}>
            <Card 
              title={
                <Space>
                  <EyeOutlined />
                  Live Preview
                </Space>
              }
              className="sticky top-4"
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                    <Image
                      src={previewUrl}
                      alt="Banner preview"
                      width="100%"
                      height={120}
                      style={{ objectFit: 'cover' }}
                      className="rounded"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Text strong>
                      {form.getFieldValue('title') || 'Banner Title'}
                    </Text>
                    <br />
                    <Text type="secondary" className="text-sm">
                      {form.getFieldValue('description') || 'Banner description will appear here...'}
                    </Text>
                    <br />
                    <Text className="text-xs text-gray-500">
                      Position: {form.getFieldValue('position') || 'Not selected'}
                    </Text>
                  </div>

                  <Button 
                    type="link" 
                    icon={<EyeOutlined />}
                    onClick={handlePreview}
                    size="small"
                    className="p-0"
                  >
                    {isPreview ? 'Hide' : 'Full'} Preview
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <PictureOutlined className="text-4xl mb-2" />
                  <div>Upload an image to see preview</div>
                </div>
              )}
            </Card>

            {/* Guidelines */}
            <Card title="Guidelines" className="mt-4">
              <Space direction="vertical" size="small">
                <Alert
                  message="Image Requirements"
                  description="Recommended: 1200x300px, Max: 5MB, Format: JPG, PNG"
                  type="info"
                  showIcon
                  icon={<InfoCircleOutlined />}
                />
                
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• Use high-quality images</div>
                  <div>• Keep text minimal and readable</div>
                  <div>• Test on mobile devices</div>
                  <div>• Include clear call-to-action</div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Full Preview Modal */}
        {isPreview && previewUrl && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
            onClick={handlePreview}
            onKeyDown={(e) => e.key === 'Escape' && handlePreview()}
            role="button"
            tabIndex={0}
          >
            <div className="max-w-4xl w-full">
              <Image
                src={previewUrl}
                alt="Full preview"
                width="100%"
                className="rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

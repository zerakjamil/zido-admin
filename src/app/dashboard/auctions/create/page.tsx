"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import {
  Steps,
  Card,
  Form,
  Input,
  Button,
  Upload,
  Select,
  DatePicker,
  InputNumber,
  Switch,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  Alert,
  Progress,
  Tag,
  message,
  Radio,
  Checkbox,
  Slider,
  Collapse,
  Tabs,
  List,
  Image,
} from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import {
  ArrowLeftOutlined,
  EyeOutlined,
  SaveOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  PictureOutlined,
  TrophyOutlined,
  BulbOutlined,
  WarningOutlined,
  ThunderboltOutlined,
  FireOutlined,
  StarOutlined,
} from '@ant-design/icons';
import {
  type CreateAuctionItemRequest,
} from '@/lib/api/generated/models';
import {
  useCreateAdminAuctionItem,
} from '@/lib/api/generated';
import { useAuthStore } from '@/lib/auth-store';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;
const { TabPane } = Tabs;

interface AuctionDraft {
  id?: string;
  name: string;
  data: Record<string, unknown>;
  lastSaved: string;
}

// Helper to safely format values for preview
const formatValueForDisplay = (value: unknown): string => {
  if (value === null || value === undefined) return 'Not set';
  if (dayjs.isDayjs(value)) return value.format('YYYY-MM-DD HH:mm');
  if (Array.isArray(value)) return value.map((v) => String(v)).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'Not set';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return 'Not set';
};

export default function CreateAuctionPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [draftName, setDraftName] = useState('');
  const [savedDrafts, setSavedDrafts] = useState<AuctionDraft[]>([]);
  const [auctionType, setAuctionType] = useState<'standard' | 'reserve' | 'buy_now'>('standard');
  const [categoryTags, setCategoryTags] = useState<string[]>([]);
  const [shippingOptions, setShippingOptions] = useState<string[]>(['standard']);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const createMutation = useCreateAdminAuctionItem({
    mutation: {
      onSuccess: () => {
        message.success('Auction created successfully!');
        router.push('/dashboard/auctions/active');
      },
      onError: (error) => {
        console.error('Error creating auction:', error);
        message.error('Failed to create auction. Please try again.');
      },
    },
  });

  // Route protection
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  // Load drafts from localStorage
  useEffect(() => {
    const drafts = localStorage.getItem('auction_drafts');
    if (drafts) {
      setSavedDrafts(JSON.parse(drafts));
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const interval = setInterval(() => {
      const values = form.getFieldsValue();
      if ((values as Record<string, unknown>).name && Object.keys(values).length > 1) {
        const draftValues = values as Record<string, unknown>;
        const rawName = draftValues.name;
        const safeName = typeof rawName === 'string' ? rawName : '';
        const nameValue: string = draftName || safeName || 'Untitled Draft';
        const draft: AuctionDraft = {
          id: Date.now().toString(),
          name: nameValue,
          data: values,
          lastSaved: new Date().toISOString(),
        };

        const storedDrafts = JSON.parse(localStorage.getItem('auction_drafts') || '[]');
        const updatedDrafts = [draft, ...storedDrafts.slice(0, 9)];
        localStorage.setItem('auction_drafts', JSON.stringify(updatedDrafts));
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [form, draftName]);

  const steps = [
    {
      title: 'Basic Info',
      icon: <InfoCircleOutlined />,
      description: 'Item details and description',
    },
    {
      title: 'Images & Media',
      icon: <PictureOutlined />,
      description: 'Upload photos and videos',
    },
    {
      title: 'Pricing & Terms',
      icon: <DollarOutlined />,
      description: 'Set pricing and auction rules',
    },
    {
      title: 'Schedule & Settings',
      icon: <ClockCircleOutlined />,
      description: 'Timing and advanced options',
    },
    {
      title: 'Review & Publish',
      icon: <CheckCircleOutlined />,
      description: 'Final review before going live',
    },
  ];

  const categories = [
    { value: 1, label: 'Electronics', tags: ['smartphone', 'laptop', 'tablet', 'gaming', 'audio'] },
    { value: 2, label: 'Fashion', tags: ['clothing', 'shoes', 'accessories', 'jewelry', 'watches'] },
    { value: 3, label: 'Home & Garden', tags: ['furniture', 'decor', 'kitchen', 'garden', 'tools'] },
    { value: 4, label: 'Sports & Recreation', tags: ['fitness', 'outdoor', 'sports equipment', 'bikes'] },
    { value: 5, label: 'Collectibles', tags: ['art', 'antiques', 'coins', 'stamps', 'memorabilia'] },
    { value: 6, label: 'Automotive', tags: ['cars', 'motorcycles', 'parts', 'accessories'] },
  ];

  const conditions = [
    { value: 'new', label: 'Brand New', description: 'Item is brand new, unused, and in original packaging' },
    { value: 'like_new', label: 'Like New', description: 'Excellent condition, minimal signs of use' },
    { value: 'very_good', label: 'Very Good', description: 'Minor cosmetic flaws, fully functional' },
    { value: 'good', label: 'Good', description: 'Normal wear, fully functional' },
    { value: 'fair', label: 'Fair', description: 'Significant wear but still functional' },
    { value: 'poor', label: 'Poor', description: 'Heavy wear, may have functional issues' },
  ];

  const saveDraft = (values: Record<string, unknown>, source = 'Manual') => {
    const rawName = values.name;
    const safeName = typeof rawName === 'string' ? rawName : '';
    const nameValue: string = draftName || safeName || 'Untitled Draft';
    const draft: AuctionDraft = {
      id: Date.now().toString(),
      name: nameValue,
      data: values,
      lastSaved: new Date().toISOString(),
    };

    const updatedDrafts = [draft, ...savedDrafts.slice(0, 9)]; // Keep only 10 latest drafts
    setSavedDrafts(updatedDrafts);
    localStorage.setItem('auction_drafts', JSON.stringify(updatedDrafts));
    
    if (source === 'Manual') {
      message.success('Draft saved successfully!');
    }
  };

  const loadDraft = (draft: AuctionDraft) => {
    form.setFieldsValue(draft.data);
    setDraftName(draft.name);
    message.success(`Draft "${draft.name}" loaded successfully!`);
  };

  const deleteDraft = (draftId: string) => {
    const updatedDrafts = savedDrafts.filter(d => d.id !== draftId);
    setSavedDrafts(updatedDrafts);
    localStorage.setItem('auction_drafts', JSON.stringify(updatedDrafts));
    message.success('Draft deleted successfully!');
  };

  const uploadProps: UploadProps = {
    multiple: true,
    fileList,
    onChange: ({ fileList: newFileList }) => setFileList(newFileList),
    beforeUpload: () => false, // Prevent auto upload
    accept: 'image/*,video/*',
    listType: 'picture-card',
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
    },
  };

  const nextStep = async () => {
    try {
      await form.validateFields();
      setCurrentStep(currentStep + 1);
    } catch {
      message.error('Please fill in all required fields before proceeding');
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Process form data
      const payload: CreateAuctionItemRequest = {
        name: values.name,
        description: values.description,
        category_id: values.category_id,
        starting_price: values.starting_price,
        increment_amount: values.increment_amount,
        reserve_price: auctionType === 'reserve' ? values.reserve_price : undefined,
        buyout_price: auctionType === 'buy_now' ? values.buy_now_price : undefined,
        start_time: dayjs(values.start_time).toDate().toISOString(),
        end_time: dayjs(values.end_time).toDate().toISOString(),
        condition: values.condition,
        location: values.location,
        shipping_info: values.shipping_info,
        retail_price: values.retail_price,
        is_featured: values.is_featured || false,
        images: fileList.map(file => file.url || '').filter(Boolean),
      };

      await createMutation.mutateAsync({ data: payload });
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <Card title="Item Information" className="mb-4">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Form.Item
                    name="name"
                    label="Item Name"
                    rules={[{ required: true, message: 'Please enter item name' }]}
                  >
                    <Input 
                      placeholder="Enter a clear, descriptive title for your item"
                      size="large"
                      maxLength={100}
                      showCount
                    />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    name="category_id"
                    label="Category"
                    rules={[{ required: true, message: 'Please select a category' }]}
                  >
                    <Select 
                      placeholder="Select category"
                      size="large"
                      onChange={(value) => {
                        const category = categories.find(c => c.value === value);
                        setCategoryTags(category?.tags || []);
                      }}
                    >
                      {categories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="condition"
                    label="Condition"
                    rules={[{ required: true, message: 'Please select condition' }]}
                  >
                    <Select placeholder="Select condition" size="large">
                      {conditions.map(condition => (
                        <Option key={condition.value} value={condition.value}>
                          <div>
                            <div>{condition.label}</div>
                            <Text type="secondary" className="text-xs">
                              {condition.description}
                            </Text>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: 'Please enter description' }]}
                  >
                    <TextArea
                      placeholder="Provide detailed description including condition, features, and any defects"
                      rows={6}
                      maxLength={2000}
                      showCount
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="location" label="Item Location">
                    <Input placeholder="e.g., New York, NY" size="large" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="retail_price" label="Original Retail Price">
                    <InputNumber<number>
                      placeholder="0.00"
                      min={0}
                      step={0.01}
                      style={{ width: '100%' }}
                      size="large"
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => (value ? Number(value.replace(/\$\s?|(,*)/g, '')) : 0)}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {categoryTags.length > 0 && (
                <div className="mt-4">
                  <Text strong>Suggested Tags:</Text>
                  <div className="mt-2">
                    {categoryTags.map(tag => (
                      <Tag key={tag} className="mb-1">{tag}</Tag>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <Alert
              message="Pro Tips"
              description={
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Use clear, descriptive titles that include brand and model</li>
                  <li>Mention all defects or wear in the description</li>
                  <li>Research similar items to set competitive pricing</li>
                  <li>Include original retail price if available</li>
                </ul>
              }
              type="info"
              icon={<BulbOutlined />}
              showIcon
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <Card title="Upload Images & Videos" className="mb-4">
              <div className="space-y-4">
                <Upload {...uploadProps}>
                  {fileList.length >= 8 ? null : (
                    <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                      <PlusOutlined className="text-2xl text-gray-400 mb-2" />
                      <div>Upload Photos</div>
                      <Text type="secondary" className="text-xs">
                        Up to 8 images/videos
                      </Text>
                    </div>
                  )}
                </Upload>

                <div className="mt-4">
                  <Progress
                    percent={(fileList.length / 8) * 100}
                    size="small"
                    strokeColor={fileList.length >= 3 ? '#52c41a' : '#faad14'}
                  />
                  <Text type="secondary" className="text-sm">
                    {fileList.length} of 8 media files uploaded
                    {fileList.length < 3 && ' (minimum 3 recommended)'}
                  </Text>
                </div>
              </div>
            </Card>

            <Card title="Image Guidelines" size="small">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircleOutlined className="text-green-500" />
                      <Text>High resolution (min 800x600)</Text>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircleOutlined className="text-green-500" />
                      <Text>Multiple angles</Text>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircleOutlined className="text-green-500" />
                      <Text>Good lighting</Text>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircleOutlined className="text-green-500" />
                      <Text>Show any defects</Text>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <WarningOutlined className="text-red-500" />
                      <Text>No watermarks</Text>
                    </div>
                    <div className="flex items-center space-x-2">
                      <WarningOutlined className="text-red-500" />
                      <Text>No blurry photos</Text>
                    </div>
                    <div className="flex items-center space-x-2">
                      <WarningOutlined className="text-red-500" />
                      <Text>No copyrighted images</Text>
                    </div>
                    <div className="flex items-center space-x-2">
                      <WarningOutlined className="text-red-500" />
                      <Text>No misleading photos</Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {fileList.length === 0 && (
              <Alert
                message="At least 3 high-quality images are strongly recommended"
                description="Auctions with multiple clear photos receive 40% more bids on average"
                type="warning"
                showIcon
              />
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Card title="Auction Type" className="mb-4">
              <Radio.Group 
                value={auctionType} 
                onChange={(e) => setAuctionType(e.target.value)}
                className="w-full"
              >
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Radio.Button value="standard" className="w-full h-auto p-4">
                      <div className="text-center">
                        <TrophyOutlined className="text-2xl mb-2" />
                        <div className="font-medium">Standard Auction</div>
                        <Text type="secondary" className="text-xs">
                          Traditional bidding format
                        </Text>
                      </div>
                    </Radio.Button>
                  </Col>
                  <Col span={8}>
                    <Radio.Button value="reserve" className="w-full h-auto p-4">
                      <div className="text-center">
                        <StarOutlined className="text-2xl mb-2" />
                        <div className="font-medium">Reserve Auction</div>
                        <Text type="secondary" className="text-xs">
                          Set minimum sale price
                        </Text>
                      </div>
                    </Radio.Button>
                  </Col>
                  <Col span={8}>
                    <Radio.Button value="buy_now" className="w-full h-auto p-4">
                      <div className="text-center">
                        <ThunderboltOutlined className="text-2xl mb-2" />
                        <div className="font-medium">Buy It Now</div>
                        <Text type="secondary" className="text-xs">
                          Fixed price option
                        </Text>
                      </div>
                    </Radio.Button>
                  </Col>
                </Row>
              </Radio.Group>
            </Card>

            <Card title="Pricing" className="mb-4">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    name="starting_price"
                    label="Starting Bid"
                    rules={[{ required: true, message: 'Please enter starting price' }]}
                  >
                    <InputNumber<number>
                      placeholder="0.00"
                      min={0.01}
                      step={0.01}
                      style={{ width: '100%' }}
                      size="large"
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => (value ? Number(value.replace(/\$\s?|(,*)/g, '')) : 0)}
                    />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    name="increment_amount"
                    label="Bid Increment"
                    rules={[{ required: true, message: 'Please enter bid increment' }]}
                  >
                    <InputNumber<number>
                      placeholder="1.00"
                      min={0.01}
                      step={0.01}
                      style={{ width: '100%' }}
                      size="large"
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => (value ? Number(value.replace(/\$\s?|(,*)/g, '')) : 0)}
                    />
                  </Form.Item>
                </Col>

                {auctionType === 'reserve' && (
                  <Col span={12}>
                    <Form.Item
                      name="reserve_price"
                      label="Reserve Price"
                      tooltip="Minimum price you're willing to accept"
                    >
                      <InputNumber<number>
                        placeholder="0.00"
                        min={0}
                        step={0.01}
                        style={{ width: '100%' }}
                        size="large"
                        formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => (value ? Number(value.replace(/\$\s?|(,*)/g, '')) : 0)}
                      />
                    </Form.Item>
                  </Col>
                )}

                {auctionType === 'buy_now' && (
                  <Col span={12}>
                    <Form.Item
                      name="buy_now_price"
                      label="Buy It Now Price"
                      tooltip="Fixed price for immediate purchase"
                    >
                      <InputNumber<number>
                        placeholder="0.00"
                        min={0}
                        step={0.01}
                        style={{ width: '100%' }}
                        size="large"
                        formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => (value ? Number(value.replace(/\$\s?|(,*)/g, '')) : 0)}
                      />
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </Card>

            <Card title="Shipping & Handling" size="small">
              <Form.Item name="shipping_info" label="Shipping Information">
                <TextArea
                  placeholder="Describe shipping options, costs, and handling time"
                  rows={3}
                />
              </Form.Item>
              
              <div className="mt-4">
                <Text strong>Quick Shipping Options:</Text>
                <Checkbox.Group 
                  value={shippingOptions}
                  onChange={setShippingOptions}
                  className="mt-2"
                >
                  <Row>
                    <Col span={8}><Checkbox value="standard">Standard (5-7 days)</Checkbox></Col>
                    <Col span={8}><Checkbox value="expedited">Expedited (2-3 days)</Checkbox></Col>
                    <Col span={8}><Checkbox value="overnight">Overnight</Checkbox></Col>
                  </Row>
                </Checkbox.Group>
              </div>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Card title="Auction Schedule" className="mb-4">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    name="start_time"
                    label="Start Time"
                    rules={[{ required: true, message: 'Please select start time' }]}
                  >
                    <DatePicker
                      showTime
                      style={{ width: '100%' }}
                      size="large"
                      disabledDate={(current) => current && current < dayjs().startOf('day')}
                    />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    name="end_time"
                    label="End Time"
                    rules={[{ required: true, message: 'Please select end time' }]}
                  >
                    <DatePicker
                      showTime
                      style={{ width: '100%' }}
                      size="large"
                      disabledDate={(current) => {
                        const startTime = form.getFieldValue('start_time');
                        return current && startTime && current <= startTime;
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <Text strong>Quick Duration Presets:</Text>
                <div className="mt-2 space-x-2">
                  {['3 days', '5 days', '7 days', '10 days'].map(duration => (
                    <Button
                      key={duration}
                      size="small"
                      onClick={() => {
                        const start = dayjs();
                        const end = start.add(parseInt(duration), 'day');
                        form.setFieldsValue({
                          start_time: start,
                          end_time: end,
                        });
                      }}
                    >
                      {duration}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            <Card title="Advanced Settings" className="mb-4">
              <Collapse>
                <Panel header="Listing Options" key="listing">
                  <Space direction="vertical" className="w-full">
                    <Form.Item name="is_featured" valuePropName="checked">
                      <Checkbox>
                        <span className="ml-2">
                          Featured Listing 
                          <Tag color="gold" className="ml-2">+$5</Tag>
                        </span>
                      </Checkbox>
                    </Form.Item>
                    
                    <div>
                      <Text strong>Auto-extend if last-minute bidding:</Text>
                      <Form.Item name="auto_extend" valuePropName="checked" className="mt-2">
                        <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                      </Form.Item>
                    </div>
                  </Space>
                </Panel>

                <Panel header="Bidder Requirements" key="requirements">
                  <Space direction="vertical" className="w-full">
                    <div>
                      <Text strong>Minimum Feedback Score:</Text>
                      <Form.Item name="min_feedback_score" className="mt-2">
                        <Slider min={0} max={100} marks={{ 0: '0', 50: '50', 100: '100' }} />
                      </Form.Item>
                    </div>
                    
                    <Form.Item name="block_international" valuePropName="checked">
                      <Checkbox>Block international bidders</Checkbox>
                    </Form.Item>
                  </Space>
                </Panel>
              </Collapse>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Card title="Auction Preview" className="mb-4">
              <Tabs defaultActiveKey="preview">
                <TabPane tab="Preview" key="preview">
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex space-x-4">
                      <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        {fileList.length > 0 ? (
                          <Image
                            src={fileList[0].thumbUrl || fileList[0].url}
                            alt="Main"
                            width={192}
                            height={192}
                            className="object-cover rounded-lg"
                          />
                        ) : (
                          <PictureOutlined className="text-4xl text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <Title level={3}>{form.getFieldValue('name') || 'Item Name'}</Title>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Text>Starting bid:</Text>
                            <Text strong className="text-green-600">
                              ${form.getFieldValue('starting_price') || '0.00'}
                            </Text>
                          </div>
                          <div className="flex justify-between">
                            <Text>Bid increment:</Text>
                            <Text>${form.getFieldValue('increment_amount') || '1.00'}</Text>
                          </div>
                          <div className="flex justify-between">
                            <Text>Condition:</Text>
                            <Text>{form.getFieldValue('condition') || 'Not specified'}</Text>
                          </div>
                          <div className="flex justify-between">
                            <Text>Time left:</Text>
                            <Text className="text-red-500">Auction not started</Text>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Divider />
                    
                    <div>
                      <Title level={5}>Description</Title>
                      <Paragraph>
                        {form.getFieldValue('description') || 'No description provided'}
                      </Paragraph>
                    </div>
                  </div>
                </TabPane>
                
                <TabPane tab="Details" key="details">
                  <div className="space-y-4">
                    {Object.entries(form.getFieldsValue()).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b">
                        <Text strong className="capitalize">{key.replace(/_/g, ' ')}:</Text>
                        <Text>{formatValueForDisplay(value)}</Text>
                      </div>
                    ))}
                  </div>
                </TabPane>
              </Tabs>
            </Card>

            <Alert
              message="Ready to Publish"
              description="Review all details carefully. Once published, some settings cannot be changed."
              type="success"
              showIcon
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (!isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              className="mb-2"
            >
              Back
            </Button>
            <Title level={2} className="!mb-1">
              Create New Auction
            </Title>
            <Text type="secondary">
              Create a professional auction listing with advanced features
            </Text>
          </div>
          
          <Space>
            <Button
              icon={<SaveOutlined />}
              onClick={() => {
                const values = form.getFieldsValue();
                if ((values as Record<string, unknown>).name) {
                  saveDraft(values);
                } else {
                  message.warning('Please enter an item name before saving draft');
                }
              }}
            >
              Save Draft
            </Button>
            <Button icon={<EyeOutlined />} onClick={() => setCurrentStep(4)}>
              Preview
            </Button>
          </Space>
        </div>

        {/* Drafts Section */}
        {savedDrafts.length > 0 && (
          <Card title="Saved Drafts" size="small" className="mb-6">
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
              dataSource={savedDrafts}
              renderItem={(draft) => (
                <List.Item>
                  <Card
                    size="small"
                    actions={[
                      <Button
                        key="load"
                        type="text"
                        size="small"
                        onClick={() => loadDraft(draft)}
                      >
                        Load
                      </Button>,
                      <Button
                        key="delete"
                        type="text"
                        size="small"
                        danger
                        onClick={() => deleteDraft(draft.id!)}
                      >
                        Delete
                      </Button>,
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Text className="text-sm" ellipsis>
                          {draft.name}
                        </Text>
                      }
                      description={
                        <Text type="secondary" className="text-xs">
                          {dayjs(draft.lastSaved).fromNow()}
                        </Text>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        )}

        {/* Progress Steps */}
        <Card className="mb-6">
          <Steps current={currentStep} items={steps} />
        </Card>

        {/* Main Form */}
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Card>
            {renderStepContent()}
          </Card>

          {/* Navigation */}
          <Card className="mt-6">
            <div className="flex justify-between">
              <div>
                {currentStep > 0 && (
                  <Button onClick={prevStep}>
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="space-x-2">
                {currentStep < steps.length - 1 ? (
                  <Button type="primary" onClick={nextStep}>
                    Next Step
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    icon={<FireOutlined />}
                    loading={loading}
                    onClick={handleSubmit}
                  >
                    Publish Auction
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </Form>
      </div>
    </AdminLayout>
  );
}

'use client';

import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Typography, theme, Space, Badge } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  TagOutlined,
  PictureOutlined,
  GiftOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface AdminLayoutProps {
  readonly children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const admin = useAuthStore((state) => state.admin);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const pathname = usePathname();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'User Management',
      children: [
        {
          key: '/dashboard/users',
          label: 'All Users',
        },
        {
          key: '/dashboard/users/suspended',
          label: 'Suspended Users',
        },
      ],
    },
    {
      key: 'auctions',
      icon: <ShoppingOutlined />,
      label: 'Auction Management',
      children: [
        {
          key: '/dashboard/auctions',
          label: 'All Auctions',
        },
        {
          key: '/dashboard/auctions/active',
          label: 'Active Auctions',
        },
        {
          key: '/dashboard/auctions/ended',
          label: 'Ended Auctions',
        },
        {
          key: '/dashboard/auctions/create',
          label: 'Create Auction',
        },
      ],
    },
    {
      key: '/dashboard/categories',
      icon: <TagOutlined />,
      label: 'Categories',
    },
    {
      key: '/dashboard/banners',
      icon: <PictureOutlined />,
      label: 'Promotional Banners',
    },
    {
      key: '/dashboard/bids',
      icon: <GiftOutlined />,
      label: 'Bid Management',
    },
    {
      key: 'reports',
      icon: <FileTextOutlined />,
      label: 'Reports & Analytics',
      children: [
        {
          key: '/dashboard/reports/revenue',
          label: 'Revenue Reports',
        },
        {
          key: '/dashboard/reports/user-activity',
          label: 'User Activity',
        },
        {
          key: '/dashboard/reports/auction-stats',
          label: 'Auction Statistics',
        },
      ],
    },
    {
      key: '/dashboard/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
  };

  const handleLogout = async () => {
    await logout();
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => router.push('/dashboard/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => router.push('/dashboard/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const getSelectedKeys = () => {
    // Find the exact match first
    for (const item of menuItems) {
      if (item.key === pathname) {
        return [item.key];
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.key === pathname) {
            return [child.key];
          }
        }
      }
    }
    
    // If no exact match, try to find parent match
    for (const item of menuItems) {
      if (item.children) {
        for (const child of item.children) {
          if (pathname.startsWith(child.key)) {
            return [child.key];
          }
        }
      }
      if (pathname.startsWith(item.key)) {
        return [item.key];
      }
    }
    
    return ['/dashboard'];
  };

  const getOpenKeys = () => {
    for (const item of menuItems) {
      if (item.children) {
        for (const child of item.children) {
          if (pathname.startsWith(child.key)) {
            return [item.key];
          }
        }
      }
    }
    return [];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          background: colorBgContainer,
          borderRight: '1px solid #f0f0f0',
        }}
        width={250}
      >
        <div style={{ 
          height: '64px', 
          padding: '16px', 
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start'
        }}>
          {!collapsed && (
            <Text strong style={{ fontSize: '18px', color: '#1677ff' }}>
              ZidoBid Admin
            </Text>
          )}
          {collapsed && (
            <Text strong style={{ fontSize: '18px', color: '#1677ff' }}>
              ZB
            </Text>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          
          <Space size="middle">
            <Badge count={5} size="small">
              <Button 
                type="text" 
                icon={<BellOutlined />} 
                style={{ fontSize: '16px' }}
              />
            </Badge>
            
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <Text strong>{admin?.name}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

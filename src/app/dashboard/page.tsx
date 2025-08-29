"use client";

import React, { useEffect } from "react";
import { Card, Col, Row, Typography } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";

const { Title, Text } = Typography;

export default function DashboardHome() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const admin = useAuthStore((s) => s.admin);
  const router = useRouter();

  // Client-side guard (middleware already protects server-side)
  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <AdminLayout>
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Title level={3} style={{ margin: 0 }}>
            Welcome{admin?.name ? `, ${admin.name}` : ""}
          </Title>
          <Text type="secondary">Use the sections below to manage the platform.</Text>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={8}>
          <Link href="/dashboard/auctions">
            <Card hoverable title="Auctions">
              <Text>View and manage all auction items.</Text>
            </Card>
          </Link>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Link href="/dashboard/users">
            <Card hoverable title="Users">
              <Text>Manage user accounts and statuses.</Text>
            </Card>
          </Link>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Link href="/dashboard/categories">
            <Card hoverable title="Categories">
              <Text>Create and organize product categories.</Text>
            </Card>
          </Link>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Link href="/dashboard/banners">
            <Card hoverable title="Banners">
              <Text>Manage promotional banners.</Text>
            </Card>
          </Link>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Link href="/dashboard/bids">
            <Card hoverable title="Bids">
              <Text>Review and moderate bids.</Text>
            </Card>
          </Link>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Link href="/dashboard/settings">
            <Card hoverable title="Settings">
              <Text>Platform configuration and preferences.</Text>
            </Card>
          </Link>
        </Col>
      </Row>
    </AdminLayout>
  );
}

// Mã màn hình: Placeholder Tenant Portal
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Result } from 'antd';
import { Construction, ArrowLeft, LogIn } from 'lucide-react';

const { Title, Paragraph, Text } = Typography;

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#0D1117',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <Card
        style={{
          maxWidth: 520,
          width: '100%',
          textAlign: 'center',
          borderRadius: 16,
          border: '1px solid #2A303C',
          background: '#161B22',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: 16,
            backgroundColor: 'rgba(247, 144, 9, 0.15)',
            color: '#F79009',
            marginBottom: 20,
          }}
        >
          <Construction size={36} />
        </div>

        <Title level={3} style={{ color: '#FFFFFF', margin: '0 0 8px 0' }}>
          Tenant Portal
        </Title>
        <Paragraph style={{ color: '#94A3B8', fontSize: 15, marginBottom: 24 }}>
          Khu vực Tenant Portal đang được phát triển (Giai đoạn 2).
          <br />
          Hiện tại vui lòng đăng nhập vào <strong>Admin Console</strong> để trải nghiệm các tính năng quản trị.
        </Paragraph>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button
            type="primary"
            icon={<LogIn size={16} />}
            onClick={() => navigate('/login')}
            style={{ backgroundColor: '#0B72E7', height: 40, borderRadius: 8, fontWeight: 500 }}
          >
            Quay lại Đăng nhập
          </Button>
          <Button
            onClick={() => navigate('/admin/dashboard/system')}
            style={{ height: 40, borderRadius: 8 }}
          >
            Vào Admin Console
          </Button>
        </div>
      </Card>
    </div>
  );
}

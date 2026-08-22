// Mã màn hình: MH-MT5-02/03 (Báo cáo Thống kê Cảnh báo & MTTR — Tenant Portal)
import React, { useState } from 'react';
import {
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Table,
  Select,
  Row,
  Col,
  message,
} from 'antd';
import { AlertTriangle, Clock, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { DonutBreakdownChart } from '../../../components/charts/DashboardCharts';
import { useTheme } from '../../../theme/ThemeContext';

const { Title, Text, Paragraph } = Typography;

export default function TenantAlertReport() {
  const [timeRange, setTimeRange] = useState('30d');

  const alertBreakdown = [
    { name: 'Critical (Khẩn cấp)', percentage: 15, color: '#DC2626', detail: '6 sự cố' },
    { name: 'Warning (Cảnh báo)', percentage: 35, color: '#D97706', detail: '14 sự cố' },
    { name: 'Info (Thông tin)', percentage: 50, color: '#0B72E7', detail: '20 thông báo' },
  ];

  const mttrData = [
    {
      key: '1',
      handler: 'Trần Thị Mai',
      role: 'Nhân viên Kỹ thuật (AT-04)',
      assignedRooms: 'Ga T2 & Phòng Server',
      totalResolved: 18,
      avgMttr: '14.5 phút',
      performance: 'Xuất sắc',
    },
    {
      key: '2',
      handler: 'Lê Văn Hùng',
      role: 'Nhân viên Bảo trì (AT-04)',
      assignedRooms: 'Kho Lạnh ALS',
      totalResolved: 12,
      avgMttr: '28.0 phút',
      performance: 'Đạt yêu cầu',
    },
    {
      key: '3',
      handler: 'Nguyễn Hoàng Long',
      role: 'Quản trị Doanh nghiệp (AT-03)',
      assignedRooms: 'Toàn bộ Cơ sở',
      totalResolved: 8,
      avgMttr: '8.2 phút',
      performance: 'Xuất sắc',
    },
  ];

  const handleExport = () => {
    message.success('Đã xuất file Báo cáo Thống kê Cảnh báo & MTTR (.xlsx) thành công.');
  };

  const columns = [
    {
      title: 'Nhân Viên Xử Lý',
      dataIndex: 'handler',
      key: 'handler',
      render: (h, r) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{h}</Text>
          <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>{r.role}</Text>
        </div>
      ),
    },
    {
      title: 'Phạm vi Phòng Quản lý',
      dataIndex: 'assignedRooms',
      key: 'assignedRooms',
      render: (rm) => <Tag color="blue">{rm}</Tag>,
    },
    {
      title: 'Số Cảnh báo Đã Xử lý',
      dataIndex: 'totalResolved',
      key: 'totalResolved',
      width: 160,
      render: (c) => <strong>{c} sự cố</strong>,
    },
    {
      title: 'Thời gian Phản hồi TB (MTTR)',
      dataIndex: 'avgMttr',
      key: 'avgMttr',
      width: 180,
      render: (m) => <Text style={{ color: '#16A34A', fontWeight: 600 }}>{m}</Text>,
    },
    {
      title: 'Đánh giá KPI',
      dataIndex: 'performance',
      key: 'performance',
      width: 130,
      render: (p) => <Tag color="success">{p}</Tag>,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Báo Cáo Phân Loại Cảnh Báo & Hiệu Suất MTTR</Title>
          <Text type="secondary">Đo lường thời gian trung bình tiếp nhận và khắc phục sự cố theo từng nhân viên (MH-MT5-02/03)</Text>
        </div>
        <Space>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>MH-MT5-02 / 03</Tag>
          <Button type="primary" icon={<FileSpreadsheet size={16} />} onClick={handleExport} style={{ backgroundColor: '#16A34A', borderColor: '#16A34A', borderRadius: 8 }}>
            Xuất file Excel (.xlsx)
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="Cơ Cấu Mức Độ Nghiêm Trọng Cảnh Báo" style={{ borderRadius: 12, height: '100%' }}>
            <DonutBreakdownChart data={alertBreakdown} totalLabel="Cảnh báo" size={150} />
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Hiệu Suất Tiếp Nhận & Thời Gian Xử Lý Trung Bình (MTTR)" style={{ borderRadius: 12, height: '100%' }}>
            <Table dataSource={mttrData} columns={columns} pagination={false} bordered size="middle" />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

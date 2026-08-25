// Mã màn hình: MH-MT5-03 (Báo Cáo Thời Gian Phản Hồi MTTR & Hiệu Suất — Tenant Portal)
// Dựa theo FN-MT5-03 & UC-MT5-03 trong SmartSite_Function_List_v9 & SmartSite_IoT_UseCase_List_v5
import React, { useState, useMemo } from 'react';
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
  Progress,
  DatePicker,
  Radio,
  Empty,
  Badge,
  Tooltip,
  message,
  Divider,
} from 'antd';
import {
  Clock,
  FileSpreadsheet,
  Download,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  User,
  ShieldAlert,
  Zap,
  TrendingUp,
  Activity,
} from 'lucide-react';
import dayjs from 'dayjs';
import { useTheme } from '../../../theme/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function TenantMttrReport() {
  const { isDark } = useTheme();

  // Bộ lọc thời gian mặc định 30 ngày gần nhất (BR-T31)
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [selectedUser, setSelectedUser] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');

  // Role Switcher Demo (AT-03 xem toàn bộ BR-T29 vs AT-04 chỉ xem Room được gán)
  const [currentRoleView, setCurrentRoleView] = useState('AT-03');

  // Dữ liệu hiệu suất MTTR của từng nhân viên tiếp nhận sự cố
  const rawMttrData = [
    {
      key: '1',
      handler: 'Trần Thị Mai',
      role: 'Kỹ thuật viên (AT-04)',
      assignedRooms: 'Ga T2 & Phòng Server',
      totalResolved: 18,
      avgMttrMinutes: 14.5,
      avgMttrText: '14.5 phút',
      slaComplianceRate: 98.2,
      criticalHandled: 2,
      warningHandled: 10,
      infoHandled: 6,
      performance: 'Xuất sắc',
    },
    {
      key: '2',
      handler: 'Lê Văn Hùng',
      role: 'Nhân viên Bảo trì (AT-04)',
      assignedRooms: 'Kho Lạnh ALS & Khu Phân loại',
      totalResolved: 12,
      avgMttrMinutes: 28.0,
      avgMttrText: '28.0 phút',
      slaComplianceRate: 92.5,
      criticalHandled: 1,
      warningHandled: 7,
      infoHandled: 4,
      performance: 'Đạt yêu cầu',
    },
    {
      key: '3',
      handler: 'Nguyễn Hoàng Long',
      role: 'Quản trị Doanh nghiệp (AT-03)',
      assignedRooms: 'Toàn bộ Cơ sở / Tòa nhà',
      totalResolved: 8,
      avgMttrMinutes: 8.2,
      avgMttrText: '8.2 phút',
      slaComplianceRate: 100,
      criticalHandled: 3,
      warningHandled: 3,
      infoHandled: 2,
      performance: 'Xuất sắc',
    },
  ];

  // Lọc dữ liệu theo vai trò và bộ lọc
  const filteredData = useMemo(() => {
    return rawMttrData.filter((item) => {
      // Phân quyền AT-04 chỉ thấy bản ghi của chính mình (BR-T29)
      if (currentRoleView === 'AT-04' && item.handler !== 'Trần Thị Mai') {
        return false;
      }

      if (selectedUser !== 'ALL' && item.handler !== selectedUser) return false;

      return true;
    });
  }, [rawMttrData, currentRoleView, selectedUser]);

  // Thống kê tổng hợp MTTR
  const stats = useMemo(() => {
    if (filteredData.length === 0) return { avgMttr: 0, totalResolved: 0, avgSla: 0 };
    const sumMttr = filteredData.reduce((acc, cur) => acc + cur.avgMttrMinutes, 0);
    const sumResolved = filteredData.reduce((acc, cur) => acc + cur.totalResolved, 0);
    const sumSla = filteredData.reduce((acc, cur) => acc + cur.slaComplianceRate, 0);
    return {
      avgMttr: (sumMttr / filteredData.length).toFixed(1),
      totalResolved: sumResolved,
      avgSla: (sumSla / filteredData.length).toFixed(1),
    };
  }, [filteredData]);

  // Xuất file Excel (.xlsx) — Không giới hạn số dòng (BR-T40)
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      message.warning('Không có dữ liệu xử lý cảnh báo trong khoảng thời gian đã chọn. (EF-01)');
      return;
    }
    const fromDate = dateRange[0].format('DD-MM-YYYY');
    const toDate = dateRange[1].format('DD-MM-YYYY');
    message.loading('Đang khởi tạo file Excel báo cáo...', 0.6);
    setTimeout(() => {
      message.success(`Đã xuất báo cáo thành công: Bao_cao_hieu_suat_MTTR_${fromDate}_${toDate}.xlsx (Định dạng Excel .xlsx — BR-T40)`);
    }, 600);
  };

  // Giới hạn DatePicker không cho chọn ngoài 12 tháng lưu trữ (BR-T39 / NFR-T06)
  const disabledDate = (current) => {
    if (!current) return false;
    const maxPastDate = dayjs().subtract(12, 'month');
    const today = dayjs();
    return current.isBefore(maxPastDate, 'day') || current.isAfter(today, 'day');
  };

  const columns = [
    {
      title: 'Nhân Viên Tiếp Nhận / Xử Lý (BR-T27)',
      dataIndex: 'handler',
      key: 'handler',
      render: (h, r) => (
        <div>
          <Space size={6}>
            <UserCheck size={16} style={{ color: '#0B72E7' }} />
            <Text strong style={{ fontSize: 13 }}>{h}</Text>
          </Space>
          <Text type="secondary" style={{ display: 'block', fontSize: 11, marginTop: 2 }}>{r.role}</Text>
        </div>
      ),
    },
    {
      title: 'Phạm Vi Phân Quyền',
      dataIndex: 'assignedRooms',
      key: 'assignedRooms',
      render: (rm) => <Tag color="blue">{rm}</Tag>,
    },
    {
      title: 'Tổng Sự Cố Đã Khắc Phục',
      dataIndex: 'totalResolved',
      key: 'totalResolved',
      width: 170,
      render: (c, r) => (
        <div>
          <strong>{c} sự cố</strong>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
            🔴 {r.criticalHandled} • 🟡 {r.warningHandled} • 🔵 {r.infoHandled}
          </div>
        </div>
      ),
    },
    {
      title: 'Thời Gian Phản Hồi TB (MTTR)',
      dataIndex: 'avgMttrText',
      key: 'avgMttrText',
      width: 200,
      render: (t, r) => {
        let color = '#10B981';
        if (r.avgMttrMinutes > 20) color = '#F59E0B';
        if (r.avgMttrMinutes > 40) color = '#DC2626';

        return (
          <Space size={6}>
            <Clock size={14} style={{ color }} />
            <span style={{ fontWeight: 700, color, fontSize: 13 }}>{t}</span>
          </Space>
        );
      },
    },
    {
      title: 'Tỷ Lệ Đạt Chuẩn SLA',
      dataIndex: 'slaComplianceRate',
      key: 'slaComplianceRate',
      width: 210,
      render: (rate) => {
        let strokeColor = '#10B981';
        if (rate < 95) strokeColor = '#F59E0B';
        if (rate < 90) strokeColor = '#DC2626';

        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
              <span style={{ fontWeight: 700, color: strokeColor }}>{rate}% SLA</span>
              <Text type="secondary">Mục tiêu: 95%</Text>
            </div>
            <Progress percent={rate} size="small" strokeColor={strokeColor} showInfo={false} />
          </div>
        );
      },
    },
    {
      title: 'Đánh Giá Hiệu Suất',
      dataIndex: 'performance',
      key: 'performance',
      width: 140,
      render: (p) => (
        <Tag color={p === 'Xuất sắc' ? 'success' : 'processing'} style={{ fontWeight: 600 }}>
          {p}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header trang */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={22} style={{ color: '#0B72E7', flexShrink: 0 }} />
            <Title level={4} style={{ margin: 0, lineHeight: 1.2 }}>
              Báo Cáo Thời Gian Phản Hồi (MTTR) & Hiệu Suất
            </Title>
          </div>
          <Text type="secondary" style={{ fontSize: 12.5, display: 'block', marginTop: 2 }}>
            Đo lường thời gian trung bình tiếp nhận xử lý sự cố (Mean Time To Resolve) và tỷ lệ tuân thủ cam kết chất lượng dịch vụ SLA (MH-MT5-03)
          </Text>
        </div>

        <Space align="center">
          <Tag color="blue" style={{ fontSize: 12.5, padding: '3px 8px', borderRadius: 6 }}>
            MH-MT5-03
          </Tag>
          <Button
            type="primary"
            icon={<FileSpreadsheet size={15} />}
            onClick={handleExportExcel}
            disabled={filteredData.length === 0}
            style={{ backgroundColor: '#059669', borderColor: '#059669', borderRadius: 6, height: 34 }}
          >
            Xuất Báo Cáo Excel (.xlsx — BR-T40)
          </Button>
        </Space>
      </div>

      {/* KPI Cards Thống Kê MTTR */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Thời gian phản hồi TB (MTTR)</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#10B981' }}>
              {stats.avgMttr} <span style={{ fontSize: 14, color: '#9CA3AF' }}>phút</span>
            </Title>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Tỷ lệ đúng hạn SLA phản hồi</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#0B72E7' }}>{stats.avgSla}%</Title>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Tổng sự cố đã giải quyết</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#0B72E7' }}>{stats.totalResolved}</Title>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Nhân sự tham gia xử lý</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#0B72E7' }}>{filteredData.length}</Title>
          </Card>
        </Col>
      </Row>

      {/* Bảng Bộ Lọc & Chi Tiết Báo Cáo */}
      <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} lg={12}>
            <Space wrap>
              {/* Role Switcher Demo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: isDark ? '#1F2937' : '#F3F4F6', padding: '4px 10px', borderRadius: 8 }}>
                <User size={14} style={{ color: '#0B72E7' }} />
                <Text style={{ fontSize: 12 }}>Quyền xem:</Text>
                <Radio.Group
                  size="small"
                  value={currentRoleView}
                  onChange={(e) => setCurrentRoleView(e.target.value)}
                >
                  <Radio.Button value="AT-03">Admin (Toàn bộ)</Radio.Button>
                  <Radio.Button value="AT-04">User (Room gán — BR-T29)</Radio.Button>
                </Radio.Group>
              </div>

              {/* DatePicker mặc định 30 ngày (BR-T31) + chặn ngoài 12 tháng (BR-T39) */}
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                disabledDate={disabledDate}
                format="DD/MM/YYYY"
                style={{ width: 250 }}
              />
            </Space>
          </Col>

          <Col xs={24} lg={12}>
            <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Select
                value={selectedUser}
                onChange={setSelectedUser}
                style={{ width: 220 }}
              >
                <Option value="ALL">Toàn bộ nhân sự tiếp nhận</Option>
                <Option value="Trần Thị Mai">Trần Thị Mai (Kỹ thuật viên)</Option>
                <Option value="Lê Văn Hùng">Lê Văn Hùng (Bảo trì)</Option>
                <Option value="Nguyễn Hoàng Long">Nguyễn Hoàng Long (Tenant Admin)</Option>
              </Select>
            </Space>
          </Col>
        </Row>

        <Divider style={{ margin: '16px 0' }} />

        {filteredData.length === 0 ? (
          <Empty
            description="Chưa có dữ liệu xử lý cảnh báo trong khoảng thời gian đã chọn. (EF-01)"
            style={{ padding: '40px 0' }}
          />
        ) : (
          <Table
            dataSource={filteredData}
            columns={columns}
            rowKey="key"
            pagination={false}
            bordered
            size="middle"
          />
        )}
      </Card>
    </div>
  );
}

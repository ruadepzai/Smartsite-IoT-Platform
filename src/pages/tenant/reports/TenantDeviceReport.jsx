// Mã màn hình: MH-MT5-01 (Báo Cáo Vận Hành Thiết Bị & Uptime — Tenant Portal)
// Dựa theo FN-MT5-01 & UC-MT5-01 trong SmartSite_Function_List_v9 & SmartSite_IoT_UseCase_List_v5
import React, { useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Table,
  Select,
  Progress,
  Row,
  Col,
  DatePicker,
  Radio,
  Empty,
  Badge,
  Tooltip,
  message,
  Divider,
} from 'antd';
import {
  BarChart3,
  FileSpreadsheet,
  Download,
  RefreshCw,
  Cpu,
  User,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import dayjs from 'dayjs';
import { useTheme } from '../../../theme/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function TenantDeviceReport() {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);

  // Bộ lọc thời gian mặc định 30 ngày gần nhất (BR-T31)
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [selectedBuilding, setSelectedBuilding] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Role Switcher Demo (AT-03 xem toàn bộ BR-T29 vs AT-04 chỉ xem Room được gán)
  const [currentRoleView, setCurrentRoleView] = useState('AT-03');

  // Dữ liệu báo cáo vận hành thiết bị
  const rawReportData = [
    {
      id: 'DEV-101',
      name: 'Gateway Trung tâm Ga T2',
      code: 'GW-NB-001',
      category: 'Gateway IoT',
      building: 'Nhà ga Hành khách T2 (Quốc tế)',
      room: 'Phòng Kỹ thuật Điện & HVAC Trung tâm (RM-101)',
      uptimePct: 99.98,
      offlineCount: 1,
      offlineDurationMinutes: 12,
      lastOffline: '18/08/2026 04:15',
      status: 'Tuyệt hảo',
    },
    {
      id: 'DEV-102',
      name: 'Cảm biến Nhiệt ẩm Phòng Server RM-302',
      code: 'TH-SVR-01',
      category: 'Cảm biến Môi trường',
      building: 'Nhà ga Hành khách T2 (Quốc tế)',
      room: 'Phòng Server Cảng Hàng không (RM-302)',
      uptimePct: 99.95,
      offlineCount: 2,
      offlineDurationMinutes: 35,
      lastOffline: '15/08/2026 12:20',
      status: 'Ổn định',
    },
    {
      id: 'DEV-103',
      name: 'Đồng hồ Đo đếm Điện Năng Chiller T2',
      code: 'PWR-HVAC-01',
      category: 'Đồng hồ Năng lượng',
      building: 'Nhà ga Hành khách T2 (Quốc tế)',
      room: 'Phòng Kỹ thuật Điện & HVAC Trung tâm (RM-101)',
      uptimePct: 100,
      offlineCount: 0,
      offlineDurationMinutes: 0,
      lastOffline: '—',
      status: 'Tuyệt hảo',
    },
    {
      id: 'DEV-104',
      name: 'Cảm biến Kho Lạnh Âm sâu #01',
      code: 'COLD-SN-04',
      category: 'Cảm biến Môi trường',
      building: 'Nhà ga Hàng hóa ALS Cargo',
      room: 'Kho Lạnh Âm sâu -20°C (RM-C01)',
      uptimePct: 98.40,
      offlineCount: 5,
      offlineDurationMinutes: 255,
      lastOffline: '19/08/2026 08:30',
      status: 'Cảnh báo',
    },
    {
      id: 'DEV-105',
      name: 'Máy bơm Cứu hỏa Tòa nhà TSN',
      code: 'PUMP-TOC-01',
      category: 'Thiết bị Điều khiển RPC',
      building: 'Nhà ga Quốc nội T1',
      room: 'Phòng Điều khiển Trung tâm TOC (RM-TOC)',
      uptimePct: 94.20,
      offlineCount: 8,
      offlineDurationMinutes: 1110,
      lastOffline: '20/08/2026 15:30',
      status: 'Cần bảo trì',
    },
    {
      id: 'DEV-108',
      name: 'Đồng hồ Đo Điện Kho Lạnh ALS',
      code: 'SM-CARGO-01',
      category: 'Đồng hồ Năng lượng',
      building: 'Nhà ga Hàng hóa ALS Cargo',
      room: 'Kho Lạnh Âm sâu -20°C (RM-C01)',
      uptimePct: 92.10,
      offlineCount: 3,
      offlineDurationMinutes: 2280, // > 24h (BR-T08)
      lastOffline: '19/08/2026 02:00',
      status: 'Mất kết nối > 24h',
    },
  ];

  // Lọc dữ liệu theo vai trò và bộ lọc
  const filteredData = useMemo(() => {
    return rawReportData.filter((item) => {
      // Phân quyền AT-04 chỉ thấy thiết bị trong phòng mình phụ trách (BR-T29)
      if (currentRoleView === 'AT-04') {
        const userAssignedRooms = [
          'Phòng Server Cảng Hàng không (RM-302)',
          'Phòng Kỹ thuật Điện & HVAC Trung tâm (RM-101)',
        ];
        if (!userAssignedRooms.includes(item.room)) return false;
      }

      if (selectedBuilding !== 'ALL' && item.building !== selectedBuilding) return false;
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;

      return true;
    });
  }, [rawReportData, currentRoleView, selectedBuilding, selectedCategory]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    if (filteredData.length === 0) return { avgUptime: 0, totalOfflineMinutes: 0, totalOfflineCount: 0 };
    const sumUptime = filteredData.reduce((acc, cur) => acc + cur.uptimePct, 0);
    const sumOfflineMin = filteredData.reduce((acc, cur) => acc + cur.offlineDurationMinutes, 0);
    const sumOfflineCnt = filteredData.reduce((acc, cur) => acc + cur.offlineCount, 0);
    return {
      avgUptime: (sumUptime / filteredData.length).toFixed(2),
      totalOfflineMinutes: sumOfflineMin,
      totalOfflineCount: sumOfflineCnt,
    };
  }, [filteredData]);

  // Xuất file Excel (.xlsx) — Không giới hạn số dòng (BR-T40)
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      message.warning('Không có dữ liệu vận hành trong khoảng thời gian đã chọn. (EF-01)');
      return;
    }
    const fromDate = dateRange[0].format('DD-MM-YYYY');
    const toDate = dateRange[1].format('DD-MM-YYYY');
    message.loading('Đang khởi tạo file Excel báo cáo...', 0.6);
    setTimeout(() => {
      message.success(`Đã xuất báo cáo thành công: Bao_cao_van_hanh_thiet_bi_${fromDate}_${toDate}.xlsx (Định dạng Excel .xlsx — BR-T40)`);
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
      title: 'Thiết Bị & Nhóm',
      dataIndex: 'name',
      key: 'name',
      render: (name, r) => (
        <div>
          <Space size={6}>
            <Cpu size={14} style={{ color: '#0B72E7' }} />
            <Text strong style={{ fontSize: 13 }}>{name}</Text>
          </Space>
          <Text type="secondary" style={{ display: 'block', fontSize: 11, marginTop: 2 }}>
            <code>{r.code}</code> • {r.category}
          </Text>
        </div>
      ),
    },
    {
      title: 'Vị Trí Cài Đặt',
      dataIndex: 'room',
      key: 'room',
      render: (rm, r) => (
        <div>
          <Text style={{ fontSize: 12 }}>{rm}</Text>
          <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>{r.building}</Text>
        </div>
      ),
    },
    {
      title: 'Tỷ Lệ Hoạt Động (Uptime %)',
      dataIndex: 'uptimePct',
      key: 'uptimePct',
      width: 220,
      render: (pct) => {
        let strokeColor = '#10B981';
        if (pct < 98) strokeColor = '#F59E0B';
        if (pct < 95) strokeColor = '#DC2626';

        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
              <span style={{ fontWeight: 700, color: strokeColor }}>{pct}% Uptime</span>
              <Text type="secondary">Mục tiêu: 99.5%</Text>
            </div>
            <Progress percent={pct} size="small" strokeColor={strokeColor} showInfo={false} />
          </div>
        );
      },
    },
    {
      title: 'Số Lần Mất Kết Nối',
      dataIndex: 'offlineCount',
      key: 'offlineCount',
      width: 140,
      render: (cnt) => (
        <Tag color={cnt === 0 ? 'success' : cnt > 4 ? 'error' : 'warning'}>
          {cnt} lần offline
        </Tag>
      ),
    },
    {
      title: 'Tổng Thời Lượng Mất Kết Nối',
      dataIndex: 'offlineDurationMinutes',
      key: 'offlineDurationMinutes',
      width: 190,
      render: (min) => {
        if (min === 0) return <Text type="secondary">0 phút</Text>;
        if (min >= 1440) {
          const hours = (min / 60).toFixed(1);
          return (
            <Tooltip title="Mất kết nối vượt ngưỡng 24h (BR-T08)">
              <Tag color="error">{hours} giờ (&gt; 24h)</Tag>
            </Tooltip>
          );
        }
        if (min >= 60) {
          const hours = Math.floor(min / 60);
          const remainMin = min % 60;
          return <Text strong style={{ color: '#F59E0B' }}>{hours} giờ {remainMin} phút</Text>;
        }
        return <Text>{min} phút</Text>;
      },
    },
    {
      title: 'Đánh Giá Vận Hành',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (st) => {
        if (st === 'Tuyệt hảo' || st === 'Ổn định') {
          return <Badge status="success" text={st} />;
        }
        if (st === 'Cảnh báo') {
          return <Badge status="warning" text={st} />;
        }
        return <Badge status="error" text={st} />;
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header trang */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Space size={8} align="center">
            <BarChart3 size={24} style={{ color: '#0B72E7' }} />
            <Title level={4} style={{ margin: 0 }}>
              Báo Cáo Vận Hành Thiết Bị & Uptime
            </Title>
          </Space>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 2 }}>
            Tổng hợp tỷ lệ khả dụng Uptime/Downtime, số lần và thời lượng mất kết nối theo chu kỳ 30 ngày (MH-MT5-01)
          </Text>
        </div>

        <Space>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
            MH-MT5-01
          </Tag>
          <Button
            type="primary"
            icon={<FileSpreadsheet size={16} />}
            onClick={handleExportExcel}
            disabled={filteredData.length === 0}
            style={{ backgroundColor: '#059669', borderColor: '#059669', borderRadius: 8, height: 38 }}
          >
            Xuất Báo Cáo Excel (.xlsx — BR-T40)
          </Button>
        </Space>
      </div>

      {/* KPI Cards Thống Kê Uptime */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Tỷ lệ Uptime trung bình</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#10B981' }}>{stats.avgUptime}%</Title>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Tổng số lần mất kết nối</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#F59E0B' }}>{stats.totalOfflineCount} lần</Title>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Tổng thời lượng Offline</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#DC2626' }}>
              {(stats.totalOfflineMinutes / 60).toFixed(1)} <span style={{ fontSize: 14, color: '#9CA3AF' }}>giờ</span>
            </Title>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Thiết bị trong phạm vi</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#0B72E7' }}>{filteredData.length}</Title>
          </Card>
        </Col>
      </Row>

      {/* Bảng Bộ Lọc & Dữ Liệu Báo Cáo */}
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
                value={selectedBuilding}
                onChange={setSelectedBuilding}
                style={{ width: 220 }}
              >
                <Option value="ALL">Toàn bộ Tòa nhà / Cơ sở</Option>
                <Option value="Nhà ga Hành khách T2 (Quốc tế)">Nhà ga T2 Nội Bài</Option>
                <Option value="Nhà ga Quốc nội T1">Nhà ga T1 TSN</Option>
                <Option value="Nhà ga Hàng hóa ALS Cargo">Kho Hàng Hóa ALS</Option>
              </Select>

              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: 170 }}
              >
                <Option value="ALL">Tất cả chủng loại</Option>
                <Option value="Gateway IoT">Gateway IoT</Option>
                <Option value="Cảm biến Môi trường">Cảm biến Môi trường</Option>
                <Option value="Đồng hồ Năng lượng">Đồng hồ Năng lượng</Option>
                <Option value="Thiết bị Điều khiển RPC">Điều khiển RPC</Option>
              </Select>
            </Space>
          </Col>
        </Row>

        <Divider style={{ margin: '16px 0' }} />

        {filteredData.length === 0 ? (
          <Empty
            description="Không có dữ liệu vận hành trong khoảng thời gian đã chọn. (EF-01)"
            style={{ padding: '40px 0' }}
          />
        ) : (
          <Table
            dataSource={filteredData}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 8, showTotal: (total) => `Tổng số ${total} thiết bị` }}
            bordered
            size="middle"
          />
        )}
      </Card>
    </div>
  );
}
